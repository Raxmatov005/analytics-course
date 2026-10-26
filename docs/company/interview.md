# The interview bank — 30 questions with model answers

Thirty questions an analyst interview at a bank or lending company asks, grouped as the interviews are: **lending & metrics (10), SQL (6), Excel/BI (4), statistics & A/B (6), behavioural and case (4)**. Every model answer is folded. Use it like flash cards: answer **out loud**, in 60–90 seconds, then open the fold. The numbers are Nur Finance's (synthetic data, as of 2026-10-01) — in a real interview, use them as *"in my portfolio project, on a 7 800-loan book…"*. Every SQL answer runs on `data/raw/nur.db` and shows its real result.

How a good answer is built: **definition → how you compute it → a number → a trap or a company difference.** The fourth part is what the interviewer remembers.

---

## A. Lending and metrics

**A1. What is the difference between DPD and FPD?**

<details><summary>Model answer</summary>

**DPD** (days past due) is a **state of a loan today**: as-of date minus the due date of the oldest unpaid instalment, 0 if nothing is overdue; grouped into buckets 0 / 1–30 / 31–60 / 61–90 / 90+. **FPD** (first payment default) is an **event of a new loan**: the first instalment was not paid within X days of its due date (X = 30 is common; some use 7 or 10 — always say which). DPD drives collections, PAR and provisions; FPD is the early warning for a new product, channel or scoring rule, and the main fraud signal, because it is known two months after disbursement. *"On my project book FPD30 was 1.28 % — 1.70 % in the app against 1.04 % at branches — while PAR30 was 3.12 %; the two answer different questions."*

</details>

**A2. PAR30 vs NPL — what is the difference?**

<details><summary>Model answer</summary>

**PAR30** (portfolio at risk) = outstanding of loans with DPD > 30 ÷ total outstanding — a pure DPD measure, on **balance**, not on count. **NPL** (non-performing loans) is a **classification**: usually 90+ DPD, but depending on the regulator or the company it can be 60+, and it can include restructured or "unlikely to pay" loans regardless of DPD. NPL ratio = NPL outstanding ÷ total. On my project: PAR30 3.12 %, NPL90 2.55 % — so 2.55 of the 3.12 points were already old debt, not a fresh wave. The trap: comparing your NPL with a competitor's annual report without checking their definition.

</details>

**A3. What is a roll rate and how do you use it?**

<details><summary>Model answer</summary>

The share of loans (or balance) in one delinquency bucket at one month-end that are in the next bucket at the next month-end — a **migration matrix** between two snapshots. It tells collections where effort pays and lets risk forecast losses: multiply today's buckets through the matrix to project next month. On my project, 1 September → 1 October: 19.5 % of 1–30 loans rolled to 31–60, 75.8 % cured; 31–60 → 61–90 69.6 %; 61–90 → 90+ 100 %. Reading: the first bucket is where contact matters — after 60 days almost nobody comes back. Traps: the snapshots must use the same DPD definition and the same payment cut-off; closed loans must be handled explicitly.

</details>

**A4. What is vintage analysis?**

<details><summary>Model answer</summary>

Group loans by disbursement month (the **vintage**), and follow each group by **months on book**, plotting e.g. the share ever 30+ days late at MOB 1, 2, 3 … Because every cohort is read at the same age, an October cohort can be compared with a January one; a calendar view mixes young and old loans. You use it to see whether a policy change, a channel or a season produced worse loans — months before it shows in NPL. On my project the worst cohort was October 2025: 6.91 % ever-30+ at MOB 3 and 11.52 % at MOB 6. The rule people break: a cell is shown only when every loan of the cohort has reached that age — a 0 in an unobservable cell is a lie.

</details>

**A5. How do you compute approval rate? Why do two teams get different numbers?**

<details><summary>Model answer</summary>

Approved ÷ **decided** applications is the usual risk convention; the differences are all in the denominator and the status list: are **cancelled** applications in it, is "approved but not disbursed" approved, is it counted by application month or decision month, per application or per customer, and does it include applications rejected by a pre-check before the customer submitted. On my project the app channel showed 68.2 % (approved ÷ decided), 58.2 % (approved ÷ app sessions) and 84.5 % (approved ÷ submitted forms) — three correct numbers. The answer: ask for the definition, write it under the number, reconcile once.

</details>

**A6. What is expected loss?**

<details><summary>Model answer</summary>

EL = PD × LGD × EAD, summed over loans: the probability of default (usually 90+ within 12 months or lifetime), the share lost if it defaults after recoveries, and the exposure at default. It is the mean of the loss distribution — the cost of doing business that pricing and provisions must cover; unexpected loss (the tail) is what capital covers. A crude version on my project (PD = share now 90+, LGD 60 % assumed) gave 3.60 bn, 1.77 % of the performing exposure, with grade C carrying 46 % of the loss on 27 % of the exposure. Then say what is crude: the PD mixes loan ages and understates long products; real banks estimate PD from vintages and scorecards and LGD from actual recoveries.

</details>

**A7. Explain IFRS 9 provisions in plain words.**

<details><summary>Model answer</summary>

Every loan carries a provision for the loss we **expect**, not only the loss that has happened. Healthy loans (Stage 1) carry 12 months of expected loss; loans whose risk has increased significantly — typically 30+ DPD or a large score deterioration — (Stage 2) carry **lifetime** expected loss; defaulted loans, typically 90+ (Stage 3), carry lifetime loss on a defaulted exposure. The PDs are forward-looking, weighted over economic scenarios. Consequence for an analyst: a rise in early delinquency moves loans to Stage 2 and costs money in the P&L **now**, before any loan is written off — which is why risk watches 1–30 entries and FPD so closely.

</details>

**A8. What does a portfolio manager want from you?**

<details><summary>Model answer</summary>

One page, refreshed on a fixed day, that answers: **how big** (outstanding, number of live loans, disbursements this month vs last and vs plan), **what mix** (product, branch/region, grade, channel), **how good** (PAR30, NPL, FPD of the newest mature vintage, roll 1–30 → 31–60) and **what moved** (the two or three biggest changes, with the reason). Each tile has its definition and as-of date, and it reconciles with Finance's balance. Then the ad-hocs: "why did this region grow fastest while having the highest PAR30?" The trap is a beautiful dashboard that does not match the ledger.

</details>

**A9. What is cost of risk?**

<details><summary>Model answer</summary>

The credit-loss charge of a period divided by the average portfolio, usually annualised: (change in provisions + write-offs − recoveries) ÷ average gross loans. It is a **flow** in the P&L; expected loss / provisions are the **stock** on the balance sheet. It sits next to the yield and the cost of funds in the metric tree: on my project the annualised yield was about 25.5 % against an assumed 18 % funding rate, so every point of cost of risk takes a large share of a 7.5-point spread. Company differences: gross vs net of recoveries, average vs opening portfolio.

</details>

**A10. What is collection rate, and how can it mislead?**

<details><summary>Model answer</summary>

Amount collected ÷ amount due, for instalments due in a period, with payments counted up to a cut-off date. On my project, September 2026: 15.98 bn collected of 16.99 bn due by 1 October = 94.1 %. It misleads when: payments are duplicated (raw data had 25 repeat rows, 58 m soum double-counted), prepayments of future instalments are counted as collections of this month, the cut-off differs between reports, or it is computed on all payments received instead of payments for instalments due. In collections it is read with contact rate, promise-kept rate and cure rate, by bucket.

</details>

---

## B. SQL

Each answer shows the query (SQLite, as in the course; SQL Server differences in comments) and its result on `nur.db`.

**B1. Approval rate by channel for January–September 2026, cancelled applications excluded.**

<details><summary>Model answer</summary>

```sql
SELECT channel,
       COUNT(*) AS applications,
       SUM(CASE WHEN status IN ('approved', 'approved_not_disbursed') THEN 1 ELSE 0 END) AS approved,
       SUM(CASE WHEN status <> 'cancelled' THEN 1 ELSE 0 END) AS decided,
       ROUND(100.0 * SUM(CASE WHEN status IN ('approved', 'approved_not_disbursed') THEN 1 ELSE 0 END)
             / SUM(CASE WHEN status <> 'cancelled' THEN 1 ELSE 0 END), 1) AS approval_rate_pct
FROM applications
WHERE applied_at >= '2026-01-01' AND applied_at < '2026-10-01'      -- not BETWEEN: applied_at has a time
GROUP BY channel
ORDER BY approval_rate_pct DESC;
```

| channel | applications | approved | decided | approval_rate_pct |
|---|---|---|---|---|
| branch | 2 396 | 1 527 | 2 113 | 72.3 |
| partner | 1 045 | 646 | 917 | 70.4 |
| app | 1 953 | 1 118 | 1 647 | 67.9 |

Say the two choices out loud: "approved includes approved-not-disbursed; cancelled are out of the denominator". `100.0 *` avoids integer division.

</details>

**B2. Top 3 branches by amount disbursed in January–September 2026, with their share of the total.**

<details><summary>Model answer</summary>

```sql
WITH b AS (
  SELECT br.branch_name, SUM(l.principal) AS disbursed
  FROM loans l JOIN branches br ON br.branch_id = l.branch_id
  WHERE l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2026-10-01'
  GROUP BY br.branch_name)
SELECT branch_name, disbursed,
       ROUND(100.0 * disbursed / SUM(disbursed) OVER (), 1) AS share_pct,      -- window over the whole result
       RANK() OVER (ORDER BY disbursed DESC) AS rnk
FROM b
ORDER BY disbursed DESC
LIMIT 3;                                                                     -- SQL Server: SELECT TOP 3
```

| branch_name | disbursed | share_pct | rnk |
|---|---|---|---|
| Tashkent South | 21 380 780 000 | 13.2 | 1 |
| Fergana Central | 19 742 090 000 | 12.2 | 2 |
| Samarkand Central | 19 440 640 000 | 12.0 | 3 |

The point being tested: `SUM(…) OVER ()` computes the total before `LIMIT` cuts the rows, so the share is of all ten branches, not of the three shown.

</details>

**B3. How many customers applied but never received a loan?**

<details><summary>Model answer</summary>

```sql
SELECT COUNT(DISTINCT a.customer_id) AS applied_never_borrowed
FROM applications a
WHERE NOT EXISTS (SELECT 1 FROM loans l WHERE l.customer_id = a.customer_id);
```

Result: **1 118**. Why `NOT EXISTS` and not `NOT IN`: if the subquery's column can be NULL, `NOT IN` returns nothing at all; `NOT EXISTS` compares row by row. The `LEFT JOIN … WHERE l.loan_id IS NULL` anti-join gives the same 1 118.

</details>

**B4. Month-over-month growth of disbursed amount in 2026.**

<details><summary>Model answer</summary>

```sql
WITH m AS (
  SELECT strftime('%Y-%m', disbursed_at) AS month, COUNT(*) AS loans, SUM(principal) AS amount   -- SQL Server: FORMAT(disbursed_at, 'yyyy-MM')
  FROM loans
  WHERE disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01'
  GROUP BY 1)
SELECT month, loans, amount,
       ROUND(100.0 * (amount - LAG(amount) OVER (ORDER BY month)) / LAG(amount) OVER (ORDER BY month), 1) AS mom_pct
FROM m ORDER BY month;
```

| month | loans | amount | mom_pct |
|---|---|---|---|
| 2026-01 | 287 | 17 452 370 000 | — |
| 2026-02 | 265 | 11 893 850 000 | −31.8 |
| 2026-03 | 330 | 19 657 410 000 | 65.3 |
| 2026-04 | 312 | 17 894 970 000 | −9.0 |
| 2026-05 | 377 | 18 531 830 000 | 3.6 |
| 2026-06 | 373 | 16 050 300 000 | −13.4 |
| 2026-07 | 367 | 20 693 870 000 | 28.9 |
| 2026-08 | 358 | 22 290 210 000 | 7.7 |
| 2026-09 | 361 | 17 015 490 000 | −23.7 |

Add the comment an analyst adds: the number of loans is stable (312–377 a month since March); the amount swings with a handful of SME loans — month-over-month on amount is a mix story, not a demand story.

</details>

**B5. Find duplicate payments: same instalment, same day, same amount. How many extra rows, how much money?**

<details><summary>Model answer</summary>

```sql
WITH r AS (
  SELECT payment_id, amount,
         ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
  FROM payments)
SELECT COUNT(*) AS duplicate_rows, SUM(amount) AS double_counted
FROM r WHERE rn > 1;
```

Result: **25** rows, **58 397 800** soum. Then the part that gets the job: you do not `DELETE` — you show the owner, check the effect downstream (DPD unchanged, collections overstated), publish a de-duplicated view for reporting and propose a unique constraint at load.

</details>

**B6. FPD30 by channel.**

<details><summary>Model answer</summary>

```sql
WITH clean_pay AS (                                                  -- de-duplicated payments, as in B5
  SELECT * FROM (
    SELECT p.*, ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
    FROM payments p) WHERE rn = 1),
first_inst AS (
  SELECT i.loan_id, i.total_due,
         COALESCE(SUM(CASE WHEN p.paid_at < date(i.due_date, '+31 days') THEN p.amount END), 0) AS paid_30   -- half-open: up to day 30 included; DATEADD(day, 31, i.due_date)
  FROM installments i
  LEFT JOIN clean_pay p ON p.installment_id = i.installment_id
  WHERE i.installment_no = 1 AND i.due_date <= '2026-09-01'          -- only loans whose 30 days have passed
  GROUP BY i.loan_id, i.total_due)
SELECT a.channel, COUNT(*) AS loans,
       SUM(CASE WHEN f.paid_30 < f.total_due THEN 1 ELSE 0 END) AS fpd30,
       ROUND(100.0 * SUM(CASE WHEN f.paid_30 < f.total_due THEN 1 ELSE 0 END) / COUNT(*), 2) AS fpd30_pct
FROM first_inst f
JOIN loans l        ON l.loan_id = f.loan_id
JOIN applications a ON a.application_id = l.application_id
GROUP BY a.channel ORDER BY fpd30_pct DESC;
```

| channel | loans | fpd30 | fpd30_pct |
|---|---|---|---|
| app | 2 411 | 41 | 1.70 |
| partner | 1 425 | 16 | 1.12 |
| branch | 3 263 | 34 | 1.04 |

Four things to say: clean payments (a duplicated payment would count twice towards the instalment), the maturity filter (a loan whose first instalment fell due last week cannot have an FPD30 yet), the partial-payment rule (paid in full, not "any payment"), and that app vs branch is a statistical question — z = 2.15, p = 0.032 in week 6.

</details>

---

## C. Excel and BI

**C1. VLOOKUP vs XLOOKUP vs INDEX/MATCH — and the classic lookup bug.**

<details><summary>Model answer</summary>

VLOOKUP looks only to the right, breaks when a column is inserted (the column number is hard-coded) and defaults to an **approximate** match if the last argument is omitted — the classic silent bug: wrong rows returned without an error. XLOOKUP (Excel 365) looks in any direction, matches exactly by default, and has a built-in "not found" value; INDEX/MATCH does the same in older versions. Whatever the function: duplicates in the key return only the first match (check uniqueness with COUNTIF first), and text keys with trailing spaces ("CASH ") do not match — TRIM before you look up.

</details>

**C2. You receive a messy export every month. How do you clean it so that next month takes one click?**

<details><summary>Model answer</summary>

Power Query, not manual edits: connect to the file/folder, then recorded steps — promote headers, set types, TRIM/clean and fix casing on text, replace spelling variants (Card / card / bank transfer → one value), remove exact duplicates on a defined key, filter impossible dates, flag (not delete) missing values. Load to a table; next month, drop the new file in the folder and **Refresh**. Document the steps (each step name says what it does) and keep a check: row counts before and after each step, and one total compared with the source system. A cleaning done by hand is a cleaning nobody can repeat or audit.

</details>

**C3. Measure vs calculated column in Power BI?**

<details><summary>Model answer</summary>

A **calculated column** is computed once per row at refresh and stored — use it for attributes you slice or filter by (an age band, a DPD bucket, "is 90+"). A **measure** is computed at query time in the current filter context — use it for anything aggregated (outstanding, PAR30 %, collection rate): it gives the right answer at every level of a visual, the total included. The classic mistake is a ratio as a column, then summed — PAR30 of a region becomes the sum of loan-level percentages. On my project the six base measures (Outstanding 208 723 504 430, Disbursed Count 7 828, Avg Ticket 51 709 668, PAR30 3.12 %, …) matched the SQL views to the soum.

</details>

**C4. What does CALCULATE do, and why does a star schema matter for it?**

<details><summary>Model answer</summary>

`CALCULATE(expression, filters…)` evaluates a measure in a **modified filter context**: it adds, replaces or removes filters — e.g. `Outstanding DPD30+ = CALCULATE([Outstanding], v_loan_status[dpd] > 30)`, then `PAR30 % = DIVIDE([Outstanding DPD30+], [Outstanding])`. Filters flow from **dimension** tables (products, branches, dates) along one-to-many relationships into the **fact** table; that is why the model should be a star: facts in the middle, dimensions around, single-direction one-to-many relationships, a marked date table. With fact-to-fact relationships, many-to-many or bidirectional filters, the same measure returns different numbers depending on the path the filter took — and nobody can explain the dashboard.

</details>

---

## D. Statistics and A/B testing

**D1. What is a p-value?**

<details><summary>Model answer</summary>

The probability, **computed assuming the null hypothesis is true**, of getting a result at least as extreme as the one observed. It is not the probability that the null is true, not "the probability it is due to chance", and not a measure of size. Example from my project: app vs branch FPD, 1.70 % vs 1.04 %, z = 2.15, p = 0.032 — if the channels truly had equal FPD, a gap this large would appear in about 3 % of samples of this size. Then the effect size: about 7 more first-payment defaults per 1 000 app loans.

</details>

**D2. How would you put a confidence interval on an FPD rate of 1.28 % (91 of 7 099)?**

<details><summary>Model answer</summary>

A proportion: SE = √(p(1 − p)/n) = 0.133 points, so the Wald interval is 1.02–1.54 %; the **Wilson** interval, 1.05–1.57 %, is the one to use for small rates and small samples (Wald goes negative or has poor coverage near 0 with few events). Interpretation: the method captures the true rate 95 % of the time; with 91 events the book-level rate is known to about ±¼ point, but a branch with 400 loans and 5 defaults has an interval several points wide — never rank branches on raw rates without their intervals.

</details>

**D3. Statistically significant but not important — give an example.**

<details><summary>Model answer</summary>

p depends on n. On ten million rows a 0.05-point difference in FPD gives a tiny p-value and is worth nothing; on 400 loans a 2-point difference may be "not significant" and still matter. So every result is reported with an **effect size** in business units — difference in points with its confidence interval, extra defaults per 1 000 loans, soum per viewer — and the decision compares that interval with what matters (a break-even), not p with 0.05.

</details>

**D4. What is a sample ratio mismatch and what do you do when you find one?**

<details><summary>Model answer</summary>

The split between arms differs from the design (e.g. 50/50 planned, 52/48 observed) by more than chance — a chi-square test on the counts. It means the assignment or the logging is broken and the arms may differ in who is in them, so the result cannot be trusted. Check it overall **and by the slices the software ships in** (device × release week): in my project the overall p was 0.09 ("fine") but iOS users in the last week went 60/40 (p ≈ 10⁻¹⁴) — a client bug; that cell was removed from both arms, reported, and the engineers fixed the client. Never "reweight" an SRM away.

</details>

**D5. Why is peeking at an A/B test every day a problem?**

<details><summary>Model answer</summary>

Each look is another chance for noise to cross p < 0.05; stopping at the first "significant" look raises the false-positive rate far above 5 % (in a simulation of 5 000 A/A tests over 28 days: 4.9 % with one look, 12.4 % with weekly looks, 27.2 % with daily looks). Fixes: fix the sample size in advance (from the MDE and power) and decide once; or use a sequential method designed for repeated looks; monitor guardrails and the SRM daily, but not the primary metric for a decision.

</details>

**D6. How do you choose the sample size, and why are risk guardrails hard to test?**

<details><summary>Model answer</summary>

From the baseline rate, the **minimum detectable effect** worth acting on, α (5 %) and power (80 %): e.g. detecting 8.0 → 8.9 % conversion with about 14 000 users per arm gives 77 % power (four weeks of app traffic in my project). Guardrails like FPD are rare events on a sub-population (only borrowers) with a two-month delay: detecting +0.7 points of FPD with 80 % power needs about 5 500 loans per arm — months of traffic. So a guardrail is judged by its confidence interval against a **break-even** (from unit economics), and risky changes are shipped in stages with a hold-out group whose FPD is read later.

</details>

---

## E. Behavioural and case

**E1. "Tell me about a time your number disagreed with the report."**

<details><summary>Model answer</summary>

Use STAR (situation, task, action, result) with a real case from your work. From this course: *"Product said app conversion was 58 %, a risk report said 68 % approval, another slide said most applicants never open the app. (S) I was asked where the app loses people. (T) Before computing anything I wrote down each number's numerator and denominator. (A) The 58 % was approved ÷ app sessions, the 68 % approved ÷ decided applications, and the 'never open the app' figure divided app sessions by applications from all channels — branch and partner customers have no app events at all. (R) I published one funnel with definitions under each step, ending at disbursed money, which also showed 222 signed contracts that never paid out — something no dashboard had shown."* The structure the interviewer listens for: you did not assume either side was wrong, you reconciled, and you told the owner.

</details>

**E2. "The board asks why FPD rose. What do you do?"**

<details><summary>Model answer</summary>

1. **Confirm it is real**: same definition and maturity rule as last month, same data cut-off, enough loans (an interval, not a point); is it one month or a trend? 2. **Decompose** by vintage, channel, product, grade, branch, officer, app version — is it everywhere (macro, a policy change) or concentrated (one branch or officer: possible fraud; one app version: a bug; one partner: a merchant problem)? 3. **Mix vs rate**: did the share of a riskier segment grow (more D grades, more app), or did the rate rise inside segments? 4. **Look for a cause** in the calendar: scorecard or cut-off change, a campaign, a new partner, a process change in onboarding. 5. **Answer the board** in three lines: what rose, where it is concentrated, what we do (tighten the segment, investigate the branch, keep a hold-out) and when the next read comes.

</details>

**E3. 15-minute case: "Approval rate dropped 5 points last week. Investigate."**

<details><summary>Model answer</summary>

Structure it aloud (an issue tree):
- **Is it real?** Definition unchanged (cancelled in or out?), the week complete (applications still pending a decision count as not approved — a right-censoring artefact on the last days), data pipeline healthy (a status not loaded?). Compute the same rate for the same weekday mix of last weeks; check the interval — with ~150 decisions a week, ±5 points can be noise.
- **Mix (who applied)?** Channel, product, new vs repeat, region, score distribution of applicants. A campaign that brought many low-score applicants lowers approval with no policy change — check the average score of applicants week on week.
- **Rate (how we decided)?** Inside each segment: did approval fall everywhere? Then look at the decision engine: a cut-off or rule change, a bureau outage (no bureau data → automatic reject), a new pre-check.
- **Where in the funnel?** For the app: did rejections move to the pre-check (before submit) or to the scorecard?
- **So what:** approvals lost × take-up × ticket = disbursement impact; if a rule caused it, was it intended (risk wanted it) or a bug.
Close with what you would pull first — `applications` for the two weeks by channel and score band, and the rejection reasons — and who you would call (risk for rule changes, the data team for the pipeline).

</details>

**E4. "Explain a p-value to a manager."**

<details><summary>Model answer</summary>

*"Imagine the new screen did nothing. Even then, two groups of customers would never convert exactly equally — there is always some noise. The p-value says how often noise alone would produce a difference as big as the one we saw. Ours is 1.6 %: noise would do it rarely, so we are fairly confident the screen really helps. It does not tell us how much it helps — for that we have the range: between 0.2 and 1.6 more contracts per 100 viewers. And it does not say the screen is safe for risk — that is a separate check."* No formulas, one example, the size and the limit.

</details>

---

Related: the glossary (`glossary.md`) for every definition, `roles.md` for who asks what. Week 8 Day 5 runs a mock interview with ten of these questions as a rapid-fire round.
