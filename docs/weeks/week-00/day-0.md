# Week 0 · Day 0 — Where do you stand?

<span class="badge">Self-tests 90 min</span> <span class="badge">My plan 20 min</span> <span class="badge company">Company corner</span>

> STORY **The Friday before.** Your offer letter from Nur Finance says *"Junior Data Analyst, start Monday."* Your future lead, Madina, writes one line: *"Before you come in, tell me honestly what you already know. I'd rather give you hard work than boring work."* Today is that honest answer. Nobody grades this day; it only decides which weeks you can skip.

> 🧭 **What today is for.** Five short self-tests show what you already know, so the course gives you hard work, not boring work. **Nothing here is graded:** no points, no pass mark, nobody sees your answers in the boxes. The only thing you hand in is your plan.

## Today in 3 lines

- You have taken **five short self-tests** (SQL, Excel, Python, Statistics, BI) without looking anything up.
- For each module you know your score and the rule: **≥ 80 % → skip that week, do only its Friday checkpoint.**
- You have filled the **"my plan"** template and handed it in with the 📎 box on this page.

---

## 0. How to take the tests

1. **Answer in the box under each question.** Your answers are saved in this browser, so you can stop and come back.
2. **No searching, no running code, no spreadsheet.** A guess is fine: pick your best option, or write it and mark it with `?`. The point is to find the gaps, not to look good.
3. **The boxes check as you go.** Choice, number and word boxes show ✓ or ✗ at once with the right answer. On the ✍ questions you write your answer, tap **Compare**, read the model answer and tick what you covered. Count one point per ✓ or *Got it*, half a point per *Partly*.
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

**Q1.** What is a **primary key**?

```task
{"id": "w00d0-sql1", "kind": "choice", "options": ["A column whose value is unique on every row and never empty, so it names exactly one row", "The first column of any table", "A column that stores another table's ID", "The column the table is sorted by"], "answer": 0, "explain": "A primary key identifies the row: unique and never empty. Here it is loan_id. A column that stores another table's ID is a foreign key."}
```

**Q2.** In the table above, which column would be a **foreign key**, and to which table would it point?

```task
{"id": "w00d0-sql2", "kind": "choice", "options": ["loan_id → a customers table", "customer_id → a customers table", "principal → a payments table", "status → a loans table"], "answer": 1, "explain": "customer_id stores the ID of a row in customers: one customer, many loans (customer 10 has two). loan_id is this table's own primary key."}
```

**Q3.** How many rows does this return: `SELECT * FROM loans WHERE status = 'active' AND principal > 5000000;`

```task
{"id": "w00d0-sql3", "kind": "number", "answer": 2, "dp": 0, "unit": "rows", "model": "2 rows: loans 3 and 5. Loan 1 is active, but 2 000 000 is not > 5 000 000."}
```

**Q4.** ✍ Write a query that returns the **distinct** product names.

```task
{"id": "w00d0-sql4", "kind": "free", "min": 4, "model": "SELECT DISTINCT product FROM loans; → Micro, Auto, Consumer (3 rows). SELECT product FROM loans GROUP BY product gives the same three rows.", "rubric": ["SELECT DISTINCT product (or GROUP BY product)", "FROM loans", "knows the result: 3 rows — Micro, Auto, Consumer"]}
```

**Q5.** What does this return: `SELECT COUNT(*) FROM loans WHERE product = 'Micro' OR product = 'Auto';`

```task
{"id": "w00d0-sql5", "kind": "number", "answer": 4, "dp": 0, "model": "4: loans 1 and 4 are Micro, 2 and 5 are Auto; only loan 3 is left out. If you wrote 3 you skipped a row — counting carefully is the job."}
```

**Q6.** ✍ Write a query for the two loans with the largest principal, largest first (any SQL dialect).

```task
{"id": "w00d0-sql6", "kind": "free", "min": 6, "model": "SQL Server: SELECT TOP 2 * FROM loans ORDER BY principal DESC; · SQLite / Postgres / MySQL: SELECT * FROM loans ORDER BY principal DESC LIMIT 2; → loans 2 and 5.", "rubric": ["ORDER BY principal DESC — largest first", "keeps two rows: TOP 2 or LIMIT 2", "knows the result: loans 2 and 5"]}
```

**Q7.** What is the difference between `WHERE` and `HAVING`?

```task
{"id": "w00d0-sql7", "kind": "choice", "options": ["WHERE filters rows before grouping; HAVING filters groups after GROUP BY", "They are the same; HAVING is an older spelling", "WHERE works on numbers, HAVING on text", "HAVING filters rows before grouping; WHERE filters groups after it"], "answer": 0, "explain": "WHERE filters rows before grouping; HAVING filters groups after GROUP BY, so it can use COUNT, SUM…"}
```

**Q8.** ✍ Write a query that counts loans **per customer** and shows only customers with more than one loan.

```task
{"id": "w00d0-sql8", "kind": "free", "min": 8, "model": "SELECT customer_id, COUNT(*) AS n FROM loans GROUP BY customer_id HAVING COUNT(*) > 1; → customer 10 with n = 2.", "rubric": ["GROUP BY customer_id with COUNT(*)", "HAVING COUNT(*) > 1 — not WHERE", "knows the result: customer 10, 2 loans"]}
```

**Your SQL score /8:** 7+ = skip weeks 1–3 (do the three Friday checkpoints: W1 D5, W2 D5, W3 D5). 5–6 = skip week 1 only.

---

## 2. Excel / Google Sheets (8 questions, 15 min) → Week 4

**Q1.** Cell `B2` holds a price, `E1` holds a VAT rate you want to reuse when you copy the formula down. Write the formula for `C2` so that copying it down keeps pointing at `E1`.

```task
{"id": "w00d0-xl1", "kind": "text", "answer": ["=B2*$E$1", "=B2*E$1", "=$E$1*B2", "=E$1*B2", "B2*$E$1", "B2*E$1", "=B2 * $E$1", "=B2 * E$1", "=$E$1 * B2", "=E$1 * B2", "$E$1*B2", "E$1*B2"], "model": "=B2*$E$1 — the $ signs make E1 an absolute reference, so copying down keeps pointing at E1. =B2*E$1 also works: only the row needs locking."}
```

**Q2.** ✍ What does `=VLOOKUP(A2, Products!A:C, 3, FALSE)` do, word by word? What does `FALSE` change?

```task
{"id": "w00d0-xl2", "kind": "free", "min": 15, "model": "Take the value in A2, look for it in the first column of Products!A:C, and return the value from the 3rd column of that range. FALSE = exact match only; with TRUE it does an approximate match on sorted data and silently returns the wrong row. An XLOOKUP equivalent is also right.", "rubric": ["looks A2 up in the first column of Products!A:C", "returns the value from the 3rd column of the range", "FALSE = exact match; TRUE = approximate, which can silently return a wrong row"]}
```

**Q3.** ✍ Column A holds loan statuses, column B amounts. Write a formula for the total amount of rows whose status is `"active"`.

```task
{"id": "w00d0-xl3", "kind": "free", "min": 1, "model": "=SUMIF(A:A, \"active\", B:B) — or =SUMIFS(B:B, A:A, \"active\").", "rubric": ["SUMIF or SUMIFS — not COUNTIF", "the condition is on column A, the sum is of column B", "\"active\" in quotes"]}
```

**Q4.** ✍ Same columns plus column C = region. Write a formula counting rows that are `active` **and** in `Tashkent`.

```task
{"id": "w00d0-xl4", "kind": "free", "min": 1, "model": "=COUNTIFS(A:A, \"active\", C:C, \"Tashkent\")", "rubric": ["COUNTIFS — several conditions at once", "two pairs: A:A with \"active\", C:C with \"Tashkent\""]}
```

**Q5.** A cell shows `#N/A`. What usually happened?

```task
{"id": "w00d0-xl5", "kind": "choice", "options": ["A lookup (VLOOKUP / XLOOKUP / MATCH) did not find the value", "The formula divides by zero", "The column is too narrow to show the number", "A number is stored as text"], "answer": 0, "explain": "#N/A means 'not available': the lookup did not find it. Division by zero shows #DIV/0!, a narrow column shows ####."}
```

**Q6.** Numbers imported from a bank export are stored as text (left-aligned, `SUM` gives 0). Which of these turn them into numbers? Tick every one that works.

```task
{"id": "w00d0-xl6", "kind": "multi", "options": ["Multiply by 1, or VALUE()", "Data → Text to Columns → Finish", "Change the cell format to Number", "Paste Special → Multiply by 1", "Sort the column"], "answer": [0, 1, 3], "explain": "Changing the format alone does not convert text that is already in the cell. Fix a thousands separator or a decimal comma first; Power Query 'Change type' also works."}
```

**Q7.** A **pivot table** summarises a long table by groups (sum, count or average per category) without formulas. Which four areas do you drag fields into?

```task
{"id": "w00d0-xl7", "kind": "multi", "options": ["Rows", "Columns", "Values", "Filters", "Formulas", "Charts"], "answer": [0, 1, 2, 3], "explain": "Rows, Columns, Values and Filters. Charts are built from a pivot, not inside it."}
```

**Q8.** You want every loan with DPD > 90 to turn red automatically. Which feature is that?

```task
{"id": "w00d0-xl8", "kind": "choice", "options": ["Conditional formatting", "Data validation", "A pivot table", "Freeze panes"], "answer": 0, "explain": "A conditional formatting rule on the DPD column: cell value > 90 → red fill."}
```

**Your Excel score /8:** 7+ = skip week 4 (do its checkpoint W4 D5).

---

## 3. Python (8 questions, 20 min) → Week 5

Answer without running anything.

```text
x = [3, 8, 1, 8]
print(len(x), x[0], x[-1])
```

**Q1.** What does the code above print?

```task
{"id": "w00d0-py1", "kind": "text", "answer": ["4 3 8", "4, 3, 8", "(4, 3, 8)"], "model": "4 3 8 — the length is 4; x[0] is the first element, 3; x[-1] is the last element, 8."}
```

```text
d = {"micro": 42, "auto": 24}
d["sme"] = 26
print(len(d), d["auto"])
```

**Q2.** What does the code above print?

```task
{"id": "w00d0-py2", "kind": "text", "answer": ["3 24", "3, 24", "(3, 24)"], "model": "3 24 — a new key was added, so there are 3 keys; d[\"auto\"] looks the value up by its key."}
```

```text
total = 0
for n in [1, 2, 3, 4]:
    if n % 2 == 0:
        total += n
print(total)
```

**Q3.** What does the code above print?

```task
{"id": "w00d0-py3", "kind": "number", "answer": 6, "dp": 0, "model": "6 — only the even numbers are added: 2 + 4."}
```

**Q4.** What are the types of `7 / 2` and `7 // 2`, and their values?

```task
{"id": "w00d0-py4", "kind": "choice", "options": ["3.5 (float) and 3 (int)", "3 (int) and 3 (int)", "3.5 (float) and 3.5 (float)", "3.5 (float) and 4 (int)"], "answer": 0, "explain": "/ always gives a float; // is floor division and keeps an int when both numbers are ints."}
```

**Q5.** Write one line that reads `loans.csv` into a pandas DataFrame called `df` (pandas is imported as `pd`).

```task
{"id": "w00d0-py5", "kind": "text", "answer": ["df = pd.read_csv(\"loans.csv\")", "df = pd.read_csv('loans.csv')", "df=pd.read_csv(\"loans.csv\")", "df=pd.read_csv('loans.csv')", "df = pandas.read_csv(\"loans.csv\")", "df = pandas.read_csv('loans.csv')"], "model": "import pandas as pd, then df = pd.read_csv(\"loans.csv\")."}
```

**Q6.** Which two show the first five rows of `df` and its size as (rows, columns)?

```task
{"id": "w00d0-py6", "kind": "multi", "options": ["df.head()", "df.shape", "df.tail()", "df.size", "df.describe()", "df.columns"], "answer": [0, 1], "explain": "df.head() shows the first five rows; df.shape is a tuple (rows, columns). df.size is rows × columns in one number."}
```

**Q7.** `df[df["status"] == "active"]` — what does it return?

```task
{"id": "w00d0-py7", "kind": "choice", "options": ["A new DataFrame with only the rows whose status is \"active\"", "True or False for the whole table", "The number of active rows", "The status column only"], "answer": 0, "explain": "The inner part is a mask — True or False for every row; df[mask] keeps the True rows (boolean filtering)."}
```

**Q8.** `df.groupby("product")["principal"].sum()` — in words, what does this compute?

```task
{"id": "w00d0-py8", "kind": "choice", "options": ["For each product, the sum of principal — one number per product", "The total principal of all loans", "The number of loans per product", "Every loan, sorted by product"], "answer": 0, "explain": "One number per product, like a pivot table or GROUP BY product in SQL."}
```

**Your Python score /8:** 7+ = skip week 5 (do its checkpoint W5 D5).

---

## 4. Statistics (8 questions, 20 min) → Week 6

Use this sample of days-late for 8 payments: **2, 4, 4, 4, 5, 5, 7, 9**.

**Q1.** Mean, median and mode of the sample?

```task
{"id": "w00d0-st1", "kind": "choice", "options": ["mean 5, median 4.5, mode 4", "mean 5, median 4, mode 4", "mean 4.5, median 5, mode 4", "mean 5, median 4.5, mode 5"], "answer": 0, "explain": "Mean = 40 / 8 = 5; median = the middle two (4 + 5) / 2 = 4.5; mode = the most frequent value, 4."}
```

**Q2.** The variance of this set, treated as a whole population, is 4. What is the **standard deviation**, in days?

```task
{"id": "w00d0-st2", "kind": "number", "answer": 2, "dp": 0, "unit": "days", "model": "SD = √4 = 2 days: a typical value sits about 2 days from the mean."}
```

**Q3.** A ninth payment arrives 60 days late. Which moves more, the mean or the median?

```task
{"id": "w00d0-st3", "kind": "choice", "options": ["The mean — it jumps to about 11.1, while the median only moves to 5", "The median — it jumps to 60", "Both move by the same amount", "Neither moves"], "answer": 0, "explain": "Outliers drag the mean (100 / 9 ≈ 11.1); the median moves only to 5. For 'typical' lateness, report the median (or both)."}
```

**Q4.** Two fair dice are thrown. Probability the sum is 7?

```task
{"id": "w00d0-st4", "kind": "choice", "options": ["1/6 ≈ 16.7 %", "1/12 ≈ 8.3 %", "1/36 ≈ 2.8 %", "7/36 ≈ 19.4 %"], "answer": 0, "explain": "6 of the 36 combinations sum to 7: 1+6, 2+5, 3+4, 4+3, 5+2, 6+1."}
```

**Q5.** Credit scores are roughly normal with mean 660 and SD 60. About what share of applicants scores between 600 and 720?

```task
{"id": "w00d0-st5", "kind": "choice", "options": ["About 68 %", "About 50 %", "About 95 %", "About 99.7 %"], "answer": 0, "explain": "600–720 is the mean ± 1 SD — about 68 % by the 68–95–99.7 rule."}
```

**Q6.** ✍ *"Customers who got an SMS reminder paid 12 % more often than those who did not."* Give one reason this does **not** prove the SMS caused it.

```task
{"id": "w00d0-st6", "kind": "free", "min": 10, "model": "Who gets an SMS is not random — e.g. only customers with a valid phone, or lower-risk ones; better customers may opt in; the groups differ in product, region or time; or the timing is reversed (they paid, then got a 'thank you' SMS). Correlation is not causation — you need a randomised test (week 7).", "rubric": ["names a concrete way the two groups differ (selection, opt-in, product / region / time, reversed timing)", "says correlation is not causation, or that a randomised test is needed"]}
```

**Q7.** A test gives **p = 0.03**. Which reading is correct?

```task
{"id": "w00d0-st7", "kind": "choice", "options": ["(a) there is a 3 % chance the null hypothesis is true", "(b) if the null were true, data this extreme or more would appear about 3 % of the time", "(c) the effect is 3 %"], "answer": 1, "explain": "(b). (a) is the most common misreading; (c) confuses the p-value with the effect size."}
```

**Q8.** ✍ What is the difference between a **population** and a **sample**, in one lending example?

```task
{"id": "w00d0-st8", "kind": "free", "min": 12, "model": "Population = every loan Nur Finance ever issued; sample = the 500 loans you pulled for a manual file review. Statistics lets you say something about the first from the second, with an error margin.", "rubric": ["population = everything you want to know about (e.g. every loan ever issued)", "sample = the part you actually look at (e.g. 500 loans pulled for review)", "you go from the sample to the population with an error margin"]}
```

**Your Statistics score /8:** 7+ = skip week 6 (do its checkpoint W6 D5).

---

## 5. BI / Power BI (6 questions, 15 min) → Week 7

**Q1.** ✍ What is a **dashboard** for, and how is it different from a 20-page report?

```task
{"id": "w00d0-bi1", "kind": "free", "min": 15, "model": "One screen that answers a few fixed questions at a glance, refreshed automatically, for repeated use (every morning); a report is read once, in depth.", "rubric": ["one screen, a few fixed questions, read at a glance", "refreshed automatically and used again and again", "a report is read once, in depth"]}
```

**Q2.** In Power BI, what is the difference between a **calculated column** and a **measure**?

```task
{"id": "w00d0-bi2", "kind": "choice", "options": ["A calculated column is computed per row when the data loads and stored; a measure is computed at query time over whatever the visual filters", "They are the same; a measure is a column with a name", "A measure is stored per row; a calculated column is computed when you click", "A calculated column works only on numbers, a measure only on text"], "answer": 0, "explain": "So a measure gives the total per product on one chart and per month on another — the same formula, different filters."}
```

**Q3.** ✍ Write a DAX measure that counts rows of a table `loans`.

```task
{"id": "w00d0-bi3", "kind": "free", "min": 2, "model": "Loan Count = COUNTROWS(loans) — or COUNT(loans[loan_id]).", "rubric": ["a named measure: Name = …", "COUNTROWS(loans), or COUNT of the key column"]}
```

**Q4.** You have `fact_loans` and `dim_product`. On which column do you relate them, and in which direction does the filter flow?

```task
{"id": "w00d0-bi4", "kind": "choice", "options": ["product_id; one-to-many from dim_product to fact_loans; the filter flows from the dimension to the fact", "product_id; the filter flows from fact_loans to dim_product", "loan_id; many-to-many", "No relationship is needed; a measure does the join"], "answer": 0, "explain": "One product, many loans: picking a product filters the loans."}
```

**Q5.** What is a **slicer**?

```task
{"id": "w00d0-bi5", "kind": "choice", "options": ["A filter control on the page (a list, a dropdown, a date range) that filters the other visuals", "A chart that cuts a pie into slices", "A DAX function that splits a table", "One page of a report"], "answer": 0, "explain": "A slicer is a visible filter the reader clicks; every other visual on the page follows it."}
```

**Q6.** ✍ Import mode vs **DirectQuery**: one sentence each, and when would a bank's risk team pick DirectQuery?

```task
{"id": "w00d0-bi6", "kind": "free", "min": 20, "model": "Import copies the data into the model: fast, refreshed on a schedule. DirectQuery leaves the data in the database and sends a query per interaction: always current, slower. Pick DirectQuery when the numbers must be live (intraday collections, a regulatory limit) or the data is too big to import.", "rubric": ["Import: a copy in the model — fast, refreshed on a schedule", "DirectQuery: data stays in the database, a query per click — always current, slower", "when: numbers must be live, or the data is too big to import"]}
```

**Your BI score /6:** 5+ = skip week 7 (do its checkpoint W7 D5; the A/B-testing half of the week still applies unless you also passed Statistics).

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
- Python: nothing to install for the course — it runs on the pages from week 5 ([ ] I also have Jupyter)
- Power BI Desktop: [ ] installed  [ ] not yet (Windows only)

## One thing I want to be able to do by the end
[one sentence, e.g. "answer a live SQL question in an interview without panic"]

## Something that worries me about this course
[one or two sentences]
```

Graded on: (a) it is submitted before Day 1, (b) the scores match your boxes above, (c) the hours are realistic — a plan that says 6 h a day and delivers 2 is worse than one that says 2.

### 📎 Hand in here

```sqltask
{"check": "handin-W0D0", "lesson": "W0D0", "title": "Day 0 plan", "tasks": [{"id": "my-plan.md", "file": "my-plan.md", "text": true, "minLines": 3, "q": "Write `my-plan.md` here — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```


---

## 8. Self-check

```check
{"id": "w00d0-sc", "questions": [
  {"type": "single", "q": "You score 6/8 in SQL. Which weeks do you take in full?", "options": ["Weeks 1, 2 and 3", "Weeks 2 and 3 — week 1 is skipped", "None of weeks 1–3"], "answer": 1, "explain": "5–6 of 8 skips week 1 only; 7+ would skip all three (→ section 6)."},
  {"type": "single", "q": "Does a skipped week remove its Friday checkpoint?", "options": ["Yes — skipped means skipped", "No — you still have to pass that week's checkpoint"], "answer": 1, "explain": "Skip means checkpoint only; fail it and you take the week after all (→ section 0, rule 4)."},
  {"type": "text", "q": "Your plan goes into the 📎 box on this page. What is the file called?", "answer": ["my-plan.md", "my-plan"], "explain": "my-plan.md, handed in with the 📎 Hand in here box before Day 1 (→ section 7)."}
]}
```

---

## 9. Company corner <span class="badge company">What a lending analyst does</span>

Before the vocabulary comes a picture. A lending company (*кредитная организация*) makes money by lending it at a rate and losing some of it when people do not pay back. Every team's question is one of two:

- **"Are we lending enough, to the right people?"** — applications, approval rate, disbursements, ticket size, channel. The *growth* side.
- **"Are they paying us back?"** — days past due (*просрочка*), buckets, first-payment default, write-offs, recoveries. The *risk* side.

An analyst sits between the two. A typical week: Monday a portfolio manager asks how September's disbursements split by product; Tuesday collections asks which borrowers crossed 30 days late; Wednesday risk asks whether a new scoring rule changed the approval rate; Thursday somebody's number does not match somebody else's and you find out why. Everything you learn in the eight weeks — SQL, Excel, Python, statistics, BI — is a different tool for those same questions.

```game
{"type": "sort", "id": "w00d0-sides", "title": "Growth or risk?", "q": "Put each number on the side of the business it answers.", "groups": {"Growth: are we lending enough, to the right people?": ["Approval rate by channel", "Disbursements in September by product", "Average ticket size", "Applications from the app"], "Risk: are they paying us back?": ["Borrowers more than 30 days late", "First-payment default by vintage", "Loans written off this quarter", "Money recovered after write-off"]}}
```

> 🎯 **Interview version.** *"What does a data analyst do in a lending company?"* Say your answer out loud in 30 seconds, write it below, then compare.

**Your answer.** Two or three sentences, as you would say them to the interviewer.

```task
{"id": "w00d0-interview", "kind": "free", "min": 25, "model": "Turn the database into answers for two questions: are we lending well, and are we being repaid. I pull the data with SQL, check it, summarise it in a report or dashboard, and explain what changed and why.", "rubric": ["names the two questions: are we lending well (growth), are we being repaid (risk)", "says how: pull with SQL, check, summarise in a report or dashboard", "ends with explaining what changed and why"]}
```

Monday: Week 1, Day 1 — how a company keeps its data.

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
