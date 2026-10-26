# Week 2 · Day 5 — Checkpoint: 25 questions from four teams

<span class="badge">Tasks 120 min</span> <span class="badge">Interview 30 min</span> <span class="badge hw">Checkpoint · 100 points</span>

> STORY **Friday, 9:00.** Four e-mails are waiting, forwarded by Madina with one line on top: *"Everyone wants numbers before the long weekend. Bekzod — the book. Sevara — who is late and who we have not called. Nilufar — Monday's committee. Timur — he wants to know what you found in his data before the board does. Twenty-five questions. Answer them with what you learned this week and last; at 15:00 I'll ask you eight things."*

## Today in 3 lines

- **Part A (75 pts):** 25 tasks — 7 from Bekzod, 6 from Sevara, 6 from Nilufar, 6 from Timur — each a query and its result, difficulty rising inside each group.
- **Part B (25 pts):** eight interview questions answered in writing, 3–5 sentences each.
- Allowed SQL: weeks 1–2 only — `SELECT/WHERE/ORDER BY`, joins, `GROUP BY/HAVING`, functions, `CASE`, set operators. The two `WITH` blocks printed on Day 3 (DPD) and Day 4 (FPD30) may be copied as they stand; no other subqueries, no window functions.

**Rules.** Open book: your notes, this week's pages, your tool. Closed: the answer folds until you submit. Submit to **`submissions/week-02/day-5/`**: `queries.sql` (each task with `-- Tn:` above and `-- result:` below; say which dialect) and `interview.md`. Also due today: **HW 2.2** in `day-3/`. Expected numbers are as of 2026-10-01.

**Working method** (the one the week taught): before each query write the noun that is "one row" of the table you aggregate; join dimensions many-to-one freely; when a join is one-to-many, run `COUNT(*)` next to `COUNT(DISTINCT key)` before you sum anything; filter periods half-open; put NULL tests first in a `CASE`; and report a count next to every average or rate.

---

## Part A — Twenty-five tasks (120 min, 75 pts)

Three points each: 1 for a query that runs and expresses the question, 1 for the right result, 1 for the one-line reading (`-- note:`) where the task asks for one.

### Bekzod — the portfolio (7)

**T1.** Loans and total principal by product, most money first.

<details><summary>T1</summary>

```sql
SELECT p.name, COUNT(*) AS loans, SUM(l.principal) AS principal
FROM loans l JOIN products p ON p.product_id = l.product_id GROUP BY p.name ORDER BY principal DESC;
-- SME 781 / 241 117 150 000 · Auto 391 / 84 791 530 000 · Consumer 2418 / 65 109 280 000 · Micro 2669 / 7 221 210 000 · BNPL 1569 / 6 544 110 000
```
</details>

**T2.** Outstanding principal (instalments not yet due) by product, with the number of loans still owing.

<details><summary>T2</summary>

```sql
SELECT p.name, SUM(i.principal_due) AS outstanding, COUNT(DISTINCT i.loan_id) AS loans
FROM installments i JOIN loans l ON l.loan_id = i.loan_id JOIN products p ON p.product_id = l.product_id
WHERE i.due_date > '2026-10-01' GROUP BY p.name ORDER BY outstanding DESC;
-- SME 125 892 942 411 / 603 · Auto 57 684 271 333 / 368 · Consumer 23 054 933 316 / 1398 · BNPL 1 135 251 000 / 474 · Micro 956 106 370 / 566
```
Sums an *instalment* column over `installments`, so the join to `loans` (many-to-one from the instalment) is safe; summing `l.principal` here would be the trap. Total 208 723 504 430.
</details>

**T3.** 2026 disbursements by product: loans, amount, average ticket (whole UZS).

<details><summary>T3</summary>

```sql
SELECT p.name, COUNT(*) AS loans, SUM(l.principal) AS disbursed, ROUND(AVG(l.principal)) AS avg_ticket
FROM loans l JOIN products p ON p.product_id = l.product_id
WHERE l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2027-01-01' GROUP BY p.name ORDER BY disbursed DESC;
-- SME 305 / 95 235 100 000 / 312 246 230 · Auto 165 / 36 218 310 000 / 219 504 909 · Consumer 941 / 25 618 370 000 / 27 224 623
-- Micro 1045 / 2 811 950 000 / 2 690 861 · BNPL 595 / 2 449 330 000 / 4 116 521            (total 3051 / 162 333 060 000)
```
</details>

**T4.** 2026 disbursements by month — which month was largest by amount, which by count?

<details><summary>T4</summary>

```sql
SELECT strftime('%Y-%m', disbursed_at) AS month, COUNT(*) AS loans, SUM(principal) AS disbursed      -- FORMAT(disbursed_at, 'yyyy-MM')
FROM loans WHERE disbursed_at >= '2026-01-01' GROUP BY strftime('%Y-%m', disbursed_at) ORDER BY month;
-- largest amount: 2026-08, 358 loans / 22 290 210 000; most loans: 2026-05, 377 / 18 531 830 000
```
Ten rows; October has one day (21 loans). Count and amount peak in different months — two SME loans more or less move the amount by billions.
</details>

**T5.** Outstanding principal by region of the *branch*, largest first, with a `-- note:` on concentration.

<details><summary>T5</summary>

```sql
SELECT b.region, SUM(i.principal_due) AS outstanding, COUNT(DISTINCT i.loan_id) AS loans
FROM installments i JOIN loans l ON l.loan_id = i.loan_id JOIN branches b ON b.branch_id = l.branch_id
WHERE i.due_date > '2026-10-01' GROUP BY b.region ORDER BY outstanding DESC;
-- Tashkent 81 679 738 071 / 1297 · Fergana 24 797 334 197 / 383 · Samarkand 24 655 889 676 / 401 · Andijan 19 798 392 956 / 340
-- Namangan 18 696 787 066 / 290 · Bukhara 15 116 046 338 / 279 · Nukus 13 309 138 567 / 216 · Termez 10 670 177 559 / 203
```
Note: Tashkent holds 39 % of outstanding with 38 % of the owing loans — the book is not concentrated by region; it is concentrated by product (T2: SME is 60 % of outstanding on 18 % of the owing loans).
</details>

**T6.** How many customers have five or more loans? Show the distribution of loans per customer (1, 2, 3 … → customers).

<details><summary>T6</summary>

```sql
SELECT customer_id, COUNT(*) AS loans FROM loans GROUP BY customer_id HAVING COUNT(*) >= 5;    -- 81 rows
```
Distribution (`GROUP BY customer_id`, then count the rows per value — by eye today, with a subquery next week): 1 loan → 2 089 customers · 2 → 1 378 · 3 → 593 · 4 → 194 · 5 → 62 · 6 → 15 · 7 → 4. Total 4 335 borrowers.
</details>

**T7.** Bekzod's hardest: 2026 disbursed amount by product (rows) × quarter (Q1, Q2, Q3 as columns; 1 October belongs to Q4 — leave it out). Add a `-- note:` on which products grew every quarter.

<details><summary>T7</summary>

```sql
SELECT p.name,
       SUM(CASE WHEN l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2026-04-01' THEN l.principal ELSE 0 END) AS q1,
       SUM(CASE WHEN l.disbursed_at >= '2026-04-01' AND l.disbursed_at < '2026-07-01' THEN l.principal ELSE 0 END) AS q2,
       SUM(CASE WHEN l.disbursed_at >= '2026-07-01' AND l.disbursed_at < '2026-10-01' THEN l.principal ELSE 0 END) AS q3
FROM loans l JOIN products p ON p.product_id = l.product_id
WHERE l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2026-10-01' GROUP BY p.name ORDER BY p.name;
-- Q1 / Q2 / Q3:  Auto 13 637 110 000 / 10 773 540 000 / 11 611 170 000 · BNPL 775 920 000 / 733 850 000 / 921 270 000
--                Consumer 7 465 620 000 / 9 226 930 000 / 8 769 350 000 · Micro 782 600 000 / 988 770 000 / 1 019 870 000
--                SME 26 342 380 000 / 30 754 010 000 / 37 677 910 000
```
Day 4's version let 1 October (21 loans, 852 760 000) leak into Q3; the half-open upper bound fixes it. Note: SME and Micro grew every quarter; BNPL and Consumer dipped in Q2 or Q3; Auto fell after Q1 and has not recovered. Full marks need the half-open filters and the note.
</details>

### Sevara — delinquency and collections (6)

**T8.** How much is overdue right now: matured instalments **not fully paid** — count of instalments, loans, and the unpaid remainder.

<details><summary>T8</summary>
Copy Day 3's `WITH unpaid … dpd …` block and finish with `SELECT COUNT(*), COUNT(DISTINCT loan_id), SUM(total_due - paid) FROM unpaid;` → **1 784 instalments · 413 loans · 7 599 088 794 UZS**. (Day 1's simpler "no payment at all" version gives 1 357 / 399 / 6 475 544 633 — accepted with a note saying it ignores partial payments.)
</details>

**T9.** The DPD bucket table (0 / 1–30 / 31–60 / 61–90 / 90+) with loans and overdue amount per bucket, and the status check.

<details><summary>T9</summary>
From `dpd` with the bucket `CASE` (Day 3, Company corner): 0 → 14 / 53 018 776 · 1–30 → 124 / 499 314 822 · 31–60 → 25 / 74 348 104 · 61–90 → 16 / 109 375 982 · 90+ → 234 / 6 863 031 110. Note: 90+ = 44 `default` + 190 `written_off`, so the status column agrees with the computation; 399 loans have DPD > 0.
</details>

**T10.** The call list: loans with DPD 31–90, borrower name, phone, DPD and overdue amount, worst first. How many, how much?

<details><summary>T10</summary>

```sql
-- after the WITH block:
SELECT d.loan_id, c.first_name || ' ' || c.last_name AS borrower, c.phone, d.dpd, d.overdue_amount
FROM dpd d JOIN loans l ON l.loan_id = d.loan_id JOIN customers c ON c.customer_id = l.customer_id
WHERE d.dpd BETWEEN 31 AND 90 ORDER BY d.dpd DESC;
```
**41 loans, 183 724 086 UZS**; first row loan 2242, Abror Abdullaev, 89 DPD, 968 400 owed; the largest overdue amount in the list is loan 4567 (60 328 500 owed, 84 DPD). `BETWEEN` is fine on integers — the trap is on dates with times, not here.
</details>

**T11.** Delinquent loans (DPD > 0) and overdue amount by product, with a `-- note:`.

<details><summary>T11</summary>
From `dpd`, `WHERE d.dpd > 0`, joined to `loans → products`: SME 47 loans / 4 802 628 425 · Consumer 138 / 1 308 423 535 · Auto 29 / 1 161 471 073 · Micro 121 / 177 923 528 · BNPL 64 / 95 623 457. Note: Consumer has the most late *loans*, SME the most late *money* — ask Sevara which she is staffing for.
</details>

**T12.** Collections actions by type with the share ending in a promise to pay — one query, `SUM(CASE)`.

<details><summary>T12</summary>

```sql
SELECT action_type, COUNT(*) AS actions,
       ROUND(100.0 * SUM(CASE WHEN outcome = 'promise_to_pay' THEN 1 ELSE 0 END) / COUNT(*), 1) AS promise_pct
FROM collections_actions GROUP BY action_type ORDER BY actions DESC;
-- sms 3265 / 38.4 · call 3114 / 25.2 · visit 1506 / 25.3 · restructure_offer 1476 / 23.3
```
</details>

**T13.** Sevara's hardest: delinquent loans that have **never** had a collections action — total, and how many of them are in the 1–30 bucket. `-- note:` what it says about the team's queue.

<details><summary>T13</summary>

```sql
-- after the WITH block:
SELECT COUNT(*) AS never_contacted,
       SUM(CASE WHEN d.dpd BETWEEN 1 AND 30 THEN 1 ELSE 0 END) AS of_which_1_30
FROM dpd d LEFT JOIN collections_actions ca ON ca.loan_id = d.loan_id
WHERE ca.action_id IS NULL;                                        -- 130 · 106
```
The anti-join on `collections_actions`. 130 of the 413 loans with a matured unpaid instalment have no action — but 13 of those fall due today (DPD 0) and cannot have been called yet, so the fair answer is **117 of the 399 delinquent (DPD > 0) loans**; 106 of the 124 in 1–30 are among them, while the 234 loans in 90+ carry 9 058 actions (39 each). The team's effort sits on the dead debt; the fresh, curable cases wait. That sentence is the note.
</details>

### Nilufar — approvals and risk (6)

**T14.** Approval rate by channel under both conventions in one query: all applications, and decided only (cancelled out).

<details><summary>T14</summary>

```sql
SELECT channel, COUNT(*) AS apps,
       ROUND(100.0 * SUM(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END) / COUNT(*), 1) AS rate_all,
       ROUND(100.0 * SUM(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END)
                   / NULLIF(SUM(CASE WHEN status <> 'cancelled' THEN 1 ELSE 0 END), 0), 1) AS rate_decided
FROM applications GROUP BY channel;
-- app 5006 / 58.2 / 68.2 · branch 6223 / 63.7 / 72.4 · partner 2771 / 61.9 / 70.5
```
</details>

**T15.** Approval rate by credit-score band (A ≥ 720, B 660–719, C 600–659, D < 600) **with a no-score band**; the bands must add up to 14 000.

<details><summary>T15</summary>
Day 4 P4: A 2 150 / 91.3 % · B 4 702 / 77.4 · C 4 605 / 52.2 · D 2 155 / 16.8 · no score 388 / 59.0 — sum 14 000. The NULL test comes first in the `CASE`; without it the 388 land in D and the D rate reads 23 % instead of 17 %.
</details>

**T16.** Approval rate (all applications) by band **and** channel. In which band is the app furthest below the branch?

<details><summary>T16</summary>
`GROUP BY band, channel`: A app 88.0 vs branch 93.0 (−5.0) · B 72.9 vs 80.2 (−7.3) · C 49.8 vs 54.3 (−4.5) · **D 11.6 vs 19.6 (−8.0)** · no score 57.6 vs 60.9. The app is strictest at the bottom — where Day 4's FPD says it should be — and still has the worse FPD.
</details>

**T17.** Share of approvals that were never disbursed (`approved_not_disbursed` ÷ all approved), by channel.

<details><summary>T17</summary>
`SUM(CASE WHEN status = 'approved_not_disbursed' THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END)`: app 222 / 2 915 = **7.6 %** · branch 329 / 3 965 = 8.3 % · partner 127 / 1 715 = 7.4 %. Branch customers walk away slightly more often — they had two days to think (decision lag 2.0 days vs 0 in the app).
</details>

**T18.** FPD30 by channel (Day 4's definition and `WITH` block).

<details><summary>T18</summary>
app 2 411 / 41 / **1.70 %** · partner 1 425 / 16 / 1.12 % · branch 3 263 / 34 / 1.04 %; overall 7 099 / 91 / 1.28 %. State the definition in the `-- note:` (first instalment not fully paid within 30 days; base = first due date ≤ 2026-09-01).
</details>

**T19.** Nilufar's hardest: FPD30 **and** write-off share by risk grade in one table, with a `-- note:` on whether the grades order both.

<details><summary>T19</summary>
FPD from the `flags` block joined to `loans`, grouped by `l.risk_grade`; write-off share from `loans` alone (`SUM(CASE WHEN status = 'written_off' THEN 1 ELSE 0 END) / COUNT(*)`) — two queries, or one `UNION ALL` with a label column:

| grade | loans in FPD scope | FPD30 | write-offs / loans | write-off % |
|---|---|---|---|---|
| A | 1 667 | 0.60 % | 13 / 1 821 | 0.7 % |
| B | 3 084 | 0.97 % | 49 / 3 404 | 1.4 % |
| C | 2 034 | 2.16 % | 98 / 2 264 | 4.3 % |
| D | 314 | 2.23 % | 30 / 339 | 8.8 % |

Both monotonic. FPD separates A/B from C/D (×2.2) but barely C from D; write-off separates every grade (×2 each step). FPD is the early signal, write-off the outcome — the scorecard works, and D is a small, expensive book.
</details>

### Timur — data quality and grain (6)

**T20.** Payments by `method` raw and cleaned (`LOWER`, `TRIM`, `REPLACE`), and the number of rows that needed cleaning.

<details><summary>T20</summary>
Raw: 10 groups on SQLite (SQL Server's default collation ignores case and trailing spaces and shows 6 — Day 2 P9). Cleaned with `REPLACE(LOWER(TRIM(method)), 'bank transfer', 'transfer')`: card 17 621 · payme 8 900 · click 8 790 · cash 8 790 · transfer 8 774. Dirty rows: `WHERE method <> LOWER(TRIM(method)) OR method LIKE 'bank%'` → **180** on SQLite (SQL Server: add `COLLATE Latin1_General_CS_AS` after `LOWER(TRIM(method))`, or its default collation finds only the 27 `bank transfer` rows). Note for Timur: the 27 `bank transfer` rows average 2.1 days late — a different source system, not a typo.
</details>

**T21.** Exact duplicate payments: how many groups, and how much money is counted twice?

<details><summary>T21</summary>
`GROUP BY installment_id, paid_at, amount HAVING COUNT(*) > 1` → **25** groups of 2; `SUM(amount)` over those groups → **58 397 800** double-counted. Also visible as 52 875 rows vs 52 850 distinct `installment_id`, and as 25 instalments "overpaid" by exactly one instalment.
</details>

**T22.** Closed loans with no `closed_at` — how many, and do they have an unpaid matured instalment?

<details><summary>T22</summary>
`SELECT COUNT(*) FROM loans WHERE status = 'closed' AND closed_at IS NULL` → **15**. Joined to Day 3's `dpd` set, all 15 appear (13 in 1–30, 1 in 31–60, 1 at DPD 0): the system closed them when the schedule ended, not when the money arrived. Note: `status` should be derived from payments, not from the calendar.
</details>

**T23.** Payments dated **after** the as-of date: count, latest date, loans affected.

<details><summary>T23</summary>
`SELECT COUNT(*), MAX(paid_at), COUNT(DISTINCT loan_id) FROM payments WHERE paid_at > '2026-10-01'` → **24 · 2026-11-24 · 23**. Either the extract date is wrong or these are forward-dated entries; Day 4 P7 showed they do not change the DPD buckets, but they inflate "collected in October" before October exists.
</details>

**T24.** Loans disbursed before their application was submitted: count, and the rule that recovers the true date.

<details><summary>T24</summary>
`WHERE l.disbursed_at < date(a.applied_at)` (SQL Server `CAST(a.applied_at AS DATE)`) after `loans JOIN applications` → **12**. The true date is the first instalment's `due_date` minus one month — 0–3 days after `decided_at` for all twelve. Recommendation: restore `disbursed_at` from the schedule; add a load check `disbursed_at >= decided_at`.
</details>

**T25.** The grain question (no query, 5–8 sentences). Bekzod asks for *outstanding by product*; Sevara for *days late per payment*; Madina for *disbursements by month*. For each: what is one row of the table you aggregate, which tables may you join before aggregating, and which join would silently inflate the number?

<details><summary>T25 — model answer</summary>
*Outstanding by product:* one row = one **instalment** (`installments`, filtered to `due_date > as-of`); join `loans` → `products` (many-to-one from the instalment) to label; never sum `loans.principal` on this join — every loan would count once per instalment. *Days late per payment:* one row = one **payment** (`payments`); join `installments` on `installment_id` (one-to-one here, the 25 duplicates aside) for the due date and `loans → products` for labels; grouping by product is safe because each payment belongs to one loan. *Disbursements by month:* one row = one **loan** (`loans`); join `products`/`branches`/`dim_date`, all many-to-one; joining `installments` or `payments` first would multiply each loan by its term or its payment count. The method: name the noun that is "one row", aggregate that table's own measures, and treat every one-to-many join as a reason to aggregate separately and join the results (week 3).
</details>

---

## Part B — Eight interview questions (30 min, 25 pts)

Answer in writing, 3–5 sentences each, as you would say it: 3 points per question (1 correct, 1 a Nur Finance example with a number, 1 plain words) and 1 point for a short "definitions I used" note at the top of `interview.md` (as-of date, FPD30 rule, DPD rule).

1. What is the difference between INNER JOIN and LEFT JOIN? When does the row count change, and in which direction?
2. Why would you choose a LEFT JOIN for a report, and what mistake turns it back into an INNER JOIN?
3. HAVING vs WHERE — what does each filter, and in what order do they run?
4. How does NULL behave in `COUNT`, `AVG` and `WHERE`? What do you report next to an average?
5. How do you compute DPD for every loan in SQL?
6. FPD and DPD — what is each used for, and why track FPD separately?
7. What is the trap in filtering by period, and how do you write the filter?
8. What is row multiplication in a join, how do you detect it, and how do you avoid summing the wrong thing?

<details><summary>Model answers (open after submitting)</summary>

1. INNER keeps only rows with a match on both sides; LEFT keeps every row of the left table and fills the right with NULL where nothing matches. Many-to-one joins keep the count (7 828 loans → 7 828 rows with customers); one-to-many joins raise it to the many side (92 193 with instalments); INNER can lower it when matches are missing (customers → loans drops 1 705 people).
2. When the question is about the *left* population including those with nothing on the right: customers with no loan, instalments with no payment, delinquent loans with no collections action (117 of 399). The mistake is a condition on the right-hand table in `WHERE` — `WHERE p.paid_at <= as-of` fails on NULL and throws away exactly the unmatched rows; put right-side conditions in `ON`.
3. `WHERE` filters rows before grouping, `HAVING` filters groups after the aggregates exist; order FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. "Active loans per branch, branches with more than 300" is `WHERE status = 'active' … HAVING COUNT(*) > 300` (6 branches). `WHERE COUNT(*) > 300` is an error because there is no count yet.
4. `COUNT(*)` counts rows, `COUNT(col)` only non-NULLs; `AVG` and `SUM` ignore NULLs, so `AVG(monthly_income)` is the average of the 94 % with income (15.25 m), not of everyone; `= NULL` is never true and NULL rows fail every `WHERE` comparison, including `<>`. Report the count and the missing share next to any average, and check whether the missing are concentrated (Bukhara 7.6 % vs Termez 4.6 %).
5. Per instalment: LEFT JOIN payments, group per instalment, `COALESCE(SUM(amount), 0)` as paid, keep matured instalments with `HAVING paid < total_due`. Per loan: `MIN(due_date)` of those; DPD = as-of − that date; bucket with `CASE`. Check that 90+ equals default + written_off (234 = 44 + 190). Say how partial payments are treated — "not fully paid", otherwise 17 written-off loans fall out of 90+.
6. DPD measures the current state of each loan and drives collections and provisions (buckets, PAR30, NPL). FPD flags loans whose first instalment was not paid within X days — it appears within two months of disbursement, so it is the early warning for a new channel, product or scoring rule, and the classic fraud signal. Nur Finance: 1.28 % FPD30 overall, 1.70 % on the app vs 1.04 % at branches — visible years before the 36-month Auto book shows its losses.
7. `BETWEEN '2026-09-01' AND '2026-09-30'` drops rows with a time on the last day (598 instead of 621 September applications), and functions on the column (`strftime(…) = '2026-09'`) stop indexes working. Write half-open ranges: `col >= '2026-09-01' AND col < '2026-10-01'` — works for days, months, years, datetimes alike.
8. A one-to-many join repeats each parent row once per child; summing a parent column over it multiplies it by the child count (`SUM(principal)` over loans × instalments → 9.98 trillion, 24× the SME figure). Detect it with `COUNT(*)` vs `COUNT(DISTINCT parent_key)` side by side; avoid it by aggregating each table at its own grain and joining the aggregates (week 3's subqueries/CTEs), or by using `COUNT(DISTINCT)` for counts.
</details>

---

## Scoring and what happens next

| Part | Points | Pass |
|---|---|---|
| A — 25 tasks × 3 | 75 | |
| B — 8 questions × 3 + definitions note | 25 | |
| **Total** | **100** | **≥ 70 → Week 3 on Monday** |

Below 70: feedback names the sections to redo (most often Day 2's HAVING/multiplication or Day 4's NULL rules); re-submit the failed tasks Monday morning before Week 3. Points go to `docs/progress.md`.

**Submission checklist** — `submissions/week-02/day-5/`: `queries.sql` (25 tasks, 25 `-- result:` lines, dialect stated), `interview.md` (definitions note + 8 answers). Also due today: **HW 2.2** in `day-3/` (`lateness.sql`, `lateness.md`, `methods.sql`, `detective.md`).

Madina, 17:40: *"Nilufar has her slide and the sentence under it. Sevara moved three collectors to the 1–30 queue. Timur found out about his fifteen closed loans from you, not from the board — he says thank you, in his way. Monday: window functions, and the twenty-five questions you could not answer this week because they needed 'the previous month'."*

---

### 📎 Hand in here

```sqltask
{"check": "handin-W2D5", "lesson": "W2D5", "title": "Checkpoint 2", "tasks": [{"id": "queries.sql", "file": "queries.sql", "text": true, "minLines": 3, "q": "Write `queries.sql` here — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w02d5", "pass": 0.8, "questions": [
  {"type": "single", "q": "Bekzod asks for outstanding principal by product. What is one row of the table you aggregate?", "options": ["One loan", "One instalment not yet due", "One payment", "One product"], "answer": 1, "explain": "Outstanding is the sum of principal_due on instalments with due_date after the as-of date; loans and products are joined only as labels (→ T2, T25)."},
  {"type": "single", "q": "Madina asks for disbursements by month. Which join, made before SUM(l.principal), silently inflates the number?", "options": ["loans → products", "loans → branches", "loans → dim_date", "loans → installments"], "answer": 3, "explain": "products, branches and dim_date are many-to-one from the loan; installments repeats each loan once per instalment (→ T25)."},
  {"type": "number", "q": "Two loans: loan 1 has principal 100 and 3 instalments, loan 2 has principal 200 and 2 instalments. What does the query return?", "code": "SELECT SUM(l.principal)\nFROM loans l\nJOIN installments i ON i.loan_id = l.loan_id;", "answer": 700, "explain": "Each principal is counted once per instalment: 100 × 3 + 200 × 2 = 700, not 300; COUNT(*) vs COUNT(DISTINCT l.loan_id) (5 vs 2) would have warned you (→ interview question 8)."},
  {"type": "single", "q": "The data runs to 2026-10-01 and Q3 must end on 30 September. Which line has the bug?", "code": "1  SUM(CASE WHEN l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2026-04-01' THEN l.principal ELSE 0 END) AS q1,\n2  SUM(CASE WHEN l.disbursed_at >= '2026-04-01' AND l.disbursed_at < '2026-07-01' THEN l.principal ELSE 0 END) AS q2,\n3  SUM(CASE WHEN l.disbursed_at >= '2026-07-01' THEN l.principal ELSE 0 END) AS q3", "options": ["Line 1", "Line 2", "Line 3 — it has no upper bound, so 1 October leaks into Q3", "None — the query is right"], "answer": 2, "explain": "Every period needs a half-open range with both ends: >= start AND < next start (→ T7)."},
  {"type": "single", "q": "Sevara wants delinquent loans that have NEVER had a collections action. Which shape is right (dpd = the delinquent loans)?", "options": ["FROM dpd d LEFT JOIN collections_actions ca ON ca.loan_id = d.loan_id WHERE ca.action_id IS NULL", "FROM dpd d JOIN collections_actions ca ON ca.loan_id = d.loan_id WHERE ca.action_id IS NULL", "FROM dpd d LEFT JOIN collections_actions ca ON ca.loan_id = d.loan_id WHERE ca.outcome IS NOT NULL", "FROM collections_actions ca LEFT JOIN dpd d ON d.loan_id = ca.loan_id WHERE d.loan_id IS NULL"], "answer": 0, "explain": "The anti-join: the population you count goes on the left, and IS NULL on the right key keeps the unmatched ones; the inner version always returns 0 (→ T13)."},
  {"type": "single", "q": "Is this filter safe for the 31–90 call list?", "code": "WHERE d.dpd BETWEEN 31 AND 90", "options": ["Yes — dpd is a whole number and BETWEEN includes both ends", "No — BETWEEN leaves out 90", "No — BETWEEN is never safe", "No — it also includes 30"], "answer": 0, "explain": "The BETWEEN trap is on dates that carry a time; on integers it is exact (→ T10)."},
  {"type": "multi", "q": "Which habits belong to the working method of weeks 1–2?", "options": ["Write the noun that is 'one row' before aggregating", "Run COUNT(*) next to COUNT(DISTINCT key) after a one-to-many join, before summing", "Filter periods half-open (>= start, < next start)", "Put the NULL test first in a CASE", "Use BETWEEN with the month's last day for monthly reports", "Leave the count out next to a rate to keep slides clean"], "answer": [0, 1, 2, 3], "explain": "BETWEEN with an end date drops times on the last day, and a rate without its count hides how small the base is (→ Working method, top of the page)."},
  {"type": "single", "q": "A monthly FPD30 vintage has about 300 loans and 3 FPDs, so one loan moves the rate by 0.3 points. How do you read it?", "options": ["Compare single months and report every jump", "Read vintages by quarter (or longer) and show the counts next to the rates", "Drop the months with zero FPDs", "Use AVG(principal) instead"], "answer": 1, "explain": "Small counts make monthly rates noisy; group them and always show the base (→ T18; Day 4, Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w02d5", "q": "Sevara's queue review, branch by branch. Take the loans with DPD > 0 as of 2026-10-01 (Day 3's unpaid / dpd block). For each branch, compute the share of those delinquent loans that have never had a collections action. Which branch has the highest share?", "type": "text", "dp": 0, "h": ["06f38c160b3b9b47e6ca2e38", "5acae2e91977a75e1e2c7e02", "a20f52c21beec9f12b143428"], "hint": "Get the denominator right first: a loan with nine collections actions must still count once.", "sol": "V0lUSCB1bnBhaWQgQVMgKCDigKZEYXkgMydzIGJsb2Nr4oCmICksIGRwZCBBUyAoIOKApkRheSAzJ3MgYmxvY2vigKYgKQpTRUxFQ1QgYi5icmFuY2hfbmFtZSwKICAgICAgIENPVU5UKERJU1RJTkNUIGQubG9hbl9pZCkgQVMgZGVsaW5xdWVudCwKICAgICAgIENPVU5UKERJU1RJTkNUIENBU0UgV0hFTiBjYS5hY3Rpb25faWQgSVMgTlVMTCBUSEVOIGQubG9hbl9pZCBFTkQpIEFTIG5ldmVyX2FjdGlvbmVkLAogICAgICAgUk9VTkQoMTAwLjAgKiBDT1VOVChESVNUSU5DVCBDQVNFIFdIRU4gY2EuYWN0aW9uX2lkIElTIE5VTEwgVEhFTiBkLmxvYW5faWQgRU5EKQogICAgICAgICAgICAgICAgICAgLyBDT1VOVChESVNUSU5DVCBkLmxvYW5faWQpLCAxKSBBUyBwY3QKRlJPTSBkcGQgZApKT0lOIGxvYW5zIGwgICAgT04gbC5sb2FuX2lkID0gZC5sb2FuX2lkCkpPSU4gYnJhbmNoZXMgYiBPTiBiLmJyYW5jaF9pZCA9IGwuYnJhbmNoX2lkCkxFRlQgSk9JTiBjb2xsZWN0aW9uc19hY3Rpb25zIGNhIE9OIGNhLmxvYW5faWQgPSBkLmxvYW5faWQKV0hFUkUgZC5kcGQgPiAwCkdST1VQIEJZIGIuYnJhbmNoX25hbWUKT1JERVIgQlkgcGN0IERFU0M7Ci0tIFRhc2hrZW50IE5vcnRoIDIwIG9mIDUyID0gMzguNSAlIMK3IFRlcm1leiBDZW50cmFsIDggb2YgMjIgPSAzNi40IMK3IFNhbWFya2FuZCBDZW50cmFsIDE0IG9mIDQxID0gMzQuMSDigKYgVGFzaGtlbnQgQ2VudHJhbCA4IG9mIDQ3ID0gMTcuMAotLSBTUUwgU2VydmVyOiB0aGUgRGF5IDMgREFURURJRkYgc3BlbGxpbmcgaW4gdGhlIGRwZCBibG9jaywgdGhlIHJlc3QgaWRlbnRpY2FsCkNPVU5UKCopIG92ZXIgdGhlIExFRlQgSk9JTiBjb3VudHMgYWN0aW9ucywgbm90IGxvYW5zOiB0aGUgOTArIGxvYW5zIGNhcnJ5IGFib3V0IDM5IGFjdGlvbnMgZWFjaCBhbmQgc3dhbXAgdGhlIGRlbm9taW5hdG9yLiBLZWVwIERQRCA+IDAg4oCUIHRoZSAxNCBsb2FucyBhdCBEUEQgMCBmYWxsIGR1ZSBvbiB0aGUgYXMtb2YgZGF5IGFuZCBhcmUgbm90IGxhdGUgeWV0ICh3aXRoIHRoZW0sIFRlcm1leiBDZW50cmFsLCA5IG9mIDIzLCBjb21lcyBmaXJzdDogc2F5IHlvdXIgc2NvcGUpLgpUYXNoa2VudCBOb3J0aCBsZWF2ZXMgNCBpbiAxMCBvZiBpdHMgbGF0ZSBsb2FucyB1bnRvdWNoZWQgd2hpbGUgVGFzaGtlbnQgQ2VudHJhbCwgaW4gdGhlIHNhbWUgY2l0eSB3aXRoIHRoZSBzYW1lIHByb2R1Y3RzLCBsZWF2ZXMgZmV3ZXIgdGhhbiAyIGluIDEwOiBhIHRlYW0tY2FwYWNpdHkgcXVlc3Rpb24gZm9yIFNldmFyYSwgbm90IGEgY3VzdG9tZXIgb25lLg=="}
```

<!-- challenge:end -->
