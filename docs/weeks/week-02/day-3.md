# Week 2 · Day 3 — Strings, numbers and dates: cleaning as you query

<span class="badge">Learn 60 min</span> <span class="badge">Detective 30 min</span> <span class="badge">Practice 50 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Wednesday, 9:05.** Sevara, head of collections, has two things. *"One: my team logs every payment, and I want to know for each one how many days late it was, and the average lateness by product — Micro feels worse than Auto, but I want the number. Two: Timur's 'share of card payments' tile moved 0.3 points overnight and nobody changed anything."* Madina adds a third: *"While you're in the dates — Risk thinks some loans were paid out before the customer applied. Find them."*

## Today in 3 lines

- **Strings:** `UPPER`/`LOWER`/`TRIM`, `LEN`|`LENGTH`, `LEFT`|`SUBSTR`, `REPLACE`, concatenation — enough to make `Card` and `card` one group.
- **Numbers:** `ROUND`, `CAST`, and the integer-division trap that turns 56.55 % into 0.
- **Dates:** extract year/month, difference in days, add months, first day of month, and filter a period **correctly**; you have computed **DPD for every loan** and the bucket table.

---

## 1. Learn — functions change a value on the way out

A **function** takes a value from a row and returns a changed value. Nothing in the table changes; the result does. Functions work in `SELECT`, `WHERE`, `GROUP BY`, `ORDER BY` and `HAVING`. This is the day the two dialects differ most, so every example shows both.

> 💡 **Key idea.** A function changes a value on its way out of the query — `LOWER(method)` shows `card` for `Card`, but the table still holds `Card`. Whatever you group or filter on, group or filter on the *same* expression.

### Strings (*строковые функции*)

| Does | SQL Server | SQLite | On our data |
|---|---|---|---|
| upper / lower case | `UPPER(s)`, `LOWER(s)` | same | `LOWER('CASH ')` → `'cash '` |
| remove spaces at the ends | `TRIM(s)` (also `LTRIM`, `RTRIM`) | `TRIM(s)` | `TRIM('CASH ')` → `'CASH'` |
| length | `LEN(s)` (ignores trailing spaces!) | `LENGTH(s)` | `LENGTH('Bobur ')` → 6 |
| first n characters | `LEFT(s, n)` | `SUBSTR(s, 1, n)` | `SUBSTR(phone, 1, 6)` → `'+99890'` |
| part from position | `SUBSTRING(s, start, n)` | `SUBSTR(s, start, n)` | |
| replace text | `REPLACE(s, 'old', 'new')` | same | `REPLACE(phone, '+998', '8')` |
| join texts | `a + ' ' + b` or `CONCAT(a, ' ', b)` | `a \|\| ' ' \|\| b` | `first_name \|\| ' ' \|\| last_name` |

> ⚠️ **Watch out.** SQL Server's `LEN` ignores trailing spaces: `LEN('Bobur ')` is 5, SQLite's `LENGTH('Bobur ')` is 6. A length test that finds dirty names on one engine finds nothing on the other — on SQL Server compare `DATALENGTH` instead.

The one that fixes yesterday's P9:

```sql
SELECT LOWER(TRIM(method)) AS method, COUNT(*) AS payments
FROM payments
GROUP BY LOWER(TRIM(method))
ORDER BY payments DESC;
-- card 17621 · payme 8900 · click 8790 · cash 8790 · transfer 8747 · bank transfer 27
```

Six rows, not ten — `Card`→`card`, `CASH `→`cash`, `PayMe`→`payme`, `Click`→`click`. The last stray is a different *word*, so case and spaces cannot fix it: `REPLACE(LOWER(TRIM(method)), 'bank transfer', 'transfer')` → five rows, transfer 8 774. Wrap the expression once and reuse it everywhere; week 3 turns it into a view so nobody retypes it.

How many rows were dirty? `WHERE method <> LOWER(TRIM(method)) OR method LIKE 'bank%'` → **180** on SQLite. (SQL Server's default collation ignores case and trailing spaces, so there the same test finds only the 27 `bank transfer` rows; write `method <> LOWER(TRIM(method)) COLLATE Latin1_General_CS_AS` to get the same 180.) Small number, five phantom categories — Timur's tile moved because 0.3 % of the payments were spelt differently.

Which spelling belongs to which engine? Sort them before you go on — you will translate between the two all day:

```game
{"id": "w02d3-g1", "type": "sort", "title": "SQL Server, SQLite, or both?", "groups": {"SQL Server": ["LEN(s)", "DATEDIFF(day, a, b)", "DATEADD(month, 1, d)", "a + ' ' + b"], "SQLite": ["LENGTH(s)", "julianday(b) - julianday(a)", "date(d, '+1 month')", "a || ' ' || b"], "Both": ["LOWER(TRIM(s))", "REPLACE(s, 'old', 'new')", "ROUND(x, 2)"]}}
```

### Numbers (*числовые функции*)

**Integer division.** Both engines divide two integers *as integers*: `7917 / 14000` → **0**. The approval rate becomes zero, silently. Make one side a decimal — multiply by `1.0` or `100.0`, or `CAST`:

```sql
SELECT 7917 / 14000,            -- 0
       7917 * 100 / 14000,      -- 56   (integer again: truncated, not rounded)
       7917 * 100.0 / 14000,    -- 56.55
       ROUND(7917 * 100.0 / 14000, 2);   -- 56.55
-- SQL Server alternative: CAST(7917 AS FLOAT) / 14000
```

> ⚠️ **Watch out.** Whole number ÷ whole number = whole number, on SQL Server and SQLite alike: `7917 / 14000` is 0 and `7917 * 100 / 14000` is 56, not 56.55. No error, no warning — just a wrong rate. Put `100.0 *` at the front of every percentage.

Rule: put `100.0 *` at the *front* of every percentage. **`ROUND(x, n)`** rounds to n decimals; `ROUND(x)` to a whole number; `ROUND(x, -6)` to the nearest million (SQL Server; SQLite rounds to a whole number — divide first). **`CAST(x AS type)`** converts: `CAST(AVG(principal) AS INTEGER)` → 51 709 667 — CAST cuts the decimals off, it does not round (SQL Server: `AS BIGINT`); `CAST(julianday(...) AS INTEGER)` turns SQLite's fractional days into whole days. For money reports, divide by a billion and round once: `ROUND(SUM(principal) / 1000000000.0, 1)` → SME 241.1 bn, Auto 84.8, Consumer 65.1, Micro 7.2, BNPL 6.5.

Timur's approval tile shows 0 % for every channel. Find the line:

```game
{"id": "w02d3-g2", "type": "bug", "title": "The approval rate that was always zero", "q": "Every channel shows approval_pct = 0. One line is wrong.", "code": "SELECT channel,\n       COUNT(*) AS applications,\n       SUM(status LIKE 'approved%') / COUNT(*) * 100 AS approval_pct\nFROM applications\nGROUP BY channel;", "answer": [2], "why": "Both SUM(…) and COUNT(*) are whole numbers, so 2915 / 5006 is 0 before it is ever multiplied by 100. Write 100.0 * SUM(…) / COUNT(*) — the decimal goes first."}
```

### Dates (*функции дат*)

SQL Server stores dates as a date type; SQLite stores ours as text `YYYY-MM-DD` (and `applied_at`, `event_time` as `YYYY-MM-DD HH:MM:SS`). Text in that format sorts and compares correctly, which is why week 1's `WHERE applied_at >= '2025-01-01'` worked. For arithmetic you need functions:

| Does | SQL Server | SQLite |
|---|---|---|
| year, month as numbers | `YEAR(d)`, `MONTH(d)` | `CAST(strftime('%Y', d) AS INTEGER)`, `strftime('%m', d)` |
| year-month label | `FORMAT(d, 'yyyy-MM')` | `strftime('%Y-%m', d)` |
| difference in days (b − a) | `DATEDIFF(day, a, b)` | `julianday(b) - julianday(a)` |
| add / subtract time | `DATEADD(month, 1, d)`, `DATEADD(day, -30, d)` | `date(d, '+1 month')`, `date(d, '-30 days')` |
| first day of the month | `DATEFROMPARTS(YEAR(d), MONTH(d), 1)` | `date(d, 'start of month')` |
| date part of a datetime | `CAST(dt AS DATE)` | `date(dt)` |
| weekday | `DATENAME(weekday, d)` | `strftime('%w', d)` (0 = Sunday) — or join `dim_date` |

```sql
-- how old is loan 1 on the as-of date?
SELECT DATEDIFF(day, disbursed_at, '2026-10-01') FROM loans WHERE loan_id = 1;                      -- SQL Server
SELECT CAST(julianday('2026-10-01') - julianday(disbursed_at) AS INTEGER) FROM loans WHERE loan_id = 1;  -- SQLite → 552
```

Our `dim_date` table is the no-function alternative: `JOIN dim_date d ON d.date_key = l.disbursed_at` and then `GROUP BY d.year, d.month_name` — identical on both engines, and it already knows weekends (2 206 of 7 828 loans were disbursed on a Saturday or Sunday — this synthetic company never closes).

**Filtering a period — the trap you met in week 1 B10.** Never `BETWEEN '2026-09-01' AND '2026-09-30'` on a column that may carry a time: September 30th's 23 applications made after midnight are lost (598 instead of 621). Also never `strftime('%Y-%m', applied_at) = '2026-09'` in a `WHERE` on a big table — it computes a function on every row and defeats indexes (week 3). The right shape, always:

```sql
WHERE applied_at >= '2026-09-01' AND applied_at < '2026-10-01'     -- half-open: start inclusive, next period exclusive
```

It works for dates, datetimes, months of 28–31 days and year ends alike. Make it a habit today; week 3's performance chapter will thank you.

> ⚠️ **Watch out.** `BETWEEN '2026-09-01' AND '2026-09-30'` reads as "all of September" but stops at 30 September **00:00:00** — every application made later that day is gone (23 of them here).

> 💡 **Key idea.** One shape for every period: `col >= start AND col < start of the next period`. Start inclusive, next period exclusive — right for dates, datetimes, any month length and year ends.

Fill the gaps of Sevara's September filter:

```game
{"id": "w02d3-g3", "type": "cloze", "title": "The half-open filter", "text": "SELECT COUNT(*) FROM applications\nWHERE applied_at {{0}} '2026-09-01'\n  AND applied_at {{1}} {{2}};", "blanks": [[">="], ["<"], ["'2026-10-01'"]], "distractors": ["<=", "'2026-09-30'", "BETWEEN"]}
```

### Depth (optional)

- ▶ Baraa, *String functions* [4:52:58](https://youtu.be/SSKVgrwhzus?t=17578&end=19124), *Numeric* [5:18:44](https://youtu.be/SSKVgrwhzus?t=19124&end=19368), *Date & time* [5:22:48](https://youtu.be/SSKVgrwhzus?t=19368&end=25146) — 1 h 20 total; SQL Server syntax throughout, use the table above to translate.
- RU deck (TBC Data Analytics 2.0, if you have it) `2.2 SQL-1-38.pdf` — functions pages. *Russian terms:* строковые функции = string functions, преобразование типов = CAST, целочисленное деление = integer division, разница дат = date difference.

```videoquiz
{"video": "SSKVgrwhzus", "stops": [
  {"at": 18050, "q": "A column holds 'CASH ' with a space at the end. Which function gives back 'CASH'?", "options": ["UPPER", "TRIM", "LEN", "SUBSTRING"], "answer": 1, "explain": "TRIM removes spaces at both ends (LTRIM / RTRIM one end only); UPPER and LOWER change case, not spaces.", "back": 60},
  {"at": 18800, "q": "What does REPLACE(phone, '+998', '8') do?", "options": ["Deletes the whole phone number", "Swaps every '+998' inside the value for '8'", "Keeps only the first 8 characters", "Changes the column in the table permanently"], "answer": 1, "explain": "REPLACE swaps one piece of text for another in the value it returns; the table itself does not change.", "back": 60},
  {"at": 19300, "q": "What does ROUND(3.516, 2) return?", "options": ["3.51", "3.52", "4", "3.5"], "answer": 1, "explain": "ROUND(x, n) rounds to n decimals: 3.516 → 3.52. CAST to an integer would cut the decimals off instead of rounding.", "back": 45},
  {"at": 22000, "q": "DATEDIFF(day, '2026-09-01', '2026-10-01') — what is the result?", "options": ["-30", "30", "1", "0"], "answer": 1, "explain": "DATEDIFF(part, start, end) counts from the first date to the second: 30 days. SQLite writes it julianday(end) - julianday(start).", "back": 60}]}
```

---

## 2. Worked example — loans paid out before they were requested (detective, 30 min)

Madina's tip: *some loans were disbursed before the customer applied.* That is a date comparison across two tables.

**Step 1 — the distribution.** Days from application to disbursement, per loan, counted:

```sql
-- SQL Server: DATEDIFF(day, CAST(a.applied_at AS DATE), l.disbursed_at)
SELECT CAST(julianday(l.disbursed_at) - julianday(date(a.applied_at)) AS INTEGER) AS days_to_disburse, COUNT(*)
FROM loans l JOIN applications a ON a.application_id = l.application_id
GROUP BY days_to_disburse ORDER BY days_to_disburse;
```

<details><summary>What you see</summary>

Values 0 to 7 carry 7 816 loans (0 days: 925 — the app channel pays out the same day; 3 days is the mode with 1 670). Then ten rows at the top of the list with **negative** days: −29, −26, −24 (two), −23 (two), −20, −18, −17, −15, −12, −6 — one or two loans each. A negative difference means disbursed *before* applied.

</details>

**Step 2 — list them.**

```sql
SELECT l.loan_id, l.application_id, date(a.applied_at) AS applied, a.decided_at, l.disbursed_at,
       CAST(julianday(l.disbursed_at) - julianday(date(a.applied_at)) AS INTEGER) AS days, l.status
FROM loans l JOIN applications a ON a.application_id = l.application_id
WHERE l.disbursed_at < date(a.applied_at)
ORDER BY days;
```

How many loans were paid out before their application was submitted?

```task
{"id": "w02d3-d1", "kind": "number", "answer": 12, "dp": 0, "unit": "loans", "hint": "Run the Step 2 query and read the row count under the result.", "model": "12 loans — 0.15 % of the book. The same 12 come back with l.disbursed_at < a.decided_at."}
```

<details><summary>Result</summary>

**12 loans.** The first row: loan 2244 (application 3969), applied 2026-09-27, disbursed 2026-08-29 — 29 days before the request. Eight are closed, four active; they were disbursed between 2024-12 and 2026-08, all Micro, Consumer or BNPL loans. Now look at their schedules: loan 1039's first instalment is due 2025-02-07 — one month after **2025-01-07**, not after the stored 2024-12-20. The schedule was built from the real disbursement date; only `disbursed_at` was overwritten later (a re-import, a manual correction gone wrong). Memo line for Timur: *12 loans (0.15 %) have `disbursed_at` 6–29 days earlier than `applications.applied_at`; the first due date minus one month gives the true date, 0–3 days after `decided_at`, consistent with every other loan; recommend restoring `disbursed_at` from the schedule.* Check also `l.disbursed_at < a.decided_at` — the same 12; nothing else was paid out before its decision.

</details>

**Step 3 — Timur's tile.** Rebuild "share of payments by method" with the cleaned expression and compare with the raw one. The share needs the total number of payments as its denominator; `(SELECT COUNT(*) FROM payments)` is a one-value subquery — week 3's tool; copy it as it stands today.

<details><summary>Result</summary>

```sql
SELECT REPLACE(LOWER(TRIM(method)), 'bank transfer', 'transfer') AS method,
       COUNT(*) AS payments, ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM payments), 1) AS share_pct
FROM payments GROUP BY 1 ORDER BY payments DESC;
-- card 17621 (33.3 %) · payme 8900 (16.8) · click 8790 (16.6) · cash 8790 (16.6) · transfer 8774 (16.6)
```
Raw `card` was 17 564 = 33.2 % on SQLite (SQL Server's default collation already puts `Card` with `card`); the tile moved by the 57 `Card` rows. Nothing changed overnight except which rows the cashier's software capitalised.

</details>

---

## 3. Practice (50 min)

Questions whose answer is a query have a box under them — write, **▶ Run**, then **✔ Check** compares your result with the answer without showing it; your query is saved in this browser. Questions that ask for a number or a reason have an answer box of their own. Show both dialects where they differ, or say which one you used; the **Database** panel lists every table and column.

**P1.** The 18 customers whose first name has a trailing space, found with a length comparison (not `LIKE`).

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM customers WHERE LENGTH(first_name) <> LENGTH(TRIM(first_name));   -- 18
-- SQL Server: LEN() ignores trailing spaces, so use DATALENGTH(first_name) <> DATALENGTH(TRIM(first_name))
```

</details>

**P2.** One `full_name` column for customers 6001–6003, cleaned: trimmed, first letter logic ignored, surname lower-cased for comparison.

<details><summary>Answer</summary>

```sql
SELECT customer_id, TRIM(first_name) || ' ' || last_name AS full_name, LOWER(TRIM(first_name)) || ' ' || LOWER(last_name) AS match_key
FROM customers WHERE customer_id BETWEEN 6001 AND 6003;   -- 'MALIKA jalilova' / 'malika jalilova', 'LOLA saidova', 'Bobur rakhimov'
```
The `match_key` is what last Thursday's duplicate search grouped on.

</details>

**P3.** Share of total due that is interest, per product, one decimal. Which product is 0 %, and why?

<details><summary>Answer</summary>

```sql
SELECT p.name, ROUND(100.0 * SUM(i.interest_due) / SUM(i.total_due), 1) AS interest_pct
FROM installments i JOIN loans l ON l.loan_id = i.loan_id JOIN products p ON p.product_id = l.product_id
GROUP BY p.name;      -- Auto 29.5 · SME 23.1 · Consumer 17.5 · Micro 9.0 · BNPL 0.0
```
BNPL has `annual_rate = 0` — the merchant pays, not the borrower. Longer terms → more interest share (Auto 36 months). Without `100.0` the column is all zeros.

</details>

Why is one product at 0.0 %?

```task
{"id": "w02d3-p3", "kind": "choice", "options": ["BNPL charges the borrower no interest — its annual_rate is 0, the merchant pays", "The query divides two integers, so BNPL rounds down to 0", "BNPL loans have no instalments", "Micro loans are too small to carry interest"], "answer": 0, "explain": "BNPL's annual_rate is 0, so its interest_due is 0 on every instalment. Integer division would have zeroed every product, not just one — that is what the 100.0 prevents.", "xp": 1}
```

**P4.** Loans disbursed in September 2026 — with the half-open filter — and the same for applications *submitted* in September, showing the BETWEEN mistake next to it.

<details><summary>Answer</summary>

```sql
SELECT COUNT(*) FROM loans WHERE disbursed_at >= '2026-09-01' AND disbursed_at < '2026-10-01';          -- 361
SELECT COUNT(*) FROM applications WHERE applied_at >= '2026-09-01' AND applied_at < '2026-10-01';       -- 621
SELECT COUNT(*) FROM applications WHERE applied_at BETWEEN '2026-09-01' AND '2026-09-30';               -- 598 (wrong: loses 23)
```

</details>

How many September applications does the `BETWEEN` version lose?

```task
{"id": "w02d3-p4", "kind": "number", "answer": 23, "dp": 0, "unit": "applications", "hint": "Subtract the BETWEEN count from the half-open count.", "model": "621 − 598 = 23: every application made on 30 September after midnight. applied_at carries a time, and BETWEEN stops at '2026-09-30 00:00:00'."}
```

**P5.** Average age in days of active loans on the as-of date, as a whole number.

<details><summary>Answer</summary>

```sql
SELECT ROUND(AVG(julianday('2026-10-01') - julianday(disbursed_at))) FROM loans WHERE status = 'active';   -- 221
-- SQL Server: AVG(DATEDIFF(day, disbursed_at, '2026-10-01'))  (integer average → CAST one side AS FLOAT first)
```

</details>

**P6.** Disbursed loans and amount by month of 2026 using `dim_date` instead of a date function — month number, month name, loans, amount.

<details><summary>Answer</summary>

```sql
SELECT d.month, d.month_name, COUNT(*) AS loans, SUM(l.principal) AS disbursed
FROM loans l JOIN dim_date d ON d.date_key = l.disbursed_at
WHERE d.year = 2026 GROUP BY d.month, d.month_name ORDER BY d.month;
-- January 287 / 17.45 bn … August 358 / 22.29 bn, September 361 / 17.02 bn, October 21 / 0.85 bn (one day)
```
Same numbers as Tuesday's `strftime` version, no dialect difference, and a readable month name for free.

</details>

**P7.** Sevara's first ask: for every payment, days late = paid date − due date (`installments` via `installment_id`). Show the five latest payments and the overall count of late ones.

<details><summary>Answer</summary>

```sql
SELECT p.payment_id, p.loan_id, i.due_date, p.paid_at,
       CAST(julianday(p.paid_at) - julianday(i.due_date) AS INTEGER) AS days_late     -- DATEDIFF(day, i.due_date, p.paid_at)
FROM payments p JOIN installments i ON i.installment_id = p.installment_id
ORDER BY days_late DESC LIMIT 5;                      -- five payments at exactly 60 days
SELECT COUNT(*) FROM payments p JOIN installments i ON i.installment_id = p.installment_id
WHERE p.paid_at > i.due_date;                         -- 6669 of 52875 = 12.6 % late
```
Negative days_late = paid early (34 649 payments); 11 557 on the day; 534 more than 30 days late. The maximum is 60 — the data's borrowers never pay later than two months; after that they stop paying, which is why lateness and DPD are two different measurements.

</details>

**P8.** Sevara's second ask: average lateness by product — over *all* payments, and over *late* payments only.

<details><summary>Answer</summary>

```sql
SELECT pr.name, COUNT(*) AS payments,
       ROUND(AVG(julianday(p.paid_at) - julianday(i.due_date)), 2) AS avg_days_all,
       ROUND(100.0 * SUM(p.paid_at > i.due_date) / COUNT(*), 1) AS late_pct          -- SQL Server: SUM(IIF(p.paid_at > i.due_date, 1, 0))
FROM payments p JOIN installments i ON i.installment_id = p.installment_id
JOIN loans l ON l.loan_id = p.loan_id JOIN products pr ON pr.product_id = l.product_id
GROUP BY pr.name ORDER BY avg_days_all DESC;
```
All payments: Micro **+0.56** days, SME +0.04, Consumer −0.01, BNPL −0.02, Auto **−0.21**; share late: Micro 16.3 %, SME 12.4, Consumer 12.0, BNPL 11.5, Auto 10.1. Late payments only: every product averages 11.0–11.4 days — identical. So Sevara's feeling is right about *how often* Micro is late, not about *how late*: the average over all payments mixes the two. Report both columns and name them; "average lateness" alone is ambiguous.

</details>

Which answer gives Sevara what she actually asked ("Micro feels worse than Auto")?

```task
{"id": "w02d3-p8", "kind": "choice", "options": ["Micro is late more often (16.3 % vs 10.1 % of payments), but a late Micro payment is no later than a late Auto one (about 11 days each)", "Micro payments are 0.56 days late on average, so Micro is worse in every way", "Auto is worse: its average is −0.21 days", "There is no difference: late payments average 11 days in every product"], "answer": 0, "explain": "Frequency (share late) and severity (days of the late payments) are two numbers. Micro differs on the first, not the second; the all-payments average blends them into one misleading figure.", "xp": 1}
```

**P9.** By risk grade: share of late payments and average days over all payments. Does the scorecard order the grades?

<details><summary>Answer</summary>

```sql
SELECT l.risk_grade, COUNT(*) AS payments,
       ROUND(100.0 * SUM(p.paid_at > i.due_date) / COUNT(*), 1) AS late_pct,
       ROUND(AVG(julianday(p.paid_at) - julianday(i.due_date)), 2) AS avg_days_all
FROM payments p JOIN installments i ON i.installment_id = p.installment_id
JOIN loans l ON l.loan_id = p.loan_id
GROUP BY l.risk_grade ORDER BY l.risk_grade;
```
A 5.1 % late / −0.87 days · B 9.8 % / −0.31 · C 19.6 % / +1.05 · D 35.6 % / +2.96. Monotonic — the grade predicts payment behaviour. Same shape as P8 with `GROUP BY l.risk_grade`.

</details>

**P10.** Rewrite Tuesday's payments-by-method with the cleaned method *and* average lateness per method. Anything about the 27 `bank transfer` rows?

<details><summary>Answer</summary>

```sql
SELECT REPLACE(LOWER(TRIM(p.method)), 'bank transfer', 'transfer') AS method, COUNT(*) AS payments,
       ROUND(AVG(julianday(p.paid_at) - julianday(i.due_date)), 2) AS avg_days_late
FROM payments p JOIN installments i ON i.installment_id = p.installment_id
GROUP BY REPLACE(LOWER(TRIM(p.method)), 'bank transfer', 'transfer') ORDER BY payments DESC;
SELECT COUNT(*) AS payments, ROUND(AVG(julianday(p.paid_at) - julianday(i.due_date)), 2) AS avg_days_late
FROM payments p JOIN installments i ON i.installment_id = p.installment_id
WHERE p.method = 'bank transfer';
```
card −0.03 days, payme 0.14, click 0.20, cash 0.09, transfer 0.16 — and before merging, `bank transfer` alone averaged **2.11** days: the 27 mis-spelt rows are not a random sample; a different source system logs them, later. Cleaning the label is right; also tell Timur where those 27 come from.

</details>

What do the 27 raw `bank transfer` rows average, in days late? (Two decimals.)

```task
{"id": "w02d3-p10", "kind": "number", "answer": 2.11, "dp": 2, "unit": "days", "hint": "Your second query: WHERE p.method = 'bank transfer', the raw spelling.", "model": "2.11 days, against 0.16 for the cleaned transfer group and −0.03 for card. The 27 rows come from a different source system that logs them later — clean the label, and tell Timur where they come from."}
```

> 🚀 **Stretch (optional, +5 XP).** One more date rule for the curious — not needed to finish the day.

**P11.** Reconstruct the true disbursement date of the twelve detective loans from their schedule: first `due_date` minus one month. How many days after `decided_at` is it for each? Then test the same rule on *all* loans — how many disagree with `disbursed_at`?

<details><summary>Answer</summary>

```sql
SELECT l.loan_id, a.decided_at, l.disbursed_at, i.due_date AS first_due,
       date(i.due_date, '-1 month') AS true_disbursed,                                  -- DATEADD(month, -1, i.due_date)
       CAST(julianday(date(i.due_date, '-1 month')) - julianday(a.decided_at) AS INTEGER) AS lag_days
FROM loans l JOIN applications a ON a.application_id = l.application_id
JOIN installments i ON i.loan_id = l.loan_id AND i.installment_no = 1
WHERE l.disbursed_at < date(a.applied_at) ORDER BY l.loan_id;
SELECT COUNT(*) FROM loans l JOIN installments i ON i.loan_id = l.loan_id AND i.installment_no = 1
WHERE date(i.due_date, '-1 month') <> l.disbursed_at;                                 -- 166
```
Lags of 0–3 days for all twelve (1039 → 2025-01-07, 2 days after the decision; 2244 → 2026-09-30, 3 days) — exactly the lag every normal loan shows. On all 7 828 loans the rule `date(first_due, '-1 month') <> disbursed_at` flags **166**: the 12 real ones plus 154 month-end artefacts (disbursed 2026-01-29 → due 2026-02-28, and February cannot give January 29 back). A date rule needs a tolerance; a "wrong" flag list always needs a look.

</details>

How many loans does the rule flag on the whole book — and how many of them are real errors? Enter the first number.

```task
{"id": "w02d3-p11", "kind": "number", "answer": 166, "dp": 0, "unit": "loans", "hint": "The second query in your box: first instalment's due date minus one month, compared with disbursed_at, over every loan.", "model": "166 flags: the 12 detective loans plus 154 month-end artefacts — a loan paid out on 29–31 January falls due on 28 February, and '28 February − 1 month' is 28 January, not the 29th. A date rule needs a tolerance before its flags are called errors.", "xp": 2}
```

### SQL lab — promises with dates

Dates become numbers only through functions. This lab runs on **your practice copy** of the database (the **Database** panel shows your new table; **Database → Reset** brings the original back).

```sqllab
{"id": "w02d3-lab", "title": "Sevara's promise-to-pay log", "intro": "Sevara's collectors write down every promise to pay: which loan, the day of the call, the day the customer promised to pay by, the amount. Build the log, then let date functions do the counting.",
 "steps": [
  {"say": "Create a table my_promises: promise_id (INTEGER PRIMARY KEY), loan_id (INTEGER), promised_on (TEXT), pay_by (TEXT), amount (INTEGER). Dates are stored as text 'YYYY-MM-DD'.", "hint": "CREATE TABLE my_promises (promise_id INTEGER PRIMARY KEY, loan_id INTEGER, promised_on TEXT, pay_by TEXT, amount INTEGER);", "expect": "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'my_promises'", "want": 1},
  {"say": "Insert these four promises: (1, 2242, '2026-09-28', '2026-10-05', 968400), (2, 4567, '2026-09-29', '2026-10-15', 20000000), (3, 1039, '2026-09-30', '2026-11-02', 500000), (4, 2167, '2026-10-01', '2026-10-31', 1000000).", "hint": "INSERT INTO my_promises (promise_id, loan_id, promised_on, pay_by, amount) VALUES (1, 2242, '2026-09-28', '2026-10-05', 968400), (2, 4567, '2026-09-29', '2026-10-15', 20000000), (3, 1039, '2026-09-30', '2026-11-02', 500000), (4, 2167, '2026-10-01', '2026-10-31', 1000000);", "expect": "SELECT COUNT(*) FROM my_promises", "want": 4},
  {"say": "How many days did each customer ask for? Add a column days_given (INTEGER) and fill it with the whole days from promised_on to pay_by.", "hint": "ALTER TABLE my_promises ADD COLUMN days_given INTEGER; UPDATE my_promises SET days_given = CAST(julianday(pay_by) - julianday(promised_on) AS INTEGER);", "expect": "SELECT SUM(days_given) FROM my_promises", "want": 86},
  {"say": "Add a column pay_month (TEXT) and fill it with the year-month of pay_by, like '2026-10'.", "hint": "ALTER TABLE my_promises ADD COLUMN pay_month TEXT; UPDATE my_promises SET pay_month = strftime('%Y-%m', pay_by);", "expect": "SELECT COUNT(*) FROM my_promises WHERE pay_month = '2026-10'", "want": 3},
  {"say": "Sevara only tracks October. Delete the promises due in November 2026 — with a half-open filter on pay_by, not with pay_month.", "hint": "DELETE FROM my_promises WHERE pay_by >= '2026-11-01' AND pay_by < '2026-12-01';", "expect": "SELECT COUNT(*) FROM my_promises", "want": 3}],
 "cleanup": "DROP TABLE IF EXISTS my_promises"}
```

The 33 days customer 1039 asked for is the kind of number a function gives you in one line and a calendar in five minutes; the half-open delete is the same filter you will write in every period report.

---

## 4. Homework <span class="badge hw">HW 2.2 — Due Day 5</span>

**Sevara's 2026 lateness report, the clean method table, and a new detective case.** Use the payments received from 1 January to 30 September 2026 throughout — a half-open filter on `paid_at` (`>= '2026-01-01' AND < '2026-10-01'`). Write each query in the workspace below; **✔ Check** compares the key numbers with ours without showing them; 📤 Submit sends `lateness.sql` and your notes to your mentor. Write in either dialect and put `-- SQLite` or `-- SQL Server` on the first line.

### 📎 Hand in here

```sqltask
{"check": "hw2.2", "lesson": "W2D3", "title": "HW 2.2 — lateness, methods, under-18 applications", "file": "lateness.sql",
 "why": "Sevara staffs her team on these numbers, Timur's method tile is wrong until the labels are clean, and an approval given to a minor is a compliance problem the board will ask about.",
 "graded": ["Every query passes ✔ Check: the right period filter, the right join, the right numbers", "Frequency and severity kept apart: share late and days of late payments are separate columns", "The notes answer Sevara's and Timur's actual questions in plain words"],
 "tasks": [
  {"id": "Q1", "q": "Days late per payment (the P7 shape) for 2026 payments, and the count of late ones (`paid_at > due_date`)."},
  {"id": "Q2", "q": "By customer segment: payments, share late %, average days over all payments, average days over late payments only — one query, four columns."},
  {"id": "Q3", "q": "The same four columns by region of the branch (from `branches`, not the customer's region)."},
  {"id": "lateness.md", "file": "lateness.md", "text": true, "minLines": 3, "q": "Three sentences for Sevara: which segment is late most often, how late a late payment typically is, and whether any region stands out."},
  {"id": "Q4", "q": "The cleaned payments-by-method table for 2026: five rows (trim, lower-case, 'bank transfer' → 'transfer'), with count, total amount and share %."},
  {"id": "Q5", "q": "How many 2026 payment rows needed cleaning? (One number; on SQL Server add the case-sensitive collation.)"},
  {"id": "fix.md", "file": "fix.md", "text": true, "minLines": 1, "q": "One line for Timur: where does the fix belong — the cashier software, the ETL, or a reference table of methods — and why?"},
  {"id": "Q6", "q": "Applications made by people who were not yet 18 on the day they applied (join to `customers`; compare `date(c.birth_date, '+18 years')` with `date(a.applied_at)`; SQL Server `DATEADD(year, 18, c.birth_date)`, `CAST(a.applied_at AS DATE)`): the number of applications and the number of customers in one result."},
  {"id": "detective.md", "file": "detective.md", "text": true, "minLines": 3, "q": "The case: how many of those applications became loans, how many applicants were 'born after the day they applied' and how many really under 18 — and a memo line for Timur on what it says about the data and about the approval process."}]}
```

---

## 5. Self-check

```check
{"id": "w02d3-sc", "questions": [
  {"type": "single", "q": "Why does `SELECT 7917 / 14000` return 0, and what is the fix?", "options": ["Two whole numbers divide as whole numbers; write 7917 * 100.0 / 14000", "The result is too small to show; use ROUND", "Division needs CAST on the result: CAST(7917 / 14000 AS FLOAT)", "SQLite cannot divide; use SQL Server"], "answer": 0, "explain": "The decimal must be there before the division: CAST of the result is too late, the fraction is already gone (→ section 1, Numbers)."},
  {"type": "single", "q": "Which filter selects the payments received in the first quarter of 2026?", "options": ["paid_at BETWEEN '2026-01-01' AND '2026-03-31'", "paid_at >= '2026-01-01' AND paid_at < '2026-04-01'", "strftime('%m', paid_at) <= '03'", "paid_at > '2026-01-01' AND paid_at < '2026-03-31'"], "answer": 1, "explain": "Half-open: the start inclusive, the next period's start exclusive. BETWEEN loses times on 31 March; the strftime version takes every year's first quarter (→ section 1, Filtering a period)."},
  {"type": "number", "q": "On SQLite, what does `LENGTH('Bobur ')` return?", "answer": 6, "explain": "SQLite counts the trailing space; SQL Server's LEN would say 5 — compare DATALENGTH there (→ section 1, Strings; P1)."},
  {"type": "multi", "q": "Sevara asks for 'average lateness by product'. Which two numbers should you report, named?", "options": ["Share of payments that are late (how often)", "Average days of the late payments (how late)", "Total principal by product", "Number of products"], "answer": [0, 1], "explain": "An average over all payments mixes how often with how late; Micro is late more often, not later (→ P8)."}
]}
```

---

## 6. Company corner <span class="badge company">DPD computed</span>

Week 1 Day 3 gave you the definition and the numbers 413 and 14 / 124 / 25 / 16 / 234 to *read*. Today you produce them.

**DPD (days past due) of a loan on a date** = days since the due date of its **oldest instalment that is not fully paid**. Three steps, each a tool from this week:

1. **Per instalment, how much was paid?** `installments LEFT JOIN payments`, grouped per instalment, summing the payments (LEFT so that unpaid instalments stay, with 0). Keep only matured instalments (`due_date <= as-of`) — and keep only those where *paid < due*. That is a condition on an aggregate → `HAVING`.
2. **Per loan, the oldest such instalment:** `MIN(due_date)` grouped by loan.
3. **Days:** as-of minus that date.

Steps 1 and 2 are two groupings in a row, which needs week 3's CTE (`WITH … AS (…)`) to chain. **This is a read-and-run preview:** run it, read it as two named results; next week you write this shape yourself.

```sql
WITH unpaid AS (                                   -- step 1: matured instalments not fully paid
  SELECT i.installment_id, i.loan_id, i.due_date, i.total_due,
         COALESCE(SUM(p.amount), 0) AS paid        -- COALESCE: NULL (no payment) → 0; Day 4
  FROM installments i
  LEFT JOIN payments p ON p.installment_id = i.installment_id
  WHERE i.due_date <= '2026-10-01'
  GROUP BY i.installment_id, i.loan_id, i.due_date, i.total_due
  HAVING COALESCE(SUM(p.amount), 0) < i.total_due
),
dpd AS (                                           -- step 2 + 3: oldest unpaid per loan, in days
  SELECT loan_id,
         MIN(due_date) AS oldest_unpaid_due,
         CAST(julianday('2026-10-01') - julianday(MIN(due_date)) AS INTEGER) AS dpd,   -- DATEDIFF(day, MIN(due_date), '2026-10-01')
         COUNT(*) AS unpaid_instalments,
         SUM(total_due - paid) AS overdue_amount
  FROM unpaid GROUP BY loan_id
)
SELECT * FROM dpd ORDER BY dpd DESC;
```

**413 rows** — loans with at least one matured instalment not fully paid. Top: loan 2167, oldest unpaid due 2024-03-26, **919 DPD**, 6 unpaid instalments, written off. Loans absent from the result have DPD 0 (nothing overdue) — loan 1 is one of them: its 45-day-late March instalment is paid, so today it owes nothing overdue.

**Buckets** need `CASE` — *tomorrow's tool: read it today, write it tomorrow.* Replace the last line with:

```sql
SELECT CASE WHEN dpd = 0  THEN '0'
            WHEN dpd <= 30 THEN '1-30'
            WHEN dpd <= 60 THEN '31-60'
            WHEN dpd <= 90 THEN '61-90'
            ELSE '90+' END AS bucket,
       COUNT(*) AS loans, SUM(overdue_amount) AS overdue
FROM dpd GROUP BY bucket ORDER BY MIN(dpd);
```

| bucket | loans | overdue (UZS) | who is in it |
|---|---|---|---|
| 0 | 14 | 53 018 776 | instalments due *today* (2026-10-01), unpaid as of this morning — not late yet |
| 1–30 | 124 | 499 314 822 | 111 active loans, 13 "closed" (see below) |
| 31–60 | 25 | 74 348 104 | 24 active, 1 closed |
| 61–90 | 16 | 109 375 982 | all active — Sevara's visit list |
| 90+ | 234 | 6 863 031 110 | exactly the 44 `default` + 190 `written_off` loans |

Same numbers the week-1 page printed: **14 / 124 / 25 / 16 / 234**; 399 loans with DPD > 0. The 90+ bucket equals the status column to the loan — the first check on any portfolio report, and it passes. Two things the computation shows that the status column does not:

- **Partial payments matter.** 427 of the 1 784 unpaid instalments have *some* payment. Count only instalments with *no* payment (Monday's simpler anti-join) and the buckets become 13 / 127 / 24 / 18 / **217**: seventeen defaulted or written-off loans whose unpaid instalments all got a token payment would vanish from 90+. "Not fully paid" is the definition; keep the `HAVING paid < due`.
- **Fifteen "closed" loans have an unpaid matured instalment** (13 in 1–30, 1 in 31–60, 1 at DPD 0) — and they are exactly the 15 closed loans whose `closed_at` is NULL. The system closed them because the schedule ended, not because the money arrived. A finding for Timur; Friday's checkpoint asks about it.

Two more numbers fall out of the same `dpd` result. **PAR30** (portfolio at risk) = outstanding principal of loans with DPD > 30 ÷ total outstanding: 6.51 bn / 208.72 bn = **3.1 %**. And the average DPD of the 151 *active* delinquent loans is 22.7 days (max 89) — the collections team's live caseload is young; the old debt is already written off.

Put the computation in order:

```game
{"id": "w02d3-g4", "type": "order", "title": "DPD in six moves", "items": ["Join every instalment to its payments with a LEFT JOIN", "Sum what was paid per instalment (0 when nothing was paid)", "Keep matured instalments where paid < due (HAVING)", "Per loan, take the oldest such due date (MIN)", "DPD = as-of date − that date", "Bucket the DPD with CASE and check 90+ against the statuses"]}
```

> 🎯 **Interview version.** *"How would you compute DPD in SQL?"* — Per instalment, paid vs due via LEFT JOIN payments with HAVING paid < due; per loan, MIN(due_date) of those; DPD = as-of − that date; bucket with CASE; check that 90+ matches default/written-off statuses; say how partial payments are treated.

**Say it like in an interview.** *"How would you compute DPD for every loan in SQL, and how would you check the result?"* Answer as you would out loud, with Nur Finance numbers.

```task
{"id": "w02d3-iv", "kind": "free", "min": 30, "model": "DPD is the number of days since the due date of a loan's oldest instalment that is not fully paid. Per instalment I LEFT JOIN payments, sum what was paid with COALESCE to 0, and keep matured instalments with HAVING paid < due. Per loan I take MIN(due_date) of those and subtract it from the as-of date, then bucket with CASE. At Nur Finance on 2026-10-01 that gives 413 loans, buckets 14 / 124 / 25 / 16 / 234, and the 234 in 90+ are exactly the 44 default plus 190 written-off loans — that match is my check. I would also say that a partly paid instalment still counts as unpaid; otherwise 17 dead loans fall out of 90+.", "rubric": ["Defines DPD: days since the oldest not-fully-paid instalment's due date", "Describes the steps: LEFT JOIN payments, HAVING paid < due, MIN(due_date) per loan, as-of minus that date", "Names a check: 90+ against default / written-off statuses", "States how partial payments are treated", "Gives a Nur Finance number"], "xp": 2}
```

Tomorrow: NULLs (the `COALESCE` above), CASE for real, and the joins that find what is *missing*.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w02d3", "pass": 0.8, "questions": [
  {"type": "single", "q": "What does this return, on SQL Server and SQLite alike?", "code": "SELECT 7917 / 14000;", "options": ["0.5655", "0", "56.55", "An error"], "answer": 1, "explain": "Two integers divide as integers, so the fraction is cut off; put 100.0 * at the front of every percentage (→ section 1, Numbers)."},
  {"type": "number", "q": "And what does this return?", "code": "SELECT 7917 * 100 / 14000;", "answer": 56, "explain": "Still integer division: 791 700 / 14 000 = 56.55, truncated (not rounded) to 56; 100.0 gives 56.55 (→ section 1, Numbers)."},
  {"type": "single", "q": "Which filter is right for 'payments received in February 2026'?", "options": ["WHERE paid_at BETWEEN '2026-02-01' AND '2026-02-28'", "WHERE paid_at >= '2026-02-01' AND paid_at < '2026-03-01'", "WHERE MONTH(paid_at) = 2", "WHERE paid_at < '2026-02-28'"], "answer": 1, "explain": "Half-open: start inclusive, next period exclusive — safe for dates, datetimes and any month length; MONTH() = 2 takes every year's February (→ section 1, Filtering a period)."},
  {"type": "multi", "q": "GROUP BY LOWER(TRIM(method)) — which raw values end up in the same group?", "options": ["'Card' with 'card'", "'CASH ' with 'cash'", "'PayMe' with 'payme'", "'bank transfer' with 'transfer'"], "answer": [0, 1, 2], "explain": "Case and end spaces are fixed by LOWER and TRIM; a different word needs REPLACE (→ section 1, Strings)."},
  {"type": "single", "q": "On SQL Server, this finds no customers although 18 first names end with a space. Why?", "code": "SELECT COUNT(*) FROM customers\nWHERE LEN(first_name) <> LEN(TRIM(first_name));", "options": ["TRIM does not exist on SQL Server", "LEN ignores trailing spaces, so both sides are equal; compare DATALENGTH instead", "The names are NULL", "<> does not work on numbers"], "answer": 1, "explain": "SQLite's LENGTH counts the space, SQL Server's LEN does not (→ section 1, Strings; P1)."},
  {"type": "single", "q": "How do you find loans that were paid out before the customer applied?", "options": ["WHERE disbursed_at < applied_at on the loans table alone", "Join loans to applications on application_id and keep l.disbursed_at < date(a.applied_at)", "Join loans to customers and compare with registered_at", "Sort loans by disbursed_at and look at the first rows"], "answer": 1, "explain": "applied_at lives in applications, so it is a date comparison across two tables joined on their key (→ section 2, Detective)."},
  {"type": "single", "q": "Sevara asks for 'average lateness by product'. Which pair of numbers keeps that question honest?", "options": ["Average principal and average term", "Share of payments that are late (how often) and average days of the late payments (how late)", "Total late days and number of products", "Maximum and minimum days late"], "answer": 1, "explain": "An average over all payments mixes frequency with severity; report both and name them (→ P8)."},
  {"type": "single", "q": "In the DPD query, why is the condition HAVING COALESCE(SUM(p.amount), 0) < i.total_due, rather than 'instalments with no payment at all'?", "options": ["It runs faster", "A partly paid instalment is still past due; counting only unpaid-at-all ones drops loans from the 90+ bucket", "COALESCE removes duplicate payments", "HAVING is required whenever a JOIN is used"], "answer": 1, "explain": "The definition is the oldest instalment not fully paid; token payments would otherwise hide defaulted loans (→ section 6, Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w02d3", "sql": true, "q": "Sevara wants to know whether bank transfers arrive later than other methods. Take the payments received from 1 January to 30 September 2026, clean the method (trim, lower-case, 'bank transfer' → 'transfer'), keep the cleaned 'transfer' rows, and compute the share paid more than 7 days after the instalment's due date. Percentage to 2 decimals.", "type": "number", "dp": 2, "h": ["e0b2149f10af3b0bcbee4f88"], "hint": "The due date lives in another table, and check what your engine does when it divides one whole number by another.", "sol": "LS0gU1FMaXRlClNFTEVDVCBDT1VOVCgqKSBBUyBwYXltZW50cywKICAgICAgIFNVTShqdWxpYW5kYXkocC5wYWlkX2F0KSAtIGp1bGlhbmRheShpLmR1ZV9kYXRlKSA+IDcpIEFTIGxhdGVfb3Zlcl83LAogICAgICAgUk9VTkQoMTAwLjAgKiBTVU0oanVsaWFuZGF5KHAucGFpZF9hdCkgLSBqdWxpYW5kYXkoaS5kdWVfZGF0ZSkgPiA3KSAvIENPVU5UKCopLCAyKSBBUyBwY3QKRlJPTSBwYXltZW50cyBwCkpPSU4gaW5zdGFsbG1lbnRzIGkgT04gaS5pbnN0YWxsbWVudF9pZCA9IHAuaW5zdGFsbG1lbnRfaWQKV0hFUkUgcC5wYWlkX2F0ID49ICcyMDI2LTAxLTAxJyBBTkQgcC5wYWlkX2F0IDwgJzIwMjYtMTAtMDEnCiAgQU5EIFJFUExBQ0UoTE9XRVIoVFJJTShwLm1ldGhvZCkpLCAnYmFuayB0cmFuc2ZlcicsICd0cmFuc2ZlcicpID0gJ3RyYW5zZmVyJzsKLS0gU1FMIFNlcnZlcjogU1VNKElJRihEQVRFRElGRihkYXksIGkuZHVlX2RhdGUsIHAucGFpZF9hdCkgPiA3LCAxLCAwKSkgZm9yIHRoZSBjb3VudCwgdGhlbiAxMDAuMCAqIHRoYXQgLyBDT1VOVCgqKQotLSA0IDE1NiBwYXltZW50cywgMTg3IG1vcmUgdGhhbiA3IGRheXMgbGF0ZSDihpIgNC41MCAlCk9uIHRoZSByYXcgc3BlbGxpbmcgKG1ldGhvZCA9ICd0cmFuc2Zlcicgb25seSkgeW91IGdldCAxODUgb2YgNCAxNDIgPSA0LjQ3ICU6IHRoZSAxNCAnYmFuayB0cmFuc2Zlcicgcm93cyBvZiAyMDI2IHBheSBsYXRlciB0aGFuIGF2ZXJhZ2UsIHNvIHRoZSBjbGVhbmluZyBtb3ZlcyB0aGUgbnVtYmVyLiBDYXJkIHNpdHMgYXQgNC4wMiAlIGFuZCBwYXltZSBhdCA0LjkwICUsIHNvIHRyYW5zZmVycyBhcmUgaW4gdGhlIG1pZGRsZSDigJQgdGhlIHBheW1lbnQgbWV0aG9kIGlzIG5vdCBTZXZhcmEncyBsYXRlbmVzcyBwcm9ibGVtLiAoVGhlIDI1IGR1cGxpY2F0ZSBwYXltZW50cyBhcmUgc3RpbGwgaW4gdGhlIHRhYmxlOyB3ZWVrIDMgcmVtb3ZlcyB0aGVtLik="}
```

<!-- challenge:end -->
