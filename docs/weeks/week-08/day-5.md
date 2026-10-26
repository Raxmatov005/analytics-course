# Week 8 · Day 5 — Presentation day, the mock interview, and what next

<span class="badge">Final checks 60 min</span> <span class="badge">Presentation 10 min + questions</span> <span class="badge">Mock interview 60 min</span> <span class="badge">What next 30 min</span> <span class="badge hw">Capstone · 100 points</span> <span class="badge hw">Mock interview · 50 points</span>

> STORY **Friday, 9:00.** The meeting room is booked from eleven. Madina, at the door: *"Two things today, and the second matters more than you think. At eleven you present to the board — ten minutes, then their questions. After lunch I stop being your manager and become an interviewer from another bank. Sixty minutes: your CV, live SQL on our database, a case, quick questions, and then your questions to me. Treat it as real. Most people fail the first interview not on SQL but on the case and on 'do you have any questions for us?'."*

## Today in 3 lines

- **Part A:** you submit and present the capstone — notebook, two-page dashboard, deck or memo, and the recording or speaker notes — and answer the board's questions with numbers.
- **Part B:** you go through a **60-minute mock interview**: CV walk, four live SQL tasks of rising difficulty on `nur.db`, a 15-minute case, a metrics rapid-fire, and your own questions to the company.
- **Part C:** you leave with a **30/60/90-day plan** for your first analyst job, a list of free resources to keep learning, and the checklist of what you can now do.

---

## Part A — The capstone presentation (100 points)

**Submit by 9:00** to `submissions/week-08/day-5/`:

| File | What |
|---|---|
| `capstone.ipynb` | executed (Kernel → Restart & Run All, then save); the sanity numbers in cells; one section per question; an interpretation sentence under each table |
| `capstone.pbix` + `capstone_dashboard.pdf` (or `capstone.xlsx` + PDF) | two pages: Growth & mix, Risk & collections |
| `capstone_deck.pdf` (10 slides) **or** `capstone_memo.pdf` (2 pages) | answer first, so-what titles, 3–5 recommendations with owner and value |
| `capstone_talk.mp4` **or** `speaker_notes.md` | 10 minutes; notes = what you say per slide, in full sentences |
| `issue_tree.md` | from Wednesday, updated if your tree changed |

**The rubric** (as on Day 3):

| Criterion | Points | The question the mentor asks |
|---|---|---|
| Analysis | 30 | Are all five questions and the deep-dive answered with a comparison and a "so what"? |
| Correctness | 20 | Do the sanity numbers reproduce; are definitions written and denominators right; are data problems handled and said? |
| Dashboard | 15 | Two clean pages; do the numbers match the notebook; do slicers work; definitions and date visible? |
| Story / deck | 20 | Answer first; can the titles alone be read as a memo; one chart per message; recommendations with owner and value? |
| Presentation | 15 | 10 minutes ±1; the answer in the first minute; questions answered with a number or "I will check"? |

**The ten minutes.** Start with the answer, not with "today I will talk about". Say every title as the first sentence of its slide. When you are asked something you do not know: *"I don't have that cut here; I will send it today"* — and write it down. When a board member disagrees: thank, restate their point, give your number and its definition, offer the check that would settle it. Never argue about a number whose definition you have not agreed.

---

## Part B — The mock interview (60 minutes, 50 points)

Run by the mentor as an interviewer from another lender. The structure is the one most analyst interviews in banks and fintechs follow.

| Block | Minutes | Points | What is tested |
|---|---|---|---|
| B1. Intro and CV walk | 10 | 5 | a 2-minute story of yourself; one project told with STAR and numbers |
| B2. Live SQL on `nur.db` | 20 | 20 | four tasks, rising difficulty; you talk while you write |
| B3. Case | 15 | 10 | structure, hypotheses, data you would pull, a recommendation |
| B4. Metrics rapid-fire | 10 | 10 | ten questions from the interview bank, ~1 minute each |
| B5. Your questions | 5 | 5 | do you ask about the job, the data, the team? |

### B1. Intro and CV walk (10 min)

*"Tell me about yourself"* in two minutes: who you are (one line), what you learned and built (the course, framed as projects), the role you want and why this company. Then the interviewer picks one CV line — have STAR for each of your four portfolio deliverables (HW 8.1). The trap: describing the tools ("I used pandas") instead of the result ("I found 300 users in both arms and the iOS bug, and the lift went from 13 % to 11 %").

### B2. Live SQL (20 min) — four tasks

Open DBeaver on `data/raw/nur.db`. Think aloud: restate the task, name the tables and the grain, write, run, **check the result makes sense** (a total you know, a row count). Ask clarifying questions — interviewers reward them.

**T1 (easy, 3 min).** Loans and amount disbursed in September 2026 by product, with the average ticket, largest amount first.

<details><summary>Model answer</summary>

```sql
SELECT p.code, COUNT(*) AS loans, SUM(l.principal) AS disbursed, ROUND(AVG(l.principal)) AS avg_ticket
FROM loans l JOIN products p ON p.product_id = l.product_id
WHERE l.disbursed_at >= '2026-09-01' AND l.disbursed_at < '2026-10-01'
GROUP BY p.code ORDER BY disbursed DESC;
```

| code | loans | disbursed | avg_ticket |
|---|---|---|---|
| SME | 30 | 8 601 880 000 | 286 729 333 |
| AUTO | 21 | 4 398 600 000 | 209 457 143 |
| CONS | 121 | 3 409 790 000 | 28 180 083 |
| MICRO | 123 | 328 630 000 | 2 671 789 |
| BNPL | 66 | 276 590 000 | 4 190 758 |

Check aloud: 361 loans, 17 015 490 000 in total — the September figure you know. Say: half-open date range, not `BETWEEN`.
</details>

**T2 (medium, 5 min).** Monthly approval rate of the **app** channel, April–September 2026, cancelled applications excluded; show the cancelled count too.

<details><summary>Model answer</summary>

```sql
SELECT strftime('%Y-%m', applied_at) AS month,
       COUNT(*) AS applications,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
       ROUND(100.0 * SUM(CASE WHEN status IN ('approved', 'approved_not_disbursed') THEN 1 ELSE 0 END)
             / SUM(CASE WHEN status <> 'cancelled' THEN 1 ELSE 0 END), 1) AS approval_rate_pct
FROM applications
WHERE channel = 'app' AND applied_at >= '2026-04-01' AND applied_at < '2026-10-01'
GROUP BY 1 ORDER BY 1;
```

| month | applications | cancelled | approval_rate_pct |
|---|---|---|---|
| 2026-04 | 219 | 34 | 69.7 |
| 2026-05 | 224 | 24 | 67.5 |
| 2026-06 | 236 | 32 | 69.1 |
| 2026-07 | 242 | 46 | 71.4 |
| 2026-08 | 235 | 42 | 67.9 |
| 2026-09 | 224 | 32 | 66.7 |

The interviewer's follow-up: *"September is the lowest — a problem?"* Answer: with ~190 decisions a month a swing of ±3 points is noise (a 95 % interval on 66.7 % is about ±7 points); and September's last days may still have applications without a decision.
</details>

**T3 (harder, 6 min).** For each branch, the loan officer with the most approved applications in January–September 2026 (all channels). Show ties.

<details><summary>Model answer</summary>

```sql
WITH o AS (
  SELECT a.branch_id, a.officer_id, COUNT(*) AS approved
  FROM applications a
  WHERE a.status IN ('approved', 'approved_not_disbursed')
    AND a.applied_at >= '2026-01-01' AND a.applied_at < '2026-10-01'
  GROUP BY a.branch_id, a.officer_id),
r AS (SELECT o.*, RANK() OVER (PARTITION BY branch_id ORDER BY approved DESC) AS rnk FROM o)
SELECT b.branch_name, s.full_name, r.approved
FROM r JOIN branches b ON b.branch_id = r.branch_id
       JOIN staff s    ON s.staff_id = r.officer_id
WHERE r.rnk = 1
ORDER BY r.approved DESC, b.branch_name;
```

| branch_name | full_name | approved |
|---|---|---|
| Tashkent South | Gulbahor Ismoilov | 92 |
| Tashkent North | Sevara Tursunov | 85 |
| Samarkand Central | Nilufar Tashkentov | 74 |
| Tashkent Central | Dilnoza Olimov | 74 |
| Andijan Central | Zafar Ismoilov | 66 |
| Fergana Central | Sanjar Ergashev | 62 |
| Fergana Central | Bobur Ergashev | 62 |
| Bukhara Central | Gulbahor Abdullaev | 57 |
| Namangan Central | Sanjar Ergashev | 57 |
| Termez Central | Dildora Qodirov | 45 |
| Nukus Central | Nodira Abdullaev | 43 |

11 rows for 10 branches: Fergana has a **tie** — `RANK` keeps both, `ROW_NUMBER` would silently pick one. Two "Sanjar Ergashev" are **different people** (different `staff_id`, Fergana and Namangan): group by the id, display the name. The follow-up: *"Is the top officer the best?"* — not without FPD of their loans; most approvals can mean the loosest approvals.
</details>

**T4 (hardest, 6 min).** Repeat borrowing: for customers whose first loan was in 2025, by quarter of the first loan — customers, how many took a second loan within 6 months of the first, and the rate.

<details><summary>Model answer</summary>

```sql
WITH ranked AS (
  SELECT customer_id, disbursed_at,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY disbursed_at, loan_id) AS n
  FROM loans),
pairs AS (
  SELECT f.customer_id, f.disbursed_at AS first_at, s.disbursed_at AS second_at
  FROM ranked f LEFT JOIN ranked s ON s.customer_id = f.customer_id AND s.n = 2
  WHERE f.n = 1)
SELECT strftime('%Y', first_at) || '-Q' || ((CAST(strftime('%m', first_at) AS INTEGER) + 2) / 3) AS cohort,
       COUNT(*) AS customers,
       SUM(CASE WHEN second_at <= date(first_at, '+6 months') THEN 1 ELSE 0 END) AS repeat_6m,
       ROUND(100.0 * SUM(CASE WHEN second_at <= date(first_at, '+6 months') THEN 1 ELSE 0 END) / COUNT(*), 1) AS repeat_6m_pct
FROM pairs
WHERE first_at >= '2025-01-01' AND first_at < '2026-01-01'
GROUP BY 1 ORDER BY 1;
```

| cohort | customers | repeat_6m | repeat_6m_pct |
|---|---|---|---|
| 2025-Q1 | 375 | 108 | 28.8 |
| 2025-Q2 | 414 | 134 | 32.4 |
| 2025-Q3 | 450 | 146 | 32.4 |
| 2025-Q4 | 443 | 160 | 36.1 |

What earns the points: the first loan is found **before** filtering to 2025 (filter inside `ranked` and every customer's first 2025 loan looks like a first loan); `loan_id` breaks ties on the same day; the `LEFT JOIN` keeps customers with no second loan; and the observability check said aloud — even a first loan of 31 December 2025 reaches 6 months on 30 June 2026, before the as-of, so every cell is complete. SQL Server: `DATEADD(month, 6, first_at)`, `DATEPART(quarter, first_at)`.
</details>

**Scoring B2 (20):** T1 3, T2 5, T3 6, T4 6. Each: correct result (60 %), the check said aloud (20 %), the trap named (20 %). A query that runs but answers a different question scores 0 for that task — ask before you write.

### B3. The case (15 min): *"FPD in the app doubled last month. What do you do?"*

Five minutes to structure aloud, eight to go through it, two for the recommendation. The interviewer answers your data questions.

<details><summary>A model approach</summary>

**1. Is it real? (first 3 minutes — most candidates skip this.)** Which FPD (FPD30? FPD7?), which "last month" (loans *disbursed* last month cannot have an FPD30 yet — so it is probably the month whose first due date passed 30 days ago), same definition as the month before, same payment cut-off, a pipeline change? Then the **size**: on Nur's app, the monthly vintages of January–July 2026 have 74–136 loans each with a readable FPD30, and 0–2 defaults each — June 1 of 136 (0.74 %), July 2 of 122 (1.64 %): that is "FPD doubled", and it is **one extra default**. A 95 % interval on 2 of 122 runs from about 0.5 % to 5.8 %. So first: *"How many loans and how many defaults?"* If it is a handful, the answer is "watch the next vintage and the 3-month rolling rate", not an alarm.

**2. If it is real: where is it?** Split by app version and device (a release can break the payment reminder or the auto-debit), by product term, by grade/score band, by region and the branch/officer that reviewed the application, by acquisition source (a campaign or a new partner), new vs repeat customers. Concentrated in one cell → a cause (bug, campaign, fraud ring); everywhere → policy or economy.

**3. Mix or rate?** Did the share of riskier applicants rise (lower scores, more D grade, a new region) with the same rate inside each, or did the rate rise inside segments? Compare the score distribution of approved applicants month on month.

**4. Look for an event.** Scorecard or cut-off change, a new pre-check, a payment-channel outage on the first due dates (a payment provider down for three days creates "FPD" that cures), a campaign, a fraud pattern (same device, same phone prefix, many applications in a short time, first payment never made, no contact).

**5. What you recommend.** If a cell is found: fix or stop that cell (pause the campaign, block the pattern, patch the release), notify collections to call those loans in the first week. If it is mix: decide with risk whether the new segment pays (unit economics, break-even FPD ≈ 2.5 % on Micro under our assumptions). Either way: a guardrail line on the weekly report and a definition note.

**Close in two sentences:** *"First I would check it is not one or two defaults on a small vintage or a definition change. If it is real, I would locate it by version, source and score band and separate mix from rate; then fix the cell or re-price the segment, and add FPD by app version to the weekly monitor."*
</details>

**Scoring B3 (10):** checks reality and size before causes (3); a structure that is MECE (3); names the data and tables (2); ends with a recommendation and a monitor (2).

### B4. Metrics rapid-fire (10 min)

Ten questions from `docs/company/interview.md`, about a minute each, no notes: **A1** DPD vs FPD · **A2** PAR30 vs NPL · **A3** roll rate · **A5** approval rate conventions · **A6** expected loss · **A7** IFRS 9 in plain words · **A9** cost of risk · **C3** measure vs calculated column · **D1** p-value · **D4** sample ratio mismatch. The model answers are in the bank; 1 point each for a correct definition with one number or one trap.

### B5. Your questions to the company (5 min)

Ask two or three. Good questions show you thought about the job, the data and the team:

- *"What would a successful first three months look like in this role?"*
- *"Which metrics does this team own, and which definition of approval rate / NPL do you use in the board pack?"*
- *"Where does the data live — a warehouse, which tools — and who do I go to when a number looks wrong?"*
- *"What is the most recent analysis from this team that changed a decision?"*
- *"How are requests prioritised — who are the main internal clients?"*
- *"What is the biggest data-quality problem the team lives with today?"*
- *"How does the team review each other's work before it goes to management?"*

Avoid as first questions: salary and holidays (later, with HR), "what does the company do?" (you should know), and "no questions".

**Scoring B5 (5):** at least two questions (2), about the work rather than the perks (2), one that follows from something said in the interview (1).

---

## Part C — What next

### A 30/60/90-day plan for your first analyst job

| Days | Goal | Concretely |
|---|---|---|
| **1–30: learn** | the business and the data | meet every internal client (the roles page is your list); get access to the warehouse and the dashboards; write your own glossary of *their* definitions (approval, DPD, NPL, active customer) and where each differs from the course; rebuild one existing recurring report and reconcile it to the soum |
| **31–60: deliver** | own something small, end to end | take over one recurring report or dashboard; answer ad-hoc requests with the four steps (metric + definition, grain, tables, check against a trusted number); find and document one data-quality problem with its size and a fix |
| **61–90: improve** | one piece of analysis that changes a decision | pick a question from your metric tree that nobody owns (an early-bucket strategy, a funnel leak, a product's unit economics); deliver it as a one-page memo with a recommendation, an owner and a value; automate one manual step you inherited |

### How to keep learning (free)

- **SQL practice:** SQLBolt (interactive basics), the **Mode SQL Tutorial** (mode.com/sql-tutorial — analytics SQL with window functions), HackerRank and LeetCode "Database" problems (interview-style), StrataScratch (free questions from real company interviews); and Data with Baraa's full course (the course's SQL backbone) for review.
- **Python:** Kaggle Learn (kaggle.com/learn — Pandas, Data Visualization, Intro to Machine Learning), then a public Kaggle dataset per month analysed end to end as a notebook.
- **Statistics:** **StatQuest** with Josh Starmer (YouTube) — p-values, confidence intervals, power, logistic regression explained visually.
- **Power BI:** Microsoft Learn's **Power BI Data Analyst** learning path (learn.microsoft.com — the free path behind the PL-300 certificate), and its DAX modules.
- **Lending:** the annual reports (IFRS financial statements) of two or three local banks each year — read the credit-risk note; the central bank's published statistics on the loan market.
- **Habit:** one question a week answered on your own data, written in five sentences. The writing is the skill that stays rare.

### You can now…

- [ ] explain how a lending company works from application to write-off, and who owns each step;
- [ ] design a small database from a brief and query it in SQL — joins, aggregates, dates, CASE, windows, CTEs, views;
- [ ] compute every core lending metric — DPD and buckets, FPD, PAR30, NPL, roll rates, vintages, approval rate, collection rate, expected loss — and say where companies define them differently;
- [ ] clean data in Excel and Power Query, and build pivot reports;
- [ ] analyse data in Python with pandas and charts, in a notebook someone else can re-run;
- [ ] put a confidence interval on a rate, choose and run a test, report an effect size, and explain a p-value to a manager;
- [ ] design and analyse an A/B test, including the checks that catch a broken experiment and the guardrail that protects risk;
- [ ] build a Power BI model with a star schema, DAX measures and a dashboard that refreshes;
- [ ] build a metric tree, a funnel, a cohort analysis and the unit economics of a loan;
- [ ] turn an analysis into a ten-slide story with the answer first, and present it in ten minutes;
- [ ] go into an analyst interview with a CV, a portfolio, thirty prepared answers and good questions of your own.

---

## Scoring and what happens next

| Item | Points |
|---|---|
| Capstone (Part A) | 100 |
| Mock interview (Part B) | 50 |

The mentor's written feedback goes to `submissions/week-08/day-5/FEEDBACK.md` — the capstone by rubric line, the interview block by block with the two things to practise first. Points are added to the progress page. Then the real ones: send the CV, keep the portfolio link in it, and keep `docs/company/interview.md` open the evening before every interview.

---

### 📎 Hand in here

```sqltask
{"check": "handin-W8D5", "lesson": "W8D5", "title": "Capstone + mock interview", "tasks": [{"id": "capstone.ipynb", "file": "capstone.ipynb", "names": ["capstone.ipynb"], "upload": true, "accept": ".ipynb", "q": "Attach `capstone.ipynb` — what the page above asks for."}, {"id": "capstone_deck.pdf", "file": "capstone_deck.pdf", "names": ["capstone_deck.pdf"], "upload": true, "accept": ".pdf", "q": "Attach `capstone_deck.pdf` — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w08d5", "pass": 0.8, "questions": [
  {"type": "single", "q": "How do you open the ten-minute presentation?", "options": ["'Today I will talk about…'", "With the method", "With the answer: the governing thought and three bullets", "With the data sources"], "answer": 2, "explain": "The answer comes in the first minute; the rest is evidence (→ Part A, 'The ten minutes')."},
  {"type": "single", "q": "A board member disagrees with one of your numbers. What do you do?", "options": ["Thank them, restate their point, give your number and its definition, and offer the check that would settle it", "Argue until they accept it", "Drop the slide", "Change the number"], "answer": 0, "explain": "Never argue about a number whose definition you have not agreed (→ Part A, 'The ten minutes')."},
  {"type": "single", "q": "Two officers in one branch tie for the most approvals. What does this return for that branch?", "code": "r AS (SELECT o.*, ROW_NUMBER() OVER (PARTITION BY branch_id ORDER BY approved DESC) AS rn FROM o)\nSELECT * FROM r WHERE rn = 1;", "options": ["Both officers", "An error", "Neither", "One of them, chosen silently — RANK() keeps the tie"], "answer": 3, "explain": "ROW_NUMBER always numbers 1, 2, …; RANK gives tied rows the same rank (→ B2, T3)."},
  {"type": "single", "q": "This is meant to find each customer's first loan, for customers whose first loan was in 2025. What goes wrong?", "code": "WITH ranked AS (\n  SELECT customer_id, disbursed_at,\n         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY disbursed_at, loan_id) AS n\n  FROM loans\n  WHERE disbursed_at >= '2025-01-01' AND disbursed_at < '2026-01-01')\nSELECT * FROM ranked WHERE n = 1;", "options": ["loan_id in ORDER BY breaks the ranking", "The date filter runs before ROW_NUMBER, so a customer's first 2025 loan looks like a first loan even if they borrowed in 2024", "Nothing", "ROW_NUMBER needs GROUP BY"], "answer": 1, "explain": "Find the first loan on all loans, then filter the cohort (→ B2, T4)."},
  {"type": "single", "q": "Case: 'FPD in the app doubled last month.' What is your first step?", "options": ["Re-train the scorecard", "Check that it is real and how big: the definition, which month, and how many loans and defaults — 1 → 2 defaults on ~120 loans is 'doubled'", "Recommend pausing the app", "Look for a fraud ring"], "answer": 1, "explain": "Most candidates skip reality and size; only then locate it, separate mix from rate, and recommend (→ B3)."},
  {"type": "text", "q": "STAR stands for Situation, Task, Action and … (one word)", "answer": ["result", "results", "the result"], "explain": "Tell the result with a number, not the tools you used (→ B1)."},
  {"type": "multi", "q": "Which are good first questions to ask the interviewer?", "options": ["What is the salary, and how many holidays are there?", "What would a successful first three months look like in this role?", "What does the company do?", "What is the biggest data-quality problem the team lives with today?", "Which definition of approval rate or NPL do you use in the board pack?"], "answer": [1, 3, 4], "explain": "Ask about the work, the data and the team; perks come later with HR, and you should already know what the company does (→ B5)."},
  {"type": "single", "q": "What is the goal of your first 30 days in an analyst job?", "options": ["Rebuild the warehouse", "Learn the business and the data: meet the internal clients, write a glossary of their definitions, rebuild one recurring report and reconcile it to the soum", "Automate every manual step", "Deliver a big analysis that changes a decision"], "answer": 1, "explain": "Learn, then deliver (31–60), then improve (61–90) (→ Part C, the 30/60/90-day plan)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w08d5", "q": "In the case (B3) the interviewer accepts that one month's 'FPD doubled' is one extra default and asks for the number you would put on the weekly monitor instead: the app's FPD30 pooled over the last three readable vintages, May, June and July 2026 (loans disbursed in those months, in FPD30 scope, clean payments). What is the UPPER limit of its 95 % Wilson interval? Give a percentage to 3 decimals.", "type": "number", "dp": 3, "h": ["800b09b71e13480ec966aaa1"], "hint": "Pool the counts first (Σ FPD over Σ loans), then build one interval — not three intervals averaged.", "sol": "YSA9IGZbKGZbImNoYW5uZWwiXSA9PSAiYXBwIikgJiAoZlsiZGlzYnVyc2VkX2F0Il0gPj0gIjIwMjYtMDUtMDEiKSAmIChmWyJkaXNidXJzZWRfYXQiXSA8ICIyMDI2LTA4LTAxIildCmssIG4gPSBhWyJmcGQzMCJdLnN1bSgpLCBsZW4oYSkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgMSArIDEgKyAyID0gNCBGUERzIGluIDEzMSArIDEzNiArIDEyMiA9IDM4OSBsb2Fucwpwcm9wb3J0aW9uX2NvbmZpbnQoaywgbiwgYWxwaGE9MC4wNSwgbWV0aG9kPSJ3aWxzb24iKSAgICAgICAgICAgICMgKDAuMDA0MDEsIDAuMDI2MTQpCgo0IC8gMzg5ID0gMS4wMyAlLCBXaWxzb24gOTUgJSAwLjQw4oCTMi42MSAlOiBwb29sZWQgb3ZlciBhIHF1YXJ0ZXIsIHRoZSBhcHAncyByZWNlbnQgRlBEMzAgaXMsIGlmIGFueXRoaW5nLCBiZWxvdyBpdHMgbG9uZy1ydW4gMS43MCAlLCBhbmQgdGhlIHNpbmdsZSAnZG91YmxlZCcgbW9udGggc2l0cyBjb21mb3J0YWJseSBpbnNpZGUgdGhlIGludGVydmFsLgpUaGUgdXBwZXIgbGltaXQgaXMgdGhlIGxpbmUgd29ydGggd2F0Y2hpbmc6IGl0IGp1c3QgdG91Y2hlcyBNaWNybydzIGJyZWFrLWV2ZW4gRlBEIG9mIGFib3V0IDIuNSAlIChEYXkgMiksIHNvIHRocmVlIG1vbnRocyBvZiBkYXRhIGNhbm5vdCB5ZXQgcHJvbWlzZSB0aGUgZ3VhcmRyYWlsIGhvbGRzLgpGb3IgdGhlIGludGVydmlld2VyOiAnSSB3b3VsZCByZXBvcnQgdGhlIHJvbGxpbmcgdGhyZWUtdmludGFnZSByYXRlIHdpdGggaXRzIGludGVydmFsIGFuZCBuLCBhbmQgYWxhcm0gb25seSB3aGVuIHRoZSBsb3dlciBsaW1pdCBjcm9zc2VzIHRoZSBicmVhay1ldmVuIOKAlCBub3Qgd2hlbiBvbmUgbW9udGggb2YgMTIyIGxvYW5zIGhhcyB0d28gZGVmYXVsdHMuJw=="}
```

<!-- challenge:end -->
