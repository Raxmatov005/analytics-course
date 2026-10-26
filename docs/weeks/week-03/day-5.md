# Week 3 · Day 5 — Checkpoint: the loan-book EDA report

<span class="badge">Report 150 min</span> <span class="badge">Interview 30 min</span> <span class="badge hw">Checkpoint · 100 points</span>

> STORY **Friday, 9:00.** Madina closes the door. *"Monday the board gets a one-pager on the loan book from Bekzod. He will build it from what you write today. Not twenty-five answers — one **report**: what is in the database, how big the book is, where it sits, how it moves, how it performs. Ten sections, each with the query, the first rows, and what you see. Everything we built this week — windows, CTEs, the views — is allowed; everything must be reproducible. At 15:00, eight questions."*

## Today in 3 lines

- **Part A (80 pts):** `report.md` — an exploratory data analysis (*разведочный анализ данных*, EDA) of Nur Finance's loan book in ten sections, modelled on Baraa's SQL EDA project (▶ [27:41:51](https://youtu.be/SSKVgrwhzus?t=99711)) but on our data and our metrics.
- **Part B (20 pts):** eight interview questions on this week's material, answered in writing.
- Allowed: everything from weeks 1–3, including the three HW 3.2 views (ship `views.sql` with the report so the reviewer can run it).

**Rules.** Open book: your pages, your files, your tool. Closed: the model-answer folds until you submit. Submit to **`submissions/week-03/day-5/`**: `report.md` (ten numbered sections; each = the query in a code block, the first rows as a Markdown table, 1–3 sentences of findings), `report.sql` (the same queries, `-- S1:` … `-- S10:` headers), `interview.md`. Also due today: **HW 3.2** in `day-4/`. All numbers as of **2026-10-01**; use `v_payments_clean` wherever payments are summed.

**Working method.** For each section: say the grain before the query; name *share of what* and *period* in every sentence; a count next to every rate; half-open date filters; a window for shares and running totals, a CTE chain where you aggregate twice; and one finding per section that Bekzod could read aloud — not a description of the table.

**The shape of one section** (copy it ten times):

~~~markdown
## S5. Magnitude — disbursed principal by product
Grain: one row per loan (`loans`); dimension joined many-to-one.

```sql
SELECT p.code, COUNT(*) AS loans, SUM(l.principal) AS disbursed, … FROM loans l JOIN products p … GROUP BY p.code;
```

| code | loans | disbursed | share % |
|---|---|---|---|
| SME | 781 | 241 117 150 000 | 59.6 |
| … | | | |

**Finding.** Two books in one: 85 % of loans are Micro/Consumer/BNPL, 80 % of the money is SME/Auto.
~~~

Five lines of Markdown per section, not fifty: the reviewer reads the finding first, then checks the number, then — only if it is wrong — reads the query.

**Common mistakes from this week** (each costs the number point): summing `loans.principal` after a join to `installments` (11.8 rows per loan, and the long loans are the big ones: Σ principal ×24.7); a running total without `PARTITION BY` where the sentence says "per product"; `LAG` with the display filter inside the CTE (NULL year-on-year); a 0.00 % in a vintage cell that is not yet observable; `BETWEEN` on a datetime column; raw `payments` where `v_payments_clean` was asked for.

---

## Part A — The report (150 min, 80 pts)

Eight points per section: 3 for a query that runs and answers the heading, 3 for the numbers, 2 for the finding sentence(s). The model answers below are *an* answer; a different cut with correct numbers and a real finding scores the same.

### S1. Database exploration — tables, row counts, grain

<details><summary>Model answer</summary>

```sql
SELECT 'customers' AS tbl, COUNT(*) AS rows FROM customers
UNION ALL SELECT 'applications', COUNT(*) FROM applications
UNION ALL SELECT 'loans', COUNT(*) FROM loans
UNION ALL SELECT 'installments', COUNT(*) FROM installments
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'collections_actions', COUNT(*) FROM collections_actions
UNION ALL SELECT 'app_events', COUNT(*) FROM app_events
UNION ALL SELECT 'branches', COUNT(*) FROM branches UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'staff', COUNT(*) FROM staff UNION ALL SELECT 'dim_date', COUNT(*) FROM dim_date;
```

| table | rows | grain (one row =) |
|---|---|---|
| customers | 6 040 | a person (40 are duplicates of another person — week 1) |
| applications | 14 000 | a loan request |
| loans | 7 828 | a disbursed loan |
| installments | 92 193 | a scheduled payment of a loan |
| payments | 52 875 | money received (52 850 after removing 25 exact duplicates) |
| collections_actions | 9 361 | a contact with a late borrower |
| app_events | 22 784 | an in-app event (app channel only) |
| branches / products / staff / dim_date | 10 / 5 / 100 / 1 461 | dimensions |

**Finding.** The fact tables are `loans` (7 828), `installments` (11.8 per loan) and `payments`; `payments` carries 25 duplicate rows and `loans` 12 impossible disbursement dates (week 2), so the report reads payments through `v_payments_clean`. (SQL Server: `sys.tables` + `sys.partitions`, or `INFORMATION_SCHEMA.TABLES`, lists the same without eleven `UNION`s.)
</details>

### S2. Dimensions — products, branches, grades, channels

<details><summary>Model answer</summary>

```sql
SELECT 'product' AS dim, p.code AS value, COUNT(*) AS loans, ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS share_pct
FROM loans l JOIN products p ON p.product_id = l.product_id GROUP BY p.code
UNION ALL SELECT 'grade', risk_grade, COUNT(*), ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) FROM loans GROUP BY risk_grade
UNION ALL SELECT 'channel', a.channel, COUNT(*), ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1)
FROM loans l JOIN applications a ON a.application_id = l.application_id GROUP BY a.channel
UNION ALL SELECT 'status', status, COUNT(*), ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) FROM loans GROUP BY status;
```

Products: MICRO 2 669 (34.1 %) · CONS 2 418 (30.9) · BNPL 1 569 (20.0) · SME 781 (10.0) · AUTO 391 (5.0). Grades: A 1 821 (23.3) · B 3 404 (43.5) · C 2 264 (28.9) · D 339 (4.3). Channels (of loans): branch 3 590 (45.9) · app 2 669 (34.1) · partner 1 569 (20.0). Status: active 3 352 · closed 4 242 · default 44 · written_off 190. Branches: 10 in 8 regions (three in Tashkent); customer segments mass 3 585 · sme 1 251 · affluent 1 204.

**Finding.** Each channel sells one kind of product — app = Micro, partner = BNPL, branch = Consumer/Auto/SME — so "channel" and "product" are almost the same cut; compare them with care. (The window-over-`GROUP BY` share runs inside each `UNION ALL` branch separately — check that each block adds to 100.)
</details>

### S3. Date range — first/last disbursement, as-of

<details><summary>Model answer</summary>

```sql
SELECT (SELECT MIN(disbursed_at) FROM loans) AS first_disbursed, (SELECT MAX(disbursed_at) FROM loans) AS last_disbursed,
       (SELECT MIN(applied_at) FROM applications) AS first_application, (SELECT MAX(applied_at) FROM applications) AS last_application,
       (SELECT MIN(paid_at) FROM payments) AS first_payment, (SELECT MAX(paid_at) FROM payments) AS last_payment,
       (SELECT MAX(due_date) FROM installments) AS last_due, '2026-10-01' AS as_of;
-- 2024-01-02 · 2026-10-01 · 2024-01-01 10:07 · 2026-10-01 21:36 · 2024-01-31 · 2026-11-24 · 2030-10-01 · 2026-10-01
```

**Finding.** The book is 33 months old (January 2024 to 1 October 2026) and the schedule runs to October 2030 (48-month Auto loans). `MAX(paid_at)` = 2026-11-24 is **after** the as-of date: 24 forward-dated payments (week 2 T23) — every payment sum in this report is filtered `paid_at <= '2026-10-01'`. Seven scalar subqueries in one row is a legitimate use of the scalar form.
</details>

### S4. Key measures — the totals

<details><summary>Model answer</summary>

```sql
SELECT (SELECT COUNT(*) FROM loans) AS loans, (SELECT COUNT(DISTINCT customer_id) FROM loans) AS borrowers,
       (SELECT SUM(principal) FROM loans) AS disbursed_total, (SELECT ROUND(AVG(principal)) FROM loans) AS avg_ticket,
       (SELECT ROUND(AVG(term_months), 1) FROM loans) AS avg_term,
       (SELECT SUM(outstanding) FROM v_loan_status) AS outstanding,
       (SELECT SUM(amount) FROM v_payments_clean WHERE paid_at <= '2026-10-01') AS collected_to_date,
       (SELECT SUM(interest_due) FROM installments) AS contracted_interest;
-- 7828 · 4335 · 404 783 280 000 · 51 709 668 · 11.8 · 208 723 504 430 · 255 061 333 229 (52 826 payments) · 122 497 355 801
```

Through the clean view and the as-of filter the collected total is 255 061 333 229 — raw `payments` says 255 173 169 976: 58.4 m of duplicates and 53.4 m of forward-dated rows removed. Quote the clean figure and say so.

**Finding.** 404.8 bn UZS lent to 4 335 borrowers in 7 828 loans (average ticket 51.7 m, average term 11.8 months); 208.7 bn is still outstanding — half of everything ever lent, because the book nearly doubled each year (86.5 → 155.9 → 162.3 bn in nine months). Scheduled interest over the life of the book is 122.5 bn, 23 % of the total due (527.3 bn). 73 % of loans go to repeat borrowers.
</details>

### S5. Magnitude — by product, branch, region

<details><summary>Model answer</summary>

```sql
SELECT p.code, COUNT(*) AS loans, ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS loan_share_pct,
       SUM(l.principal) AS disbursed, ROUND(100.0 * SUM(l.principal) / SUM(SUM(l.principal)) OVER (), 1) AS amount_share_pct,
       ROUND(AVG(l.principal)) AS avg_ticket
FROM loans l JOIN products p ON p.product_id = l.product_id GROUP BY p.code ORDER BY disbursed DESC;
-- SME 781 / 10.0 % / 241 117 150 000 / 59.6 % / 308 728 745 · AUTO 391 / 5.0 / 84 791 530 000 / 20.9 / 216 858 133
-- CONS 2418 / 30.9 / 65 109 280 000 / 16.1 / 26 926 915 · MICRO 2669 / 34.1 / 7 221 210 000 / 1.8 / 2 705 586 · BNPL 1569 / 20.0 / 6 544 110 000 / 1.6 / 4 170 880
```

By region (same shape, `GROUP BY b.region`): Tashkent 3 020 loans / 160.5 bn / **39.7 %** · Fergana 12.7 · Samarkand 11.2 · Andijan 9.5 · Namangan 8.6 · Bukhara 6.9 · Nukus 5.8 · Termez 5.7. Outstanding by branch and the 60.3 / 27.6 / 11.0 / 0.5 / 0.5 product mix: Day 1.

**Finding.** Two books in one: by count a Micro/Consumer/BNPL retail lender (85 % of loans), by money an SME/Auto lender (80 % of principal). The ticket ratio is 100 : 1 (SME 309 m vs Micro 2.7 m). Tashkent's three branches are 39–40 % by every measure.
</details>

### S6. Ranking — top and bottom

<details><summary>Model answer</summary>

```sql
WITH b AS (SELECT b.branch_name, COUNT(*) AS loans, SUM(l.principal) AS disbursed_2026
           FROM loans l JOIN branches b ON b.branch_id = l.branch_id
           WHERE l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2026-10-01' GROUP BY b.branch_name)
SELECT branch_name, loans, disbursed_2026, RANK() OVER (ORDER BY disbursed_2026 DESC) AS rk FROM b ORDER BY rk;
-- 1 Tashkent South 381 / 21 380 780 000 · 2 Fergana Central 315 / 19 742 090 000 · 3 Samarkand Central 344 / 19 440 640 000 · 4 Tashkent Central · 5 Tashkent North
-- … 9 Nukus Central 201 / 11 345 780 000 · 10 Termez Central 184 / 8 120 400 000
```

Top borrowers by total principal (`GROUP BY customer_id`, `ORDER BY … LIMIT 5`): Murod Yusupov (sme) 5 loans / 1 258 430 000 · Ulugbek Nazarov (sme) 2 / 1 023 170 000 · Ulugbek Mirzaev (mass) 3 / 971 810 000. Largest loan per product (`ROW_NUMBER` top-1): SME 2861 599 060 000 · AUTO 1501 399 530 000 · CONS 1464 49 990 000 · BNPL 7 990 000 (four tied) · MICRO 4 990 000 (four tied).

**Finding.** Fergana Central is the second-largest branch in 2026 by money with fewer loans than four others — SME-heavy. Termez is last at 38 % of the leader. Every product's biggest loans sit at its `max_amount`: the limits bind, so growth comes from count, not ticket.
</details>

### S7. Change over time — monthly disbursements, 3-month moving average

<details><summary>Model answer</summary>

```sql
WITH m AS (SELECT strftime('%Y-%m', disbursed_at) AS month, COUNT(*) AS loans, SUM(principal) AS disbursed
           FROM loans WHERE disbursed_at < '2026-10-01' GROUP BY 1),
w AS (SELECT month, loans, disbursed,
             ROUND(AVG(disbursed) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)) AS ma3,
             ROUND(100.0 * (disbursed - LAG(disbursed) OVER (ORDER BY month)) / LAG(disbursed) OVER (ORDER BY month), 1) AS mom_pct,
             ROUND(100.0 * (disbursed - LAG(disbursed, 12) OVER (ORDER BY month)) / LAG(disbursed, 12) OVER (ORDER BY month), 1) AS yoy_pct
      FROM m)
SELECT * FROM w WHERE month >= '2026-01' ORDER BY month;
```

| month | loans | disbursed | 3-month average | mom % | yoy % |
|---|---|---|---|---|---|
| 2026-01 | 287 | 17 452 370 000 | 16 605 040 000 | −1.5 | +72.8 |
| 2026-02 | 265 | 11 893 850 000 | 15 689 990 000 | −31.8 | +20.0 |
| 2026-03 | 330 | 19 657 410 000 | 16 334 543 333 | +65.3 | +59.0 |
| 2026-04 | 312 | 17 894 970 000 | 16 482 076 667 | −9.0 | +43.0 |
| 2026-05 | 377 | 18 531 830 000 | 18 694 736 667 | +3.6 | +114.4 |
| 2026-06 | 373 | 16 050 300 000 | 17 492 366 667 | −13.4 | +53.1 |
| 2026-07 | 367 | 20 693 870 000 | 18 425 333 333 | +28.9 | +41.8 |
| 2026-08 | 358 | 22 290 210 000 | 19 678 126 667 | +7.7 | +26.2 |
| 2026-09 | 361 | 17 015 490 000 | 19 999 856 667 | −23.7 | +16.2 |

By year: 2024 1 736 loans / 86.5 bn · 2025 3 041 / 155.9 bn · 2026 (nine months + one day) 3 051 / 162.3 bn.

**Finding.** The 3-month average climbed from 16.6 bn (Jan) to 20.0 bn (Sep), +20 % in nine months, while single months swing ±30 % (February −32 % month-on-month and still +20 % year-on-year). Read the trend on the moving average and the growth on year-on-year; never on one month. 2026 has already out-lent the whole of 2025.
</details>

### S8. Cumulative — running outstanding

<details><summary>Model answer</summary>

```sql
SELECT month, SUM(disbursed_amount) AS disbursed, SUM(outstanding_month_end) AS outstanding_month_end,
       SUM(outstanding_month_end) - LAG(SUM(outstanding_month_end)) OVER (ORDER BY month) AS net_growth
FROM v_portfolio_monthly WHERE month >= '2026-01-01' AND month < '2026-10-01' GROUP BY month ORDER BY month;
-- 2026-01 151 807 386 149 · 02 154 145 984 724 (+2.3 bn) · 03 163 974 316 812 (+9.8) · 04 171 675 271 237 · 05 179 741 433 725 · 06 184 617 414 010
-- 07 193 664 170 150 (+9.0) · 08 203 830 205 928 (+10.2) · 09 208 243 879 623 (+4.4 bn)
```

Without the view: a recursive month calendar and, per month, `SUM(principal_due)` of instalments with `due_date >= next_month` for loans with `disbursed_at < next_month` (Day 4). Cumulative disbursed by year as a running total: 86.5 → 242.4 → 404.8 bn (`SUM(SUM(principal)) OVER (ORDER BY year)`).

**Finding.** The book grew 56 bn (+37 %) in nine months, from 151.8 to 208.2 bn, while 161.5 bn was disbursed: about two thirds of new lending replaces repayments. Net growth is lumpy (+2.3 bn in February, +10.2 bn in August) and follows the SME months. Loans with a balance rose from 2 579 to 3 392.
</details>

### S9. Performance — DPD buckets, FPD30, roll rates

<details><summary>Model answer</summary>

```sql
SELECT bucket, COUNT(*) AS loans, SUM(outstanding) AS outstanding, SUM(overdue_amount) AS overdue,
       ROUND(100.0 * SUM(outstanding) / SUM(SUM(outstanding)) OVER (), 2) AS share_of_outstanding_pct
FROM v_loan_status GROUP BY bucket ORDER BY MIN(dpd);
```

| bucket | loans | outstanding | overdue | share of outstanding % |
|---|---|---|---|---|
| 0 | 7 429 | 197 486 207 578 | 53 423 100 | 94.62 |
| 1–30 | 124 | 4 729 769 899 | 499 554 867 | 2.27 |
| 31–60 | 25 | 748 610 049 | 74 942 884 | 0.36 |
| 61–90 | 16 | 439 441 377 | 111 375 664 | 0.21 |
| 90+ | 234 | 5 319 475 527 | 6 913 231 226 | 2.55 |

(Bucket 0 carries 53 m "overdue": the 14 instalments due on the as-of day itself, unpaid as of the morning. The overdue column is a few hundred thousand above week 2's because the clean view also drops the forward-dated payments.)

PAR30 **3.12 %** (6.51 bn), NPL90 **2.55 %** (5.32 bn, 234 loans = 44 default + 190 written off). FPD30 (week 2's block on `v_payments_clean`): 91 of 7 099 = **1.28 %**; app 1.70 % vs branch 1.04 % vs partner 1.12 %; by grade A 0.60 · B 0.97 · C 2.16 · D 2.23 %. Roll rates 1 Sep → 1 Oct (Day 2): 1–30 → 31–60 **19.5 %**, 1–30 → cured **75.8 %**, 31–60 → 61–90 69.6 %, 61–90 → 90+ 100 %, 117 new entries into 1–30 (3.8 % of performing loans). Vintage (Day 3): worst cohort 2025-10, 6.91 % ever-30+ at MOB 3 and 11.52 % at MOB 6, against a pooled 2025 curve of 4.35 % / 7.46 %.

**Finding.** 5.4 % of outstanding is delinquent, and 2.55 of those 3.12 PAR30 points are already 90+ — the at-risk book is old debt, not a fresh wave. The live collections caseload (1–90 DPD, 165 loans, 5.9 bn) cures three times out of four in the first bucket and almost never after 60 days. The scorecard orders FPD, write-offs (0.7 → 8.8 %) and vintage curves (A 3.1 % vs D 19.1 % at MOB 6) alike; the app channel runs 1.6× the branch FPD.
</details>

### S10. Part-to-whole and segmentation — mix, income bands × grade

<details><summary>Model answer</summary>

```sql
SELECT CASE WHEN c.monthly_income IS NULL THEN 'unknown' WHEN c.monthly_income < 5000000 THEN '<5m'
            WHEN c.monthly_income < 10000000 THEN '5-10m' WHEN c.monthly_income < 20000000 THEN '10-20m' ELSE '20m+' END AS income_band,
       COUNT(*) AS loans,
       SUM(CASE WHEN l.risk_grade = 'A' THEN 1 ELSE 0 END) AS a, SUM(CASE WHEN l.risk_grade = 'B' THEN 1 ELSE 0 END) AS b,
       SUM(CASE WHEN l.risk_grade = 'C' THEN 1 ELSE 0 END) AS c, SUM(CASE WHEN l.risk_grade = 'D' THEN 1 ELSE 0 END) AS d,
       ROUND(100.0 * SUM(CASE WHEN l.risk_grade IN ('C', 'D') THEN 1 ELSE 0 END) / COUNT(*), 1) AS cd_share_pct,
       ROUND(AVG(l.principal)) AS avg_ticket
FROM loans l JOIN customers c ON c.customer_id = l.customer_id
GROUP BY income_band ORDER BY MIN(COALESCE(c.monthly_income, -1));
-- unknown 466 / 116 201 132 17 / 32.0 % / 53.9 m · <5m 1670 / 388 731 478 73 / 33.0 / 48.1 m · 5-10m 2781 / 640 1228 792 121 / 32.8 / 52.3 m
-- 10-20m 774 / 183 322 232 37 / 34.8 / 55.4 m · 20m+ 2137 / 494 922 630 91 / 33.7 / 51.9 m
```

Mix (S5): count share vs money share by product; outstanding mix 60.3 / 27.6 / 11.0 / 0.5 / 0.5 (Day 1); concentration — top-3 branches 39.1 %, top borrower 0.47 %, top decile of borrowers 49.2 %.

**Finding.** Income does **not** predict grade here: the C+D share is 32–35 % in every band, including the 466 loans to customers with no income on file, and the average ticket barely moves (48–55 m). Either the scorecard does not use income or the data has it only weakly — a question for Nilufar, and a reminder that the NULL band must be shown, not dropped. The book's concentration is in products and one city, not in people.
</details>

---

## Part B — Eight interview questions (30 min, 20 pts)

Answer in writing, 3–5 sentences each, as you would say it aloud: 2 points per question (1 correct and complete, 1 with a Nur Finance example and number) plus 4 for the "definitions I used" note at the top of `interview.md` (as-of, DPD, FPD30, outstanding, the dedup rule).

1. Window function vs `GROUP BY` — what does each do to the rows, and when do you use both in one query?
2. `ROW_NUMBER` vs `RANK` vs `DENSE_RANK` — the difference, and which one you use to deduplicate and why.
3. Give a use of `LAG` from this week and the trap when the display is filtered.
4. CTE vs subquery — when does each win?
5. What is a recursive CTE for? Give the example you built.
6. View vs table — what is stored, what is fresh, what is fast, and which one Power BI should read?
7. What does an index cost and what does it buy? Name a `WHERE` that an index cannot help.
8. How do you de-duplicate safely in a production database?

<details><summary>Model answers (open after submitting)</summary>

1. `GROUP BY` collapses rows to one per group; a window computes an aggregate *next to* each row over a partition/frame and keeps every row. Both when you need a per-group number **and** its share or running total across groups: `SUM(SUM(outstanding)) OVER ()` — the inner `SUM` is the group's, the outer window adds the groups (SME 125.9 bn = 60.3 % of 208.7 bn).
2. All three number rows by an `ORDER BY`; they differ on ties: `ROW_NUMBER` always 1, 2, 3; `RANK` 1, 1, 3; `DENSE_RANK` 1, 1, 2. Deduplicate with `ROW_NUMBER() OVER (PARTITION BY the-columns-that-define-sameness ORDER BY id)` and keep `rn = 1` — it guarantees exactly one survivor per group, which `RANK` does not when the tiebreaker ties (25 duplicate payments, ids 52851–52875, 58.4 m double-counted).
3. Month-on-month and year-on-year change: `LAG(disbursed)` and `LAG(disbursed, 12)` over months (February 2026 −31.8 % mom, +20.0 % yoy). Trap: a `WHERE month >= '2026-01'` in the same query removes 2025 *before* the window runs, so every yoy is NULL — filter in an outer query. Same for gaps between payments (loan 1's 58-day gap).
4. A CTE chain when a result is used twice (two DPD snapshots), when there are more than two levels of nesting, or when steps have different grains (instalment → loan → customer) and a reader must follow them top-down. A subquery when it is a one-line scalar (`> (SELECT AVG(principal) FROM loans)`) or an `EXISTS` test. Same performance on both engines; readability and grain discipline decide.
5. To generate rows that no table has: a month calendar (anchor `'2025-01-01'`, step `+1 month`, stop at `'2026-09-01'` → 21 rows) so that months with zero disbursement appear as zeros — 16 empty branch × product × month cells in 2026 that `GROUP BY` would hide; also a 1..6 sequence for months-on-book. `dim_date` is the no-recursion alternative when it exists.
6. A view stores the query text — always fresh, costs its query every time (12.8 s for `v_portfolio_monthly`); a table stores the result — instant, frozen at load (0 s). Power BI reads **views** (or nightly tables built from them) so that one DPD definition serves every tile; `v_loan_status` = one row per loan with DPD, bucket, outstanding, days on book, 7 828 rows reconciling to 208 723 504 430.
7. Cost: disk space and slower inserts/updates; benefit: a filter or join on the indexed column becomes a seek instead of a scan (`SCAN payments` → `SEARCH … USING INDEX ix_payments_loan`). It cannot help when a function wraps the column — `strftime('%Y-%m', due_date) = '2026-09'`, `LOWER(method) = 'card'` — or with `LIKE '%x'`; rewrite as a half-open range or clean the data in a view.
8. Never `DELETE` on your own authority. Define sameness explicitly (`installment_id, paid_at, amount`), list the duplicates with `ROW_NUMBER`, show the owner the rows and the money (25 rows, 58 397 800), check the downstream effect (DPD buckets unchanged; collections overstated), publish a de-duplicated **view** (`v_payments_clean`, `rn = 1`, earliest id kept) for all reporting, and propose a unique constraint at load so it cannot recur. The raw table stays as evidence.
</details>

---

## Scoring and what happens next

| Part | Points | Pass |
|---|---|---|
| A — report, 10 sections × 8 | 80 | |
| B — 8 questions × 2 + definitions note | 20 | |
| **Total** | **100** | **≥ 70 → Week 4 on Monday** |

Below 70: feedback names the sections to redo (most often S8 — the month-end outstanding — and S9's definitions); re-submit Monday morning before Week 4. Points go to `docs/progress.md`.

**Submission checklist** — `submissions/week-03/day-5/`: `report.md` (10 sections, each with query + first rows + finding), `report.sql` (`-- S1:` … `-- S10:`), `views.sql` (copied from HW 3.2 so the report runs), `interview.md` (definitions note + 8 answers). Also due today: **HW 3.2** in `day-4/` (`views.sql`, `dictionary.md`, `checks.sql`).

<span class="badge stretch">Stretch</span> Baraa's *Advanced analytics* project (▶ [28:30:38](https://youtu.be/SSKVgrwhzus?t=102638)) adds change-over-time, cumulative, performance-vs-target, part-to-whole and segmentation reports in SQL Server on his SalesDB. Redo his "performance vs target" idea on ours: each product's 2026 monthly disbursement against its own 2025 monthly average (`AVG(...) OVER (PARTITION BY product)` on the 2025 rows, joined), flagged above/below.

Madina, 17:30: *"Bekzod has his one-pager — six numbers, three cuts, one chart, one sentence under each. Nilufar put the vintage table on her committee slide with your definitions on it. Timur deleted eleven measures and pointed the dashboard at three views. Monday is Excel — the same book, in the tool everyone else in the building uses."*

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w03d5", "pass": 0.8, "questions": [
  {"type": "multi", "q": "Which of these cost the number point in the report?", "options": ["Summing loans.principal after a join to installments", "LAG with the display filter inside the CTE, so year-on-year comes out NULL", "Printing 0.00 % in a vintage cell that is not yet observable", "BETWEEN on a datetime column", "Summing payments through v_payments_clean", "Half-open date filters"], "answer": [0, 1, 2, 3], "explain": "The last two are the required habits, not mistakes (→ Common mistakes from this week)."},
  {"type": "single", "q": "In S2, what does SUM(COUNT(*)) OVER () add up in the SECOND block?", "code": "SELECT 'product' AS dim, p.code AS value, COUNT(*) AS loans,\n       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS share_pct\nFROM loans l JOIN products p ON p.product_id = l.product_id GROUP BY p.code\nUNION ALL\nSELECT 'grade', risk_grade, COUNT(*),\n       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1)\nFROM loans GROUP BY risk_grade;", "options": ["The grade groups of its own block only, so each block adds to 100", "Every row of both blocks, so the shares add to 100 across the whole result", "Nothing — windows are not allowed with UNION ALL", "Only the product rows"], "answer": 0, "explain": "Each SELECT of a UNION ALL is computed on its own before stacking; check that each block adds to 100 (→ S2)."},
  {"type": "single", "q": "Why does every payment sum in the report read v_payments_clean with paid_at <= '2026-10-01'?", "options": ["To make the query faster", "To drop the exact duplicate payments and the payments dated after the as-of date", "Because raw payments has no amount column", "To exclude cash payments"], "answer": 1, "explain": "Raw payments carries repeats and forward-dated rows; the clean view plus the as-of filter gives the figure you can defend (→ S3, S4)."},
  {"type": "number", "q": "Monthly disbursement in a toy series. What is mom_pct for March?", "code": "month   | disbursed\n2026-01 | 100\n2026-02 |  80\n2026-03 | 120\n\nROUND(100.0 * (disbursed - LAG(disbursed) OVER (ORDER BY month))\n      / LAG(disbursed) OVER (ORDER BY month), 1) AS mom_pct", "answer": 50, "explain": "(120 − 80) / 80 = +50 %; a month-on-month swing like this is why the trend is read on a moving average (→ S7)."},
  {"type": "single", "q": "A vintage cell is not yet observable: only some of the cohort's loans have had their 30 days at that MOB. What goes in the cell?", "options": ["0.00 %", "Nothing — leave it blank (NULL)", "The previous MOB's value", "The pooled average"], "answer": 1, "explain": "A zero would say 'nobody late' when nobody was measured (→ S9; Day 3, Company corner)."},
  {"type": "single", "q": "Month-end outstanding for 30 September is a little lower than the as-of outstanding on 1 October. Which explanation is right?", "options": ["One of the two queries is wrong", "Month-end leaves out loans disbursed on 1 October and still counts instalments due on 1 October; two correct numbers, two definitions", "Payments made on 1 October", "Rounding"], "answer": 1, "explain": "Write both definitions in the dictionary and reconcile them, rather than forcing one to match the other (→ S8; Day 4, P8)."},
  {"type": "single", "q": "Duplicate rows turn up in a production payments table. What is the safe way to handle them?", "options": ["DELETE the second rows right away", "Define sameness, list the rows with ROW_NUMBER, show the owner the rows and the money, check downstream effects, publish a de-duplicated view, propose a unique constraint at load", "Ignore them — they are under 0.1 %", "Copy the table to Excel and remove duplicates there"], "answer": 1, "explain": "The raw table stays as evidence; reporting reads the clean view (→ Part B, question 8)."},
  {"type": "single", "q": "Which sentence is a finding rather than a description of the table?", "options": ["The table has five rows, one per product.", "By count this is a Micro/Consumer/BNPL lender; by money it is an SME/Auto lender.", "The query groups loans by product code.", "SME is one of the five products."], "answer": 1, "explain": "A finding is something Bekzod could read aloud and act on, with share of what and period stated (→ Working method)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w03d5", "q": "Bekzod's concentration question for the SME book only: take the borrowers who still owe SME principal as of 2026-10-01 (customer_id with the outstanding of their SME loans), rank them and split them into ten equal groups. What share of SME outstanding does the top tenth hold? Percentage to 2 decimals.", "type": "number", "dp": 2, "h": ["34d8b643fd91f94a7023eca0"], "hint": "Aggregate to the borrower first, then let a ranking window cut the list into tenths.", "sol": "V0lUSCBjIEFTIChTRUxFQ1QgY3VzdG9tZXJfaWQsIFNVTShvdXRzdGFuZGluZykgQVMgb3V0c3RhbmRpbmcKICAgICAgICAgICBGUk9NIHZfbG9hbl9zdGF0dXMKICAgICAgICAgICBXSEVSRSBwcm9kdWN0ID0gJ1NNRScgQU5EIG91dHN0YW5kaW5nID4gMAogICAgICAgICAgIEdST1VQIEJZIGN1c3RvbWVyX2lkKSwKZCBBUyAoU0VMRUNUIGN1c3RvbWVyX2lkLCBvdXRzdGFuZGluZywgTlRJTEUoMTApIE9WRVIgKE9SREVSIEJZIG91dHN0YW5kaW5nIERFU0MpIEFTIGRlY2lsZSBGUk9NIGMpClNFTEVDVCBkZWNpbGUsIENPVU5UKCopIEFTIGJvcnJvd2VycywgU1VNKG91dHN0YW5kaW5nKSBBUyBvdXRzdGFuZGluZywKICAgICAgIFJPVU5EKDEwMC4wICogU1VNKG91dHN0YW5kaW5nKSAvIChTRUxFQ1QgU1VNKG91dHN0YW5kaW5nKSBGUk9NIGMpLCAyKSBBUyBzaGFyZV9wY3QKRlJPTSBkCkdST1VQIEJZIGRlY2lsZQpPUkRFUiBCWSBkZWNpbGU7Ci0tIHRoZSBzYW1lIG9uIFNRTCBTZXJ2ZXIgKHdpdGhvdXQgdGhlIHZpZXc6IFNVTShwcmluY2lwYWxfZHVlKSBvZiBpbnN0YWxtZW50cyBkdWUgYWZ0ZXIgMjAyNi0xMC0wMSBvbiBsb2FucyB3aXRoIHByb2R1Y3RfaWQgPSA1KQotLSBkZWNpbGUgMTogNTcgYm9ycm93ZXJzLCAyOSA3NzcgNTUwIDQ2MCBvZiAxMjUgODkyIDk0MiA0MTEgPSAyMy42NSAlOyBkZWNpbGUgMiAxOC42NCAlOyBkZWNpbGUgMyAxNS4xMCAlCjU3MCBTTUUgYm9ycm93ZXJzIHNwbGl0IGludG8gdGVudGhzIG9mIGV4YWN0bHkgNTcuIE92ZXIgdGhlIHdob2xlIGJvb2sgdGhlIHRvcCBkZWNpbGUgaG9sZHMgNDkuMiAlIChEYXkgMiksIGJ1dCB0aGF0IGlzIG1vc3RseSB0aGUgU01FLXZlcnN1cy1NaWNybyBtaXguIEluc2lkZSBTTUUgdGhlIHRvcCB0ZW50aCBob2xkcyB1bmRlciBhIHF1YXJ0ZXI6IHRoZSBTTUUgYm9vayBpcyBub3QgaGFuZ2luZyBvbiBhIGZldyBuYW1lcyDigJQgdGhlIHNlbnRlbmNlIEJla3pvZCBuZWVkcyBiZWZvcmUgaGUgc2V0cyBzaW5nbGUtYm9ycm93ZXIgbGltaXRzLg=="}
```

<!-- challenge:end -->
