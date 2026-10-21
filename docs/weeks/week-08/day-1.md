# Week 8 · Day 1 — Product analytics I: metrics that matter, funnels and retention

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 60 min</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:00.** The last week. Kamola, the product manager for the app (*продакт-менеджер*), puts her phone on the desk with the app open. *"Two questions, and I have been asking them since spring. **Where do we lose people in the app — and do borrowers come back?** The marketing deck has one conversion number, a slide from last quarter has another, and somebody showed me that most of our applicants never even open the app. They cannot all be true."* Madina: *"Product analytics is the same SQL you already write, asked by a different person. Before you answer Kamola, decide what each number is a share **of**. Tomorrow you put money on it, and from Wednesday you build the board review."*

## Today in 3 lines

- You place a business goal on a **metric tree**: decompose "monthly disbursed amount" into factors whose product is the total, tell **input** from **output** and **leading** from **lagging** metrics, and say which factor moved when the total moves.
- You build the **app funnel** from `app_events` — sessions, step conversion, drop-off, by device and app version — and you decide, before you divide anything, **who is in the denominator** (one population in this table is not what it seems; find it before you open the folds).
- You measure **retention the lending way**: cohorts by first-loan month, the share who take a second loan within 3, 6 and 12 months, a cohort triangle with honest blank cells, and DAU/MAU — with a sentence on why it is the wrong headline for a lender.

---

## 1. Learn — product analytics in a lending company

### What it is, and how it differs from risk analytics

Until now every request came from the **loan book**: Bekzod's outstanding, Nilufar's FPD, Sevara's buckets. The unit was a **loan**, the clock was **days past due**, the question was "how much will we lose?". **Product analytics** (*продуктовая аналитика*) asks about **people using a product**: how many arrive, how many get to the result they came for, how fast, and whether they come back. The unit is a **user or a session**, the clock is **time since the first visit**, the question is "where does the product lose people, and why?".

| | Risk / portfolio analytics | Product analytics |
|---|---|---|
| Unit | loan, instalment | user, session, event |
| Typical table | `loans`, `installments`, `payments` | `app_events`, `applications`, `customers` |
| Typical metric | PAR30, FPD, roll rate, vintage curve | funnel conversion, activation, retention, DAU/MAU |
| Typical question | "Is the October vintage worse?" | "Why do people stop between the offer and the form?" |
| Owner | portfolio manager, risk, collections | product manager, marketing, UX |

They meet at two points, and a good lending analyst lives there: **approval** (a funnel step that is a risk decision) and **repeat borrowing** (a retention metric that is also a portfolio-growth metric).

### North Star and the metric tree

A **North Star metric** (*метрика «Полярная звезда»*) is the one number that best captures the value the company delivers and earns from — for a lender, usually **disbursed amount** (or the number of good loans) per month, sometimes **outstanding of performing loans**. One number is not enough to act on, so it is decomposed into a **metric tree** (*дерево метрик*): each node is the product (or sum) of its children, down to things a team can move.

```
monthly disbursed amount  =  active customers  ×  application rate  ×  approval rate  ×  take-up rate  ×  average ticket
                              (people)            applications ÷        approved ÷        loans ÷          amount ÷
                                                  active customers      applications      approved         loans
```

The rule that makes a tree a tree: **each factor's denominator is the previous factor's numerator**, so the product telescopes to the total *exactly*. If it does not multiply back, a definition is inconsistent (a different month, a different population, a different status list) — the check is free, so always run it. Two consequences:

- The tree's approval rate is **approved ÷ all applications** (cancelled included), because the next factor starts from all approved. The risk report's approval rate excludes cancelled (week 1: approved ÷ decided). Both are legitimate; the tree simply needs the one that chains. Write the definition under the number.
- Pick one **cohort** for the whole chain. Here: applications made in the month, followed to disbursement (even if the money went out on 1 October). The calendar figure "disbursed in September" includes loans applied for in August, and its ratios would mix two populations.

When the total moves, ask **which factor moved**. With a product, use logs: ln(total₂ ÷ total₁) = Σ ln(factorₖ₂ ÷ factorₖ₁), so each factor's share of the change is its log-ratio divided by the total's log-ratio. Shares add to 100 %; a negative share means that factor worked against the change.

### Input vs output, leading vs lagging

- An **output metric** is the result (disbursed amount, profit); an **input metric** is something a team can push directly (app sessions, offer views, the share of approved who sign). Teams get input metrics as targets; the board reads output metrics.
- A **leading metric** (*опережающая метрика*) moves before the result (applications this week, FPD30 at 60 days); a **lagging metric** (*запаздывающая*) confirms it later (NPL90 after a year, write-offs). FPD is the lender's favourite leading indicator of loss; disbursements are a lagging indicator of marketing.
- A metric a team can push **without** creating value is a vanity metric. App installs, or approval rate pushed up by a looser scorecard — the second one shows up a year later in the write-offs.

### The funnel

A **funnel** (*воронка*) is an ordered list of steps and the number of units that reached each. For the Nur app:

`app_open → view_offer → start_application → submit_application → approved → contract_signed` (+ **disbursed**, from `loans`)

Two ways to express it, always both: **step conversion** (*конверсия шага*) = reached step k ÷ reached step k−1, and **conversion from the top** = reached step k ÷ reached step 1. **Drop-off** = the count lost at each step. Four decisions come before the first division:

1. **The unit.** User, session or application? In `app_events` each row has an `application_id`, and every application opened in the app has exactly one session — so a session *is* an application here, and the funnel counts sessions.
2. **Reached = has the event**, counted once per session (`MAX(CASE WHEN event_name = … THEN 1 ELSE 0 END)` per session), not "number of events".
3. **The population.** The denominator is everyone who *could* have reached the step. A funnel built on a table that only exists for some customers says nothing about the others.
4. **Attributes of the session** (device, version, region) are taken **once per session**, from a defined event (here: the `app_open`). If an attribute is logged per event, check that it is constant inside a session before you group by it.

A step can be a **business decision**, not a user action: `approved` is the scorecard. A drop there is risk policy, not UX, and the product team cannot "fix" it with a button.

### Retention in lending

A social app measures retention as "came back on day 7". A lender's customer has no reason to open the app weekly; the behaviour that matters is **coming back for another loan**. So: **cohort** (*когорта*) = customers by the month of their **first** loan; **repeat borrowing within N months** = share whose second loan was disbursed within N months of the first. A **cohort triangle** (*треугольник когорт*) puts cohorts in rows and N in columns. A cell exists only when **every** customer in the cohort has had N months to come back — a customer whose first loan was last month cannot have a 12-month repeat, and counting them as "did not repeat" makes recent cohorts look worse (or, with a naive query, identical at 6 and 12 months). Same rule as week 3's vintage blanks.

Related words: **activation** (here, the first disbursed loan), **churn** (*отток*: a customer who repaid and did not come back), **DAU/MAU** (daily / monthly active users; the ratio, average DAU ÷ MAU, is "stickiness" — *липкость*).

### Depth (optional)

- RU deck `8.1 Product Analytics.pptx` (lesson 8.1): slides 4–6 — what a metric is and why it exists; slides 7–11 — how to build one: goal → product initiatives → business questions → the metric (the Amplitude pyramid on 8–10, the one-line definition on 11: a metric tells you how what you do affects your goal); slides 12–18 — a case: MAU growing while revenue flattens (13–14), product vs growth metrics (15), a monthly KPI table with MoM and YoY (16), **cohort retention curves against a benchmark** (17), a daily product dashboard split into financial, growth and performance metrics (18); slide 19 — the summary grid (question, how, goal, metric; growth, financial, efficiency metrics). Mostly pictures: read them next to this page.
- *Russian terms:* продуктовая аналитика = product analytics, дерево метрик = metric tree, входная / выходная метрика = input / output metric, опережающая / запаздывающая = leading / lagging, воронка = funnel, конверсия шага = step conversion, отвал = drop-off, когорта = cohort, удержание = retention, отток = churn, повторный займ = repeat loan, липкость = stickiness.

---

## 2. Worked example — the metric tree for August 2026 (15 min)

**Active customer** (our definition, write it under the number): a customer who, during the month, applied in any channel, opened the app, or had a loan outstanding. Cohort = applications made in the month.

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
SELECT (SELECT COUNT(*) FROM act)                                            AS active_customers,   -- 2 846
       COUNT(*)                                                              AS applications,       -- 649
       SUM(CASE WHEN status IN ('approved', 'approved_not_disbursed') THEN 1 ELSE 0 END) AS approved, -- 392
       COUNT(principal)                                                      AS loans,              -- 363
       SUM(principal)                                                        AS disbursed           -- 23 335 710 000
FROM apps;
```

| factor | definition | August 2026 |
|---|---|---|
| active customers | as above | 2 846 |
| application rate | 649 ÷ 2 846 | 22.80 % |
| approval rate (tree) | 392 ÷ 649 | 60.40 % |
| take-up | 363 ÷ 392 | 92.60 % |
| average ticket | 23 335 710 000 ÷ 363 | 64 285 702 |
| **product** | 2 846 × 0.2280 × 0.6040 × 0.9260 × 64 285 702 | **23 335 710 000** ✓ |

The product equals the disbursed amount of August's applications to the soum, because every denominator is the previous numerator. The risk report would say approval = 392 ÷ 566 decided = 69.3 %; the tree uses 60.4 % — the difference is the 83 cancelled applications, which in the tree sit inside "approval". **The sentence:** *"August's applications produced 363 loans and 23.3 bn soum: 2 846 active customers, 22.8 % of whom applied; 60.4 % of applications were approved and 92.6 % of approvals were disbursed, at an average ticket of 64.3 m."*

`closed_at` is empty for 15 closed loans (week 3), so those customers count as "outstanding" forever in this definition; at most 15 people in a base of thousands — note it, do not let it stop you.

---

## 3. Practice (60 min)

SQL in DBeaver (or your SQL tool) on `data/raw/nur.db`, or pandas: `data/python/week8/day1_starter.ipynb` loads the tables and has a cell per task. Your choice per task; the answers are the same.

**P1.** The metric tree for **September 2026** (the worked example's definitions). Compute each factor, multiply them, and show that the product equals the amount disbursed from September's applications. Add the risk report's approval rate next to the tree's.

<details><summary>Answer</summary>

Change the dates in the worked example to September (`act` from `2026-09-01` to `2026-10-01`; loans live if `disbursed_at < '2026-10-01'` and `closed_at` empty or ≥ `2026-09-01`).

| factor | September 2026 |
|---|---|
| active customers | **2 910** |
| application rate | 621 ÷ 2 910 = **21.34 %** |
| approval rate (tree) | 383 ÷ 621 = **61.67 %** |
| take-up | 334 ÷ 383 = **87.21 %** |
| average ticket | 14 606 670 000 ÷ 334 = **43 732 545** |
| product | 2 910 × 0.21340 × 0.61675 × 0.87206 × 43 732 545 = **14 606 670 000** ✓ |

Report convention: 383 ÷ 540 decided = **70.9 %** (81 cancelled out of the denominator). The tree's number is lower by construction, not because something is wrong.
</details>

**P2.** September's applications produced less money than August's. By how much, and which factor explains most of the fall (log shares)? Then look hard at the factor in second place: is it a real change?

<details><summary>Answer</summary>

Total **−37.4 %** (23.34 bn → 14.61 bn). Factor changes and shares of the log change: active +2.2 % (−4.7 %), application rate −6.4 % (+14.2 %), approval +2.1 % (−4.5 %), take-up −5.8 % (+12.8 %), **ticket −32.0 % (+82.2 %)**. The ticket is the story: August's applications carried 14.76 bn of SME loans (39 loans), September's 6.65 bn (26) — a **mix** effect of a few very large loans, not a change in how many people borrow.

Take-up is not a real fall: **24** of September's approved applications had no loan yet on 1 October — approvals of the last days, waiting for the money. Without them take-up is 334 ÷ 359 = 93.0 %, the same as August's 92.6 %. A month that has just ended is **right-censored** at the bottom of the tree; read its last factor a week later, or compare it with August as it looked one day after month-end.
</details>

**P3.** Kamola's first question. Build the app funnel: one row per session (`application_id`), a 0/1 flag per step, then the count per step, step conversion, conversion from the top and drop-off. Add **disbursed** from `loans`. Where is the biggest loss?

<details><summary>Answer</summary>

```sql
WITH s AS (
  SELECT application_id,
         MAX(CASE WHEN event_name = 'app_open'           THEN 1 ELSE 0 END) AS opened,
         MAX(CASE WHEN event_name = 'view_offer'         THEN 1 ELSE 0 END) AS viewed,
         MAX(CASE WHEN event_name = 'start_application'  THEN 1 ELSE 0 END) AS started,
         MAX(CASE WHEN event_name = 'submit_application' THEN 1 ELSE 0 END) AS submitted,
         MAX(CASE WHEN event_name = 'approved'           THEN 1 ELSE 0 END) AS approved,
         MAX(CASE WHEN event_name = 'contract_signed'    THEN 1 ELSE 0 END) AS signed
  FROM app_events GROUP BY application_id)
SELECT SUM(opened), SUM(viewed), SUM(started), SUM(submitted), SUM(approved), SUM(signed),
       SUM(CASE WHEN l.loan_id IS NOT NULL THEN 1 ELSE 0 END) AS disbursed
FROM s LEFT JOIN loans l ON l.application_id = s.application_id;
```

| step | sessions | step conversion | from the top | drop-off |
|---|---|---|---|---|
| app_open | 5 006 | | 100 % | |
| view_offer | 4 494 | 89.8 % | 89.8 % | 512 |
| start_application | 4 003 | 89.1 % | 80.0 % | 491 |
| submit_application | 3 451 | 86.2 % | 68.9 % | **552** |
| approved | 2 915 | 84.5 % | 58.2 % | 536 |
| contract_signed | 2 915 | 100 % | 58.2 % | 0 |
| disbursed | 2 669 | 91.6 % | 53.3 % | **246** |

The funnel is a staircase with no cliff: 10–15 % is lost at each of the first four steps. The largest user-side loss is the **form** (start → submit: 552, 13.8 %). Submit → approved (536) is the scorecard, a risk decision. And one loss is not in anybody's app dashboard: **246 signed contracts never became a loan** (P7). The marketing deck's "conversion" is most likely *approved (or signed) ÷ app opens* = 58.2 %; the money conversion is 53.3 %. Ask for the definition before you agree or disagree.
</details>

**P4.** The other claim Kamola heard: "most applicants never open the app". Reproduce it: for **all** applications, left-join the sessions and compute the share with an `app_open`, by channel. Then write what "funnel conversion" means for a branch or partner customer, and give Kamola the funnel those customers *do* have.

<details><summary>Answer</summary>

5 006 of 14 000 applications have an `app_open` = **35.8 %** — and by channel: app **5 006 / 5 006 = 100 %**, branch **0 / 6 223**, partner **0 / 2 771**. `app_events` exists **only for applications made in the app**. Branch and partner customers never had an app session to lose; the 35.8 % is the app's share of applications, not a behaviour. Any funnel or "conversion" built on `app_events` must say *"app applications only"* in its title, and its denominator must be app sessions. A dashboard that left-joins events onto all customers will show a "64 % drop at app_open" that is pure population.

The funnel every channel has comes from `applications` + `loans`: applied → decided (not cancelled) → approved → disbursed.

| channel | applications | decided | approved (of decided) | disbursed (of approved) | applied → disbursed |
|---|---|---|---|---|---|
| app | 5 006 | 85.4 % | 68.2 % | 91.6 % | 53.3 % |
| branch | 6 223 | 88.0 % | 72.4 % | 90.5 % | 57.7 % |
| partner | 2 771 | 87.7 % | 70.5 % | 91.5 % | 56.6 % |

Only for the app can you see *inside* "applied → decided" (offer, form, submit). For branch and partner the steps before the application happen at a desk or a shop till and are not logged — the honest answer is "we do not measure them", not 0 %.
</details>

**P5.** The funnel by **device** and by **app version**. First check: is `device` (and `app_version`) constant inside a session? Then compare grouping events by their own device with grouping sessions by the device of their `app_open`. Is any device or version worse at any step?

<details><summary>Answer</summary>

Not constant: **3 660 of 5 006** sessions have events from more than one device value and **4 325** from more than one version — the SDK fills these per event and they cannot be trusted after the first one (a tracking defect for Jasur's list). Grouping **events** by their own device gives approved ÷ submitted **82.4 %** on Android vs **88.9 %** on iOS — a 6.5-point "iOS advantage" that is an artefact: the steps are counted on different populations. Grouping **sessions** by the `app_open` device:

| device | sessions | view | start | submit | approved | disbursed (of signed) | open → disbursed |
|---|---|---|---|---|---|---|---|
| Android | 3 368 | 90.3 % | 89.7 % | 86.5 % | 84.2 % | 91.7 % | 54.1 % |
| iOS | 1 638 | 88.7 % | 87.7 % | 85.6 % | 85.0 % | 91.3 % | 51.6 % |

Versions 3.8.0 / 3.9.1 / 4.0.0 / 4.0.2 (1 272 / 1 258 / 1 267 / 1 209 sessions): open → disbursed 52.4 / 54.1 / 52.6 / 54.3 %. Chi-square per step (3 steps × 2 attributes): smallest p = 0.045 (submit by version), next 0.055 (start by device); after a Holm correction for six tests nothing is close. **No device or version leaks more than another** — the leak is in the product's steps, not in a client. All four versions are in use in every month of the data: the app does not force updates, which is itself worth a line to Kamola.
</details>

**P6.** The funnel says approved ÷ submitted for the app is one number; week 1's approval rate for the app channel is another. Compute both and explain the difference with a cross-tab of `applications.status` against "has a submit event".

<details><summary>Answer</summary>

Funnel: 2 915 ÷ 3 451 = **84.5 %** of submitted. Report: 2 915 ÷ 4 274 decided = **68.2 %**. The cross-tab: all 2 915 approved applications have a submit event; of 1 359 rejected, only **348** do — **1 011 were rejected without ever being submitted**. The application row is created when the session opens, and the pre-check (age, blacklist, existing overdue debt) can reject it at any step before the form is sent; 732 cancelled split 544 without submit / 188 with. So the scorecard's decision on *submitted* forms approves 84.5 %; the company's approval of *applications* is 68.2 %. Two true numbers with two denominators — the classic "your approval rate does not match the report" (roles page, step 4).
</details>

**P7.** The last step. How many sessions signed a contract but have no loan, and why? Which part of that is final and which part is the as-of date?

<details><summary>Answer</summary>

**246**: **222** have status `approved_not_disbursed` — signed, and the money never went out (final; a question for operations: payout failures, card not linked, the customer withdrew); **24** have status `approved` and were decided on 29 September – 1 October — waiting for disbursement on the as-of date (censored, not lost). The real post-signature loss is 222 of 2 915 signed = **7.6 %** — larger than any single UX step after the offer, and invisible in an event funnel that ends at `contract_signed`. Rule: end a funnel at **money**, from the table that books the money.
</details>

**P8.** Kamola's second question. One row per customer: first and second loan dates (`ROW_NUMBER` by `disbursed_at`). For each first-loan month: customers, % with a second loan within 3, 6 and 12 months. Then look at the cohorts of 2026 in your result and fix what is wrong.

<details><summary>Answer</summary>

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

4 335 borrowers; 2 089 took one loan, 2 246 two or more. The earliest full cohort, **January 2024: 79 customers, 10.1 % / 20.3 % (16 people) / 36.7 %** at 3 / 6 / 12 months.

What is wrong: from **2025-10** onwards the 12-month column is a number although the window has not ended, and from 2026-04 onward m6 = m12 (e.g. 2026-06: 37.4 / 37.4 / 37.4) — those customers had three months, not twelve. Blank a cell unless **every** first loan of the cohort is at least N months old: `CASE WHEN MAX(date(first_at, '+12 months')) <= '2026-10-01' THEN … END`. With the rule, m12 exists up to the 2025-09 cohort, m6 up to 2026-03, m3 up to 2026-06. (One more caveat for the slide: the data start in January 2024, so some "first" loans of early 2024 are a customer's first loan *in our data*, not in their life.)
</details>

**P9.** The cohort triangle by **quarter** of the first loan, columns at 1, 2, 3, 6, 9, 12, 18, 24 months, only observable cells. What does the triangle say, read down the columns?

<details><summary>Answer</summary>

| first loan | 1 | 2 | 3 | 6 | 9 | 12 | 18 | 24 |
|---|---|---|---|---|---|---|---|---|
| 2024Q1 (282) | 6.0 | 10.3 | 13.1 | 22.3 | 31.9 | 41.1 | 55.3 | 68.8 |
| 2024Q2 (323) | 5.3 | 10.2 | 14.2 | 23.5 | 30.7 | 38.1 | 52.0 | 61.9 |
| 2024Q3 (364) | 7.7 | 11.0 | 16.8 | 27.7 | 34.6 | 42.0 | 53.0 | 63.7 |
| 2024Q4 (399) | 11.3 | 13.8 | 17.3 | 28.3 | 33.8 | 37.3 | 52.4 | |
| 2025Q1 (375) | 12.5 | 16.3 | 18.4 | 28.8 | 38.1 | 44.5 | 53.9 | |
| 2025Q2 (414) | 16.7 | 20.3 | 23.7 | 32.4 | 38.9 | 44.7 | | |
| 2025Q3 (450) | 16.4 | 19.8 | 22.4 | 32.4 | 41.1 | 45.6 | | |
| 2025Q4 (443) | 18.1 | 21.7 | 25.1 | 36.1 | 42.2 | | | |
| 2026Q1 (399) | 22.8 | 25.1 | 30.8 | 38.3 | | | | |
| 2026Q2 (463) | 26.1 | 29.2 | 33.0 | | | | | |

% with a second loan, cumulative. Read **down** a column (same age, later cohorts): repeat borrowing is rising steadily — at 6 months from 22.3 % (2024Q1) to 38.3 % (2026Q1); at 3 months from 13.1 % to 33.0 %. Read **across** a row: about two in three customers of 2024 had come back within two years. Kamola's answer: *borrowers do come back, more and sooner every quarter.* What it does not say: whether the repeat loans are *good* (FPD of second loans — Day 2 and the capstone) and whether the quick repeats are refinancing a struggling first loan.
</details>

**P10.** DAU, MAU and stickiness from `app_events` (distinct customers per day / per month; average DAU over all calendar days of the month ÷ MAU), for the last 12 months. Then one sentence for Kamola on why this is not the app's North Star.

<details><summary>Answer</summary>

September 2026: **MAU 201**, average DAU **7.43**, stickiness **3.7 %**; the last twelve full months run 3.3–3.8 %, MAU 151 (Oct 2025) → 214 (Aug 2026). In the last six months only 3–7 % of a month’s users were also active the month before. A social app wants 20 %+; a lender's customer opens the app when they need money, so 3–4 % is normal and pushing it up is not the goal. Also: our event log only records sessions that create an application — a real app would log payments and balance checks too, and its MAU would be larger. *"DAU/MAU measures habit; our customers do not need a habit, they need a loan when they need one — so we steer by applications, approval-to-money conversion and repeat borrowing, and keep DAU/MAU as a health line."*
</details>

<span class="badge stretch">Stretch</span> **P11.** Repeat borrowing by the **product of the first loan** (customers whose first loan was before October 2025, so 12 months are observable), and which product the second loan is.

<details><summary>Answer</summary>

First product (customers): MICRO (903) 18.7 / 29.8 / 42.2 % at 3 / 6 / 12 months; CONS (809) 18.0 / 26.9 / 40.7; BNPL (526) 20.0 / 30.6 / 43.5; AUTO (120) 15.8 / 27.5 / 44.2; SME (249) 16.9 / 24.1 / 42.6. Within the noise of a few hundred customers, **the first product hardly matters** for coming back. What they come back for (all customers, second loan by first product): after a first MICRO, the second is MICRO 263, CONS 254, BNPL 171, SME 71, AUTO 52 (720 never came back) — the app is a door into the whole book, which is the LTV argument of Day 2.
</details>

### Mistakes people make

- A metric tree whose factors do not multiply back to the total (different month, different status list, approval excluding cancelled in the middle of the chain).
- Reading the last factor of a month that ended yesterday (take-up "falls" because approvals are still waiting for money).
- Explaining a fall in the total with the factor that moved most in **percent** instead of its share of the **log** change — and missing a mix effect in the average ticket.
- Calling `app_events` "the funnel" for all customers; dividing app steps by all applications or all customers.
- Grouping events by an attribute logged per event (device, version) instead of per session.
- Ending the funnel at `contract_signed` — the money is in `loans`.
- A cohort table with numbers in cells that cannot be observed yet (m12 for a three-month-old cohort).
- DAU/MAU as the North Star of a lender.

---

## 4. Homework

None today. **HW 8.1** (your CV draft and a one-page portfolio index) is set tomorrow, due Wednesday. Keep today's queries: the capstone (Wednesday–Friday) asks for the funnel and the cohort triangle again.

---

## 5. Self-check

1. Your tree's approval rate is 62 %, the risk report says 71 % for the same month. Who is wrong? *(→ "North Star and the metric tree", P1, P6)*
2. A dashboard shows "two thirds of applicants drop before opening the app". What is the first question you ask? *(→ "The funnel", decision 3, P4)*
3. The 2026-06 cohort shows 37 % repeat borrowing at 3, 6 and 12 months. What is wrong, and how do you fix the query? *(→ "Retention in lending", P8)*

---

## 6. Company corner <span class="badge company">The metric tree of a lending company</span>

Disbursement is the product team's North Star; the **board's** is net income. Its tree, with the owner of each branch (`docs/company/roles.md`):

```
NET INCOME (before tax)                                                      — CFO / Finance (FP&A)
├── + interest income  = average portfolio × yield                            — Finance
│     ├── average portfolio  ← disbursements − repayments − write-offs         — Portfolio manager (Bekzod)
│     │     └── disbursements = active customers × application rate × approval × take-up × ticket
│     │           ├── active customers, application rate, take-up              — Product (Kamola), marketing, branch managers
│     │           ├── approval rate                                            — Risk (Nilufar): scorecard and cut-off
│     │           └── average ticket                                           — Portfolio manager: product limits, mix
│     └── yield  ← annual rate, term mix, prepayments, fees                    — Product + Finance (pricing)
├── − cost of funds  = average portfolio × funding rate                       — Treasury / Finance
├── − cost of risk   = provisions (expected loss) + write-offs − recoveries   — Risk + Collections
│     ├── PD   ← approval policy, grade mix, FPD (the leading signal), roll rates   — Risk (Nilufar)
│     ├── LGD  ← cure rate, recoveries, restructuring                         — Collections (Sevara)
│     └── EAD  ← ticket, term, amortisation                                   — Portfolio manager
└── − operating expenses  ← acquisition cost per loan (by channel), servicing, collections staff, IT   — Finance, Operations
```

What the tree is for: **every request you get is a node on it.** Kamola's funnel is the left end of disbursements; Nilufar's FPD is the leading edge of PD; Sevara's cure rate is LGD; Timur's dashboard is the tree drawn as pages. When a number at the top moves, you walk down until one child explains the change — exactly the log decomposition of P2, one level at a time.

Two September 2026 numbers to see the size of the branches (scheduled interest as a proxy for interest income; the funding rate is our assumption, 18 % a year, used again tomorrow): interest scheduled on instalments due in September **4.39 bn soum**, average outstanding (31 August and 30 September month-ends) **206.0 bn** → an annualised yield of **25.5 %**; funding at 18 % costs **3.09 bn** of that a month. The spread before risk and costs is about **7.5 points** — and week 6's crude expected loss is 1.77 % of the performing exposure. Most of a lender's profit is decided in the risk and cost branches, which is why a product team that grows approvals without watching FPD can grow the top of the tree and shrink the bottom.

| Branch of the tree | Leading metric | Lagging metric | Who asks you |
|---|---|---|---|
| Disbursements | applications, app funnel, approvals this week | disbursed amount, outstanding | Kamola, Bekzod |
| Yield | rate and term mix of new loans | interest income | Finance |
| Cost of risk | FPD30, 1–30 entries, roll 1–30 → 31–60 | NPL90, write-offs, provisions | Nilufar |
| LGD / recoveries | contact rate, promises kept, cure rate | recoveries after write-off | Sevara |
| Opex | cost per application, per loan by channel | operating expenses | Finance, Operations |

> Interview version: *"How would you build a metric tree for a lender?"* — Start from net income: interest income minus cost of funds, cost of risk and opex. Interest income is average portfolio times yield; the portfolio grows with disbursements, which decompose into active customers × application rate × approval × take-up × ticket — each a team's input metric. Cost of risk decomposes into PD (watched early through FPD), LGD and EAD. Then name an owner per branch and check that the factors multiply back to the total.

Tomorrow: money. Which product earns how much per loan once funding, risk and the cost of selling it are taken out — and the company day.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w08d1", "pass": 0.8, "questions": [
  {"type": "single", "q": "What makes a metric tree multiply back to the total exactly?", "options": ["Each factor uses the same month's calendar data", "Approval must exclude cancelled applications", "Every factor is a percentage", "Each factor's denominator is the previous factor's numerator — so the tree's approval rate is approved ÷ all applications"], "answer": 3, "explain": "The product telescopes only when the chain is consistent; the risk report's approved ÷ decided is fine, just not in the tree (→ section 1, 'North Star and the metric tree')."},
  {"type": "number", "q": "Active customers 2 846; application rate 22.80 %; approval (tree) 60.40 %; take-up 92.60 %. About how many loans did August's applications produce?", "answer": 363, "tol": 1, "explain": "2 846 × 0.2280 × 0.6040 × 0.9260 ≈ 363 — the tree multiplies back to the 363 loans and 23.3 bn of the worked example (→ section 2)."},
  {"type": "single", "q": "Why is this not the funnel's 'reached' count?", "code": "SELECT event_name, COUNT(*) AS reached\nFROM app_events\nGROUP BY event_name;", "options": ["GROUP BY must come before FROM", "COUNT(*) skips NULLs", "It is the correct funnel", "It counts events, not sessions; reached = has the event, once per session — MAX(CASE …) per application_id, then SUM"], "answer": 3, "explain": "In this data each step happens at most once per session, but the definition must not depend on that luck (→ section 1, 'The funnel', decision 2)."},
  {"type": "single", "q": "A dashboard says '64 % of applicants drop before opening the app'. What is the first question?", "options": ["Who is in the denominator — app_events exists only for applications made in the app", "Whether the app crashed", "What the drop was last month", "Which app version they used"], "answer": 0, "explain": "Branch and partner customers never had an app session to lose; an app funnel must say 'app applications only' (→ P4)."},
  {"type": "single", "q": "device and app_version are logged per event and change inside a session. How do you group the funnel by device?", "options": ["By the most common device in the table", "You cannot group by device", "By each event's own device", "By session, taking the device of the session's app_open"], "answer": 3, "explain": "Grouping events by their own device counts each step on a different population — the 'iOS advantage' was an artefact (→ section 1, decision 4, P5)."},
  {"type": "multi", "q": "Which are leading metrics?", "options": ["FPD30 at 60 days", "Applications this week", "NPL90 after a year", "Write-offs", "1–30 DPD entries"], "answer": [0, 1, 4], "explain": "Leading metrics move before the result; NPL90 and write-offs confirm it later (→ section 1, 'Input vs output, leading vs lagging')."},
  {"type": "single", "q": "What is wrong, and what is the fix?", "code": "-- repeat borrowing, first-loan cohort 2026-06\n-- m3 = 37.4 % · m6 = 37.4 % · m12 = 37.4 %", "options": ["Nothing — these customers repeat early", "The 6- and 12-month windows have not ended for this cohort; blank a cell unless every first loan of the cohort is at least N months old", "Use COUNT(DISTINCT customer_id)", "Start the cohort at the application date"], "answer": 1, "explain": "An unobservable cell is 'not measured', not 'did not repeat' — the same rule as week 3's vintage blanks (→ section 1, 'Retention in lending', P8)."},
  {"type": "single", "q": "Company corner: on the net-income tree, which branch does Sevara's cure rate belong to?", "options": ["Operating expenses", "Cost of risk → LGD", "Interest income → yield", "Disbursements → take-up"], "answer": 1, "explain": "Cure rate, recoveries and restructuring drive LGD, a child of cost of risk (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w08d1", "q": "Bekzod: 'August's applications brought more money than July's — was it the customers or the tickets?' Build the worked example's metric tree for July 2026 (same definitions, July dates) and compare it with August's. What share of the log change in the total is explained by the APPLICATION RATE factor (its log-ratio ÷ the total's log-ratio; negative = it worked against the change)? Give a percentage to 1 decimal, with its sign.", "type": "number", "dp": 1, "h": ["52430fb972089788b5ef2533"], "hint": "Check that July's five factors multiply back to July's disbursed amount before you take any logs.", "sol": "SnVseSAyMDI2IHdpdGggdGhlIHdvcmtlZCBleGFtcGxlJ3MgcXVlcnkgKGFjdCBmcm9tIDIwMjYtMDctMDEgdG8gMjAyNi0wOC0wMTsgbG9hbnMgbGl2ZSBpZiBkaXNidXJzZWRfYXQgPCAnMjAyNi0wOC0wMScgYW5kIGNsb3NlZF9hdCBlbXB0eSBvciA+PSAnMjAyNi0wNy0wMScpOgphY3RpdmUgMiA3NTYgwrcgYXBwbGljYXRpb25zIDY1NyDCtyBhcHByb3ZlZCAzOTggwrcgbG9hbnMgMzcwIMK3IGRpc2J1cnNlZCAyMSAyMzMgNDMwIDAwMApmYWN0b3JzOiBhcHBsaWNhdGlvbiByYXRlIDIzLjg0ICUgwrcgYXBwcm92YWwgNjAuNTggJSDCtyB0YWtlLXVwIDkyLjk2ICUgwrcgdGlja2V0IDU3IDM4NyA2NDkg4oaSIHByb2R1Y3QgMjEgMjMzIDQzMCAwMDAg4pyTCkF1Z3VzdDogMiA4NDYgwrcgMjIuODAgJSDCtyA2MC40MCAlIMK3IDkyLjYwICUgwrcgNjQgMjg1IDcwMiDihpIgMjMgMzM1IDcxMCAwMDAKCmltcG9ydCBtYXRoClQgPSBtYXRoLmxvZygyM18zMzVfNzEwXzAwMCAvIDIxXzIzM180MzBfMDAwKSAgICAgICAgICAgICAgICAgICAgIyArOS45ICUgdG90YWwKbWF0aC5sb2coKDY0OSAvIDI4NDYpIC8gKDY1NyAvIDI3NTYpKSAvIFQgKiAxMDAgICAgICAgICAgICAgICAgICAjIOKIkjQ3LjAKIyBzaGFyZXM6IGFjdGl2ZSArMzQuMCDCtyBhcHBsaWNhdGlvbiByYXRlIOKIkjQ3LjAgwrcgYXBwcm92YWwg4oiSMy4xIMK3IHRha2UtdXAg4oiSNC4xIMK3IHRpY2tldCArMTIwLjIgKHN1bSAxMDApCgriiJI0Ny4wICU6IGEgc21hbGxlciBzaGFyZSBvZiBhY3RpdmUgY3VzdG9tZXJzIGFwcGxpZWQgaW4gQXVndXN0ICgyMi44ICUgdnMgMjMuOCAlKSwgYW5kIHRoYXQgYWxvbmUgd291bGQgaGF2ZSBjdXQgdGhlIHRvdGFsIGJ5IGFsbW9zdCBoYWxmIG9mIHRoZSByaXNlIHRoYXQgYWN0dWFsbHkgaGFwcGVuZWQuClRoZSByaXNlIGNhbWUgZnJvbSB0aGUgdGlja2V0ICgrMTIwICUgb2YgdGhlIGNoYW5nZTogNjQuMyBtIHZzIDU3LjQgbSBwZXIgbG9hbikgYW5kIGEgbGFyZ2VyIGN1c3RvbWVyIGJhc2UgKCszNCAlKSDigJQgYmlnZ2VyIGxvYW5zLCBub3QgbW9yZSBib3Jyb3dpbmcuCkZvciBCZWt6b2Q6IEF1Z3VzdCdzICs5LjkgJSBpcyBhIG1peCBlZmZlY3Qgb2YgbGFyZ2UgbG9hbnM7IHRoZSBwZW9wbGUgc2lkZSBvZiB0aGUgdHJlZSBtb3ZlZCB0aGUgb3RoZXIgd2F5LCB3aGljaCBpcyB0aGUgbGluZSB3b3J0aCB3YXRjaGluZyBpbiBTZXB0ZW1iZXIu"}
```

<!-- challenge:end -->
