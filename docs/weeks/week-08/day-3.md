# Week 8 · Day 3 — Capstone I: the brief and the analysis

<span class="badge">The brief 30 min</span> <span class="badge">Framing 40 min</span> <span class="badge">Data checks 40 min</span> <span class="badge">First analyses 70 min</span> <span class="badge hw">HW 8.1 due today · Capstone (due Day 5)</span>

> STORY **Wednesday, 9:00.** Madina closes the door. *"The board meets on Friday at eleven. The chairman asked for one thing: **'The 2026 portfolio review: where do we grow, where do we stop, and what would you change?'** Every head of department will be in the room and every one of them has a favourite answer. Bekzod wants more SME, Kamola more app, Nilufar fewer partners, Sevara more collectors. You are the only person in the building who has looked at all of it with the same definitions. Ten minutes, ten slides, a dashboard they can click, and a notebook Jasur can re-run. Today you decide what to look at and you make sure the numbers are right. Do not draw a single chart before lunch."*

## Today in 3 lines

- You read the **brief**, the five required questions, the deliverables, the rubric and the three-day plan, and you pick **one deep-dive** of your own.
- You **frame** the problem as an **issue tree** — the board's question split into sub-questions you can answer with a table each — with a hypothesis per branch and the definition of every metric you will show.
- You **check the data** against the known problems and the **sanity numbers** below (reproduce them before anything else), then run the first analyses: growth, risk and collections — and end the day with the checkpoint list ticked.

---

## 1. The brief

> **To:** Analyst, Nur Finance  **From:** Madina (Head of Analytics)  **Date:** Wednesday
> **Subject:** Board, Friday 11:00 — the 2026 portfolio review
>
> The board wants three answers about Nur Finance's 2026 lending, as of **1 October 2026**: **where we should grow**, **where we should stop or slow down**, and **what we should change** (policy, process, product, pricing). Each recommendation must have the number behind it, an owner and what it is worth or what it protects. The room: the CEO; Bekzod (portfolio), Nilufar (risk), Sevara (collections), Kamola (product, app). Use the definitions we use in the course; where you choose one, write it down.
>
> **Deliverables** (all in Day 5's hand-in box by Friday 9:00):
> - **(a) Analysis notebook** — `capstone.ipynb` (SQL through `read_sql` or pandas), from `data/python/week8/capstone_template.ipynb`; Restart & Run All must work on a fresh copy of the data; one section per question; every number on a slide comes from a cell.
> - **(b) Dashboard, 2 pages** — Power BI (`capstone.pbix` + `capstone_dashboard.pdf`) or Excel (`capstone.xlsx` + `capstone_dashboard.pdf`): page 1 *Growth & mix*, page 2 *Risk & collections*; slicers for product, channel, region; definitions in a text box.
> - **(c) A 10-slide deck** (`capstone_deck.pdf`, from PowerPoint or Google Slides) **or** a 2-page memo (`capstone_memo.pdf`, attached in the deck's place in Day 5's box) with the recommendations.
> - **(d) A 10-minute presentation** on Friday — a recording (`capstone_talk.mp4`, a phone is fine) or full speaker notes (`speaker_notes.md`) if you present live to the mentor.

The arc of the three days: **brief → analysis (today) → dashboard and story (Thursday) → the ten minutes (Friday)**. Each section below ends with a line *Done looks like* — tick it before you move on.

**P1.** Restate the brief in **one sentence**, with the as-of date and who is in the room. It becomes the first line of your notebook.

```task
{"id": "w08d3-p1", "kind": "free", "min": 20, "rubric": ["the three questions: where to grow, where to stop or slow, what to change", "the as-of date, 1 October 2026", "the audience: the board (CEO, Bekzod, Nilufar, Sevara, Kamola)", "the promise: a number, an owner and a value behind each recommendation"], "model": "As of 1 October 2026, the board — the CEO, portfolio, risk, collections and product — wants to know where Nur Finance should grow its lending, where it should stop or slow down, and what it should change in policy, process, product or pricing, with the number, the owner and the value behind every recommendation."}
```

*Done looks like:* you can say the question, the date, the room and the four deliverables in two sentences without looking.

---

## 2. What the board must hear about — five required questions

Five required questions and one of your own (Q6). Each is a section of the notebook and at least one slide. Suggested cuts; you choose the ones that carry a message.

| # | Question | Minimum analysis | Course tools |
|---|---|---|---|
| Q1 | **Growth** — where did the book grow in 2026, and is the growth healthy? | disbursements (count, amount) and outstanding Jan–Sep 2026 vs Jan–Sep 2025 by **product, channel, region**; mix shift; average ticket | week 2 aggregates, week 3 `v_portfolio_monthly` |
| Q2 | **Risk** — which vintages, grades and channels are riskiest, and is it getting better or worse? | FPD30 by channel, product, grade and disbursement period; vintage curves (ever 30+ by MOB, blanks where unobservable) by channel and grade; PAR30 and NPL by product and region; one roll-rate matrix | weeks 2–3, week 6 intervals and tests |
| Q3 | **Collections efficiency** — is effort where the money is? | delinquent loans and balance by bucket; share contacted in September by bucket; actions by bucket; recorded outcome vs actual payment after the action; cure and roll from week 3 | weeks 2–3 |
| Q4 | **The app funnel** — where does the app lose people, and do they come back? | Day 1's funnel (sessions, app only, ending at money), by device/version; repeat borrowing by first-loan cohort | Day 1 |
| Q5 | **Unit economics** — which product makes money per loan and per soum lent? | Day 2's table with the assumptions printed; one sensitivity that matters for a recommendation | Day 2 |
| Q6 | **Your deep-dive** — one question you choose (below) | one analysis, one slide, one recommendation | any |

```game
{"type": "match", "id": "w08d3-g1", "title": "Which question does this cut answer?", "q": "Match each cut to the board question it belongs to.", "pairs": [["Disbursements Jan–Sep 2026 vs 2025 by region, count and amount", "Q1 Growth"], ["FPD30 by channel and grade; vintage curves with blanks", "Q2 Risk"], ["Share of 1–30 DPD loans contacted in September", "Q3 Collections"], ["App sessions per step, ending at disbursed", "Q4 App funnel"], ["Net contribution per 1 000 soum lent, assumptions printed", "Q5 Unit economics"]]}
```

**Deep-dive ideas** (pick one, or propose your own to the mentor before noon):
- **Regional growth vs risk:** which regions grew fastest, and did their risk follow? Is it one branch, one officer, one product?
- **SME underwriting:** SME is the largest product by balance; what do its *matured* loans say about its default rate, and what does that do to its margin?
- **BNPL and the partners:** which partners/terms lose most; what merchant fee would make it pay; what would stopping it cost in customers who later borrow elsewhere at Nur?
- **The early bucket:** a collections strategy for 1–30 DPD — who to contact first (balance × risk), what it would save if the roll rate fell by a third.
- **Repeat borrowers' risk:** is the FPD of a customer's second loan lower or higher than of the first? Should the app make repeat loans easier?
- **Signed but never paid out:** the app contracts that never became loans — how many, since when, which device/version, what they would have been worth.

**P2.** Choose your deep-dive and write it as **one question** a board member would ask, plus the one table that would answer it.

```task
{"id": "w08d3-p2", "kind": "free", "min": 20, "rubric": ["a question, not a topic (it ends with a question mark and could be answered yes / no / a number)", "it does not repeat Q1–Q5", "it names the table or cut that answers it", "it could lead to a recommendation with an owner"], "model": "\"Do customers who come back for a second loan default less than on their first loan — should the app make repeat loans easier?\" Table: FPD30 of first vs second loans, by product and by months between them (loans + installments + clean payments), with the number of loans in each cell. Owner if it holds: Kamola (a pre-approved repeat offer) with Nilufar's FPD guardrail."}
```

*Done looks like:* the deep-dive is one sentence with a question mark, and you know which tables answer it.

---

## 3. The plan — three days

| Day | Morning | Afternoon | End-of-day output |
|---|---|---|---|
| **Wed (today)** | brief, issue tree, definitions | data checks, sanity numbers, Q1–Q3 first pass | checkpoint list (section 7) ticked; `issue_tree.md` + notebook draft saved |
| **Thu** | Q4–Q6; **storyline: slide titles first** (Day 4) | dashboard pages; draft deck; peer-review checklist against your own work | full draft deck; dashboard 2 pages |
| **Fri** | rehearse twice (timer), final checks, Restart & Run All, export PDFs | present (10 min + questions); then the mock interview | everything in Day 5's hand-in box |

Time box it: if a cut has not produced a message in 30 minutes, write down what you tried and move on. The board needs five clear answers more than one perfect one.

---

## 4. Grading rubric (100 points)

| Criterion | Points | Full marks look like | Common deductions |
|---|---|---|---|
| **Analysis** | 30 | all five questions + a deep-dive answered with the right cut, a comparison (vs last year, vs the book, vs a benchmark) and a "so what" for each | a table with no comparison; a deep-dive that repeats a required question; findings with no recommendation |
| **Correctness** | 20 | the sanity numbers reproduced; definitions written; known data problems handled (and said); denominators right; unobservable cells blank; intervals where n is small | approval with a different denominator per slide; raw payments; FPD on immature loans; a funnel on all customers |
| **Dashboard** | 15 | 2 pages, the board's numbers match the notebook, slicers work, definitions and as-of date on the page, readable at a glance | 12 visuals per page; totals that change with the slicer in the wrong way; no date |
| **Story / deck** | 20 | executive summary with the answer first; so-what titles; one chart per message; 3–5 recommendations with owner and value; assumptions and risks | topic titles; the method before the answer; charts without units; 25 slides |
| **Presentation** | 15 | 10 minutes ±1; the answer in the first minute; each board member hears their part; questions answered with a number or "I will check" | reading the slides; running out of time before the recommendations; arguing with a board member |

---

## 5. Framing — the issue tree (40 min)

An **issue tree** (*дерево проблем*) breaks the question into sub-questions that are **mutually exclusive and collectively exhaustive** (MECE): no overlaps, no gaps. Each leaf is a question one table can answer. One possible start (make it yours):

```
Where do we grow, where do we stop, what do we change?
├── 1. Where is the money made?            → unit economics per product (Q5), contribution 2026, sensitivity
├── 2. Where did we grow, and how?         → product / channel / region growth; new vs repeat; ticket vs count (Q1)
├── 3. Where is the risk?                  → FPD and vintages by channel, grade, product; PAR30 by region (Q2)
│     └── is the risk where the growth is? → growth × PAR30 by region / product
├── 4. Do we lose value in the process?    → app funnel leaks, signed-not-disbursed (Q4); collections coverage (Q3)
└── 5. What would change the answer?       → assumptions (funding rate, costs, PD of young products), the deep-dive (Q6)
```

For every branch write one **hypothesis** before you look ("SME grows fastest and earns most per soum") and the **test** that could break it ("unless its matured default rate is much higher"). A hypothesis you can not break is an opinion. Save it as `issue_tree.md` (it goes in with Friday's hand-in), with a **definitions block**: outstanding, PAR30, NPL90, FPD30 (maturity rule), approval rate (denominator), collection rate, active customer, funnel step, repeat borrowing, net contribution — one line each, the same as the course's unless you say why.

> 💡 **Key idea.** The tree decides what you will **not** do. A cut that answers no branch is interesting, not useful — and with three days, every interesting cut is time taken from a recommendation.

```game
{"type": "bug", "id": "w08d3-g2", "title": "Find the branch that breaks MECE", "q": "A colleague's issue tree for the same brief. One branch overlaps the others.", "code": "1. Where is the money made? → unit economics per product, 2026 contribution\n2. Where did we grow, and how? → growth by product, channel, region; count vs ticket\n3. Where is the risk? → FPD and vintages by channel, grade, product; PAR30 by region\n4. Which region is our best? → growth and PAR30 by region\n5. Do we lose value in the process? → app funnel leaks, collections coverage", "answer": [3], "why": "Branch 4 re-cuts branches 2 and 3 — the same tables twice, and 'best' has no definition. Fold it into branch 3 as the sub-question 'is the risk where the growth is?' (growth × PAR30 by region)."}
```

**P3.** Your issue tree: five branches, and for each a **hypothesis** and the **test** that could break it. Copy it into `issue_tree.md` afterwards.

```task
{"id": "w08d3-p3", "kind": "free", "min": 60, "rubric": ["five branches with no overlap and no gap (MECE) that together answer grow / stop / change", "a hypothesis per branch, written before looking", "a test per hypothesis that could break it, naming the table or cut", "the deep-dive sits in one branch", "at least one hypothesis that would change a recommendation if it were false"], "model": "1. Money — H: SME and Auto earn most per soum lent; test: their margin at the matured PD and at 22 % funding. 2. Growth — H: growth is broad, not a few big loans; test: count and amount growth by product and region side by side. 3. Risk — H: the app's loans start worse than the branches' but are improving; test: FPD30 by channel and disbursement year, vintages by channel; sub-question: is the risk where the growth is (growth × PAR30 by region)? 4. Process — H: we lose value after approval (signed but not paid out) and in the early bucket (few contacts at 1–30 DPD); test: signed-without-loan count, share contacted by bucket in September. 5. What would change the answer — H: the SME recommendation depends on its unobserved default rate; test: unit economics at matured PD; deep-dive: repeat borrowers' FPD vs first loans."}
```

*Done looks like:* `issue_tree.md` with five branches, a hypothesis and a test each, the deep-dive placed in one of them, and the ten definitions.

---

## 6. Data checks and the sanity numbers (40 min)

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

```game
{"type": "match", "id": "w08d3-g3", "title": "Problem → handling", "q": "Match each known data problem to the handling you will write in the notebook's first section.", "pairs": [["Exact duplicate payments", "Sum money from v_payments_clean"], ["Closed loans without closed_at", "Decide 'live' from status and the schedule"], ["app_events only for app applications", "App-only funnel, app sessions as the denominator"], ["Loans whose first instalment is not 30 days old", "Leave them out of FPD30; blank vintage cells"], ["Approvals of the last days not yet disbursed", "Do not read the last week's take-up"], ["Loans disbursed before their application date", "Keep in money totals; drop from time-to-disburse"]]}
```

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

### Reproduce them here

`v_loan_status` and `v_payments_clean` are not tables in `nur.db` — the capstone template creates them as TEMP views in its own connection. In these boxes, write the same logic as CTEs at the top of your query. The chain below gives every loan its outstanding and DPD on 2026-10-01 (▶ Run it, then build on `ls`):

```sql
WITH pay AS (                                -- v_payments_clean: exact duplicates dropped
  SELECT installment_id, paid_at, amount FROM (
    SELECT installment_id, paid_at, amount,
           ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
    FROM payments) WHERE rn = 1),
unpaid AS (                                  -- instalments due by the as-of date and not paid in full
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

Each box below runs your query on an untouched copy of the data and checks the numbers in your result without showing them. Save the queries as `sanity.sql` — the notebook's section 2 needs the same numbers. This box is today's check, not the capstone hand-in: submit it if you want the mentor to see your sanity numbers early; the capstone itself goes into Day 5's 📎 box on Friday.

```sqltask
{"check": "cap8", "lesson": "W8D3", "title": "Capstone · the sanity numbers", "file": "sanity.sql", "why": "Every number on Friday's slides stands on these. If your outstanding or your FPD differs from the company's by a decimal, the board stops listening to the recommendation and starts auditing the arithmetic — so you find the difference today, on numbers you know.", "graded": ["Every box below ✅ — the site checks each result against the sanity table", "Your query, not a typed number: the checks look for the values inside the result", "The same definitions as the table (clean payments, half-open dates, FPD maturity rule) — written in the notebook's definitions block"], "tasks": [{"id": "S1", "q": "Sanity 1 — outstanding on 2026-10-01 (principal due after the as-of date) and the number of loans that owe it."}, {"id": "S2", "q": "Sanity 2 — PAR30 and NPL90 in % of outstanding (DPD > 30 and DPD > 90; use the DPD chain above)."}, {"id": "S3", "q": "Sanity 3 — the number of loans per bucket 0 / 1–30 / 31–60 / 61–90 / 90+ (one row per bucket)."}, {"id": "S4", "q": "Sanity 4 — FPD30 in % by channel: first instalments due on or before 2026-09-01; FPD if not paid in full by 1 October, or first paid more than 30 days late (clean payments)."}, {"id": "S5", "q": "Sanity 5 — loans and amount disbursed January–September 2026 and January–September 2025."}, {"id": "S7", "q": "Sanity 7 — approval rate, approved ÷ decided, all applications, in % to two decimals (approved_not_disbursed counts as approved)."}, {"id": "S8", "q": "Sanity 8 — collection rate for instalments due in September 2026, paid (clean) by 1 October, in % to one decimal."}, {"id": "S11", "q": "Sanity 11 — the exact duplicate payments: how many rows and how much money."}, {"id": "S12", "q": "Sanity 12 — app sessions (distinct application_id in app_events) and loans disbursed from app applications."}, {"id": "S13", "q": "Sanity 13 — repeat borrowing of the January 2024 first-loan cohort within 6 months, in % to one decimal."}]}
```

*Done looks like:* all ten boxes ✅, and for the five numbers the boxes do not check (6, 9, 10, 14, 15) a cell in the notebook that prints them — or a written reason for any difference.

---

## 7. First analyses (70 min) and the end-of-day checkpoint

Run Q1, Q2 and Q3 at the level of the "minimum analysis" column. For each table write, in the notebook, **one sentence** that would be a slide title if it survived tomorrow. Do not format anything yet.

Useful starting points: growth by product is week 2 with two `CASE WHEN` columns (2025 and 2026, Jan–Sep each); by region join `customers` (or `branches`; here they agree); vintages are week 3 Day 3's chain with `GROUP BY` channel or grade; collections coverage is the DPD chain of section 6 left-joined to the loans with a `collections_actions` row in September. In the notebook, `v_loan_status` exists (the template creates it), so the same queries are shorter there.

**P4.** Q1, first cut: by product, loans and amount disbursed January–September 2025 and January–September 2026, and the growth of the amount in %. Largest 2026 amount first.

```task
{"id": "w08d3-p4", "kind": "sql", "note": "Five rows, seven columns: product code, loans 2025, loans 2026, amount 2025, amount 2026, amount growth in % to one decimal — sorted by amount 2026, largest first.", "model": "SELECT p.code,\n       SUM(CASE WHEN l.disbursed_at >= '2025-01-01' AND l.disbursed_at < '2025-10-01' THEN 1 ELSE 0 END) AS loans_2025,\n       SUM(CASE WHEN l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2026-10-01' THEN 1 ELSE 0 END) AS loans_2026,\n       SUM(CASE WHEN l.disbursed_at >= '2025-01-01' AND l.disbursed_at < '2025-10-01' THEN l.principal ELSE 0 END) AS amount_2025,\n       SUM(CASE WHEN l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2026-10-01' THEN l.principal ELSE 0 END) AS amount_2026,\n       ROUND(100.0 * SUM(CASE WHEN l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2026-10-01' THEN l.principal ELSE 0 END)\n             / SUM(CASE WHEN l.disbursed_at >= '2025-01-01' AND l.disbursed_at < '2025-10-01' THEN l.principal ELSE 0 END) - 100, 1) AS growth_pct\nFROM loans l JOIN products p ON p.product_id = l.product_id\nGROUP BY p.code ORDER BY amount_2026 DESC;"}
```

**P5.** Q3, first cut: for loans 1–90 days past due on 2026-10-01, by bucket — loans, how many had **any** collections action in September 2026, and their outstanding. Start from the DPD chain of section 6.

```task
{"id": "w08d3-p5", "kind": "sql", "note": "Three rows (1-30, 31-60, 61-90): bucket, loans, contacted in September, outstanding. COUNT(t.loan_id) after a LEFT JOIN counts only the contacted ones.", "model": "WITH pay AS (\n  SELECT installment_id, paid_at, amount FROM (\n    SELECT installment_id, paid_at, amount,\n           ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn\n    FROM payments) WHERE rn = 1),\nunpaid AS (\n  SELECT i.loan_id, i.due_date FROM installments i\n  LEFT JOIN pay p ON p.installment_id = i.installment_id AND p.paid_at <= '2026-10-01'\n  WHERE i.due_date <= '2026-10-01'\n  GROUP BY i.installment_id, i.loan_id, i.due_date, i.total_due\n  HAVING COALESCE(SUM(p.amount), 0) < i.total_due),\ndpd AS (SELECT loan_id, CAST(julianday('2026-10-01') - julianday(MIN(due_date)) AS INTEGER) AS dpd FROM unpaid GROUP BY loan_id),\noutst AS (SELECT loan_id, SUM(principal_due) AS outstanding FROM installments WHERE due_date > '2026-10-01' GROUP BY loan_id),\ndelinquent AS (\n  SELECT d.loan_id, COALESCE(o.outstanding, 0) AS outstanding,\n         CASE WHEN d.dpd <= 30 THEN '1-30' WHEN d.dpd <= 60 THEN '31-60' ELSE '61-90' END AS bucket\n  FROM dpd d LEFT JOIN outst o ON o.loan_id = d.loan_id\n  WHERE d.dpd BETWEEN 1 AND 90),\ntouched AS (SELECT DISTINCT loan_id FROM collections_actions\n            WHERE action_date >= '2026-09-01' AND action_date < '2026-10-01')\nSELECT d.bucket, COUNT(*) AS loans, COUNT(t.loan_id) AS contacted_in_september, SUM(d.outstanding) AS outstanding\nFROM delinquent d LEFT JOIN touched t ON t.loan_id = d.loan_id\nGROUP BY d.bucket ORDER BY d.bucket;"}
```

**P6.** Under each of your Q1, Q2 and Q3 tables, one sentence that would be a slide title if it survived tomorrow. Write the three here.

```task
{"id": "w08d3-p6", "kind": "free", "min": 30, "rubric": ["three sentences, one per question (growth, risk, collections)", "each has a number and a comparison", "growth gives count and amount, not amount alone", "each says 'so what', not only 'what'"], "model": "Q1: \"Disbursements grew 46 % in January–September — in count (+40 %) as well as amount — with Auto fastest (+57 %) and BNPL slowest (+28 %).\" Q2: \"App loans start riskier than branch loans — FPD30 1.70 % vs 1.04 % — but the app's FPD has fallen every year.\" Q3: \"Only 13 of 124 loans in 1–30 DPD had any contact in September, while every 61–90 loan did: effort arrives after the cheap moment to act.\""}
```

**Checkpoint — tick before you stop** (keep `issue_tree.md` and the `capstone.ipynb` draft on your computer — Friday's hand-in box takes the final versions):

- [ ] The brief restated in one sentence at the top of the notebook, with the as-of date.
- [ ] Issue tree with a hypothesis and a test per branch; your deep-dive chosen and written as a question.
- [ ] Definitions block (ten metrics, one line each).
- [ ] Data-checks section: every known problem with its handling and the number of rows affected.
- [ ] The ten sanity boxes of section 6 ✅, all 15 sanity numbers in notebook cells (or a written reason for any difference).
- [ ] Q1, Q2, Q3: one table each, one candidate title sentence each.
- [ ] A list of the three questions you most expect from the board (Day 4 prepares them).

---

## 8. Common pitfalls

- **Charts before questions.** The tree first; a chart that answers no branch is cut.
- **Growth without risk, risk without size.** "Region X grew most" and "region X has the highest PAR30" are two halves of one sentence — put them on one slide.
- **Different definitions on different slides** — approval with and without cancelled, FPD with and without the maturity rule.
- **Amount growth explained by demand** when it is a few large SME loans (count and amount, always both).
- **Collections judged by recorded outcomes** ("paid") instead of the payments table.
- **Unit economics as fact.** Your cost figures are assumptions; the recommendation must survive them (show one sensitivity).
- **Twenty recommendations.** Three to five, each with an owner and what it is worth.
- **Hiding the data problems.** One line each in the appendix makes the deck *more* credible, not less.

---

## 9. Self-check

```check
{"id": "w08d3-sc", "questions": [
  {"type": "single", "q": "Which set of branches is MECE for 'where do we grow, where do we stop, what do we change'?", "options": ["Growth · Risk · Best region · App · Collections", "Money · Growth · Risk (incl. is the risk where the growth is?) · Process losses · What would change the answer", "SME · Auto · Consumer · Micro · BNPL · Everything else", "Charts · Tables · Slides"], "answer": 1, "explain": "No overlap, no gap; 'best region' re-cuts growth and risk (→ section 5)."},
  {"type": "single", "q": "Your app FPD30 is 1.9 %; the sanity table says 1.70 %. What do you check first?", "options": ["Whether the app had an outage", "Raw vs clean payments, then the maturity rule (first instalment due on or before 2026-09-01), then the denominator", "Nothing — update the table", "The vintage curves"], "answer": 1, "explain": "The four usual culprits, in order (→ section 6). Including loans whose first instalment is not yet 30 days old gives about 2 % — the daily challenge."},
  {"type": "single", "q": "Which hypothesis is useful?", "options": ["'Growth was good.'", "'SME earns most per soum lent — unless its matured default rate is much higher than the crude one.'", "'The data are interesting.'", "'Risk matters.'"], "answer": 1, "explain": "A hypothesis with a test that could break it — and if it breaks, the SME recommendation changes (→ section 5)."}
]}
```

---

## 10. Company corner <span class="badge company">How a board request travels</span>

At a lender the board pack is not one analyst's afternoon. A request like the chairman's moves through people, and each step exists because someone was burned once:

```game
{"type": "order", "id": "w08d3-g4", "title": "The life of a board request", "q": "Put the steps in the order they usually happen.", "items": ["The chairman asks the CEO an open question", "The head of analytics turns it into a brief: questions, as-of date, deliverables, deadline", "The analyst frames an issue tree and agrees the definitions with the data owners", "Sanity numbers are reconciled with Finance's ledger", "Each department head sees the findings about their area before the meeting", "The pre-read goes to the board 48 hours before", "The presentation: answer first, ten minutes, questions", "Follow-ups promised in the room are sent the same day"], "why": "The two steps juniors skip are the reconciliation with Finance and the preview with each department head — the first protects the numbers, the second protects you from being surprised in the room."}
```

> 🎯 **Interview version.** *"The CEO gives you an open question — 'where should we grow?' — and three days. How do you start?"* — I restate it as a brief: the decision it serves, the as-of date, who is in the room, what they will receive. Then an issue tree — money, growth, risk, process losses, what would change the answer — with a hypothesis and a test per branch, and the definitions agreed with the data owners. Before any chart I reproduce a few numbers the company already trusts, so that my outstanding and PAR30 match Finance's. Only then the analysis, time-boxed per branch, and every finding written as one sentence with a number.

**Say it like in an interview.** *"Walk me through a project you did end to end."* Use this capstone: the question, how you framed it, one number you checked, one finding, one recommendation.

```task
{"id": "w08d3-ci", "kind": "free", "min": 50, "rubric": ["the question and who asked it, in one sentence", "the framing: an issue tree with hypotheses", "a check that the numbers were right (sanity numbers matched)", "one finding with a number", "one recommendation with an owner and a value", "what you would do differently or next"], "model": "The board of a lending company asked where to grow, where to slow down and what to change, as of 1 October 2026, and I had three days. I framed it as an issue tree — where the money is made, where we grew, where the risk is, where we lose value in the process — with a hypothesis and a test for each, and before any analysis I reproduced fifteen numbers the company already reported, like outstanding of 208.7 bn and PAR30 of 3.1 %, so nobody could argue with the base. One finding: only 13 of 124 loans in their first month of delinquency had any collections contact, while nearly all actions went to loans already 90 days late. I recommended contacting every early-late loan in the first week — owned by the head of collections, worth about 23 m soum per loan kept out of default. Next time I would get the collections data with the DPD at the time of each action, because I could only use today's bucket."}
```

Tomorrow: from tables to a story — slide titles first, then the dashboard, then the questions each board member will ask.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w08d3", "pass": 0.8, "questions": [
  {"type": "text", "q": "An issue tree should be MECE: mutually exclusive and collectively … (one word)", "answer": ["exhaustive", "collectively exhaustive"], "explain": "No overlaps, no gaps — each leaf a question one table can answer (→ section 5)."},
  {"type": "single", "q": "What makes a branch hypothesis useful?", "options": ["It is vague enough to always be true", "It comes with a test that could break it — 'SME grows fastest and earns most, unless its matured default rate is much higher'", "It has no number", "It matches what the board already believes"], "answer": 1, "explain": "A hypothesis you cannot break is an opinion (→ section 5)."},
  {"type": "single", "q": "Your app FPD30 is 1.9 %; the sanity table says 1.70 %. What do you check first?", "options": ["Clean vs raw payments, the maturity rule (first instalment due on or before 2026-09-01) and the denominator", "Drop the app from the analysis", "Switch to a one-sided test", "Nothing — update the sanity table"], "answer": 0, "explain": "If a sanity number differs, find out why before building on it — usually raw payments, BETWEEN on a datetime, a status list or immature loans (→ section 6)."},
  {"type": "multi", "q": "Which handlings of the known data problems are right?", "options": ["Use closed_at to decide whether a loan is live", "Build the app funnel on all applications", "FPD only for first instalments due on or before 2026-09-01", "Sum money from v_payments_clean", "Leave unobservable vintage cells blank"], "answer": [2, 3, 4], "explain": "closed_at is empty for some closed loans (use status and the schedule), and app_events exist only for app applications (→ section 6, 'Known problems')."},
  {"type": "single", "q": "applied_at holds a date and a time. What does this filter lose?", "code": "WHERE applied_at BETWEEN '2026-09-01' AND '2026-09-30'", "options": ["Nothing", "Every application after midnight on 30 September", "Only applications with NULL dates", "Applications on 1 September"], "answer": 1, "explain": "'2026-09-30' means 00:00 on the 30th; use >= '2026-09-01' AND < '2026-10-01' — the half-open rule (→ section 6, sanity-number tips)."},
  {"type": "single", "q": "Why COUNT(t.loan_id) for 'contacted'?", "code": "SELECT d.bucket, COUNT(*) AS loans, COUNT(t.loan_id) AS contacted_in_september\nFROM delinquent d LEFT JOIN touched t ON t.loan_id = d.loan_id\nGROUP BY d.bucket;", "options": ["It counts distinct loans", "After a LEFT JOIN, t.loan_id is NULL for loans with no action, and COUNT(column) skips NULLs — so only contacted loans are counted", "It equals COUNT(*)", "COUNT(*) would fail"], "answer": 1, "explain": "COUNT(*) counts rows, COUNT(column) counts non-null values — the week-2 NULL rule doing the work (→ section 7)."},
  {"type": "single", "q": "SME disbursement grew strongly in amount. What must sit next to it?", "options": ["The median principal only", "Nothing — amount is what the board wants", "The approval rate", "The count of loans: amount growth can be a few very large loans, not more borrowing"], "answer": 3, "explain": "Count and amount, always both (→ section 8, 'Common pitfalls')."},
  {"type": "single", "q": "How do you judge collections efficiency?", "options": ["By the outcomes collectors record ('paid')", "By the share of SMS", "By the number of calls", "By actual payments after the action, from the payments table"], "answer": 3, "explain": "Recorded outcomes are a collector's note, not money (→ section 8, 'Common pitfalls')."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w08d3", "sql": true, "q": "Before the board, Kamola's team sends their own number: 'app FPD30 is about 2 %', not the sanity table's 1.70 %. Reproduce their mistake to prove where it comes from: same FPD30 rule (clean payments to 1 Oct; FPD if not fully paid or first paid more than 30 days after the due date), but with every loan whose first instalment fell due on or before 2026-10-01 in scope. What is the app channel's FPD30 then? Give a percentage to 2 decimals.", "type": "number", "dp": 2, "h": ["9491a2398e0c3567d6ae9164"], "hint": "Only the scope's cut-off date moves; count how many app loans enter the scope and how many of them are flagged.", "sol": "Zmlyc3QgPSBpbnN0WyhpbnN0WyJpbnN0YWxsbWVudF9ubyJdID09IDEpICYgKGluc3RbImR1ZV9kYXRlIl0gPD0gIjIwMjYtMTAtMDEiKV0gICAgICAgIyB0aGUgbWlzdGFrZTogbm8gMzAtZGF5IG1hdHVyaXR5CnBhaWQxID0gcGF5W3BheVsicGFpZF9hdCJdIDw9IEFTX09GXS5ncm91cGJ5KCJpbnN0YWxsbWVudF9pZCIsIGFzX2luZGV4PUZhbHNlKS5hZ2cocGFpZD0oImFtb3VudCIsICJzdW0iKSwgZmlyc3RfcGFpZD0oInBhaWRfYXQiLCAibWluIikpCmZmID0gZmlyc3QubWVyZ2UocGFpZDEsIG9uPSJpbnN0YWxsbWVudF9pZCIsIGhvdz0ibGVmdCIpLmZpbGxuYSh7InBhaWQiOiAwfSkKZmZbImZwZDMwIl0gPSAoKGZmWyJwYWlkIl0gPCBmZlsidG90YWxfZHVlIl0pIHwgKChmZlsiZmlyc3RfcGFpZCJdIC0gZmZbImR1ZV9kYXRlIl0pLmR0LmRheXMgPiAzMCkpLmFzdHlwZShpbnQpCmZmID0gZmYubWVyZ2UobG9hbnMsIG9uPSJsb2FuX2lkIikKZmYuZ3JvdXBieSgiY2hhbm5lbCIpWyJmcGQzMCJdLmFnZyhbInN1bSIsICJzaXplIiwgIm1lYW4iXSkgICAgICMgYXBwIDUxIC8gMiA1NDIgPSAyLjAxICUKCjIuMDEgJTogdGhlIHdyb25nIHNjb3BlIGFkZHMgMTMxIGFwcCBsb2FucyB3aG9zZSBmaXJzdCBpbnN0YWxtZW50IGZlbGwgZHVlIGluIFNlcHRlbWJlcjsgMTAgb2YgdGhlbSBhcmUgbm90IHlldCBmdWxseSBwYWlkIGFuZCBhcmUgY291bnRlZCBhcyAnZGVmYXVsdHMnIGFsdGhvdWdoIHRoZXkgaGF2ZSBoYWQgbGVzcyB0aGFuIDMwIGRheXMgdG8gcGF5LgpUaGUgYm9vayBtb3ZlcyBmcm9tIDEuMjggJSB0byAxLjQxICUgKDEwNSAvIDcgNDYyKSBhbmQgdGhlIGFwcCBmcm9tIDEuNzAgJSB0byAyLjAxICUg4oCUIHRoZSBhcHAgaXMgaGl0IGhhcmRlc3QgYmVjYXVzZSAxMCBvZiB0aGUgMTQgZXh0cmEgZmxhZ3MgYXJlIGFwcCBsb2Fucy4KRm9yIHRoZSBkZWNrOiBvbmUgZGVmaW5pdGlvbnMgbGluZSAoZmlyc3QgaW5zdGFsbWVudCBkdWUgb24gb3IgYmVmb3JlIDIwMjYtMDktMDEpIGVuZHMgdGhlIGFyZ3VtZW50IGJlZm9yZSB0aGUgYm9hcmQgc2VlcyB0d28gbnVtYmVycy4="}
```

<!-- challenge:end -->
