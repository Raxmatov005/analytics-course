# Week 0 · Day 0 — Where do you stand?

<span class="badge">Self-tests 90 min</span> <span class="badge">My plan 20 min</span> <span class="badge company">Company corner</span>

> STORY **The Friday before.** Your offer letter from Nur Finance says *"Junior Data Analyst, start Monday."* Your future lead, Madina, writes one line: *"Before you come in, tell me honestly what you already know. I'd rather give you hard work than boring work."* Today is that honest answer. Nobody grades this day; it only decides which weeks you can skip.

## Today in 3 lines

- You have taken **five short self-tests** (SQL, Excel, Python, Statistics, BI) without looking anything up.
- For each module you know your score and the rule: **≥ 80 % → skip that week, do only its Friday checkpoint.**
- You have filled the **"my plan"** template and handed it in with the 📎 box on this page.

---

## 0. How to take the tests

1. Paper or a note on your phone. Write the test name, then your answers numbered.
2. **No searching, no running code, no spreadsheet.** A guess is fine; mark it with `?`. The point is to find the gaps, not to look good.
3. Only after finishing a whole test, open its folded key and count. One point per question, half for a partly right answer.
4. The rule, per test: **SQL / Excel / Python / Statistics: 7 of 8 or better = skip. BI: 5 of 6 or better = skip.** SQL has one half step: 5–6 of 8 skips week 1 only. "Skip" means you still do that week's Friday checkpoint; if you fail the checkpoint, you do the week after all.

Many modules will score 0–3. That is the expected starting point of this course, and the course is built for it.

---

## 1. SQL (8 questions, 20 min) → Weeks 1–3

Use this tiny table for questions 3–8. It is called `loans`.

| loan_id | customer_id | product | principal | status |
|---|---|---|---|---|
| 1 | 10 | Micro | 2 000 000 | active |
| 2 | 11 | Auto | 150 000 000 | closed |
| 3 | 10 | Consumer | 12 000 000 | active |
| 4 | 12 | Micro | 900 000 | written_off |
| 5 | 13 | Auto | 90 000 000 | active |

1. What is a **primary key**? One sentence.
2. In the table above, which column would be a **foreign key**, and to which table would it point?
3. How many rows does this return: `SELECT * FROM loans WHERE status = 'active' AND principal > 5000000;`
4. Write a query that returns the **distinct** product names.
5. What does this return: `SELECT COUNT(*) FROM loans WHERE product = 'Micro' OR product = 'Auto';`
6. Write a query for the two loans with the largest principal, largest first (any SQL dialect).
7. What is the difference between `WHERE` and `HAVING`?
8. Write a query that counts loans **per customer** and shows only customers with more than one loan.

<details><summary>Answer key — SQL</summary>

1. A column (or set of columns) whose value is unique on every row and never empty; it identifies the row. Here `loan_id`.
2. `customer_id` → a `customers` table (one customer, many loans).
3. **2** rows (loans 3 and 5; loan 1 is active but 2 000 000 is not > 5 000 000).
4. `SELECT DISTINCT product FROM loans;` → Micro, Auto, Consumer (3 rows).
5. **4** (loans 1 and 4 are Micro, 2 and 5 are Auto; only loan 3 is excluded). If you wrote 3 you skipped a row — counting carefully is the job.
6. SQL Server: `SELECT TOP 2 * FROM loans ORDER BY principal DESC;` · SQLite/Postgres/MySQL: `SELECT * FROM loans ORDER BY principal DESC LIMIT 2;` → loans 2 and 5.
7. `WHERE` filters **rows** before grouping; `HAVING` filters **groups** after `GROUP BY` (so it can use `COUNT`, `SUM`…).
8. `SELECT customer_id, COUNT(*) AS n FROM loans GROUP BY customer_id HAVING COUNT(*) > 1;` → customer 10 with n = 2.

Score /8: _____ · 7+ = skip weeks 1–3 (do the three Friday checkpoints: W1 D5, W2 D5, W3 D5). 5–6 = skip week 1 only.

</details>

---

## 2. Excel / Google Sheets (8 questions, 15 min) → Week 4

1. Cell `B2` holds a price, `E1` holds a VAT rate you want to reuse when you copy the formula down. Write the formula for `C2` so that copying it down keeps pointing at `E1`.
2. What does `=VLOOKUP(A2, Products!A:C, 3, FALSE)` do, word by word? What does `FALSE` change?
3. Column A holds loan statuses, column B amounts. Write a formula for the total amount of rows whose status is `"active"`.
4. Same columns plus column C = region. Write a formula counting rows that are `active` **and** in `Tashkent`.
5. A cell shows `#N/A`. What usually happened?
6. Numbers imported from a bank export are stored as text (left-aligned, `SUM` gives 0). Name one way to turn them into numbers.
7. What is a **pivot table** for? One sentence, and name the four areas you drag fields into.
8. You want every loan with DPD > 90 to turn red automatically. Which feature is that?

<details><summary>Answer key — Excel</summary>

1. `=B2*$E$1` (absolute reference with `$`; `=B2*E$1` also accepted).
2. Take the value in A2, look for it in the **first** column of `Products!A:C`, return the value from the **3rd** column of that range; `FALSE` = exact match only (with `TRUE` it does an approximate match on sorted data and silently returns the wrong row). `XLOOKUP` equivalent also accepted.
3. `=SUMIF(A:A, "active", B:B)`.
4. `=COUNTIFS(A:A, "active", C:C, "Tashkent")`.
5. A lookup (`VLOOKUP`/`XLOOKUP`/`MATCH`) did not find the value.
6. Any of: multiply by 1 / `VALUE()`; *Data → Text to Columns → Finish*; paste-special *Multiply* by 1; fix the thousands separator / decimal comma first; Power Query *Change type*.
7. Summarise a long table by groups without formulas (sum/count/average per category). Areas: **Rows, Columns, Values, Filters**.
8. **Conditional formatting** (a rule on the DPD column: cell value > 90 → red fill).

Score /8: _____ · 7+ = skip week 4 (do its checkpoint W4 D5).

</details>

---

## 3. Python (8 questions, 20 min) → Week 5

Answer without running anything.

1. What is printed?
   ```python
   x = [3, 8, 1, 8]
   print(len(x), x[0], x[-1])
   ```
2. What is printed?
   ```python
   d = {"micro": 42, "auto": 24}
   d["sme"] = 26
   print(len(d), d["auto"])
   ```
3. What is printed?
   ```python
   total = 0
   for n in [1, 2, 3, 4]:
       if n % 2 == 0:
           total += n
   print(total)
   ```
4. What are the types of `7 / 2` and `7 // 2`, and their values?
5. Write one line that reads `loans.csv` into a pandas DataFrame called `df`.
6. Write one line that shows the first five rows of `df`, and one that shows row count and column count.
7. `df[df["status"] == "active"]` — what does it return?
8. `df.groupby("product")["principal"].sum()` — in words, what does this compute?

<details><summary>Answer key — Python</summary>

1. `4 3 8` (length 4; first element 3; `[-1]` is the last element, 8).
2. `3 24` (a new key was added; dict lookup by key).
3. `6` (even numbers 2 + 4).
4. `7 / 2` → `3.5`, type `float`; `7 // 2` → `3`, type `int` (floor division).
5. `import pandas as pd` then `df = pd.read_csv("loans.csv")`.
6. `df.head()` and `df.shape` (a tuple `(rows, columns)`).
7. A new DataFrame with only the rows whose `status` column equals `"active"` (boolean filtering / a mask).
8. For each product, the sum of `principal` — one number per product, like a pivot table or `GROUP BY product` in SQL.

Score /8: _____ · 7+ = skip week 5 (do its checkpoint W5 D5).

</details>

---

## 4. Statistics (8 questions, 20 min) → Week 6

Use this sample of days-late for 8 payments: **2, 4, 4, 4, 5, 5, 7, 9**.

1. Mean, median and mode of the sample.
2. The variance of this set, treated as a whole population, is 4. What is the **standard deviation**? What does it tell you in words?
3. A ninth payment arrives 60 days late. Which moves more, the mean or the median? Why does that matter for reporting "typical" lateness?
4. Two fair dice are thrown. Probability the sum is 7?
5. Credit scores are roughly normal with mean 660 and SD 60. About what share of applicants scores between 600 and 720?
6. *"Customers who got an SMS reminder paid 12 % more often than those who did not."* Give one reason this does **not** prove the SMS caused it.
7. A test gives **p = 0.03**. Which is correct? (a) there is a 3 % chance the null hypothesis is true; (b) if the null were true, data this extreme or more would appear about 3 % of the time; (c) the effect is 3 %.
8. What is the difference between a **population** and a **sample**, in one lending example?

<details><summary>Answer key — Statistics</summary>

1. Mean = 40 / 8 = **5**; median = (4 + 5) / 2 = **4.5**; mode = **4**.
2. SD = √4 = **2** days. Typical distance of a value from the mean is about 2 days.
3. The **mean** jumps (to 100 / 9 ≈ 11.1) while the median moves only to 5. Outliers drag the mean; for "typical" lateness report the median (or both).
4. 6 of 36 combinations → **1/6 ≈ 16.7 %**.
5. 600–720 is mean ± 1 SD → about **68 %** (the 68–95–99.7 rule).
6. Any of: who gets an SMS is not random (e.g. only customers with a valid phone / lower risk); better customers may opt in; the groups differ in product, region or time; reverse timing (they paid, then got a "thank you" SMS). Correlation is not causation — you need a randomised test (week 7).
7. **(b)**. (a) is the most common misreading; (c) confuses p-value with effect size.
8. Population = every loan Nur Finance ever issued; sample = the 500 loans you pulled for a manual file review. Statistics lets you say something about the first from the second, with an error margin.

Score /8: _____ · 7+ = skip week 6 (do its checkpoint W6 D5).

</details>

---

## 5. BI / Power BI (6 questions, 15 min) → Week 7

1. What is a **dashboard** for, and how is it different from a 20-page report?
2. In Power BI, what is the difference between a **calculated column** and a **measure**?
3. Write a DAX measure that counts rows of a table `loans`.
4. You have `fact_loans` and `dim_product`. On which column do you relate them and in which direction does the filter flow?
5. What is a **slicer**?
6. Import mode vs **DirectQuery**: one sentence each, and when would a bank's risk team pick DirectQuery?

<details><summary>Answer key — BI</summary>

1. One screen that answers a few fixed questions at a glance, refreshed automatically, for repeated use (every morning); a report is read once, in depth.
2. A calculated column is computed **per row** when the data loads and stored; a measure is computed **at query time** over whatever the visual is filtering (e.g. total per product on one chart, per month on another).
3. `Loan Count = COUNTROWS(loans)` (or `COUNT(loans[loan_id])`).
4. `product_id` on both; one-to-many from `dim_product` (one) to `fact_loans` (many); the filter flows from the dimension to the fact: picking a product filters the loans.
5. A visual filter control on the page (a list, a dropdown, a date range) that filters the other visuals.
6. Import copies the data into the model (fast, refreshed on schedule). DirectQuery leaves the data in the database and sends a query per interaction (always current, slower). Pick DirectQuery when the numbers must be live (intraday collections, a regulatory limit) or the data is too big to import.

Score /6: _____ · 5+ = skip week 7 (do its checkpoint W7 D5; the A/B-testing half of the week still applies unless you also passed Statistics).

</details>

---

## 6. Interpreting your scores

| Module | Score | Rule | Decision |
|---|---|---|---|
| SQL | /8 | 7+ skip W1–3; 5–6 skip W1 | |
| Excel | /8 | 7+ skip W4 | |
| Python | /8 | 7+ skip W5 | |
| Statistics | /8 | 7+ skip W6 | |
| BI | /6 | 5+ skip W7 | |

Three honest notes:

- **Week 8 (product analytics + capstone) and the Company & metrics track are never skipped.** They are the job.
- A skipped week still has a **Friday checkpoint** you must pass. If you fail it, you take the week — no penalty, the checkpoint simply found a gap the test missed.
- If every score is below 4: good. The plan is the full 8 weeks, and the course was written for exactly that start.

---

## 7. "My plan" <span class="badge hw">Submit today</span>

Copy this into the **📎 Hand in here** box below, fill it, tap **📤 Submit**. Keep answers short and true; Madina reads it before Monday.

```markdown
# My plan — [your name], [date]

## Scores
SQL __/8 · Excel __/8 · Python __/8 · Statistics __/8 · BI __/6

## Weeks I will take in full
[e.g. 1, 2, 3, 4, 5, 6, 7, 8]

## Weeks I will skip (checkpoint only)
[e.g. none]

## Hours per study day I can really give
[e.g. 3 h, 19:00–22:00; weekends free]

## Tools on my laptop
- Database: nothing to install — SQL runs on the course website
- Excel or Sheets: [ ] Excel  [ ] Google Sheets
- Python: [ ] installed  [ ] not yet
- Power BI Desktop: [ ] installed  [ ] not yet (Windows only)

## One thing I want to be able to do by the end
[one sentence, e.g. "answer a live SQL question in an interview without panic"]

## Something that worries me about this course
[one or two sentences]
```

Graded on: (a) it is submitted before Day 1, (b) the scores match your answer sheet, (c) the hours are realistic — a plan that says 6 h a day and delivers 2 is worse than one that says 2.

---

## 8. Self-check

1. If you score 6/8 in SQL, which weeks do you take? *(→ section 6)*
2. Does a skipped week remove its Friday checkpoint? *(→ section 0, rule 4)*
3. Where does the plan file go, and what is its name? *(→ section 7)*

---

## 9. Company corner <span class="badge company">What a lending analyst does</span>

Before the vocabulary comes a picture. A lending company (*кредитная организация*) makes money by lending it at a rate and losing some of it when people do not pay back. Every team's question is one of two:

- **"Are we lending enough, to the right people?"** — applications, approval rate, disbursements, ticket size, channel. The *growth* side.
- **"Are they paying us back?"** — days past due (*просрочка*), buckets, first-payment default, write-offs, recoveries. The *risk* side.

An analyst sits between the two. A typical week: Monday a portfolio manager asks how September's disbursements split by product; Tuesday collections asks which borrowers crossed 30 days late; Wednesday risk asks whether a new scoring rule changed the approval rate; Thursday somebody's number does not match somebody else's and you find out why. Everything you learn in the eight weeks — SQL, Excel, Python, statistics, BI — is a different tool for those same questions.

> Interview version: *"What does a data analyst do in a lending company?"* — "Turn the database into answers for two questions: are we lending well, and are we being repaid. I pull the data with SQL, check it, summarise it in a report or dashboard, and explain what changed and why."

Monday: Week 1, Day 1 — how a company keeps its data.

---

### 📎 Hand in here

```sqltask
{"check": "handin-W0D0", "lesson": "W0D0", "title": "Day 0 plan", "tasks": [{"id": "my-plan.md", "file": "my-plan.md", "text": true, "minLines": 3, "q": "Write `my-plan.md` here — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w00d0", "pass": 0.8, "questions": [
  {"type": "single", "q": "In the middle of a self-test you meet a question you do not know. What do you do?", "options": ["Search it quickly, then answer", "Run the code or query to check", "Write your best guess and mark it with ?", "Open the answer key for that one question"], "answer": 2, "explain": "The tests exist to find gaps, so no searching or running anything; a marked guess is fine (→ section 0)."},
  {"type": "single", "q": "Your SQL self-test score is shown below. Which SQL weeks do you take in full?", "code": "SQL 6/8", "options": ["Weeks 1, 2 and 3", "Weeks 2 and 3 (week 1 skipped)", "None — skip weeks 1–3", "Only week 1"], "answer": 1, "explain": "7+ skips weeks 1–3; 5–6 skips week 1 only (→ section 6)."},
  {"type": "multi", "q": "These are your five scores. Which weeks do you skip (checkpoint only)?", "code": "SQL 7/8 · Excel 5/8 · Python 8/8 · Statistics 6/8 · BI 5/6", "options": ["Weeks 1–3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"], "answer": [0, 2, 4], "explain": "7 of 8 skips SQL and Python, 5 of 6 skips BI; Excel 5 and Statistics 6 are below the bar, and week 8 is never skipped (→ section 6)."},
  {"type": "single", "q": "You skip week 4 because Excel scored 7/8. What must you still do?", "options": ["Nothing — the week is done", "Pass week 4's Friday checkpoint (W4 D5)", "All of week 4's homework", "Take the Excel self-test again on Monday"], "answer": 1, "explain": "Skip means checkpoint only; if you fail it, you take the week after all (→ section 0, rule 4)."},
  {"type": "single", "q": "Which part of the course is never skipped, whatever your scores?", "options": ["Week 1 (SQL basics)", "Week 8 (product analytics + capstone) and the Company & metrics track", "Week 7 (BI)", "Day 0's self-tests"], "answer": 1, "explain": "Week 8 and the Company & metrics track are the job itself (→ section 6)."},
  {"type": "number", "q": "BI has only 6 questions. What is the lowest BI score that lets you skip week 7?", "answer": 5, "explain": "BI: 5 of 6 or better = skip; the other four modules need 7 of 8 (→ section 0, rule 4)."},
  {"type": "text", "q": "The hand-in box names the file for your plan. What is that file called?", "answer": ["my-plan.md", "my-plan"], "explain": "The plan is my-plan.md, handed in with the 📎 box on this page before Day 1 (→ section 7)."},
  {"type": "single", "q": "Collections asks which borrowers crossed 30 days late. Which of the two lending questions is that?", "options": ["Are we lending enough, to the right people? (growth)", "Are they paying us back? (risk)", "Neither — it is a marketing question"], "answer": 1, "explain": "Days past due, buckets and write-offs belong to the risk side (→ section 9)."}
]}
```
