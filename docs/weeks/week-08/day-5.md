# Week 8 · Day 5 — Presentation day, the mock interview, and what next

<span class="badge">Final checks 60 min</span> <span class="badge">Presentation 10 min + questions</span> <span class="badge">Mock interview 60 min</span> <span class="badge">What next 30 min</span> <span class="badge hw">Capstone · 100 points</span> <span class="badge hw">Mock interview · 50 points</span>

> STORY **Friday, 9:00.** The meeting room is booked from eleven. Madina, at the door: *"Two things today, and the second matters more than you think. At eleven you present to the board — ten minutes, then their questions. After lunch I stop being your manager and become an interviewer from another bank. Sixty minutes: your CV, live SQL on our database, a case, quick questions, and then your questions to me. Treat it as real. Most people fail the first interview not on SQL but on the case and on 'do you have any questions for us?'."*

## Today in 3 lines

- **Part A:** you submit and present the capstone — notebook, two-page dashboard, deck or memo, and the recording or speaker notes — and answer the board's questions with numbers.
- **Part B:** you go through a **60-minute mock interview**: CV walk, four live SQL tasks of rising difficulty on `nur.db`, a 15-minute case, a metrics rapid-fire, and your own questions to the company.
- **Part C:** you leave with a **30/60/90-day plan** for your first analyst job, a list of free resources to keep learning, and the checklist of what you can now do.

---

## Part A — The capstone presentation (100 points)

**Hand in by 9:00** with the 📎 box below:

| File | What |
|---|---|
| `capstone.ipynb` | executed (Kernel → Restart & Run All, then save); the sanity numbers in cells; one section per question; an interpretation sentence under each table |
| `capstone.pbix` + `capstone_dashboard.pdf` (or `capstone.xlsx` + PDF) | two pages: Growth & mix, Risk & collections |
| `capstone_deck.pdf` (10 slides) **or** `capstone_memo.pdf` (2 pages, attached in the deck's place) | answer first, so-what titles, 3–5 recommendations with owner and value |
| `capstone_talk.mp4` **or** `speaker_notes.md` | 10 minutes; notes = what you say per slide, in full sentences (a recording over 5 MB goes to the course bot — see [How to submit](homework/how-to-submit.md)) |
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

> 💡 **Key idea.** The first minute decides the next nine: if the board has your answer by 0:60, every slide after it is evidence they are already weighing; if not, they spend the ten minutes guessing where you are going.

> ⚠️ **Watch out.** The presentation mistakes that cost the most points: reading the slides aloud, running out of time before the recommendations, "as you can see" instead of the number, and defending a number against a board member instead of agreeing its definition first. Rehearse with a timer until slide 9 starts before minute 8.

*Done looks like:* everything in the 📎 box at the bottom of the page by 9:00, and the ten minutes delivered with the answer in the first one.

---

## Part B — The mock interview (60 minutes, 50 points)

Run by the mentor as an interviewer from another lender. The structure is the one most analyst interviews in banks and fintechs follow. Before the real thing, go through every block below **on your own, against the clock**: each question has a box; write the answer you would say, then compare it with the model.

| Block | Minutes | Points | What is tested |
|---|---|---|---|
| B1. Intro and CV walk | 10 | 5 | a 2-minute story of yourself; one project told with STAR and numbers |
| B2. Live SQL on `nur.db` | 20 | 20 | four tasks, rising difficulty; you talk while you write |
| B3. Case | 15 | 10 | structure, hypotheses, data you would pull, a recommendation |
| B4. Metrics rapid-fire | 10 | 10 | ten questions from the interview bank, ~1 minute each |
| B5. Your questions | 5 | 5 | do you ask about the job, the data, the team? |

```game
{"type": "order", "id": "w08d5-g1", "title": "The interview, in order", "q": "Put the five blocks of a typical analyst interview in order.", "items": ["B1 · Intro and CV walk", "B2 · Live SQL, rising difficulty", "B3 · A case: structure before answers", "B4 · Metrics rapid-fire", "B5 · Your questions to them"], "why": "Warm-up, skills, judgement, breadth, then you — and the last five minutes are scored too."}
```

> 💡 **Key idea.** Interviewers score the **process** as much as the result: restate the question, name the tables and the grain, check the answer against a number you know, say the trap out loud. A right query in silence scores less than a nearly-right one explained.

Three methods carry most of the interview. Learn them here, in the course's shape, then use them in B1–B5.

### The STAR answer — situation, task, action, result

**What it is.** **STAR** is the shape of a story about your work: **S**ituation (who needed what, and why), **T**ask (what exactly you had to deliver), **A**ction (what you did — the method, not only the tool), **R**esult (a number, and what changed because of it). Interviewers use it to score "tell me about a time…" and the CV walk.

**How to write it.** One sentence per letter; the result carries a number you can prove:

```text
S  Bekzod's outstanding did not match Finance's ledger.
T  Find the difference before the month-end pack went out.
A  Reconciled payments to instalments; found rows identical in instalment, date and amount; built a clean view.
R  25 duplicate rows, 58 397 800 soum counted twice; every report since uses the clean payments.
```

The R line comes from a query, not from memory:

```sql
SELECT COUNT(*) AS duplicate_rows, SUM(amount) AS counted_twice
FROM (SELECT amount,
             ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
      FROM payments)
WHERE rn > 1;  -- every copy after the first
```

25 rows and 58 397 800 soum: the result line of the story, exact to the soum.

**When you use it.**
- "Tell me about yourself", "walk me through a project", "a time you disagreed", "a time you made a mistake".
- On the CV: each portfolio line is a compressed STAR — action verb, method, result with a number.

> ⚠️ **Watch out.** "I used pandas and Power BI" is a list of tools, not an action, and has no result. Say what you found and what changed.

**Your turn.** Which line is a **Result**?

```task
{"id": "w08d5-l1", "kind": "choice", "options": ["I used SQL and Python.", "The product manager wanted to know if the new screen worked.", "300 users in both arms were removed; the lift fell from 13 % to 11 % and the screen shipped with an FPD guardrail.", "I had to analyse an A/B test."], "answer": 2, "explain": "A result has a number and a consequence. The others are a tool list, the situation and the task."}
```

### Live SQL habits — think aloud, check, name the trap

**What it is.** In a live SQL task the interviewer scores the **process** as much as the query. Five habits: **restate** the task and ask one clarifying question; **name the tables and the grain**; **write in small steps** and run each; **check** the result against a number you already know; **say the trap** you avoided.

**How to write it.** Add the check to the query itself, so it is on the screen when you say it:

```sql
-- task: loans and amount disbursed in September 2026 by channel
-- grain: one loan, tables: loans → applications (for the channel)
SELECT a.channel, COUNT(*) AS loans, SUM(l.principal) AS disbursed
FROM loans l JOIN applications a ON a.application_id = l.application_id
-- half-open: no BETWEEN on dates
WHERE l.disbursed_at >= '2026-09-01' AND l.disbursed_at < '2026-10-01'
GROUP BY a.channel
UNION ALL
-- the check: September's known total
SELECT 'TOTAL', COUNT(*), SUM(principal)
FROM loans
WHERE disbursed_at >= '2026-09-01' AND disbursed_at < '2026-10-01';
```

Branch 172 loans, app 123, partner 66; the total row says 361 loans and 17 015 490 000 soum — sanity number 6, so the join lost nothing.

**When you use it.** Every live task, from T1 to T4. Say each habit aloud as you do it:

| Habit | What you say |
|---|---|
| restate | "So: one row per channel, September 2026, count and amount — loans, not applications?" |
| grain | "One row of the result is a channel; one row before grouping is a loan." |
| small steps | "First the filter alone, then the join, then the GROUP BY." |
| check | "361 loans in total — that matches September." |
| trap | "I used a half-open date range, because `BETWEEN` loses the last day's times." |

> ⚠️ **Watch out.** A query that runs but answers a different question scores 0. Ask before you write: "loans or applications?", "by disbursement month or by application month?"

**Your turn.** The interviewer says: *"Approval rate by month for the app."* What do you do first?

```task
{"id": "w08d5-l2", "kind": "choice", "options": ["Start typing SELECT at once to save time", "Restate it and ask about the denominator: decided or all applications, and is approved_not_disbursed approved?", "Ask which SQL dialect they prefer and stop there", "Write the query for all channels and filter later"], "answer": 1, "explain": "Approval rate has two common denominators (week 1, Day 1 of this week). One question settles it and shows the interviewer you know the trap."}
```

### The case method — is it real, how big, where, why, what now

**What it is.** A **case** is an open business question ("FPD doubled — what do you do?"). The **case method** answers it in five steps, in this order: **is it real?** (same definition, same period, enough loans), **how big?** (counts, not only rates), **where?** (a MECE split: product, channel, grade, version, region, officer), **why?** (an event: a policy change, an outage, a campaign, fraud), **what now?** (a recommendation and a monitor).

**How to write it.** The first two steps are a query. App FPD30 by the month the first instalment fell due:

```sql
WITH pay AS (  -- clean payments
  SELECT installment_id, paid_at, amount FROM (
    SELECT installment_id, paid_at, amount,
           ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
    FROM payments) WHERE rn = 1),
-- first instalments old enough to judge
first_inst AS (
  SELECT i.loan_id, i.due_date, i.total_due, COALESCE(SUM(p.amount), 0) AS paid_in_30
  FROM installments i
  LEFT JOIN pay p ON p.installment_id = i.installment_id
                 AND p.paid_at <= date(i.due_date, '+30 days') AND p.paid_at <= '2026-10-01'
  WHERE i.installment_no = 1 AND i.due_date <= '2026-09-01'
  GROUP BY i.loan_id, i.due_date, i.total_due)
SELECT strftime('%Y-%m', f.due_date) AS due_month,
       COUNT(*)                                                         AS loans,
       SUM(CASE WHEN f.paid_in_30 < f.total_due THEN 1 ELSE 0 END)      AS fpd30,
       ROUND(100.0 * SUM(CASE WHEN f.paid_in_30 < f.total_due THEN 1 ELSE 0 END) / COUNT(*), 2) AS fpd30_pct
FROM first_inst f
JOIN loans l    ON l.loan_id = f.loan_id
JOIN products p ON p.product_id = l.product_id
WHERE p.channel = 'app' AND f.due_date >= '2026-03-01'
GROUP BY due_month ORDER BY due_month;
```

FPD30 "doubled" from July to August: 0.74 % to 1.64 %. In counts it is 1 loan of 136 against 2 of 122. One extra default on a hundred loans is not a crisis — it is a reason to keep watching, with an interval.

**When you use it.**
- B3, and every "X went up/down — what do you do?" question.
- In the job: half of the "crises" in a lender's week are one extra default, a definition change or a payment outage.

> ⚠️ **Watch out.** Jumping to "why" ("the new app version is buggy") before "is it real" and "how big" is the most common way to fail a case. Check the counts first, out loud.

**Your turn.** *"Approval in the app fell from 70 % to 62 % last week."* What is your first move?

```task
{"id": "w08d5-l3", "kind": "choice", "options": ["Blame the new scorecard", "Ask for the counts and the definition: how many decisions last week, same denominator, any applications still undecided?", "Propose an A/B test of the form", "Split by region at once"], "answer": 1, "explain": "Is it real, how big: with about 45 app decisions a week, 8 points can be four applications — and the last days of a week may still be undecided. Only then where and why."}
```

### Putting it together

One interview, three methods. B1 and the CV walk are **STAR** stories, each ending with a number from a query. B2 is the **live SQL habits**, said aloud while you type. B3 is the **case method**, step by step. B4 is definitions with one number or one trap each; B5 is your questions. The same discipline runs through all of them: say the definition, give the count, name the trap.

```game
{"id": "w08d5-g4", "type": "sort", "title": "Which method?", "groups": {"STAR": ["Situation: Bekzod's outstanding did not match Finance", "Result: 25 duplicate rows, 58 m soum counted twice"], "Live SQL habits": ["'One row before grouping is a loan'", "'361 in total — that matches September'"], "Case method": ["'How many loans is that, not only what percent?'", "'Was there a scorecard change that week?'"]}}
```

### B1. Intro and CV walk (10 min)

*"Tell me about yourself"* in two minutes: who you are (one line), what you learned and built (the course, framed as projects), the role you want and why this company. Then the interviewer picks one CV line — have STAR for each of your four portfolio deliverables (HW 8.1). The trap: describing the tools ("I used pandas") instead of the result ("I found 300 users in both arms and the iOS bug, and the lift went from 13 % to 11 %").

**B1.1.** *(STAR — the two-minute version)* *"Tell me about yourself."* Write the two minutes as you would say them.

```task
{"id": "w08d5-b1", "kind": "free", "min": 80, "rubric": ["who you are in one line", "what you built, framed as projects with at least one number", "the role you want and why this company", "no list of tools without results", "about 250 words or fewer (two minutes)"], "model": "I am a data analyst at the start of my career, coming from [your background], and for the last two months I have been doing the work of a junior analyst at a fictional lender, Nur Finance, on a realistic loan book of 7 800 loans. I built the portfolio reporting in SQL — outstanding, PAR30, vintages — and found that 25 duplicate payments were double-counting 58 m soum. I analysed a 28 000-user A/B test of a new offer screen, found an assignment leak and a client bug, and recommended a staged rollout with a default-rate guardrail. I built a three-page Power BI dashboard on a star schema, and for my final project I presented a portfolio review to a mock board: where to grow, where to slow down, and what to change, each with an owner and a value. I am looking for a risk or portfolio analyst role, and your company interests me because [one specific reason: your app lending, your SME book, a number from your annual report]."}
```

**B1.2.** *(STAR)* The interviewer points at one CV line: *"Tell me more about this one."* Tell one deliverable with **STAR** — situation, task, action, result — and a number in the result.

```task
{"id": "w08d5-b2", "kind": "free", "min": 50, "rubric": ["Situation: who asked and why, in one sentence", "Task: what exactly you had to deliver", "Action: what you did, with the method, not only the tool", "Result: a number and what changed because of it"], "model": "Situation: the product manager wanted to know whether a new loan-offer screen sold more loans. Task: analyse a four-week A/B test with 28 000 users and recommend ship or not. Action: before reading the result I checked the experiment — the split by user, a sample-ratio test, users who appeared in both arms — and found 300 users in both arms and a client bug on one iOS version; I removed them as the pre-registration allowed and ran the z-test with a confidence interval, plus a guardrail on first-payment default. Result: the lift fell from the reported +13 % to +11 %, still significant, and because the default-rate interval could not exclude a loss, I recommended a staged rollout with the guardrail monitored — which is what the team did."}
```

### B2. Live SQL (20 min) — four tasks

Think aloud: restate the task, name the tables and the grain, write, run, **check the result makes sense** (a total you know, a row count). Ask clarifying questions — interviewers reward them. Each box runs on the course database, like DBeaver on `data/raw/nur.db` would; give yourself the minutes in brackets.

```game
{"type": "bug", "id": "w08d5-g2", "title": "Find the line that loses data", "q": "A candidate's T1. One line silently drops loans.", "code": "SELECT p.code, COUNT(*) AS loans, SUM(l.principal) AS disbursed\nFROM loans l\nJOIN products p ON p.product_id = l.product_id\nWHERE l.disbursed_at BETWEEN '2026-09-01' AND '2026-09-30'\nGROUP BY p.code\nORDER BY disbursed DESC;", "answer": [3], "why": "If disbursed_at ever carries a time, '2026-09-30' means midnight and everything later that day is lost. Use the half-open range: >= '2026-09-01' AND < '2026-10-01' — and say so aloud."}
```

**T1 (easy, 3 min).** *(live SQL habits)* Loans and amount disbursed in September 2026 by product, with the average ticket, largest amount first.

```task
{"id": "w08d5-t1", "kind": "sql", "note": "Five rows: product code, loans, disbursed, average ticket (rounded to the soum) — largest amount first.", "model": "SELECT p.code, COUNT(*) AS loans, SUM(l.principal) AS disbursed, ROUND(AVG(l.principal)) AS avg_ticket\nFROM loans l JOIN products p ON p.product_id = l.product_id\nWHERE l.disbursed_at >= '2026-09-01' AND l.disbursed_at < '2026-10-01'\nGROUP BY p.code ORDER BY disbursed DESC;"}
```

<details><summary>What earns the points (open after you have checked)</summary>

SME 30 · 8 601 880 000 · 286 729 333; AUTO 21 · 4 398 600 000; CONS 121 · 3 409 790 000; MICRO 123 · 328 630 000; BNPL 66 · 276 590 000. Check aloud: **361 loans, 17 015 490 000** in total — the September figure you know. Say: half-open date range, not `BETWEEN`.

</details>

**T2 (medium, 5 min).** *(live SQL habits)* Monthly approval rate of the **app** channel, April–September 2026, cancelled applications excluded; show the cancelled count too.

```task
{"id": "w08d5-t2", "kind": "sql", "note": "Six rows (2026-04 … 2026-09): month, applications, cancelled, approval rate in % to one decimal (approved_not_disbursed counts as approved).", "model": "SELECT strftime('%Y-%m', applied_at) AS month,\n       COUNT(*) AS applications,\n       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,\n       ROUND(100.0 * SUM(CASE WHEN status IN ('approved', 'approved_not_disbursed') THEN 1 ELSE 0 END)\n             / SUM(CASE WHEN status <> 'cancelled' THEN 1 ELSE 0 END), 1) AS approval_rate_pct\nFROM applications\nWHERE channel = 'app' AND applied_at >= '2026-04-01' AND applied_at < '2026-10-01'\nGROUP BY 1 ORDER BY 1;"}
```

**T2 — the follow-up.** *"September is the lowest month (66.7 %). Is that a problem?"*

```task
{"id": "w08d5-t2b", "kind": "free", "min": 30, "rubric": ["sizes the noise: about 190 decisions a month, a 95 % interval of roughly ±7 points", "compares with the other months (66.7–71.4 %) and calls a 3-point swing noise", "mentions that the last days of September may still lack decisions", "says what would make it a signal (several months in a row, or a rise in rejections at one step)"], "model": "Probably not. With about 190 decisions a month, a 95 % interval around 66.7 % is roughly ±7 points, and the six months run from 66.7 to 71.4 % — a 3-point swing is inside the noise. Also, September's last days may still have applications without a decision, which can move the month's rate. I would call it a signal if it kept falling for two or three months, or if rejections rose at one step — the pre-check, say — and then I would look at the score distribution of applicants to separate mix from policy."}
```

**T3 (harder, 6 min).** *(live SQL habits)* For each branch, the loan officer with the most approved applications in January–September 2026 (all channels). Show ties.

```task
{"id": "w08d5-t3", "kind": "sql", "note": "One row per branch winner, ties kept: branch name, officer's full name, approved — most approved first, then branch name.", "model": "WITH o AS (\n  SELECT a.branch_id, a.officer_id, COUNT(*) AS approved\n  FROM applications a\n  WHERE a.status IN ('approved', 'approved_not_disbursed')\n    AND a.applied_at >= '2026-01-01' AND a.applied_at < '2026-10-01'\n  GROUP BY a.branch_id, a.officer_id),\nr AS (SELECT o.*, RANK() OVER (PARTITION BY branch_id ORDER BY approved DESC) AS rnk FROM o)\nSELECT b.branch_name, s.full_name, r.approved\nFROM r JOIN branches b ON b.branch_id = r.branch_id\n       JOIN staff s    ON s.staff_id = r.officer_id\nWHERE r.rnk = 1\nORDER BY r.approved DESC, b.branch_name;"}
```

<details><summary>What earns the points (open after you have checked)</summary>

11 rows for 10 branches: Fergana has a **tie** (Sanjar Ergashev and Bobur Ergashev, 62 each) — `RANK` keeps both, `ROW_NUMBER` would silently pick one. Two "Sanjar Ergashev" are **different people** (different `staff_id`, Fergana and Namangan): group by the id, display the name. Top of the table: Tashkent South, Gulbahor Ismoilov, 92.

</details>

**T3 — the follow-up.** *"So is the top officer the best?"*

```task
{"id": "w08d5-t3b", "kind": "free", "min": 30, "rubric": ["says 'not from this table': most approvals can mean the loosest approvals", "names the missing measure: FPD (or default) of the officer's loans, ideally by grade", "mentions volume differences between branches (Tashkent vs Nukus)", "proposes the comparison: approvals and FPD per officer, with intervals for small numbers"], "model": "Not from this table. The most approvals can simply mean the loosest approvals — the officer we want approves a lot and their loans repay. I would add the FPD30 of each officer's loans, by risk grade so that officers with riskier customers are not punished, and the approval rate on their decided applications; and I would compare within a branch, because Tashkent South sees far more applications than Nukus. With 40–90 loans per officer the FPD rates are noisy, so I would show intervals before anyone gets a bonus or a warning."}
```

**T4 (hardest, 6 min).** *(live SQL habits)* Repeat borrowing: for customers whose first loan was in 2025, by quarter of the first loan — customers, how many took a second loan within 6 months of the first, and the rate.

```task
{"id": "w08d5-t4", "kind": "sql", "note": "Four rows (2025-Q1 … 2025-Q4): cohort, customers, repeat within 6 months, rate in % to one decimal. Find each customer's first loan on ALL loans before you filter to 2025.", "model": "WITH ranked AS (\n  SELECT customer_id, disbursed_at,\n         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY disbursed_at, loan_id) AS n\n  FROM loans),\npairs AS (\n  SELECT f.customer_id, f.disbursed_at AS first_at, s.disbursed_at AS second_at\n  FROM ranked f LEFT JOIN ranked s ON s.customer_id = f.customer_id AND s.n = 2\n  WHERE f.n = 1)\nSELECT strftime('%Y', first_at) || '-Q' || ((CAST(strftime('%m', first_at) AS INTEGER) + 2) / 3) AS cohort,\n       COUNT(*) AS customers,\n       SUM(CASE WHEN second_at <= date(first_at, '+6 months') THEN 1 ELSE 0 END) AS repeat_6m,\n       ROUND(100.0 * SUM(CASE WHEN second_at <= date(first_at, '+6 months') THEN 1 ELSE 0 END) / COUNT(*), 1) AS repeat_6m_pct\nFROM pairs\nWHERE first_at >= '2025-01-01' AND first_at < '2026-01-01'\nGROUP BY 1 ORDER BY 1;"}
```

<details><summary>What earns the points (open after you have checked)</summary>

2025-Q1 375 · 108 · 28.8 %; Q2 414 · 134 · 32.4 %; Q3 450 · 146 · 32.4 %; Q4 443 · 160 · 36.1 %. The first loan is found **before** filtering to 2025 (filter inside `ranked` and every customer's first 2025 loan looks like a first loan); `loan_id` breaks ties on the same day; the `LEFT JOIN` keeps customers with no second loan; and the observability check said aloud — even a first loan of 31 December 2025 reaches 6 months on 30 June 2026, before the as-of, so every cell is complete. SQL Server: `DATEADD(month, 6, first_at)`, `DATEPART(quarter, first_at)`.

</details>

**Scoring B2 (20):** T1 3, T2 5, T3 6, T4 6. Each: correct result (60 %), the check said aloud (20 %), the trap named (20 %). A query that runs but answers a different question scores 0 for that task — ask before you write.

### B3. The case (15 min): *"FPD in the app doubled last month. What do you do?"*

Five minutes to structure aloud, eight to go through it, two for the recommendation. The interviewer answers your data questions.

> 🎯 **Interview version.** Open every case with **"is it real, and how big?"** before **"why?"**: the definition, the period, the denominator and the counts. Half of the "crises" in a lender's week are one extra default on a small vintage, a definition change or a payment outage — and the candidate who checks that first is the one who gets hired.

**B3.** *(the case method)* Your answer to the case: structure it aloud, then write it here — what you check first, where you look, how you separate mix from rate, and what you recommend.

```task
{"id": "w08d5-case", "kind": "free", "min": 120, "rubric": ["checks reality and size first: which FPD, which month, same definition, how many loans and defaults (on Nur's app: 1 → 2 defaults on about 120 loans)", "a MECE structure for 'where': version and device, term, grade/score, region and officer, acquisition source, new vs repeat", "separates mix from rate", "looks for an event: scorecard change, payment outage, campaign, fraud pattern", "ends with a recommendation and a monitor (rolling rate with its interval, a guardrail line)"], "model": "1. Is it real? Which FPD (FPD30? FPD7?), which 'last month' (loans disbursed last month cannot have an FPD30 yet — so probably the month whose first due date passed 30 days ago), the same definition and payment cut-off as before, no pipeline change? Then the size: on Nur's app, the monthly vintages of January–July 2026 have 74–136 loans each with a readable FPD30 and 0–2 defaults each — June 1 of 136 (0.74 %), July 2 of 122 (1.64 %): that is 'FPD doubled', and it is one extra default; a 95 % interval on 2 of 122 runs from about 0.5 % to 5.8 %. If it is a handful, the answer is 'watch the next vintage and the three-month rolling rate', not an alarm. 2. If it is real, where is it? App version and device (a release can break the payment reminder or auto-debit), product term, grade and score band, region and the officer who reviewed it, acquisition source (a campaign or new partner), new vs repeat customers. Concentrated in one cell means a cause; everywhere means policy or the economy. 3. Mix or rate? Did the share of riskier applicants rise with the same rate inside each group, or did the rate rise inside groups? Compare the score distribution of approved applicants month on month. 4. Look for an event: a scorecard or cut-off change, a new pre-check, a payment-channel outage on the first due dates (FPD that cures), a campaign, a fraud pattern (same device, same phone prefix, first payment never made). 5. Recommend: if a cell is found, fix or stop it — pause the campaign, block the pattern, patch the release — and have collections call those loans in the first week; if it is mix, decide with risk whether the new segment pays (break-even FPD about 2.5 % on Micro). Either way, add FPD by app version to the weekly monitor with its interval. In two sentences: first I check it is not one or two defaults on a small vintage or a definition change; if it is real, I locate it, separate mix from rate, fix the cell or re-price the segment, and add a monitor."}
```

**Scoring B3 (10):** checks reality and size before causes (3); a structure that is MECE (3); names the data and tables (2); ends with a recommendation and a monitor (2).

### B4. Metrics rapid-fire (10 min)

Ten questions from the [interview bank](company/interview.md), about a minute each, no notes. Say each answer aloud first, then write it — 1 point each for a correct definition with one number or one trap.

**R1.** *What is the difference between DPD and FPD?* (A1)

```task
{"id": "w08d5-r1", "kind": "free", "min": 30, "rubric": ["DPD is a state of a loan today (days since the oldest unpaid due date), grouped in buckets", "FPD is an event: the first instalment not paid within X days, and you say which X", "says what each is used for (collections and PAR vs early warning and fraud) or gives a number"], "model": "DPD (days past due) is a state of a loan today: as-of date minus the due date of the oldest unpaid instalment, 0 if nothing is overdue; grouped into buckets 0 / 1–30 / 31–60 / 61–90 / 90+. FPD (first payment default) is an event of a new loan: the first instalment was not paid within X days of its due date (X = 30 is common; some use 7 or 10 — always say which). DPD drives collections, PAR and provisions; FPD is the early warning for a new product, channel or scoring rule, and the main fraud signal, because it is known two months after disbursement. \"On my project book FPD30 was 1.28 % — 1.70 % in the app against 1.04 % at branches — while PAR30 was 3.12 %; the two answer different questions.\""}
```

**R2.** *PAR30 vs NPL — what is the difference?* (A2)

```task
{"id": "w08d5-r2", "kind": "free", "min": 30, "rubric": ["PAR30 = outstanding of loans with DPD > 30 ÷ total outstanding, on balance, not count", "NPL is a classification: usually 90+, but it varies (60+, restructured, unlikely to pay)", "warns against comparing ratios without checking the definition"], "model": "PAR30 (portfolio at risk) = outstanding of loans with DPD > 30 ÷ total outstanding — a pure DPD measure, on balance, not on count. NPL (non-performing loans) is a classification: usually 90+ DPD, but depending on the regulator or the company it can be 60+, and it can include restructured or \"unlikely to pay\" loans regardless of DPD. NPL ratio = NPL outstanding ÷ total. On my project: PAR30 3.12 %, NPL90 2.55 % — so 2.55 of the 3.12 points were already old debt, not a fresh wave. The trap: comparing your NPL with a competitor's annual report without checking their definition."}
```

**R3.** *What is a roll rate and how do you use it?* (A3)

```task
{"id": "w08d5-r3", "kind": "free", "min": 30, "rubric": ["the share moving from one bucket to the next between two month-ends (a migration matrix)", "what it is used for: where collections effort pays, forecasting losses", "a trap: the same DPD definition and cut-off in both snapshots, closed loans handled"], "model": "The share of loans (or balance) in one delinquency bucket at one month-end that are in the next bucket at the next month-end — a migration matrix between two snapshots. It tells collections where effort pays and lets risk forecast losses: multiply today's buckets through the matrix to project next month. On my project, 1 September → 1 October: 19.5 % of 1–30 loans rolled to 31–60, 75.8 % cured; 31–60 → 61–90 69.6 %; 61–90 → 90+ 100 %. Reading: the first bucket is where contact matters — after 60 days almost nobody comes back. Traps: the snapshots must use the same DPD definition and the same payment cut-off; closed loans must be handled explicitly."}
```

**R4.** *How do you compute approval rate? Why do two teams get different numbers?* (A5)

```task
{"id": "w08d5-r4", "kind": "free", "min": 30, "rubric": ["approved ÷ decided applications", "names the denominator choices: cancelled, approved-not-disbursed, application vs decision month, pre-check rejects", "ask for the definition, write it under the number, reconcile once"], "model": "Approved ÷ decided applications is the usual risk convention; the differences are all in the denominator and the status list: are cancelled applications in it, is \"approved but not disbursed\" approved, is it counted by application month or decision month, per application or per customer, and does it include applications rejected by a pre-check before the customer submitted. On my project the app channel showed 68.2 % (approved ÷ decided), 58.2 % (approved ÷ app sessions) and 84.5 % (approved ÷ submitted forms) — three correct numbers. The answer: ask for the definition, write it under the number, reconcile once."}
```

**R5.** *What is expected loss?* (A6)

```task
{"id": "w08d5-r5", "kind": "free", "min": 30, "rubric": ["EL = PD × LGD × EAD, and what each part means", "it is the mean loss, covered by pricing and provisions; the tail is covered by capital", "says what is crude in a simple estimate"], "model": "EL = PD × LGD × EAD, summed over loans: the probability of default (usually 90+ within 12 months or lifetime), the share lost if it defaults after recoveries, and the exposure at default. It is the mean of the loss distribution — the cost of doing business that pricing and provisions must cover; unexpected loss (the tail) is what capital covers. A crude version on my project (PD = share now 90+, LGD 60 % assumed) gave 3.60 bn, 1.77 % of the performing exposure, with grade C carrying 46 % of the loss on 27 % of the exposure. Then say what is crude: the PD mixes loan ages and understates long products; real banks estimate PD from vintages and scorecards and LGD from actual recoveries."}
```

**R6.** *Explain IFRS 9 provisions in plain words.* (A7)

```task
{"id": "w08d5-r6", "kind": "free", "min": 30, "rubric": ["provisions cover the loss we expect, not only losses that happened", "Stage 1: 12-month EL; Stage 2 (risk up significantly, ~30+ DPD): lifetime EL; Stage 3: defaulted (~90+)", "why it matters: early delinquency costs money in the P&L now"], "model": "Every loan carries a provision for the loss we expect, not only the loss that has happened. Healthy loans (Stage 1) carry 12 months of expected loss; loans whose risk has increased significantly — typically 30+ DPD or a large score deterioration — (Stage 2) carry lifetime expected loss; defaulted loans, typically 90+ (Stage 3), carry lifetime loss on a defaulted exposure. The PDs are forward-looking, weighted over economic scenarios. Consequence for an analyst: a rise in early delinquency moves loans to Stage 2 and costs money in the P&L now, before any loan is written off — which is why risk watches 1–30 entries and FPD so closely."}
```

**R7.** *What is cost of risk?* (A9)

```task
{"id": "w08d5-r7", "kind": "free", "min": 30, "rubric": ["credit-loss charge of a period ÷ average portfolio, usually annualised", "a flow in the P&L, while provisions are a stock on the balance sheet", "puts it next to yield and funding cost, or names a company difference"], "model": "The credit-loss charge of a period divided by the average portfolio, usually annualised: (change in provisions + write-offs − recoveries) ÷ average gross loans. It is a flow in the P&L; expected loss / provisions are the stock on the balance sheet. It sits next to the yield and the cost of funds in the metric tree: on my project the annualised yield was about 25.5 % against an assumed 18 % funding rate, so every point of cost of risk takes a large share of a 7.5-point spread. Company differences: gross vs net of recoveries, average vs opening portfolio."}
```

**R8.** *Measure vs calculated column in Power BI?* (C3)

```task
{"id": "w08d5-r8", "kind": "free", "min": 30, "rubric": ["calculated column: per row, at refresh, stored — for slicing and filtering", "measure: at query time, in the filter context — for anything aggregated", "the classic mistake: a ratio as a column, then summed"], "model": "A calculated column is computed once per row at refresh and stored — use it for attributes you slice or filter by (an age band, a DPD bucket, \"is 90+\"). A measure is computed at query time in the current filter context — use it for anything aggregated (outstanding, PAR30 %, collection rate): it gives the right answer at every level of a visual, the total included. The classic mistake is a ratio as a column, then summed — PAR30 of a region becomes the sum of loan-level percentages. On my project the six base measures (Outstanding 208 723 504 430, Disbursed Count 7 828, Avg Ticket 51 709 668, PAR30 3.12 %, …) matched the SQL views to the soum."}
```

**R9.** *What is a p-value?* (D1)

```task
{"id": "w08d5-r9", "kind": "free", "min": 30, "rubric": ["the probability of data at least this extreme, assuming the null hypothesis is true", "says what it is not: not the chance the null is true, not the size of the effect", "adds an effect size in business units"], "model": "The probability, computed assuming the null hypothesis is true, of getting a result at least as extreme as the one observed. It is not the probability that the null is true, not \"the probability it is due to chance\", and not a measure of size. Example from my project: app vs branch FPD, 1.70 % vs 1.04 %, z = 2.15, p = 0.032 — if the channels truly had equal FPD, a gap this large would appear in about 3 % of samples of this size. Then the effect size: about 7 more first-payment defaults per 1 000 app loans."}
```

**R10.** *What is a sample ratio mismatch and what do you do when you find one?* (D4)

```task
{"id": "w08d5-r10", "kind": "free", "min": 30, "rubric": ["the split between arms differs from the design more than chance allows (chi-square on counts)", "it means assignment or logging is broken, so the result cannot be trusted", "checks slices (device × week), removes the broken cell, reports it, never reweights"], "model": "The split between arms differs from the design (e.g. 50/50 planned, 52/48 observed) by more than chance — a chi-square test on the counts. It means the assignment or the logging is broken and the arms may differ in who is in them, so the result cannot be trusted. Check it overall and by the slices the software ships in (device × release week): in my project the overall p was 0.09 (\"fine\") but iOS users in the last week went 60/40 (p ≈ 10⁻¹⁴) — a client bug; that cell was removed from both arms, reported, and the engineers fixed the client. Never \"reweight\" an SRM away."}
```

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

```game
{"type": "sort", "id": "w08d5-g3", "title": "Ask it, or not yet?", "q": "Sort the questions for the last five minutes of the interview.", "groups": {"Good first questions": ["What would a successful first three months look like?", "Which definition of NPL do you use in the board pack?", "Who do I go to when a number looks wrong?", "What recent analysis from this team changed a decision?"], "Not yet / never": ["How many days of holiday do I get?", "What does the company do?", "No, I have no questions."]}, "why": "Ask about the work, the data and the team; salary and holidays come later with HR, and you should know what the company does before you walk in."}
```

> ⚠️ **Watch out.** "No questions" scores zero in B5 — and it is the most common answer from nervous candidates. Write your three questions before the interview, and add one that follows from something the interviewer said.

**B5.** Your three questions for this interviewer — and, for one of them, why you are asking it.

```task
{"id": "w08d5-b5", "kind": "free", "min": 30, "rubric": ["two or three questions", "about the work, the data or the team — not perks", "at least one that follows from something said in the interview", "you can say why you ask it"], "model": "1. \"What would a successful first three months look like in this role?\" 2. \"You mentioned the board pack — which definition of NPL does it use, and does it match the regulator's?\" — I ask because in my project two teams' approval rates differed by ten points only because of the denominator, and I would want to know the house definition from day one. 3. \"What is the biggest data-quality problem the team lives with today?\""}
```

**Scoring B5 (5):** at least two questions (2), about the work rather than the perks (2), one that follows from something said in the interview (1).

---

## Part C — What next

### A 30/60/90-day plan for your first analyst job

| Days | Goal | Concretely |
|---|---|---|
| **1–30: learn** | the business and the data | meet every internal client (the roles page is your list); get access to the warehouse and the dashboards; write your own glossary of *their* definitions (approval, DPD, NPL, active customer) and where each differs from the course; rebuild one existing recurring report and reconcile it to the soum |
| **31–60: deliver** | own something small, end to end | take over one recurring report or dashboard; answer ad-hoc requests with the four steps (metric + definition, grain, tables, check against a trusted number); find and document one data-quality problem with its size and a fix |
| **61–90: improve** | one piece of analysis that changes a decision | pick a question from your metric tree that nobody owns (an early-bucket strategy, a funnel leak, a product's unit economics); deliver it as a one-page memo with a recommendation, an owner and a value; automate one manual step you inherited |

**C1.** Your own 30/60/90 for the job in your `job_ad.md` (HW 8.1): one concrete line per period — who you will meet, what you will own, which question you will answer.

```task
{"id": "w08d5-plan", "kind": "free", "min": 60, "rubric": ["days 1–30: named internal clients and a glossary of their definitions, one report rebuilt and reconciled", "days 31–60: one recurring report or dashboard owned end to end, one data-quality problem sized", "days 61–90: one question nobody owns, delivered as a memo with an owner and a value", "fits the job advert's actual requirements"], "model": "For a risk-analyst role at a bank with an app and a branch network. Days 1–30: meet the head of risk, collections, the portfolio manager and the BI team; write a glossary of their definitions — DPD, FPD, NPL, approval rate — and where each differs from what I know; rebuild the monthly PAR30 and vintage pack and reconcile it to Finance's ledger to the soum. Days 31–60: own the weekly FPD monitor by channel and app version end to end, with intervals; find and size one data-quality problem (for example duplicate payments) and propose the fix to the data team. Days 61–90: answer a question nobody owns — say, the early-bucket strategy: who to contact first and what a third fewer roll-forwards would save — as a one-page memo with an owner and a value, and automate the manual part of the pack I inherited."}
```

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

The mentor's written feedback comes in 📤 Homework — the capstone by rubric line, the interview block by block with the two things to practise first. Points are added to the [progress page](progress.md). Then the real ones: send the CV, keep the portfolio link in it, and keep the [interview bank](company/interview.md) open the evening before every interview.

---

### 📎 Hand in here

```sqltask
{"check": "handin-W8D5", "lesson": "W8D5", "title": "Capstone + mock interview", "why": "This is the work you will show in every interview from next week: a question from the top of a company, answered with checked numbers, a dashboard someone can click and a story someone can act on — and the proof that you can say it in ten minutes.", "graded": ["Analysis 30: all five questions and the deep-dive answered with a comparison and a 'so what'", "Correctness 20: the sanity numbers reproduce (Day 3's boxes), definitions written, denominators right, data problems handled and said", "Dashboard 15: two clean pages, numbers equal to the notebook, slicers work, definitions and date visible", "Story 20: answer first, titles that read as a memo, one chart per message, 3–5 recommendations with owner and value", "Presentation 15: 10 minutes ± 1, the answer in the first minute, questions answered with a number or 'I will check'"], "tasks": [{"id": "capstone.ipynb", "file": "capstone.ipynb", "names": ["capstone.ipynb"], "upload": true, "accept": ".ipynb", "q": "Attach `capstone.ipynb` — executed (Restart & Run All, then save), the sanity numbers in cells, one section per question."}, {"id": "capstone_deck.pdf", "file": "capstone_deck.pdf", "names": ["capstone_deck.pdf"], "upload": true, "accept": ".pdf", "q": "Attach `capstone_deck.pdf` (10 slides) — or the 2-page memo, renamed to this file name."}, {"id": "capstone_dashboard.pdf", "file": "capstone_dashboard.pdf", "names": ["capstone_dashboard.pdf"], "upload": true, "accept": ".pdf", "q": "Attach the PDF of your two dashboard pages (the `.pbix` or `.xlsx` goes in Extra)."}, {"id": "issue_tree.md", "file": "issue_tree.md", "text": true, "minLines": 3, "q": "Write `issue_tree.md` here — Wednesday's tree, updated if it changed, with the definitions block."}, {"id": "speaker_notes.md", "file": "speaker_notes.md", "text": true, "minLines": 3, "optional": true, "q": "If you present live: `speaker_notes.md` — what you say per slide, in full sentences. If you recorded `capstone_talk.mp4`, attach it in Extra instead."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "The `.pbix` / `.xlsx`, the talk recording, or anything else (one more file, or a .zip of several)."}]}
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
{"id": "w08d5", "python": true, "q": "In the case (B3) the interviewer accepts that one month's 'FPD doubled' is one extra default and asks for the number you would put on the weekly monitor instead: the app's FPD30 pooled over the last three readable vintages, May, June and July 2026 (loans disbursed in those months, in FPD30 scope, clean payments). What is the UPPER limit of its 95 % Wilson interval? Give a percentage to 3 decimals.", "type": "number", "dp": 3, "h": ["800b09b71e13480ec966aaa1"], "hint": "Pool the counts first (Σ FPD over Σ loans), then build one interval — not three intervals averaged.", "sol": "YSA9IGZbKGZbImNoYW5uZWwiXSA9PSAiYXBwIikgJiAoZlsiZGlzYnVyc2VkX2F0Il0gPj0gIjIwMjYtMDUtMDEiKSAmIChmWyJkaXNidXJzZWRfYXQiXSA8ICIyMDI2LTA4LTAxIildCmssIG4gPSBhWyJmcGQzMCJdLnN1bSgpLCBsZW4oYSkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgMSArIDEgKyAyID0gNCBGUERzIGluIDEzMSArIDEzNiArIDEyMiA9IDM4OSBsb2Fucwpwcm9wb3J0aW9uX2NvbmZpbnQoaywgbiwgYWxwaGE9MC4wNSwgbWV0aG9kPSJ3aWxzb24iKSAgICAgICAgICAgICMgKDAuMDA0MDEsIDAuMDI2MTQpCgo0IC8gMzg5ID0gMS4wMyAlLCBXaWxzb24gOTUgJSAwLjQw4oCTMi42MSAlOiBwb29sZWQgb3ZlciBhIHF1YXJ0ZXIsIHRoZSBhcHAncyByZWNlbnQgRlBEMzAgaXMsIGlmIGFueXRoaW5nLCBiZWxvdyBpdHMgbG9uZy1ydW4gMS43MCAlLCBhbmQgdGhlIHNpbmdsZSAnZG91YmxlZCcgbW9udGggc2l0cyBjb21mb3J0YWJseSBpbnNpZGUgdGhlIGludGVydmFsLgpUaGUgdXBwZXIgbGltaXQgaXMgdGhlIGxpbmUgd29ydGggd2F0Y2hpbmc6IGl0IGp1c3QgdG91Y2hlcyBNaWNybydzIGJyZWFrLWV2ZW4gRlBEIG9mIGFib3V0IDIuNSAlIChEYXkgMiksIHNvIHRocmVlIG1vbnRocyBvZiBkYXRhIGNhbm5vdCB5ZXQgcHJvbWlzZSB0aGUgZ3VhcmRyYWlsIGhvbGRzLgpGb3IgdGhlIGludGVydmlld2VyOiAnSSB3b3VsZCByZXBvcnQgdGhlIHJvbGxpbmcgdGhyZWUtdmludGFnZSByYXRlIHdpdGggaXRzIGludGVydmFsIGFuZCBuLCBhbmQgYWxhcm0gb25seSB3aGVuIHRoZSBsb3dlciBsaW1pdCBjcm9zc2VzIHRoZSBicmVhay1ldmVuIOKAlCBub3Qgd2hlbiBvbmUgbW9udGggb2YgMTIyIGxvYW5zIGhhcyB0d28gZGVmYXVsdHMuJw=="}
```

<!-- challenge:end -->
