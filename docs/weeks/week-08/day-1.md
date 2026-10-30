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

```task
{"id": "w08d1-l1", "kind": "number", "answer": 74.7, "dp": 1, "unit": "%", "hint": "WHERE channel = 'branch' — the other three parts stay the same.", "model": "186 approved of 249 decided = 74.7 %. Only the filter changed; numerator, denominator and period are the same, so the two channels can be compared."}
```

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

```game
{"type": "order", "id": "w08d1-g1", "title": "Chain the tree", "q": "Put the factors in the order that multiplies back to the monthly disbursed amount — each denominator is the previous numerator.", "items": ["active customers", "application rate = applications ÷ active customers", "approval rate = approved ÷ applications", "take-up = loans ÷ approved", "average ticket = amount ÷ loans"], "why": "Active × (applications ÷ active) × (approved ÷ applications) × (loans ÷ approved) × (amount ÷ loans): everything cancels except the amount. Change one denominator (approved ÷ decided) and the chain no longer telescopes."}
```

### The lending funnel — visit → application → approval → disbursement → repayment

**What it is.** A **funnel** (*воронка*) is an ordered list of steps and the number of units that reached each one. A lender's funnel ends at money coming back: **visit → application → approval → disbursement → repayment**. **Step conversion** (*конверсия шага*) = reached this step ÷ reached the previous step. **Conversion from the top** = reached this step ÷ reached step 1.

```pic
{"id": "w08d1-pic1", "title": "The funnel narrows at every step down to money that comes back", "caption": "App sessions opened January–June 2026: 1 252 visits, 854 applications, 719 approvals, 659 loans paid out and 549 first instalments paid on time — 43.8 % of the top.", "chart": {"type": "bars", "labels": ["visit", "apply", "appr.", "loan", "repaid"], "values": [1252, 854, 719, 659, 549], "hl": [4], "show": true, "note": "y: app sessions, Jan–Jun 2026"}}
```

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

```game
{"type": "order", "id": "w08d1-g3", "title": "The Nur app funnel", "q": "Put the steps in the order a session reaches them, ending at money.", "items": ["app_open", "view_offer", "start_application", "submit_application", "approved", "contract_signed", "disbursed (from loans)"], "why": "Six events in app_events, then the money from loans. A funnel that stops at contract_signed misses the payouts that never happened (P7)."}
```

Then read the table above: what is the step conversion from **approval to disbursement**, in %?

```task
{"id": "w08d1-l2", "kind": "number", "answer": 91.7, "dp": 1, "unit": "%", "hint": "Disbursement ÷ approval: 659 ÷ 719.", "model": "659 ÷ 719 = 91.7 %. About one approved session in twelve never became money — the post-signature loss that P7 investigates."}
```

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

```task
{"id": "w08d1-l3", "kind": "choice", "options": ["The app team — the button after the form is badly placed", "Risk — approval is the scorecard's decision, not a user action", "Marketing — they bring the wrong visitors", "Nobody — it is a tracking error"], "answer": 1, "explain": "The approved event is written when the scorecard says yes. A drop there is credit policy; the app team cannot fix it with a button. Report it, but give it to Risk."}
```

### Retention — coming back for another loan

**What it is.** **Retention** (*удержание*) is the share of a group that comes back after a time N. A social app counts people who open it again on day 7. A lender counts borrowers who take **another loan**: retention at N months = customers with a second loan within N months of the first ÷ customers in the group.

```pic
{"id": "w08d1-pic2", "title": "Retention asks: did the second loan come within N months?", "caption": "Customers whose first loan is in January 2025, N = 6. Green rows came back in time; customer 18 missed by eight days, 93 never came back. All 141 count in the denominator: 38 came back, **27.0 %**.", "tables": [{"name": "pairs", "cols": ["customer_id", "first_at", "second_at", "back_6m"], "rows": [[18, "2025-01-01", "2025-07-09", 0], [93, "2025-01-01", null, 0], [530, "2025-01-01", "2025-01-11", 1], [5671, "2025-01-01", "2026-04-08", 0], [1520, "2025-01-02", "2025-05-21", 1]], "new": ["back_6m"], "keep": [2, 4], "more": "… 141 customers"}]}
```

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

> ⚠️ **Watch out.** The denominator is everyone who started, not the people still here. Divide by today's active borrowers and you measure survivors, who always look loyal.

**Your turn.** The same January 2025 group: retention at **12** months, in %.

```task
{"id": "w08d1-l4", "kind": "number", "answer": 46.1, "dp": 1, "unit": "%", "hint": "Change both '+6 months' to '+12 months'.", "model": "65 of 141 = 46.1 %. Retention only grows with N: everyone back within 6 months is also back within 12."}
```

### Cohort by month — grouping people by when they started

**What it is.** A **cohort** (*когорта*) is a group of customers who started in the same period. For a lender, "started" means the first loan, so the **cohort month** is the month of the customer's first disbursement. It never changes, however many loans follow.

```pic
{"id": "w08d1-pic3", "title": "The cohort is the month of the first loan, on every later loan too", "caption": "Two customers, three loans each. Customer 245's second loan came in February, but every row keeps the cohort of the first loan: 2025-01. Same colour, same customer.", "tables": [{"name": "loans", "cols": ["customer_id", "disbursed_at", "n", "cohort"], "rows": [[18, "2025-01-01", 1, "2025-01"], [18, "2025-07-09", 2, "2025-01"], [18, "2025-12-08", 3, "2025-01"], [245, "2025-01-31", 1, "2025-01"], [245, "2025-02-18", 2, "2025-01"], [245, "2025-05-29", 3, "2025-01"]], "new": ["n", "cohort"], "tone": ["a", "a", "a", "b", "b", "b"], "more": "… 18 has a 4th loan"}]}
```

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

```task
{"id": "w08d1-l5", "kind": "number", "answer": 148, "dp": 0, "unit": "customers", "hint": "Run the query above and read the 2025-06 row.", "model": "148 customers took their first Nur loan in June 2025."}
```

### The retention table and the retention curve

**What it is.** A **retention table** puts cohorts in rows and the age N in columns; each cell is that cohort's retention at that age. A cell exists only when **every** customer of the cohort has had N months; otherwise it stays blank. A **retention curve** draws one row of the table as a line over N.

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

```task
{"id": "w08d1-l6", "kind": "number", "answer": 36.1, "dp": 1, "unit": "%", "hint": "Row 2025Q4, column m6.", "model": "36.1 %. Its m12 cell is blank: the cohort's December customers reach 12 months only in December 2026."}
```

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

```task
{"id": "w08d1-l7", "kind": "number", "answer": 87.9, "dp": 1, "unit": "%", "hint": "Change both '+6 months' to '+3 months'.", "model": "46 came back within three months, 334 did not: 334 ÷ 380 = 87.9 %. A shorter window means more churn — so the window is part of the definition."}
```

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

```task
{"id": "w08d1-l8", "kind": "number", "answer": 214, "dp": 0, "unit": "customers", "hint": "The first subquery, with August dates.", "model": "214 — the highest month of the year; September has 201."}
```

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

```game
{"type": "sort", "id": "w08d1-g2", "title": "Leading, lagging or vanity?", "q": "Sort each Nur Finance number.", "groups": {"Leading (moves first)": ["Applications this week", "FPD30 of last month's loans", "1–30 DPD entries this month", "Offer views in the app"], "Lagging (confirms later)": ["NPL90 a year after disbursement", "Write-offs", "Net income for the year"], "Vanity (moves without value)": ["App installs", "Approval rate after loosening the cut-off"]}, "why": "Leading metrics warn you while you can still act; lagging ones confirm the result; vanity metrics can be pushed up without one more good loan."}
```

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

```game
{"id": "w08d1-g5", "type": "sort", "title": "Which concept?", "groups": {"Metric definition": ["Why does our approval rate not match the risk report?"], "Metric tree": ["Disbursements fell 37 % — which driver moved?"], "Funnel and leaky steps": ["Where do app users give up?", "Who owns the drop at approval?"], "Retention and cohorts": ["Do January's new borrowers come back within six months?"], "Churn": ["How many customers who repaid in Q1 never borrowed again?"], "Active users": ["How many customers used the app last month?"], "Vanity vs actionable": ["Should 'total registered customers' be on the board's first page?"]}}
```

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Metric system, AARRR, metric tree / North Star (RU) — [Все продуктовые метрики за 15 минут — без воды | DAU, Retention, LTV (Аналитика без воды), 00:31](https://youtu.be/X4asNCIMBRg?t=31&end=90)
- ▶ Funnels (RU) — same video, [06:41](https://youtu.be/X4asNCIMBRg?t=401&end=459)
- ▶ Retention (RU) — same video, [05:15](https://youtu.be/X4asNCIMBRg?t=315&end=401)
- ▶ Metric trees (EN, long) — [Analytics for Product Managers Masterclass (HelloPM), 1:17:30](https://youtu.be/N-Igkw7__z0?t=4650&end=4810)
- ▶ Cohorts, how to read the chart — [What is a Cohort? How to Read a Cohort Analysis Chart... (Peel), 01:21](https://youtu.be/mb2_kskQDDU?t=81)
- ▶ Retention by cohort, calculated — [Customer Retention & Cohort Analysis (Eric Andrews), 04:11](https://youtu.be/OwCATJh4lNg?t=251&end=434)
- ▶ Cohorts (RU, long) — [Когортный анализ и важнейшие метрики продукта (ProductStar), 29:00](https://youtu.be/uYYh69Nf-34?t=1740&end=2780)

- RU deck (TBC Data Analytics 2.0, if you have it) `8.1 Product Analytics.pptx` (lesson 8.1): slides 4–6 — what a metric is and why it exists; slides 7–11 — how to build one: goal → product initiatives → business questions → the metric (the Amplitude pyramid on 8–10, the one-line definition on 11: a metric tells you how what you do affects your goal); slides 12–18 — a case: MAU growing while revenue flattens (13–14), product vs growth metrics (15), a monthly KPI table with MoM and YoY (16), **cohort retention curves against a benchmark** (17), a daily product dashboard split into financial, growth and performance metrics (18); slide 19 — the summary grid (question, how, goal, metric; growth, financial, efficiency metrics). Mostly pictures: read them next to this page.
- *Russian terms:* продуктовая аналитика = product analytics, дерево метрик = metric tree, входная / выходная метрика = input / output metric, опережающая / запаздывающая = leading / lagging, воронка = funnel, конверсия шага = step conversion, отвал = drop-off, когорта = cohort, удержание = retention, отток = churn, повторный займ = repeat loan, липкость = stickiness.

```videoquiz
{"video": "X4asNCIMBRg", "stops": [{"at": 70, "q": "What is a North Star metric?", "options": ["The one number that best captures the value the company delivers and earns from", "The number of app installs", "The sum of all the team's metrics", "Whichever metric grew fastest this month"], "answer": 0, "explain": "One number for the whole company — for a lender, usually disbursed amount (or good loans) per month — then decomposed into a tree."}, {"at": 360, "q": "What does retention measure?", "options": ["Revenue per user", "The share of a cohort that comes back after N days or months", "New users this month", "All users active today"], "answer": 1, "explain": "Retention follows one cohort over time. For Nur, 'coming back' means taking a second loan.", "back": 40}, {"at": 440, "q": "What does a funnel's step conversion compare?", "options": ["Users at a step ÷ users at the previous step", "Users at a step ÷ everyone who ever opened the app", "Revenue ÷ users", "Steps ÷ sessions"], "answer": 0, "explain": "Step conversion is k ÷ k−1; conversion from the top is k ÷ step 1. Always show both."}]}
```

```videoquiz
{"video": "N-Igkw7__z0", "stops": [{"at": 4700, "q": "What is a metric tree for?", "options": ["Listing every dashboard the company has", "Breaking the North Star into drivers that teams can move", "Ranking employees", "Replacing the funnel"], "answer": 1, "explain": "Each node is the product (or sum) of its children, down to things a team can push — today's five factors."}, {"at": 4790, "q": "A good child metric in the tree is…", "options": ["Any number that is easy to collect", "A lagging financial result", "Something a team can influence directly and that moves its parent", "App installs"], "answer": 2, "explain": "Input metrics go to teams as targets; the board reads the output at the top.", "back": 60}]}
```

```videoquiz
{"video": "mb2_kskQDDU", "stops": [{"at": 150, "q": "In a cohort chart, what is one row?", "options": ["One day of revenue", "One product", "A group of users who started in the same period", "One marketing channel"], "answer": 2, "explain": "Rows are cohorts (here: the month or quarter of the first loan); columns are the age."}, {"at": 420, "q": "Reading down one column compares…", "options": ["Different cohorts at the same age", "The same cohort over time", "Days of the week", "Channels"], "answer": 0, "explain": "Down a column = same age, later cohorts: is the product getting better? Across a row = one cohort ageing.", "back": 60}]}
```

```videoquiz
{"video": "OwCATJh4lNg", "stops": [{"at": 300, "q": "A cohort's retention in month N is…", "options": ["Active users in month N ÷ all users ever", "Members of the cohort still returning in month N ÷ the cohort's starting size", "New users ÷ churned users", "Revenue growth in month N"], "answer": 1, "explain": "The denominator is the cohort's own starting size — never the whole user base."}, {"at": 410, "q": "Why does a cohort that started last month have no 12-month number?", "options": ["It has fewer users", "Retention only works for old cohorts", "It has not lived 12 months — the cell is not observed, not zero", "The query is wrong"], "answer": 2, "explain": "Blank the cell until every member has had N months — the rule you apply in P8.", "back": 60}]}
```

```videoquiz
{"video": "uYYh69Nf-34", "stops": [{"at": 1950, "q": "Why analyse by cohort instead of the total?", "options": ["Cohorts are smaller and faster to compute", "The total mixes users of different ages; cohorts compare like with like", "Totals cannot be charted", "Cohorts remove seasonality completely"], "answer": 1, "explain": "A growing base of new users drags a total down even when every cohort behaves the same."}, {"at": 2300, "q": "Which numbers are typically computed per cohort?", "options": ["Retention and revenue per user", "Total installs", "Headcount", "The number of screens in the app"], "answer": 0, "explain": "Per cohort: who came back and what they brought — repeat borrowing and, tomorrow, LTV."}, {"at": 2650, "q": "A newer cohort retains better than older ones at the same age. What does it suggest?", "options": ["Nothing — newer cohorts always look better", "A data error", "The product or the customer mix changed — find out which", "Retention should be dropped as a metric"], "answer": 2, "explain": "That is exactly P9's triangle: 6-month repeat borrowing rose from 22 % to 38 %. The next question is why — and whether the repeat loans are good.", "back": 60}]}
```

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

```task
{"id": "w08d1-p1", "kind": "sql", "note": "One row, six numbers: active customers, applications, approved, loans, disbursed amount, decided. Dates: activity in September; loans live if disbursed before 1 October and not closed before 1 September.", "model": "WITH act AS (\n  SELECT customer_id FROM applications WHERE applied_at >= '2026-09-01' AND applied_at < '2026-10-01'\n  UNION SELECT customer_id FROM app_events WHERE event_time >= '2026-09-01' AND event_time < '2026-10-01'\n  UNION SELECT customer_id FROM loans\n        WHERE disbursed_at < '2026-10-01' AND (closed_at IS NULL OR closed_at >= '2026-09-01')),\napps AS (\n  SELECT a.application_id, a.status, l.principal\n  FROM applications a LEFT JOIN loans l ON l.application_id = a.application_id\n  WHERE a.applied_at >= '2026-09-01' AND a.applied_at < '2026-10-01')\nSELECT (SELECT COUNT(*) FROM act) AS active_customers,\n       COUNT(*) AS applications,\n       SUM(CASE WHEN status IN ('approved', 'approved_not_disbursed') THEN 1 ELSE 0 END) AS approved,\n       COUNT(principal) AS loans,\n       SUM(principal) AS disbursed,\n       SUM(CASE WHEN status <> 'cancelled' THEN 1 ELSE 0 END) AS decided\nFROM apps;"}
```

**P1 — read it.** From your row: the tree's approval rate for September (approved ÷ all applications), in %, two decimals. Then multiply all five factors and check that the product lands on the disbursed amount.

```task
{"id": "w08d1-p1b", "kind": "number", "answer": 61.67, "dp": 2, "unit": "%", "hint": "383 approved ÷ 621 applications.", "model": "active 2 910 · application rate 621 ÷ 2 910 = 21.34 % · approval (tree) 383 ÷ 621 = 61.67 % · take-up 334 ÷ 383 = 87.21 % · ticket 14 606 670 000 ÷ 334 = 43 732 545 → product 14 606 670 000 ✓. The risk report's convention: 383 ÷ 540 decided = 70.9 % (81 cancelled out of the denominator). The tree's number is lower by construction, not because something is wrong — write the definition under each."}
```

**P2.** *(metric tree)* September's applications produced less money than August's. By how much, and which factor explains most of the fall? Finish the code: print each factor's change and its **share of the log change** (section 1, 'A metric tree'). Which factor's share is largest, in %?

```task
{"id": "w08d1-p2", "kind": "python", "starter": "import math\naug = {\"active\": 2846, \"applications\": 649, \"approved\": 392, \"loans\": 363, \"amount\": 23_335_710_000}\nsep = {\"active\": 2910, \"applications\": 621, \"approved\": 383, \"loans\": 334, \"amount\": 14_606_670_000}\n\ndef factors(m):\n    return {\"active customers\": m[\"active\"],\n            \"application rate\": m[\"applications\"] / m[\"active\"],\n            \"approval (tree)\":  m[\"approved\"] / m[\"applications\"],\n            \"take-up\":          m[\"loans\"] / m[\"approved\"],\n            \"average ticket\":   m[\"amount\"] / m[\"loans\"]}\n\nfa, fs = factors(aug), factors(sep)\ntotal = math.log(sep[\"amount\"] / aug[\"amount\"])\nprint(f\"total change {sep['amount'] / aug['amount'] - 1:.1%}\")\n# TODO: for each factor k print its change (fs[k] / fa[k] - 1) and its share of the log change,\n#       math.log(fs[k] / fa[k]) / total * 100, to one decimal\n", "answer": 82.2, "dp": 1, "model": "Total −37.4 % (23.34 bn → 14.61 bn). Change and share of the log change: active +2.2 % (−4.7 %), application rate −6.4 % (+14.2 %), approval +2.1 % (−4.5 %), take-up −5.8 % (+12.8 %), ticket −32.0 % (+82.2 %). The shares add to 100. The ticket is the story: August's applications carried 14.76 bn of SME loans (39 loans), September's 6.65 bn (26) — a mix effect of a few very large loans, not a change in how many people borrow."}
```

**P2 — read it.** Take-up is in second place (+12.8 % of the fall: 92.6 % → 87.2 %). Is that a real change?

```task
{"id": "w08d1-p2b", "kind": "choice", "options": ["Yes — September's customers refused more of their approved loans", "No — 24 approvals of the last days of September were still waiting for the money on 1 October; without them take-up is about 93 %, the same as August", "No — take-up cannot be compared between months", "Yes — the app lost customers after the contract"], "answer": 1, "explain": "24 of September's approved applications had no loan yet on the as-of date: approvals of 29 September – 1 October. Without them take-up is 334 ÷ 359 = 93.0 %, the same as August's 92.6 %. A month that has just ended is right-censored at the bottom of the tree; read its last factor a week later, or compare it with August as it looked one day after month-end."}
```

**P3.** *(lending funnel)* Kamola's first question. Build the app funnel: one row per session (`application_id`) with a 0/1 flag per step (`MAX(CASE …)`), then the number of sessions that reached each step. Add **disbursed** from `loans` (a `LEFT JOIN` on `application_id`).

```task
{"id": "w08d1-p3", "kind": "sql", "note": "One row, seven counts: opened, viewed offer, started, submitted, approved, signed, disbursed.", "model": "WITH s AS (\n  SELECT application_id,\n         MAX(CASE WHEN event_name = 'app_open'           THEN 1 ELSE 0 END) AS opened,\n         MAX(CASE WHEN event_name = 'view_offer'         THEN 1 ELSE 0 END) AS viewed,\n         MAX(CASE WHEN event_name = 'start_application'  THEN 1 ELSE 0 END) AS started,\n         MAX(CASE WHEN event_name = 'submit_application' THEN 1 ELSE 0 END) AS submitted,\n         MAX(CASE WHEN event_name = 'approved'           THEN 1 ELSE 0 END) AS approved,\n         MAX(CASE WHEN event_name = 'contract_signed'    THEN 1 ELSE 0 END) AS signed\n  FROM app_events GROUP BY application_id)\nSELECT SUM(opened), SUM(viewed), SUM(started), SUM(submitted), SUM(approved), SUM(signed),\n       SUM(CASE WHEN l.loan_id IS NOT NULL THEN 1 ELSE 0 END) AS disbursed\nFROM s LEFT JOIN loans l ON l.application_id = s.application_id;"}
```

**P3 — read it.** Compute step conversion (k ÷ k−1), conversion from the top and drop-off from your seven counts. Where does the app lose the most people **on the user's side**?

```task
{"id": "w08d1-p3b", "kind": "choice", "options": ["At the offer (open → view)", "At the form (start → submit)", "At approval (submit → approved)", "After signing (signed → disbursed)"], "answer": 1, "explain": "Sessions 5 006 → 4 494 → 4 003 → 3 451 → 2 915 → 2 915 → 2 669. Step conversion 89.8 / 89.1 / 86.2 / 84.5 / 100 / 91.6 %; from the top 53.3 % reach money. A staircase with no cliff: 10–15 % lost at each of the first four steps. The largest user-side loss is the form (552 sessions, 13.8 %). Submit → approved (536) is the scorecard — a risk decision, not UX. And 246 signed contracts never became a loan (P7). The marketing deck's \"conversion\" is most likely approved (or signed) ÷ app opens = 58.2 %; the money conversion is 53.3 %. Ask for the definition before you agree or disagree."}
```

**P4.** *(leaky steps — the population)* The other claim Kamola heard: "most applicants never open the app". Reproduce it: for **all** applications, left-join the sessions that have an `app_open` and count, by channel, the applications and how many of them have one; add the share in %.

```task
{"id": "w08d1-p4", "kind": "sql", "note": "Three rows (app, branch, partner): channel, applications, with an app_open, share in % to one decimal. Join to the DISTINCT application_ids that have an app_open, so a session is counted once.", "model": "SELECT a.channel, COUNT(*) AS applications, COUNT(o.application_id) AS with_app_open,\n       ROUND(100.0 * COUNT(o.application_id) / COUNT(*), 1) AS pct\nFROM applications a\nLEFT JOIN (SELECT DISTINCT application_id FROM app_events WHERE event_name = 'app_open') o\n       ON o.application_id = a.application_id\nGROUP BY a.channel ORDER BY a.channel;"}
```

**P4 — read it.** Write Kamola two or three sentences: what "most applicants never open the app" really shows, what "funnel conversion" means for a branch or partner customer, and which funnel those customers *do* have.

```task
{"id": "w08d1-p4b", "kind": "free", "min": 40, "rubric": ["says app_events exists only for applications made in the app (app 100 %, branch and partner 0 %)", "calls the 35.8 % a population share, not a behaviour", "says an app funnel must be titled 'app applications only' with app sessions as the denominator", "gives the funnel every channel has: applied → decided → approved → disbursed, from applications + loans"], "model": "5 006 of 14 000 applications have an app_open (35.8 %) — but by channel it is app 5 006 / 5 006 = 100 %, branch 0 / 6 223, partner 0 / 2 771. app_events exists only for applications made in the app; branch and partner customers never had an app session to lose, so 35.8 % is the app's share of applications, not a behaviour. Any funnel built on app_events must say \"app applications only\", with app sessions as the denominator. The funnel every channel has comes from applications + loans: applied → decided (not cancelled) → approved → disbursed — app 5 006 · 85.4 % · 68.2 % · 91.6 % (53.3 % end to end), branch 6 223 · 88.0 % · 72.4 % · 90.5 % (57.7 %), partner 2 771 · 87.7 % · 70.5 % · 91.5 % (56.6 %). For branch and partner the steps before the application happen at a desk or a shop till and are not logged: the honest answer is \"we do not measure them\", not 0 %."}
```

**P5.** *(leaky steps — segment by the unit)* The funnel by **device**. First check: is `device` constant inside a session? (`COUNT(DISTINCT device)` per `application_id` — try it in the box.) Then build the funnel by session, taking each session's device **from its `app_open` event**: sessions and step conversion at every step, plus open → disbursed.

```task
{"id": "w08d1-p5", "kind": "sql", "note": "Two rows (android, ios), eight columns: device, sessions, then step conversion in % to one decimal — view ÷ open, start ÷ view, submit ÷ start, approved ÷ submit, disbursed ÷ signed — and disbursed ÷ sessions.", "model": "WITH s AS (\n  SELECT application_id,\n         MAX(CASE WHEN event_name = 'app_open' THEN device END)               AS device,\n         MAX(CASE WHEN event_name = 'app_open'           THEN 1 ELSE 0 END) AS opened,\n         MAX(CASE WHEN event_name = 'view_offer'         THEN 1 ELSE 0 END) AS viewed,\n         MAX(CASE WHEN event_name = 'start_application'  THEN 1 ELSE 0 END) AS started,\n         MAX(CASE WHEN event_name = 'submit_application' THEN 1 ELSE 0 END) AS submitted,\n         MAX(CASE WHEN event_name = 'approved'           THEN 1 ELSE 0 END) AS approved,\n         MAX(CASE WHEN event_name = 'contract_signed'    THEN 1 ELSE 0 END) AS signed\n  FROM app_events GROUP BY application_id)\nSELECT device, COUNT(*) AS sessions,\n       ROUND(100.0 * SUM(viewed) / SUM(opened), 1)      AS view_pct,\n       ROUND(100.0 * SUM(started) / SUM(viewed), 1)     AS start_pct,\n       ROUND(100.0 * SUM(submitted) / SUM(started), 1)  AS submit_pct,\n       ROUND(100.0 * SUM(approved) / SUM(submitted), 1) AS approved_pct,\n       ROUND(100.0 * COUNT(l.loan_id) / SUM(signed), 1) AS disbursed_pct,\n       ROUND(100.0 * COUNT(l.loan_id) / COUNT(*), 1)    AS open_to_money_pct\nFROM s LEFT JOIN loans l ON l.application_id = s.application_id\nGROUP BY device ORDER BY device;"}
```

**P5 — read it.** Grouping **events** by their own device gives approved ÷ submitted 82.4 % on Android and 88.9 % on iOS. Your session table gives 84.2 % and 85.0 %. Which reading is right, and is any device worse?

```task
{"id": "w08d1-p5b", "kind": "choice", "options": ["The event table: iOS converts 6.5 points better after the form", "The session table: device changes inside a session, so grouping events by their own device counts each step on a different population — and no device leaks more than another", "Neither: device cannot be used at all", "Both: the difference is the scorecard"], "answer": 1, "explain": "Not constant: 3 660 of 5 006 sessions have events from more than one device value and 4 325 from more than one app_version — the SDK fills these per event (a tracking defect for Jasur's list). The 6.5-point \"iOS advantage\" is an artefact. By the app_open device: Android 3 368 sessions, 90.3 / 89.7 / 86.5 / 84.2 / 91.7 %, open → money 54.1 %; iOS 1 638, 88.7 / 87.7 / 85.6 / 85.0 / 91.3 %, 51.6 %. Versions 3.8.0 / 3.9.1 / 4.0.0 / 4.0.2: open → disbursed 52.4 / 54.1 / 52.6 / 54.3 %. Chi-square per step: smallest p = 0.045, and after a Holm correction for six tests nothing is close. The leak is in the product's steps, not in a client. All four versions are in use in every month: the app does not force updates — worth a line to Kamola."}
```

**P6.** *(leaky steps — a business decision)* The funnel says approved ÷ submitted for the app is 84.5 %; week 1's approval rate for the app channel (approved ÷ decided) is another number. Explain the difference with a cross-tab: for app applications, by `applications.status`, the number of applications and how many of them have a `submit_application` event.

```task
{"id": "w08d1-p6", "kind": "sql", "note": "Four rows (approved, approved_not_disbursed, cancelled, rejected): status, applications, with a submit event. App channel only.", "model": "SELECT a.status, COUNT(*) AS applications,\n       SUM(CASE WHEN s.application_id IS NOT NULL THEN 1 ELSE 0 END) AS with_submit\nFROM applications a\nLEFT JOIN (SELECT DISTINCT application_id FROM app_events WHERE event_name = 'submit_application') s\n       ON s.application_id = a.application_id\nWHERE a.channel = 'app'\nGROUP BY a.status ORDER BY a.status;"}
```

**P6 — read it.** How many app applications were **rejected without ever being submitted**?

```task
{"id": "w08d1-p6b", "kind": "number", "answer": 1011, "dp": 0, "unit": "applications", "hint": "Rejected applications minus rejected applications with a submit event.", "model": "1 359 rejected − 348 with a submit = 1 011. Every approved application (2 693 + 222 = 2 915) has a submit event. The application row is created when the session opens, and the pre-check (age, blacklist, existing overdue debt) can reject it at any step before the form is sent; the 732 cancelled split 544 without a submit / 188 with. So the scorecard approves 2 915 ÷ 3 451 = 84.5 % of submitted forms, and the company approves 2 915 ÷ 4 274 decided = 68.2 % of applications. Two true numbers with two denominators — the classic \"your approval rate does not match the report\" (roles page, step 4)."}
```

**P7.** *(leaky steps — the last step)* The last step. Sessions with a `contract_signed` event but no loan: how many, by `applications.status`, and when were they decided (earliest and latest `decided_at`)?

```task
{"id": "w08d1-p7", "kind": "sql", "note": "Two rows: status, sessions, first decided_at, last decided_at.", "model": "SELECT a.status, COUNT(*) AS sessions, MIN(a.decided_at) AS first_decided, MAX(a.decided_at) AS last_decided\nFROM app_events e\nJOIN applications a ON a.application_id = e.application_id\nLEFT JOIN loans l  ON l.application_id = e.application_id\nWHERE e.event_name = 'contract_signed' AND l.loan_id IS NULL\nGROUP BY a.status ORDER BY a.status;"}
```

**P7 — read it.** Which part is a final loss and which part is just the as-of date? Give the **real** post-signature loss as a share of signed contracts, in %, one decimal.

```task
{"id": "w08d1-p7b", "kind": "number", "answer": 7.6, "dp": 1, "unit": "% of signed", "hint": "Only the approved_not_disbursed sessions are final; divide them by all 2 915 signed contracts.", "model": "246 signed without a loan: 222 approved_not_disbursed — signed, and the money never went out (final; a question for operations: payout failures, card not linked, the customer withdrew); 24 approved, decided 29 September – 1 October — waiting for disbursement on the as-of date (censored, not lost). Real loss 222 ÷ 2 915 = 7.6 % — larger than any single UX step after the offer, and invisible in an event funnel that ends at contract_signed. Rule: end a funnel at money, from the table that books the money."}
```

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

```task
{"id": "w08d1-p8", "kind": "sql", "note": "34 rows (2024-01 … 2026-10): cohort, customers, m3, m6, m12 in % to one decimal — NULL where the window has not ended for every customer of the cohort. Wrap each percentage in CASE WHEN MAX(date(first_at, '+N months')) <= '2026-10-01' THEN … END.", "model": "WITH ranked AS (\n  SELECT customer_id, disbursed_at,\n         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY disbursed_at, loan_id) AS n\n  FROM loans),\npairs AS (\n  SELECT f.customer_id, f.disbursed_at AS first_at, s.disbursed_at AS second_at\n  FROM ranked f LEFT JOIN ranked s ON s.customer_id = f.customer_id AND s.n = 2\n  WHERE f.n = 1)\nSELECT strftime('%Y-%m', first_at) AS cohort, COUNT(*) AS customers,\n       CASE WHEN MAX(date(first_at, '+3 months')) <= '2026-10-01'\n            THEN ROUND(100.0 * SUM(CASE WHEN second_at <= date(first_at, '+3 months') THEN 1 ELSE 0 END) / COUNT(*), 1) END AS m3,\n       CASE WHEN MAX(date(first_at, '+6 months')) <= '2026-10-01'\n            THEN ROUND(100.0 * SUM(CASE WHEN second_at <= date(first_at, '+6 months') THEN 1 ELSE 0 END) / COUNT(*), 1) END AS m6,\n       CASE WHEN MAX(date(first_at, '+12 months')) <= '2026-10-01'\n            THEN ROUND(100.0 * SUM(CASE WHEN second_at <= date(first_at, '+12 months') THEN 1 ELSE 0 END) / COUNT(*), 1) END AS m12\nFROM pairs GROUP BY 1 ORDER BY 1;"}
```

**P8 — read it.** With the rule, what is the **last** cohort that has a 12-month number? (YYYY-MM)

```task
{"id": "w08d1-p8b", "kind": "text", "answer": ["2025-09", "2025-9", "september 2025", "sep 2025"], "model": "2025-09 (m6 exists up to 2026-03, m3 up to 2026-06). The plain version shows m12 from 2025-10 onwards although the window has not ended, and from 2026-04 m6 = m12 (2026-06: 37.4 / 37.4 / 37.4) — those customers had three months, not twelve. 4 335 borrowers: 2 089 took one loan, 2 246 two or more. The earliest cohort, January 2024: 79 customers, 10.1 % / 20.3 % (16 people) / 36.7 % at 3 / 6 / 12 months. One more caveat for the slide: the data start in January 2024, so some \"first\" loans of early 2024 are a customer's first loan in our data, not in their life."}
```

**P9.** *(retention table and curve)* The cohort triangle by **quarter** of the first loan, columns at 1, 2, 3, 6, 9, 12, 18, 24 months, only observable cells. Tip: cross-join the cohorts with a small table of the eight N values, compute each cell once, then pivot with `MAX(CASE WHEN m = … THEN pct END)`.

```task
{"id": "w08d1-p9", "kind": "sql", "note": "12 rows (2024Q1 … 2026Q4): cohort as YYYYQn, customers, then m1, m2, m3, m6, m9, m12, m18, m24 in % to one decimal, NULL where not every customer of the cohort has had N months by 2026-10-01.", "model": "WITH ranked AS (\n  SELECT customer_id, disbursed_at,\n         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY disbursed_at, loan_id) AS n\n  FROM loans),\npairs AS (\n  SELECT f.customer_id, f.disbursed_at AS first_at, s.disbursed_at AS second_at,\n         strftime('%Y', f.disbursed_at) || 'Q' || ((CAST(strftime('%m', f.disbursed_at) AS INTEGER) + 2) / 3) AS cohort\n  FROM ranked f LEFT JOIN ranked s ON s.customer_id = f.customer_id AND s.n = 2\n  WHERE f.n = 1),\ngrid AS (SELECT 1 AS m UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 6 UNION ALL SELECT 9\n         UNION ALL SELECT 12 UNION ALL SELECT 18 UNION ALL SELECT 24),\ncells AS (\n  SELECT p.cohort, g.m, COUNT(*) AS customers,\n         MAX(date(p.first_at, '+' || g.m || ' months')) AS last_needed,\n         ROUND(100.0 * SUM(CASE WHEN p.second_at <= date(p.first_at, '+' || g.m || ' months') THEN 1 ELSE 0 END) / COUNT(*), 1) AS pct\n  FROM pairs p CROSS JOIN grid g GROUP BY p.cohort, g.m)\nSELECT cohort, MAX(customers) AS customers,\n       MAX(CASE WHEN m = 1  AND last_needed <= '2026-10-01' THEN pct END) AS m1,\n       MAX(CASE WHEN m = 2  AND last_needed <= '2026-10-01' THEN pct END) AS m2,\n       MAX(CASE WHEN m = 3  AND last_needed <= '2026-10-01' THEN pct END) AS m3,\n       MAX(CASE WHEN m = 6  AND last_needed <= '2026-10-01' THEN pct END) AS m6,\n       MAX(CASE WHEN m = 9  AND last_needed <= '2026-10-01' THEN pct END) AS m9,\n       MAX(CASE WHEN m = 12 AND last_needed <= '2026-10-01' THEN pct END) AS m12,\n       MAX(CASE WHEN m = 18 AND last_needed <= '2026-10-01' THEN pct END) AS m18,\n       MAX(CASE WHEN m = 24 AND last_needed <= '2026-10-01' THEN pct END) AS m24\nFROM cells GROUP BY cohort ORDER BY cohort;"}
```

**P9 — read it.** Read the triangle **down** the columns (same age, later cohorts) and **across** a row. What is Kamola's answer to "do borrowers come back?" — and what does the triangle *not* tell her?

```task
{"id": "w08d1-p9b", "kind": "free", "min": 40, "rubric": ["reads down a column: repeat borrowing rises for later cohorts, with a number (6 months 22.3 % → 38.3 %)", "reads across a row: about two in three 2024 customers came back within two years", "gives Kamola a one-line answer: yes, more and sooner every quarter", "names what it does not say: whether the repeat loans are good (FPD of second loans) or refinance a struggling first loan"], "model": "% with a second loan, cumulative — 2024Q1 (282): 6.0 / 10.3 / 13.1 / 22.3 / 31.9 / 41.1 / 55.3 / 68.8; 2024Q4 (399): 11.3 / 13.8 / 17.3 / 28.6 / 33.8 / 37.3 / 52.4; 2025Q4 (443): 18.1 / 21.7 / 25.1 / 36.1 / 42.2; 2026Q1 (399): 22.8 / 25.1 / 30.8 / 38.3; 2026Q2 (463): 26.1 / 29.2 / 33.0. Down a column, repeat borrowing rises steadily: at 6 months from 22.3 % (2024Q1) to 38.3 % (2026Q1), at 3 months from 13.1 % to 33.0 %. Across a row, about two in three customers of 2024 came back within two years. Kamola's answer: borrowers do come back, more and sooner every quarter. What it does not say: whether the repeat loans are good (FPD of second loans — Day 2 and the capstone) and whether quick repeats refinance a struggling first loan."}
```

**P10.** *(churn)* Churn for the customers who repaid a loan in the **fourth quarter of 2025** (`closed_at` from 2025-10-01 to 2025-12-31), with a 6-month window. Start from the churn query in section 1 and change the dates. Return: customers who closed a loan, customers who could churn, came back within 6 months, churned, churn in %.

```task
{"id": "w08d1-p12", "kind": "sql", "note": "One row, five numbers: closers, could_churn, came_back, churned, churn_pct (one decimal).", "model": "WITH closers AS (\n  SELECT customer_id, MAX(closed_at) AS closed_at\n  FROM loans\n  WHERE status = 'closed' AND closed_at >= '2025-10-01' AND closed_at < '2026-01-01'\n  GROUP BY customer_id),\nstill_borrowing AS (\n  SELECT DISTINCT c.customer_id\n  FROM closers c\n  JOIN loans l ON l.customer_id = c.customer_id\n              AND l.disbursed_at <= c.closed_at AND (l.closed_at IS NULL OR l.closed_at > c.closed_at)),\nbase AS (SELECT * FROM closers WHERE customer_id NOT IN (SELECT customer_id FROM still_borrowing)),\nnext_loan AS (\n  SELECT b.customer_id, MIN(l.disbursed_at) AS next_at\n  FROM base b JOIN loans l ON l.customer_id = b.customer_id AND l.disbursed_at > b.closed_at\n  GROUP BY b.customer_id)\nSELECT (SELECT COUNT(*) FROM closers) AS closers,\n       COUNT(*) AS could_churn,\n       SUM(CASE WHEN n.next_at <= date(b.closed_at, '+6 months') THEN 1 ELSE 0 END) AS came_back,\n       SUM(CASE WHEN n.next_at IS NULL OR n.next_at > date(b.closed_at, '+6 months') THEN 1 ELSE 0 END) AS churned,\n       ROUND(100.0 * SUM(CASE WHEN n.next_at IS NULL OR n.next_at > date(b.closed_at, '+6 months') THEN 1 ELSE 0 END) / COUNT(*), 1) AS churn_pct\nFROM base b LEFT JOIN next_loan n ON n.customer_id = b.customer_id;"}
```

**P10 — read it.** Q1 2026's churn was 81.1 %. What is Q4 2025's, in %? And can you compare the two?

```task
{"id": "w08d1-p12b", "kind": "number", "answer": 76.7, "dp": 1, "unit": "%", "hint": "churned ÷ could_churn.", "model": "502 customers repaid a loan in Q4 2025; 184 still had another loan running, so 318 could churn; 74 came back within six months and 244 did not: 76.7 %. The two quarters can be compared because both windows have ended (Q4 2025's on 30 June 2026) and the definition is the same. 120 of the 318 have come back by 2026-10-01 — churn is not forever, which is why the window is part of the name: \"6-month churn\"."}
```

**P11.** *(active users)* DAU, MAU and stickiness from `app_events` for the twelve months October 2025 – September 2026: distinct customers per day and per month; average DAU over **all calendar days** of the month (a day with no events counts as 0 — `dim_date` has every day); stickiness = average DAU ÷ MAU.

```task
{"id": "w08d1-p10", "kind": "sql", "note": "12 rows (2025-10 … 2026-09): month, MAU, average DAU to two decimals, stickiness in % to one decimal.", "model": "WITH d AS (SELECT date(event_time) AS day, COUNT(DISTINCT customer_id) AS dau FROM app_events GROUP BY 1),\nm AS (SELECT strftime('%Y-%m', event_time) AS month, COUNT(DISTINCT customer_id) AS mau FROM app_events GROUP BY 1),\ncal AS (SELECT date_key, substr(date_key, 1, 7) AS month FROM dim_date)\nSELECT m.month, m.mau,\n       ROUND(SUM(COALESCE(d.dau, 0)) * 1.0 / COUNT(*), 2) AS avg_dau,\n       ROUND(100.0 * SUM(COALESCE(d.dau, 0)) / COUNT(*) / m.mau, 1) AS stickiness_pct\nFROM m JOIN cal ON cal.month = m.month LEFT JOIN d ON d.day = cal.date_key\nWHERE m.month >= '2025-10' AND m.month <= '2026-09'\nGROUP BY m.month, m.mau ORDER BY m.month;"}
```

**P11 — read it.** One sentence for Kamola: why is DAU/MAU not the app's North Star?

```task
{"id": "w08d1-p10b", "kind": "free", "min": 25, "rubric": ["quotes the level: about 3.7 % (MAU about 200, average DAU about 7)", "says a lender's customer opens the app when they need money, so a habit metric is the wrong goal", "names what to steer by instead: applications, approval-to-money conversion, repeat borrowing", "notes the event log only records sessions that create an application"], "model": "September 2026: MAU 201, average DAU 7.43, stickiness 3.7 %; the twelve months run 3.3–3.8 %, MAU 151 (Oct 2025) → 214 (Aug 2026). A social app wants 20 %+; a lender's customer opens the app when they need money, so 3–4 % is normal and pushing it up is not the goal. And our event log only records sessions that create an application — a real app would log payments and balance checks too. \"DAU/MAU measures habit; our customers do not need a habit, they need a loan when they need one — so we steer by applications, approval-to-money conversion and repeat borrowing, and keep DAU/MAU as a health line.\""}
```

**P12.** *(vanity vs actionable)* Bekzod's draft first page for the board has three numbers: *"6 040 customers registered"*, *"7 828 loans disbursed since 2024"* and *"approval rate up 5 points this year"*. For each: vanity or actionable, and what you would show instead. Use section 1's test: *if it falls, who does what?*

```task
{"id": "w08d1-p13", "kind": "free", "min": 40, "rubric": ["calls the two cumulative totals vanity: they can only go up and no decision follows", "gives an actionable twin for each, e.g. % of new customers with a first loan within 60 days, monthly disbursed amount against plan", "says an approval rate alone can be pushed up by a looser cut-off, so it needs FPD30 of the approved next to it", "names an owner for at least one replacement metric"], "model": "Registered customers (6 040) and loans since 2024 (7 828) are running totals: they rise every month whatever happens, so they are vanity. Instead: the share of new customers who take a first loan within 60 days (52 % in January 2026, 78 % in July — the product team owns it) and the monthly disbursed amount against plan (the portfolio manager). \"Approval up 5 points\" is actionable only with its guardrail: a looser cut-off raises approval and, a few months later, FPD — so show approval next to FPD30 of the approved, and give the pair to Risk."}
```

> 🚀 **Stretch (optional, +5 XP).** **P13.** *(retention by first product)* Repeat borrowing by the **product of the first loan** (`products.code`), for customers whose first loan was before October 2025 — so 12 months are observable for all of them. Does the first product matter for coming back? Then, in the same box, count which product the second loan is.

```task
{"id": "w08d1-p11", "kind": "sql", "xp": 2, "note": "5 rows (AUTO, BNPL, CONS, MICRO, SME): first product, customers, m3, m6, m12 in % to one decimal.", "model": "WITH ranked AS (\n  SELECT l.customer_id, l.disbursed_at, p.code,\n         ROW_NUMBER() OVER (PARTITION BY l.customer_id ORDER BY l.disbursed_at, l.loan_id) AS n\n  FROM loans l JOIN products p ON p.product_id = l.product_id),\npairs AS (\n  SELECT f.customer_id, f.code AS first_product, f.disbursed_at AS first_at, s.disbursed_at AS second_at\n  FROM ranked f LEFT JOIN ranked s ON s.customer_id = f.customer_id AND s.n = 2\n  WHERE f.n = 1)\nSELECT first_product, COUNT(*) AS customers,\n       ROUND(100.0 * SUM(CASE WHEN second_at <= date(first_at, '+3 months')  THEN 1 ELSE 0 END) / COUNT(*), 1) AS m3,\n       ROUND(100.0 * SUM(CASE WHEN second_at <= date(first_at, '+6 months')  THEN 1 ELSE 0 END) / COUNT(*), 1) AS m6,\n       ROUND(100.0 * SUM(CASE WHEN second_at <= date(first_at, '+12 months') THEN 1 ELSE 0 END) / COUNT(*), 1) AS m12\nFROM pairs WHERE first_at < '2025-10-01'\nGROUP BY first_product ORDER BY first_product;"}
```

<details><summary>Answer (open after you have checked)</summary>

MICRO (903) 18.7 / 29.8 / 42.2 %; CONS (809) 18.0 / 27.1 / 40.7; BNPL (526) 20.0 / 30.6 / 43.5; AUTO (120) 15.8 / 27.5 / 44.2; SME (249) 16.9 / 24.1 / 42.6. Within the noise of a few hundred customers, **the first product hardly matters** for coming back. What they come back for (all customers): after a first MICRO, the second loan is MICRO 263, CONS 254, BNPL 171, SME 71, AUTO 52 (720 never came back) — the app is a door into the whole book, which is the LTV argument of Day 2.

</details>

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

None today. **HW 8.1** (your CV draft and a one-page portfolio index) is set tomorrow, due Wednesday. Keep today's queries: the boxes above keep them in this browser, but copy **P3** (funnel), **P7** (signed, never paid out) and **P9** (cohort triangle) into a file now — the capstone (Wednesday–Friday) asks for all three again.

---

## 5. Self-check

```check
{"id": "w08d1-sc", "questions": [
  {"type": "single", "q": "Your tree's approval rate is 62 %; the risk report says 71 % for the same month. Who is wrong?", "options": ["The tree — approval must exclude cancelled applications", "Nobody: the tree divides approved by all applications so the chain multiplies back; the report divides by decided. Write the definition under each number", "The report — it ignores cancelled applications", "Both — approval should be approved ÷ app sessions"], "answer": 1, "explain": "Two true numbers with two denominators (→ 'What a metric is', P1, P6)."},
  {"type": "single", "q": "A dashboard shows 'two thirds of applicants drop before opening the app'. What do you ask first?", "options": ["Which app version crashed", "What the number was last month", "Who is in the denominator — app_events exists only for applications made in the app", "Whether iOS is better than Android"], "answer": 2, "explain": "Branch and partner customers never had an app session to lose: the 'drop' is a population (→ 'Leaky steps', check 1, P4)."},
  {"type": "single", "q": "The 2026-06 cohort shows 37.4 % repeat borrowing at 3, 6 and 12 months. What is wrong?", "options": ["Those customers have had about three months, not twelve: the 6- and 12-month cells are not observable and must be blank", "Nothing — June borrowers repeat early", "The query counts loans instead of customers", "The cohort should be by application month"], "answer": 0, "explain": "Blank a cell unless every first loan of the cohort is at least N months old (→ 'The retention table and the retention curve', P8)."}
]}
```

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

```game
{"type": "match", "id": "w08d1-g4", "title": "Which branch of the tree?", "q": "Each request you get is a node on the net-income tree. Match the request to its branch.", "pairs": [["Kamola: where does the app lose people?", "Disbursements → active customers, application rate, take-up"], ["Nilufar: is FPD30 of the newest vintage up?", "Cost of risk → PD"], ["Sevara: what share of 1–30 DPD loans cure?", "Cost of risk → LGD"], ["Treasury: what do we pay for our borrowing?", "Cost of funds"], ["Finance: what does one branch loan cost to sell?", "Operating expenses"], ["Bekzod: is the average SME ticket growing?", "Disbursements → average ticket"]]}
```

> 🎯 **Interview version.** *"How would you build a metric tree for a lender?"* — Start from net income: interest income minus cost of funds, cost of risk and opex. Interest income is average portfolio times yield; the portfolio grows with disbursements, which decompose into active customers × application rate × approval × take-up × ticket — each a team's input metric. Cost of risk decomposes into PD (watched early through FPD), LGD and EAD. Then name an owner per branch and check that the factors multiply back to the total.

**Say it like in an interview.** *"How would you build a metric tree for a lender?"* Answer in four or five sentences, with one Nur number.

```task
{"id": "w08d1-ci", "kind": "free", "min": 40, "rubric": ["starts from net income: interest income minus cost of funds, cost of risk and opex", "decomposes disbursements into active customers × application rate × approval × take-up × ticket", "splits cost of risk into PD (with FPD as the early signal), LGD and EAD", "names an owner per branch", "says the factors must multiply back to the total, and quotes a number (e.g. 2 846 × 22.8 % × 60.4 % × 92.6 % × 64.3 m = 23.3 bn)"], "model": "I would start from what the board reads: net income — interest income minus cost of funds, cost of risk and operating costs. Interest income is average portfolio times yield; the portfolio grows with disbursements, and disbursements decompose into active customers × application rate × approval rate × take-up × average ticket, each an input metric a team owns — product and marketing the top, risk the approval rate, the portfolio manager the ticket. Cost of risk splits into PD, watched early through FPD, LGD from collections, and EAD. Then I check that the factors multiply back exactly: at Nur, August 2026 was 2 846 active customers × 22.8 % × 60.4 % × 92.6 % × 64.3 m = 23.3 bn disbursed, to the soum. When the top moves, I walk down the tree with log shares until one child explains it."}
```

Tomorrow: money. Which product earns how much per loan once funding, risk and the cost of selling it are taken out — and the company day.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w08d1", "pass": 0.8, "questions": [
  {"type": "single", "q": "What makes a metric tree multiply back to the total exactly?", "options": ["Each factor uses the same month's calendar data", "Approval must exclude cancelled applications", "Every factor is a percentage", "Each factor's denominator is the previous factor's numerator — so the tree's approval rate is approved ÷ all applications"], "answer": 3, "explain": "The product telescopes only when the chain is consistent; the risk report's approved ÷ decided is fine, just not in the tree (→ section 1, 'A metric tree')."},
  {"type": "number", "q": "Active customers 2 846; application rate 22.80 %; approval (tree) 60.40 %; take-up 92.60 %. About how many loans did August's applications produce?", "answer": 363, "tol": 1, "explain": "2 846 × 0.2280 × 0.6040 × 0.9260 ≈ 363 — the tree multiplies back to the 363 loans and 23.3 bn of the worked example (→ section 2)."},
  {"type": "single", "q": "Why is this not the funnel's 'reached' count?", "code": "SELECT event_name, COUNT(*) AS reached\nFROM app_events\nGROUP BY event_name;", "options": ["GROUP BY must come before FROM", "COUNT(*) skips NULLs", "It is the correct funnel", "It counts events, not sessions; reached = has the event, once per session — MAX(CASE …) per application_id, then SUM"], "answer": 3, "explain": "In this data each step happens at most once per session, but the definition must not depend on that luck (→ section 1, 'The lending funnel', ⚠️)."},
  {"type": "single", "q": "A dashboard says '64 % of applicants drop before opening the app'. What is the first question?", "options": ["Who is in the denominator — app_events exists only for applications made in the app", "Whether the app crashed", "What the drop was last month", "Which app version they used"], "answer": 0, "explain": "Branch and partner customers never had an app session to lose; an app funnel must say 'app applications only' (→ P4)."},
  {"type": "single", "q": "device and app_version are logged per event and change inside a session. How do you group the funnel by device?", "options": ["By the most common device in the table", "You cannot group by device", "By each event's own device", "By session, taking the device of the session's app_open"], "answer": 3, "explain": "Grouping events by their own device counts each step on a different population — the 'iOS advantage' was an artefact (→ section 1, 'Leaky steps', check 3, P5)."},
  {"type": "multi", "q": "Which are leading metrics?", "options": ["FPD30 at 60 days", "Applications this week", "NPL90 after a year", "Write-offs", "1–30 DPD entries"], "answer": [0, 1, 4], "explain": "Leading metrics move before the result; NPL90 and write-offs confirm it later (→ section 1, 'A metric tree')."},
  {"type": "single", "q": "What is wrong, and what is the fix?", "code": "-- repeat borrowing, first-loan cohort 2026-06\n-- m3 = 37.4 % · m6 = 37.4 % · m12 = 37.4 %", "options": ["Nothing — these customers repeat early", "The 6- and 12-month windows have not ended for this cohort; blank a cell unless every first loan of the cohort is at least N months old", "Use COUNT(DISTINCT customer_id)", "Start the cohort at the application date"], "answer": 1, "explain": "An unobservable cell is 'not measured', not 'did not repeat' — the same rule as week 3's vintage blanks (→ section 1, 'The retention table and the retention curve', P8)."},
  {"type": "single", "q": "Company corner: on the net-income tree, which branch does Sevara's cure rate belong to?", "options": ["Operating expenses", "Cost of risk → LGD", "Interest income → yield", "Disbursements → take-up"], "answer": 1, "explain": "Cure rate, recoveries and restructuring drive LGD, a child of cost of risk (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w08d1", "sql": true, "q": "Bekzod: 'August's applications brought more money than July's — was it the customers or the tickets?' Build the worked example's metric tree for July 2026 (same definitions, July dates) and compare it with August's. What share of the log change in the total is explained by the APPLICATION RATE factor (its log-ratio ÷ the total's log-ratio; negative = it worked against the change)? Give a percentage to 1 decimal, with its sign.", "type": "number", "dp": 1, "h": ["52430fb972089788b5ef2533"], "hint": "Check that July's five factors multiply back to July's disbursed amount before you take any logs.", "sol": "SnVseSAyMDI2IHdpdGggdGhlIHdvcmtlZCBleGFtcGxlJ3MgcXVlcnkgKGFjdCBmcm9tIDIwMjYtMDctMDEgdG8gMjAyNi0wOC0wMTsgbG9hbnMgbGl2ZSBpZiBkaXNidXJzZWRfYXQgPCAnMjAyNi0wOC0wMScgYW5kIGNsb3NlZF9hdCBlbXB0eSBvciA+PSAnMjAyNi0wNy0wMScpOgphY3RpdmUgMiA3NTYgwrcgYXBwbGljYXRpb25zIDY1NyDCtyBhcHByb3ZlZCAzOTggwrcgbG9hbnMgMzcwIMK3IGRpc2J1cnNlZCAyMSAyMzMgNDMwIDAwMApmYWN0b3JzOiBhcHBsaWNhdGlvbiByYXRlIDIzLjg0ICUgwrcgYXBwcm92YWwgNjAuNTggJSDCtyB0YWtlLXVwIDkyLjk2ICUgwrcgdGlja2V0IDU3IDM4NyA2NDkg4oaSIHByb2R1Y3QgMjEgMjMzIDQzMCAwMDAg4pyTCkF1Z3VzdDogMiA4NDYgwrcgMjIuODAgJSDCtyA2MC40MCAlIMK3IDkyLjYwICUgwrcgNjQgMjg1IDcwMiDihpIgMjMgMzM1IDcxMCAwMDAKCmltcG9ydCBtYXRoClQgPSBtYXRoLmxvZygyM18zMzVfNzEwXzAwMCAvIDIxXzIzM180MzBfMDAwKSAgICAgICAgICAgICAgICAgICAgIyArOS45ICUgdG90YWwKbWF0aC5sb2coKDY0OSAvIDI4NDYpIC8gKDY1NyAvIDI3NTYpKSAvIFQgKiAxMDAgICAgICAgICAgICAgICAgICAjIOKIkjQ3LjAKIyBzaGFyZXM6IGFjdGl2ZSArMzQuMCDCtyBhcHBsaWNhdGlvbiByYXRlIOKIkjQ3LjAgwrcgYXBwcm92YWwg4oiSMy4xIMK3IHRha2UtdXAg4oiSNC4xIMK3IHRpY2tldCArMTIwLjIgKHN1bSAxMDApCgriiJI0Ny4wICU6IGEgc21hbGxlciBzaGFyZSBvZiBhY3RpdmUgY3VzdG9tZXJzIGFwcGxpZWQgaW4gQXVndXN0ICgyMi44ICUgdnMgMjMuOCAlKSwgYW5kIHRoYXQgYWxvbmUgd291bGQgaGF2ZSBjdXQgdGhlIHRvdGFsIGJ5IGFsbW9zdCBoYWxmIG9mIHRoZSByaXNlIHRoYXQgYWN0dWFsbHkgaGFwcGVuZWQuClRoZSByaXNlIGNhbWUgZnJvbSB0aGUgdGlja2V0ICgrMTIwICUgb2YgdGhlIGNoYW5nZTogNjQuMyBtIHZzIDU3LjQgbSBwZXIgbG9hbikgYW5kIGEgbGFyZ2VyIGN1c3RvbWVyIGJhc2UgKCszNCAlKSDigJQgYmlnZ2VyIGxvYW5zLCBub3QgbW9yZSBib3Jyb3dpbmcuCkZvciBCZWt6b2Q6IEF1Z3VzdCdzICs5LjkgJSBpcyBhIG1peCBlZmZlY3Qgb2YgbGFyZ2UgbG9hbnM7IHRoZSBwZW9wbGUgc2lkZSBvZiB0aGUgdHJlZSBtb3ZlZCB0aGUgb3RoZXIgd2F5LCB3aGljaCBpcyB0aGUgbGluZSB3b3J0aCB3YXRjaGluZyBpbiBTZXB0ZW1iZXIu"}
```

<!-- challenge:end -->

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

```task
{"id": "w08d1-x1", "kind": "number", "answer": 42.1, "dp": 1, "unit": "%", "hint": "In the pandas box: m[\"loans\"] / m[\"loans\"].shift(12) - 1, on the whole frame; read the 2026-09 row.", "model": "361 loans against 254 in September 2025: +42.1 %. The amount grew only +16.2 %. More loans, and smaller ones: the average ticket fell from 57.7 m to 47.1 m soum."}
```

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

```task
{"id": "w08d1-x2", "kind": "number", "answer": 0.88, "dp": 2, "hint": "One change in the first CTE; read the row mo = 02.", "model": "0.88 (0.85 and 0.92 in its two years): February is low every year. It also has 28 days, 8 % fewer than an average month of 30.4. Per day, February's index is 0.96: most of its dip is the calendar, not the customers. July (1.12) is the only other month more than 0.07 away from 1."}
```

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

```task
{"id": "w08d1-x3", "kind": "choice", "options": ["July 2026", "August 2026", "September 2026", "March 2026"], "answer": 2, "explain": "September: 20.0 bn, up from 19.7 — while the month itself fell 23.7 %. The average is still climbing a month after the top. A rising 3-month average does not mean the last month was good: read the month next to it."}
```

### A simple forecast — and the test that keeps it honest

**Before you read.** Guess first, then play with it — the explanation below will make more sense.

```explore
{"id": "w08d1-x4", "type": "forecast", "title": "Hide the last months, then forecast them", "predict": {"q": "Hide the last **6 months** (April–September 2026) and forecast them from the 27 months before. Which method misses the disbursed amount by the least?", "options": ["Last month (naive): every month = March 2026", "Same month last year (seasonal naive)", "The average of the last 3 months", "A straight line through the 27 months, continued"], "answer": 3, "why": "The straight line misses by 9.5 % a month on average, naive by 11.8 %, the 3-month average by 12.4 % and seasonal naive by 30.4 %. Nur grows about 47 % a year and its season is weak, so the method that follows the growth wins — and last year's month is a whole year of growth too low."}, "from": "2024-01", "series": [{"label": "Disbursed amount", "unit": "bn", "axis": "bn soum a month", "div": 1000000000, "dp": 2, "values": [3872450000, 4600560000, 6426660000, 5583500000, 5937650000, 6448770000, 8161820000, 7738120000, 8235610000, 10797640000, 11393650000, 7326560000, 10100600000, 9913540000, 12364440000, 12518010000, 8644280000, 10485910000, 14590460000, 17667620000, 14644540000, 12635080000, 14639000000, 17723750000, 17452370000, 11893850000, 19657410000, 17894970000, 18531830000, 16050300000, 20693870000, 22290210000, 17015490000]}, {"label": "Number of loans", "unit": "loans", "axis": "loans a month", "div": 1, "dp": 0, "values": [79, 106, 118, 120, 130, 132, 160, 152, 165, 180, 194, 200, 208, 192, 213, 225, 235, 262, 287, 283, 254, 288, 299, 295, 287, 265, 330, 312, 377, 373, 367, 358, 361]}], "start": {"series": 0, "meth": 0, "h": 6}, "note": "Monthly disbursed amount (`SUM(principal)` by the month of `disbursed_at`) and the number of loans, January 2024 – September 2026: 33 closed months. October 2026 is left out: on the as-of date it has one day.", "challenges": [{"id": "c1", "text": "On the **amount**, find a method that misses the 6 hidden months by **less than 10 %**.", "when": {"series": ["=", 0], "h": ["=", 6], "mape": ["<", 10]}}, {"id": "c2", "text": "Hide only **1 month** and find the method that wins it (rank 1 / 4). Then hide 6 again: where does that method finish?", "when": {"series": ["=", 0], "h": ["=", 1], "rank": ["=", 1]}}, {"id": "c3", "text": "Switch to the **number of loans** and find a method under **6 %** on 6 hidden months. Why is the count easier to forecast than the amount?", "when": {"series": ["=", 1], "h": ["=", 6], "mape": ["<", 6]}}, {"id": "c4", "text": "Show **the next quarter** for the amount, with the method that won the 6-month test and 6 months hidden: that range is your answer to Bekzod.", "when": {"mode": ["=", 1], "series": ["=", 0], "h": ["=", 6], "meth": ["=", 3]}}]}
```

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

```task
{"id": "w08d1-x5", "kind": "number", "answer": 12.9, "dp": 1, "unit": "%", "hint": "Change H = 6 to H = 3, run the box and read the smallest MAPE.", "model": "The straight line again: 12.9 %. The average of the last 3 is close behind (13.3 %), then naive (18.7 %) and seasonal naive (21.4 %). On three months the line wins by less than half a point: call it a tie, and trust the longer test more."}
```

### Try it on the real data

**T1.** Bekzod's quarter is a sum of three months. Hide **July–September 2026**, fit the straight line on the 30 months before and forecast the **quarter's total**. Print the forecast in bn (one decimal), the actual total and the miss in %.

```task
{"id": "w08d1-x6", "kind": "python", "starter": "import sqlite3\nimport numpy as np\nimport pandas as pd\n\ncon = sqlite3.connect(\"data/raw/nur.db\")\nm = pd.read_sql(\"\"\"\n    SELECT strftime('%Y-%m', disbursed_at) AS month,\n           SUM(principal) AS disbursed\n    FROM loans WHERE disbursed_at < '2026-10-01'\n    GROUP BY 1 ORDER BY 1\"\"\", con)\ny = m[\"disbursed\"].to_numpy() / 1e9\n# hide July-September 2026\ntrain, test = y[:-3], y[-3:]\n# TODO: fit the straight line on train (np.polyfit),\n#       forecast the 3 hidden months, then print\n#       the forecast total, the actual total and the miss in %\n", "answer": 58.0, "dp": 1, "model": "slope, start = np.polyfit(np.arange(len(train)), train, 1)\nf = start + slope * np.arange(len(train), len(train) + 3)\nprint(round(f.sum(), 1), round(test.sum(), 1),\n      round((f.sum() / test.sum() - 1) * 100, 1))\n# 58.0 60.0 -3.3: the quarter is 3.3 % low.\n# Month by month the line missed by 12.9 %:\n# 1.8 and 3.0 bn too low in July and August,\n# 2.8 bn too high in September.\n# In the sum the misses partly cancel:\n# a quarter is easier to forecast than its months."}
```

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

```task
{"id": "w08d1-x7", "kind": "number", "answer": 57.6, "dp": 1, "unit": "bn", "hint": "Three numbers from the result: 2025Q4's bn, 2026Q3's bn and 2026Q3's year_before_bn.", "model": "2026Q3 60.00 ÷ 2025Q3 46.90 = +27.9 % a year; 2025Q4 45.00 × 1.279 = 57.6 bn. That is inside the straight line's range (56.9–68.9 bn), near its bottom: the line carries on the growth of all 33 months, this method only the last year's. For Bekzod: \"Q4 2026: 58 to 63 bn by two methods; plan for 57 to 69 bn.\""}
```

### In one minute

- **Growth:** compare a month with the same month a year before; month on month swings with the calendar and single big loans. Closed months only: October 2026 has one day.
- **Seasonality** counts only if it repeats. In Nur's amount it is weak: March and July high, February low (partly a 28-day month), the rest flips from year to year.
- **A 3-month average** smooths the noise and turns about a month after the real line.
- **A forecast** is tested on hidden months before anyone trusts it. On April–September 2026 the straight line missed by 9.5 %, seasonal naive by 30.4 %. Answer with a range: Q4 2026 ≈ 62.9 bn, 56.9–68.9 bn.
