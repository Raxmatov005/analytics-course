# Week 1 · Day 4 — Warehouses, stars and a detective case

<span class="badge">Learn 50 min</span> <span class="badge">Detective 70 min</span> <span class="badge">Homework</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 8:55.** Madina is already at your desk, phone in hand. *"The September board pack says we have 6 040 customers. HR's year-end headcount of registered clients — the one they use for the regulator — says 6 000. Forty people have appeared from nowhere. The CFO wants to know which number is right before the board meets at two. Timur is on holiday. You have the database."* She pauses. *"Also, when you're done, I'll explain why the board pack doesn't come from the database you're querying. It's related."*

## Today in 3 lines

- You can explain **OLTP vs OLAP**, why reports do not run on the production database, and what a **data warehouse** is for.
- You can draw Nur Finance as a **star schema** — fact tables, dimension tables, grain — and say where a **snowflake** differs.
- You have solved the **customer-count case**: found the duplicate people and the impossible birth dates with queries, and know how many real customers there are.

---

## 1. Learn — two kinds of database

### OLTP: the database that runs the company

The `nur` database you have been querying is a copy of an **OLTP** system (*online transaction processing*, транзакционная система). Its job is to record events as they happen: a payment arrives → one row inserted into `payments`, in milliseconds, thousands of times a day, and it must never lose or double-count one. OLTP databases are:

- **normalised** (yesterday's 3NF) so that each fact is written once;
- tuned for **many small writes and single-row reads** ("show me loan 4516");
- **current** — they hold the state *now*; yesterday's balance is gone once today's payment is posted.

### OLAP: the database that answers questions

Your questions are different: *"disbursements by product by month for two years"* reads millions of rows at once and writes nothing. Run that on the OLTP system at 11:00 and the cashier in Fergana waits for her screen while your query scans `payments`. So companies copy the data, usually every night, into a second database shaped for reading: the **data warehouse** (*хранилище данных*, DWH), queried in **OLAP** style (*online analytical processing*). The copy process is **ETL** — extract, transform, load (Baraa builds one in his project: bronze → silver → gold layers).

| | OLTP (production) | OLAP (warehouse) |
|---|---|---|
| Purpose | run the business | understand the business |
| Typical query | insert 1 row; read 1 loan | sum 2 years of payments by month |
| Shape | normalised, many narrow tables | **de**-normalised, few wide tables |
| Data | now | history, snapshots ("balance on each month-end") |
| Users | the app, cashiers, officers | analysts, dashboards, the board pack |

Three reasons reports do not run on production: **load** (your scan slows the cashier), **history** (production overwrites; the warehouse keeps every month-end), **consistency** (a report built at 09:00 and re-run at 09:05 should give the same number; production changed in between). Madina's board pack comes from the warehouse, loaded on 1 October; HR's number comes from a different system. Keep that in mind for the case.

### Facts, dimensions, and the star

Warehouses are built from two kinds of tables — the two kinds you spotted on Day 1:

- **Fact table** (*таблица фактов*): one row per *event or measurement*, with numbers to add up (**measures**: amount, count, days) and keys pointing to the dimensions. Long and narrow; millions of rows.
- **Dimension table** (*таблица измерений*): one row per *thing you slice by* — customer, product, branch, date — with descriptive text (**attributes**: region, segment, product name, month name). Short and wide.

Draw a fact table in the middle and its dimensions around it: a **star schema** (*схема "звезда"*). Every question becomes "sum a measure in the fact, grouped by an attribute of a dimension": *disbursed principal (fact_loans) by region (dim_branch) by month (dim_date)*.

**Grain** (*гранулярность*) is the most important word of the day: *what is one row of the fact table?* One loan? One instalment? One payment? One loan **per month-end** (a snapshot)? Choose the grain first; every measure must make sense at that grain. You cannot store "outstanding balance" in a fact at the grain "one payment" — balance belongs to a loan at a date.

**Snowflake** (*"снежинка"*): a star whose dimensions are themselves normalised — `dim_branch` points to a separate `dim_region`, `dim_product` to `dim_product_family`. Fewer repeated values, more joins. Analysts prefer stars: repeating `region` on each of the ten rows of a wide `dim_branch` costs nothing and saves a join in every query. Warehouses de-normalise *on purpose* — yesterday's rules are for writing; today's are for reading.

### Nur Finance as a star

| Warehouse table | Kind | Grain / one row is | Built from | Measures or key attributes |
|---|---|---|---|---|
| `fact_loans` | fact | one loan | `loans` + `applications` (score, channel) | principal, term, monthly_payment, days_to_disburse; keys → customer, product, branch, officer, disbursed date |
| `fact_payments` | fact | one payment | `payments` + `installments` (due date) | amount, days_late (= paid − due); keys → loan, customer, product, branch, paid date |
| `fact_applications` | fact | one application | `applications` | requested_amount, credit_score, is_approved (0/1); keys → customer, product, branch, channel, applied date |
| `fact_loan_monthly` | snapshot fact | one loan × one month-end | computed from instalments and payments | outstanding, dpd, bucket — the portfolio report lives here |
| `dim_customer` | dimension | one customer | `customers` | region, segment, sex, age band, income band |
| `dim_product` | dimension | one product | `products` | name, code, channel, rate |
| `dim_branch` | dimension | one branch | `branches` (+ region, inline) | branch_name, region |
| `dim_staff` | dimension | one employee | `staff` | role, branch |
| `dim_date` | dimension | one day | `dim_date` (we already ship it) | year, quarter, month, month_name, weekday, is_weekend |

Notice `fact_loans` carries `customer_id`, `product_id` *and* `branch_id` directly, although in OLTP the branch was reachable through the application. In a star, every fact points at every dimension you want to slice by — the controlled denormalisation of yesterday's P8, made the rule. And `dim_date` is why we have had a calendar table since Day 1: "by month", "weekends only", "quarter over quarter" all become a join to one small table.

### Depth (optional)

- ▶ Baraa, *Project: Data warehouse* [23:21:04](https://youtu.be/SSKVgrwhzus?t=84064) — watch the first 20 min (what a warehouse is, bronze/silver/gold). The rest is for after week 3.
- RU decks `1.3 NoSQL, OLAPOLTP & Data Architecture.pdf` (OLTP/OLAP pages, архитектура данных) and `1.4 Dimensional Modeling Star & Snowflake Schemas.pdf` (факты, измерения, звезда, снежинка, гранулярность).

---

## 2. Worked example — choosing a grain

Bekzod wants *"the outstanding balance of the Auto portfolio at every month-end for 2026"*. Which fact answers it?

- `fact_loans` (one loan)? It has principal, not balance; and a loan has one row, not one per month. **No.**
- `fact_payments` (one payment)? Balance is not a payment attribute; summing payments gives *what came in*, not *what is left*. **No.**
- `fact_loan_monthly` (one loan per month-end)? Balance at a date is exactly its grain. Sum `outstanding` where product = Auto, grouped by month-end. **Yes.**

That is the whole method: *write the question, find the noun that is "one row", pick the table with that grain.* When no table has that grain, the warehouse is missing a fact table — and that is a request to the data engineer, not something you compute by hand each month.

---

## 3. The case of the forty customers (70 min)

Write every query and its result in `submissions/week-01/day-4/case.sql`; your reasoning goes in the homework memo. Work in order; each fold confirms the step before you take the next.

**Step 1 — reproduce the two numbers.** The board pack counts rows of `customers`. Confirm it.

<details><summary>Check</summary>

```sql
SELECT COUNT(*) FROM customers;   -- expect 6040
```
HR's 6 000 counts *people*. So either 40 people are missing from HR, or 40 rows in `customers` are not people. Which is more likely? HR's list is audited for the regulator; a CRM table is edited by a hundred officers. Start with the table.
</details>

**Step 2 — your Day-1 P8 note.** You wrote down names in CAPITALS and names with a trailing space. Count them, with only Day-2 SQL plus three functions: `UPPER()`, `LOWER()` and `TRIM()` return a changed copy of a text (SQL Server also has `LTRIM`/`RTRIM`).

<details><summary>Check</summary>

```sql
SELECT COUNT(*) FROM customers WHERE first_name = UPPER(first_name);     -- your count (SQLite)
SELECT COUNT(*) FROM customers WHERE first_name <> TRIM(first_name);     -- your count (SQLite)
SELECT COUNT(*) FROM customers WHERE last_name  = LOWER(last_name);      -- your count (SQLite)

SELECT customer_id, first_name, last_name, birth_date, registered_at
FROM customers
WHERE last_name = LOWER(last_name)
ORDER BY customer_id;
```
These three counts are SQLite's. SQL Server's default collation ignores case and trailing spaces, so there the first and third count every row and the second finds none: add `COLLATE Latin1_General_CS_AS` to the case tests (`WHERE first_name = UPPER(first_name) COLLATE Latin1_General_CS_AS`) and compare `DATALENGTH(first_name) <> DATALENGTH(TRIM(first_name))` for the spaces (Week 2 Day 3 explains why).

The capitals count and the trailing-space count add up to the lower-case-surname count: the lower-case surname catches every oddly formatted row at once. The ids run from **6001** to the end of the table — all added after the original 6 000. First three: 6001 `MALIKA jalilova`, 6002 `LOLA saidova`, 6003 `Bobur␣ rakhimov`. Suspicious, but *odd formatting is not proof of a duplicate*. Prove it.
</details>

**Step 3 — find a twin.** Take customer 6001. Is there another Malika Jalilova born 1981-08-15?

<details><summary>Check</summary>

```sql
SELECT customer_id, first_name, last_name, birth_date, phone, region, registered_at
FROM customers
WHERE LOWER(TRIM(first_name)) = 'malika'
  AND LOWER(last_name) = 'jalilova'
  AND birth_date = '1981-08-15';
```
Two rows: **4516** `Malika Jalilova`, registered 2022-09-27, and **6001** `MALIKA jalilova`, registered 2023-03-30 — same birth date, **same phone**. One person, two ids. Someone (an officer, an import) created her again instead of searching. Repeat for 6002 and 6003 if you want to feel the pattern; then stop doing it by hand.
</details>

**Step 4 — do it for everyone (borrow a week-2 tool).** You need "groups of rows with the same normalised name and birth date that have more than one member". That is `GROUP BY … HAVING COUNT(*) > 1` — week 2's topic. Copy it today, understand it next Tuesday:

```sql
SELECT LOWER(TRIM(first_name)) AS fn, LOWER(TRIM(last_name)) AS ln, birth_date, COUNT(*) AS n
FROM customers
GROUP BY LOWER(TRIM(first_name)), LOWER(TRIM(last_name)), birth_date
HAVING COUNT(*) > 1
ORDER BY n DESC, ln, fn;
```

How many groups? Now add `phone` to both the SELECT and the GROUP BY and run again. How many now? Explain the difference before opening the fold.

<details><summary>Check</summary>
Name + birth date gives a few more groups than name + birth date + phone, each of exactly 2 rows. Look at the groups that disappear when you add the phone: the same common name and the same birthday, but different phones and different regions — two genuinely different people. With 6 000 people and 40 first names, that happens. **A match on one or two fields is a suspicion; a match on name, birth date and phone is a duplicate.** Check that the confirmed groups are exactly the lower-case-surname rows from step 2.

Try the opposite check too: group by `phone` alone. A few groups appear that the name rule did not find — pairs that share a phone but have different names and birth dates: a family number or a typo, not duplicates. Every rule you invent to find duplicates has false positives; always look at what it caught. The counts and the pairs that are *not* duplicates go in your memo.
</details>

**Step 5 — the other thing you noticed on Day 1: birth dates.** The data is as of 2026-10-01 and the oldest plausible borrower was born around 1920. Count the rows outside that range and list them.

<details><summary>Check</summary>

```sql
SELECT COUNT(*) FROM customers WHERE birth_date > '2026-10-01';   -- not born yet
SELECT COUNT(*) FROM customers WHERE birth_date = '1900-01-01';   -- the classic "unknown" placeholder

SELECT customer_id, first_name, last_name, birth_date
FROM customers
WHERE birth_date > '2026-10-01' OR birth_date < '1920-01-01'
ORDER BY birth_date;                                              -- the full list
```
Look at the dates in the list: the placeholder `1900-01-01`, years far in the future — and one that looks like a normal date until you notice it is **after the as-of date**: a customer born next year. That is the lesson: a type check (is it a date?) catches nothing here; only a *business* check (born between 1920 and today minus 18 years) does. Every row of the list is a finding for the memo; check whether any of them is one of the duplicate rows. Everyone else was born between 1955-01-04 and 2006-12-26 — plausible.
</details>

**Step 6 — answer the CFO.** How many real customers are there, and which number is right?

<details><summary>Check</summary>
6 040 rows minus the duplicate rows you confirmed in step 4. If that leaves **6 000 people**, HR is right and the board pack counted rows, not people. The impossible birth dates do not change the count (they are real people with a wrong field) but they must be fixed before anyone computes age bands.

One more sentence for Madina: the duplicates are not harmless. Run `SELECT COUNT(*) FROM loans WHERE customer_id >= 6001;` and the same on `applications`: loans and applications sit on the duplicate ids, so "loans per customer", "repeat customers" and "customers with more than one product" are all understated for those people. Count, too, how many duplicate rows were registered in 2026: "new customers this year" (by `registered_at`) is overstated by exactly that many. Run it; your three numbers go in the memo's *What it changes*.
</details>

**Step 7 — what to do.** Three options, in rising order of effort: (1) report people, not rows — count distinct `(name, birth date, phone)` in the warehouse's `dim_customer`; (2) merge: repoint their loans and applications from the new id to the old one, then delete the duplicate rows — a data engineer's job, with a backup; (3) prevent: a uniqueness check on `(phone, birth_date)` at registration so officers must search before creating. Your memo recommends an order.

<span class="badge stretch">Stretch</span> **Step 8.** One more date check, across two tables. An application cannot be older than the customer who made it: are there applications dated *before* their customer's `registered_at`? It needs a join (week 2) — copy it today, and before you run it, write down what a hit would mean.

```sql
SELECT a.application_id, a.customer_id, a.applied_at, c.registered_at
FROM applications a
JOIN customers c ON c.customer_id = a.customer_id
WHERE a.applied_at < c.registered_at
ORDER BY a.customer_id, a.applied_at;
```

<details><summary>Check</summary>
There are hits, and every one sits on a duplicate id. Look at their `registered_at`: it lies *after* the as-of date — later in 2026, one in 2027. The duplicate rows were created with invented registration dates, so their applications look older than their customers. That is a finding of its own: list the ids, and count how many customer rows carry a registration date after 2026-10-01 (`WHERE registered_at > '2026-10-01'` on `customers` alone finds them all, with or without an application). It also means step 6's "new customers this year" contains people registered in the future. Not required for the memo — a memo that has it stands out.
</details>

---

## 4. Homework <span class="badge hw">HW 1.3 — Due Day 5</span>

**Data-quality memo to Madina.** Submit to `submissions/week-01/day-4/`:

1. `memo.md` — **one page**, in this order: *What is wrong* (each issue in one line: table, column, what, how many rows), *What it changes* (which reported numbers are affected and by how much), *What to do* (your recommendation per issue, who does it, and in what order), *How I checked* (one sentence pointing at the queries). Numbers from your queries, not from the folds.
2. `case.sql` — every query from steps 1–6 with a `-- result:` line.

Graded on: (a) every issue type is in the memo with the count from your queries — the duplicate rows, the impossible birth dates, and the name pairs that are *not* duplicates, explained (step 8's future registration dates are not required; a memo that has them stands out), (b) the "what it changes" section names at least two downstream numbers with their size (loans, applications or new customers), (c) it fits on one page and a CFO could read it without knowing SQL.

---

## 5. Self-check

1. Why does the board pack not query the production database directly? Three reasons. *(→ section 1, "OLAP")*
2. What is the grain of `fact_payments`, and why can it not hold "outstanding balance"? *(→ section 1, "Facts, dimensions, and the star"; section 2)*
3. Two rows match on name and birth date. Are they the same person? What is your next check? *(→ section 3, step 4)*

---

## 6. Company corner <span class="badge company">Who does what</span>

You will serve six kinds of colleagues. Learn their question, and which tables answer it, and you can start any conversation at Nur Finance.

| Role | Cares about | A typical request | Tables that answer it |
|---|---|---|---|
| **Portfolio manager** (Bekzod; *портфельный менеджер*) | size and quality of the loan book: disbursements, outstanding, yield, mix by product | *"Disbursements by product and month for 2026, with average ticket."* | `loans` (+ `products`, `dim_date`); outstanding from `installments` − `payments` |
| **Risk analyst** (*риск-аналитик*) | who to approve, at what price: scoring, approval rate, FPD, vintages | *"Approval rate and FPD30 by credit-score band for app vs branch, last 6 months."* | `applications` (score, channel, status), `loans`, `installments`, `payments` |
| **Collections analyst** (Sevara's team; *аналитик взыскания*) | getting late money back: DPD buckets, roll rates, contact and promise rates, cure | *"Which loans crossed 30 DPD this week, and how many have we not yet called?"* | `installments`, `payments`, `collections_actions`, `staff` |
| **BI / dashboard specialist** (Timur; *BI-специалист*) | one truth on one screen: warehouse model, refresh, definitions | *"The approval-rate tile shows 61 % and Risk's deck says 70 % — align them."* | the star: `fact_applications`, `dim_*` (and the two conventions from Day 2) |
| **Product analyst** (*продуктовый аналитик*) | the app and the customer journey: funnel, activation, retention, churn | *"Where in the app funnel do we lose applicants, by device and version?"* | `app_events` (+ `applications`, `customers`) — and only for the app channel |
| **Data engineer** (*инженер данных*) | the pipes: ETL, warehouse tables, data quality, performance | *"Add a month-end snapshot fact with DPD; and merge the duplicate customers."* | builds `fact_loan_monthly`; fixes `customers` — your memo lands on this desk |

Two more you will meet later: the **data scientist** (builds the scoring model from `applications` + repayment outcomes) and **Finance** (provisions, cost of risk — needs your buckets to be right).

> Interview version: *"Who are the typical consumers of an analyst's work in a lending company, and what does each want?"* — Name four roles with one request each, and say which you would join a table for. Mention that the same word (approval rate, customer) can mean different things to two of them, and that part of the job is making the definition explicit.

Tomorrow: checkpoint. No new theory — a schema to design and twenty queries. Sleep.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w01d4", "pass": 0.8, "questions": [
  {"type": "multi", "q": "Why does the board pack come from the warehouse, not from the production (OLTP) database?", "options": ["Load: a big scan slows the cashiers' screens", "History: production overwrites, the warehouse keeps every month-end", "Consistency: a report re-run five minutes later should give the same number", "Production databases cannot run SELECT", "The warehouse is always normalised to 3NF"], "answer": [0, 1, 2], "explain": "Load, history and consistency; production can be queried, and the warehouse is de-normalised on purpose (→ section 1, OLAP)."},
  {"type": "text", "q": "One word: the answer to 'what is one row of this fact table?' is called its…", "answer": ["grain", "granularity"], "explain": "Choose the grain first; every measure must make sense at it (→ section 1, Facts, dimensions, and the star)."},
  {"type": "single", "q": "Risk wants 'approval rate by channel, per month'. Which fact table has the right grain?", "options": ["fact_loans (one loan)", "fact_payments (one payment)", "fact_applications (one application)", "fact_loan_monthly (one loan per month-end)"], "answer": 2, "explain": "Approval is a property of an application, and rejected ones never become loans; write the question, find the noun that is one row (→ section 2)."},
  {"type": "single", "q": "In a warehouse, dim_branch points to a separate dim_region table instead of storing region itself. What is this design called?", "options": ["A star schema", "A snowflake schema", "An OLTP schema", "A snapshot fact"], "answer": 1, "explain": "A snowflake normalises its dimensions: fewer repeated values, one more join in every query; analysts prefer stars (→ section 1, Facts, dimensions, and the star)."},
  {"type": "single", "q": "Suppose a duplicate query returned this pair (an invented example). What do you conclude?", "code": "customer_id | name          | birth_date | phone        | region\n1111        | Aziz Rakhimov | 1980-05-12 | +99890111... | Samarkand\n2222        | Aziz Rakhimov | 1980-05-12 | +99893555... | Andijan", "options": ["A duplicate — same name and birth date", "Probably two different people: a match on name and birth date is only a suspicion, and the phones differ", "A data-type error in birth_date", "Delete the newer row right away"], "answer": 1, "explain": "Name + birth date + phone is a duplicate; name + birth date alone also catches namesakes sharing a birthday (→ section 3, step 4)."},
  {"type": "single", "q": "In SQLite, which query finds customers whose first name carries an extra space?", "options": ["SELECT COUNT(*) FROM customers WHERE first_name <> TRIM(first_name);", "SELECT COUNT(*) FROM customers WHERE first_name = TRIM(first_name);", "SELECT COUNT(*) FROM customers WHERE first_name = UPPER(first_name);", "SELECT COUNT(*) FROM customers WHERE first_name IS NULL;"], "answer": 0, "explain": "TRIM returns a copy without the spaces; a row that differs from its own trimmed copy has a space. SQL Server ignores trailing spaces when it compares text, so there compare DATALENGTH instead (→ section 3, step 2)."},
  {"type": "single", "q": "The data is as of 2026-10-01. Which filter lists the impossible birth dates, including one like 2027-02-28?", "options": ["WHERE birth_date IS NULL", "WHERE birth_date > '2026-10-01' OR birth_date < '1920-01-01'", "WHERE birth_date BETWEEN '1920-01-01' AND '2026-10-01'", "WHERE birth_date = '1900-01-01'"], "answer": 1, "explain": "2027-02-28 is a valid date, so only a business check (born before today, after about 1920) catches it; the BETWEEN version lists the plausible ones (→ section 3, step 5)."},
  {"type": "single", "q": "\"The approval-rate tile shows 61 % and Risk's deck says 70 % — align them.\" Whose desk does this request come from?", "options": ["Collections analyst", "BI / dashboard specialist", "Data engineer", "Product analyst"], "answer": 1, "explain": "The BI specialist owns one truth on one screen, including definitions like the two approval-rate conventions (→ section 6, Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w01d4", "q": "Madina wants to merge the 40 duplicate customer rows (ids 6001–6040) into their originals. A duplicate row with no loan can simply be retired; a row with loans first needs those loans re-pointed to the original id. How many of the 40 duplicate rows have at least one loan attached?", "type": "number", "dp": 0, "h": ["59476970f7aff825452ea597"], "hint": "The question counts customers, not loans — check what one row of your result is.", "sol": "U0VMRUNUIERJU1RJTkNUIGN1c3RvbWVyX2lkIEZST00gbG9hbnMgV0hFUkUgY3VzdG9tZXJfaWQgQkVUV0VFTiA2MDAxIEFORCA2MDQwIE9SREVSIEJZIGN1c3RvbWVyX2lkOyAgIC0tIDI5IHJvd3MKKFNhbWUgb24gYm90aCBlbmdpbmVzOyBuZXh0IHdlZWsgQ09VTlQoRElTVElOQ1QgY3VzdG9tZXJfaWQpIGRvZXMgdGhlIGNvdW50aW5nIGZvciB5b3UuKQpUaGUgNDggbG9hbnMgb24gZHVwbGljYXRlIGlkcyAoc3RlcCA2IG9mIHRoZSBjYXNlKSBzaXQgb24gMjkgb2YgdGhlIDQwIHJvd3M7IHRoZSBvdGhlciAxMSByb3dzIGNhcnJ5IG5vIGxvYW4uClNvIHRoZSBjbGVhbi11cCBpcyB0d28gam9iczogcmUtcG9pbnQgNDggbG9hbnMgKGFuZCB0aGVpciBhcHBsaWNhdGlvbnMpIGZyb20gMjkgZHVwbGljYXRlIGlkcyB0byB0aGUgb3JpZ2luYWwgaWRzLCB0aGVuIHJldGlyZSBhbGwgNDAgcm93cy4gQW5zd2VyaW5nIDQ4IGlzIHRoZSBncmFpbiBtaXN0YWtlIG9mIHRoZSBkYXk6IHNheSB3aGF0IG9uZSByb3cgaXMgYmVmb3JlIHlvdSBjb3VudCBpdC4="}
```

<!-- challenge:end -->
