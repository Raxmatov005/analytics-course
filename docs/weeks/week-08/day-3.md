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
> **Deliverables** (all to `submissions/week-08/day-5/` by Friday 9:00):
> - **(a) Analysis notebook** — `capstone.ipynb` (SQL through `read_sql` or pandas), from `data/python/week8/capstone_template.ipynb`; Restart & Run All must work on a fresh copy of the data; one section per question; every number on a slide comes from a cell.
> - **(b) Dashboard, 2 pages** — Power BI (`capstone.pbix` + PDF) or Excel (`capstone.xlsx` + PDF): page 1 *Growth & mix*, page 2 *Risk & collections*; slicers for product, channel, region; definitions in a text box.
> - **(c) A 10-slide deck** (`capstone_deck.pdf`, from PowerPoint or Google Slides) **or** a 2-page memo (`capstone_memo.pdf`) with the recommendations.
> - **(d) A 10-minute presentation** on Friday — a recording (`capstone_talk.mp4`, a phone is fine) or full speaker notes (`speaker_notes.md`) if you present live to the mentor.

---

## 2. What the board must hear about — five required questions

Each question is a section of the notebook and at least one slide. Suggested cuts; you choose the ones that carry a message.

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

---

## 3. The plan — three days

| Day | Morning | Afternoon | End-of-day output |
|---|---|---|---|
| **Wed (today)** | brief, issue tree, definitions | data checks, sanity numbers, Q1–Q3 first pass | checkpoint list (section 7) ticked; `day-3/issue_tree.md` + notebook draft pushed |
| **Thu** | Q4–Q6; **storyline: slide titles first** (Day 4) | dashboard pages; draft deck; peer-review checklist against your own work | full draft deck; dashboard 2 pages |
| **Fri** | rehearse twice (timer), final checks, Restart & Run All, export PDFs | present (10 min + questions); then the mock interview | everything in `submissions/week-08/day-5/` |

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

For every branch write one **hypothesis** before you look ("SME grows fastest and earns most per soum") and the **test** that could break it ("unless its matured default rate is much higher"). A hypothesis you can not break is an opinion. Save it as `submissions/week-08/day-3/issue_tree.md`, with a **definitions block**: outstanding, PAR30, NPL90, FPD30 (maturity rule), approval rate (denominator), collection rate, active customer, funnel step, repeat borrowing, net contribution — one line each, the same as the course's unless you say why.

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

### Sanity numbers — reproduce these first

If your number differs, find out why **before** you build on it (usually: raw payments instead of clean, `BETWEEN` on a datetime, a different status list, an immature loan in the denominator). All as of 2026-10-01.

| # | Metric | Value |
|---|---|---|
| 1 | Outstanding (principal due after the as-of) | **208 723 504 430** soum on **3 409** loans |
| 2 | PAR30 · NPL90 | **3.12 %** (6 507 526 953) · **2.55 %** (5 319 475 527; 234 loans) |
| 3 | Buckets 0 / 1–30 / 31–60 / 61–90 / 90+ (loans) | 7 429 / 124 / 25 / 16 / 234 |
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

---

## 7. First analyses (70 min) and the end-of-day checkpoint

Run Q1, Q2 and Q3 at the level of the "minimum analysis" column. For each table write, in the notebook, **one sentence** that would be a slide title if it survived tomorrow. Do not format anything yet.

Useful starting queries: growth by product is week 2 with two `CASE WHEN` columns (2025 and 2026, Jan–Sep each); by region join `customers` (or `branches`; here they agree); vintages are week 3 Day 3's chain with `GROUP BY` channel or grade; collections coverage is `v_loan_status` (bucket) left-joined to the loans with a `collections_actions` row in September:

```sql
WITH delinquent AS (SELECT loan_id, bucket, outstanding FROM v_loan_status WHERE dpd BETWEEN 1 AND 90),
touched AS (SELECT DISTINCT loan_id FROM collections_actions WHERE action_date >= '2026-09-01' AND action_date <= '2026-10-01')
SELECT d.bucket, COUNT(*) AS loans, COUNT(t.loan_id) AS contacted_in_september, SUM(d.outstanding) AS outstanding
FROM delinquent d LEFT JOIN touched t ON t.loan_id = d.loan_id
GROUP BY d.bucket;
```

**Checkpoint — tick before you stop** (push to `submissions/week-08/day-3/`: `issue_tree.md`, `capstone.ipynb` draft):

- [ ] The brief restated in one sentence at the top of the notebook, with the as-of date.
- [ ] Issue tree with a hypothesis and a test per branch; your deep-dive chosen and written as a question.
- [ ] Definitions block (ten metrics, one line each).
- [ ] Data-checks section: every known problem with its handling and the number of rows affected.
- [ ] All 15 sanity numbers reproduced in cells (or a written reason for any difference).
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

1. Name the five branches of your issue tree and the table that answers each. *(→ section 5)*
2. Your FPD for the app is 1.9 %, the sanity table says 1.70 %. List three things you check, in order. *(→ section 6)*
3. Which of your hypotheses would change a recommendation if it were false? *(→ section 5)*

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
{"id": "w08d3", "q": "Before the board, Kamola's team sends their own number: 'app FPD30 is about 2 %', not the sanity table's 1.70 %. Reproduce their mistake to prove where it comes from: same FPD30 rule (clean payments to 1 Oct; FPD if not fully paid or first paid more than 30 days after the due date), but with every loan whose first instalment fell due on or before 2026-10-01 in scope. What is the app channel's FPD30 then? Give a percentage to 2 decimals.", "type": "number", "dp": 2, "h": ["9491a2398e0c3567d6ae9164"], "hint": "Only the scope's cut-off date moves; count how many app loans enter the scope and how many of them are flagged.", "sol": "Zmlyc3QgPSBpbnN0WyhpbnN0WyJpbnN0YWxsbWVudF9ubyJdID09IDEpICYgKGluc3RbImR1ZV9kYXRlIl0gPD0gIjIwMjYtMTAtMDEiKV0gICAgICAgIyB0aGUgbWlzdGFrZTogbm8gMzAtZGF5IG1hdHVyaXR5CnBhaWQxID0gcGF5W3BheVsicGFpZF9hdCJdIDw9IEFTX09GXS5ncm91cGJ5KCJpbnN0YWxsbWVudF9pZCIsIGFzX2luZGV4PUZhbHNlKS5hZ2cocGFpZD0oImFtb3VudCIsICJzdW0iKSwgZmlyc3RfcGFpZD0oInBhaWRfYXQiLCAibWluIikpCmZmID0gZmlyc3QubWVyZ2UocGFpZDEsIG9uPSJpbnN0YWxsbWVudF9pZCIsIGhvdz0ibGVmdCIpLmZpbGxuYSh7InBhaWQiOiAwfSkKZmZbImZwZDMwIl0gPSAoKGZmWyJwYWlkIl0gPCBmZlsidG90YWxfZHVlIl0pIHwgKChmZlsiZmlyc3RfcGFpZCJdIC0gZmZbImR1ZV9kYXRlIl0pLmR0LmRheXMgPiAzMCkpLmFzdHlwZShpbnQpCmZmID0gZmYubWVyZ2UobG9hbnMsIG9uPSJsb2FuX2lkIikKZmYuZ3JvdXBieSgiY2hhbm5lbCIpWyJmcGQzMCJdLmFnZyhbInN1bSIsICJzaXplIiwgIm1lYW4iXSkgICAgICMgYXBwIDUxIC8gMiA1NDIgPSAyLjAxICUKCjIuMDEgJTogdGhlIHdyb25nIHNjb3BlIGFkZHMgMTMxIGFwcCBsb2FucyB3aG9zZSBmaXJzdCBpbnN0YWxtZW50IGZlbGwgZHVlIGluIFNlcHRlbWJlcjsgMTAgb2YgdGhlbSBhcmUgbm90IHlldCBmdWxseSBwYWlkIGFuZCBhcmUgY291bnRlZCBhcyAnZGVmYXVsdHMnIGFsdGhvdWdoIHRoZXkgaGF2ZSBoYWQgbGVzcyB0aGFuIDMwIGRheXMgdG8gcGF5LgpUaGUgYm9vayBtb3ZlcyBmcm9tIDEuMjggJSB0byAxLjQxICUgKDEwNSAvIDcgNDYyKSBhbmQgdGhlIGFwcCBmcm9tIDEuNzAgJSB0byAyLjAxICUg4oCUIHRoZSBhcHAgaXMgaGl0IGhhcmRlc3QgYmVjYXVzZSAxMCBvZiB0aGUgMTQgZXh0cmEgZmxhZ3MgYXJlIGFwcCBsb2Fucy4KRm9yIHRoZSBkZWNrOiBvbmUgZGVmaW5pdGlvbnMgbGluZSAoZmlyc3QgaW5zdGFsbWVudCBkdWUgb24gb3IgYmVmb3JlIDIwMjYtMDktMDEpIGVuZHMgdGhlIGFyZ3VtZW50IGJlZm9yZSB0aGUgYm9hcmQgc2VlcyB0d28gbnVtYmVycy4="}
```

<!-- challenge:end -->
