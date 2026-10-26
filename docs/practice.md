# Practice day — try the routine once

<span class="badge">About 30 min</span> <span class="badge hw">Practice — not graded</span>

> STORY **Monday, 9:00.** Madina hands you a coffee: *"Before Bekzod sends you real work, let's make sure the pipes work. Three tiny questions, you send them the way you will send everything, and I send feedback back. If something breaks today, nothing is lost."*

## Today in 3 lines

- You run SQL on the Nur Finance database right on this page — nothing to install.
- You answer three warm-up questions, check them yourself, and send them in with one tap.
- You see how a day ends (the quiz). **Nothing today counts for points** — it is a rehearsal.

## Step 1 — run your first query

Press **▶ Run**. You see Nur Finance's offices:

```sql
SELECT * FROM branches;
```

Change `branches` to `products` and run it again. That is the whole tool: write, Run, read the result.

**Lost a table name?** Tap **Database** at the bottom right: every table, its columns and 5 sample rows. Tap a name and it goes into your query.

## Step 2 — three warm-up questions

The shapes you need (on other questions):

```sql
SELECT COUNT(*) FROM customers;                                  -- how many rows
SELECT COUNT(*) FROM customers WHERE segment = 'sme';            -- how many rows match
SELECT name, min_amount FROM products ORDER BY min_amount DESC;  -- biggest first
```

Not sure what a column holds? Look first: `SELECT DISTINCT role FROM staff;`

Now answer Madina in the workspace: write each query, **▶ Run** it, **✔ Check** it. A ❌ never shows the answer — it means *look again*.

```sqltask
{"check": "practice", "lesson": "Practice", "title": "Practice day", "file": "answers.sql", "tasks": [{"id": "Q1", "q": "How many branches (offices) does Nur Finance have? (table branches)"}, {"id": "Q2", "q": "Which product has the highest annual interest rate, and what is that rate, exactly as the table stores it? (table products)"}, {"id": "Q3", "q": "How many staff members work as loan officers? (table staff, column role)"}]}
```

## Step 3 — send it

When all three are ✅, tap **📤 Submit** at the bottom of the workspace.

- **The first time** the box asks you to **🔑 Connect this website to the course bot** — tap it, press *Start* in Telegram, come back and tap Submit. Once per browser.
- Your mentor gets your answers in the group's **📤 Homework** topic, and the bot confirms *"submitted from the website"*.

## Step 4 — your feedback

Within a day your mentor replies in **📤 Homework**: what is right, what is wrong and why, how to fix it, and the points you would have earned. Fix and submit again if you like — a second try never costs points.

## Practice quiz

Every real day ends with a quiz like this; 80 % finishes the day. This one is practice and does not count.

```quiz
{"id": "practice", "pass": 0.8, "questions": [
  {"type": "single", "q": "Where do you write and run a query for this course?", "options": ["In Excel", "Right on the lesson page: write it, then press ▶ Run", "In the Telegram group", "Only in an app you install"], "answer": 1, "explain": "Every SQL box on the pages runs on the full Nur Finance database. Installing a tool is optional (→ Step 1)."},
  {"type": "single", "q": "You forgot which table has the loan officers. Fastest way to find it?", "options": ["Guess table names until one works", "Ask in the group", "Tap Database at the bottom right and look through the tables", "Skip the question"], "answer": 2, "explain": "The Database panel lists every table with its columns and 5 sample rows (→ Step 1)."},
  {"type": "single", "q": "✔ Check says ❌ for Q2. What do you do?", "options": ["Submit anyway, the mentor will fix it", "Ask for the right answer in the group", "Look again: see what the column really holds, fix the query, check again", "Delete Q2"], "answer": 2, "explain": "A ❌ means look again, not peek. SELECT DISTINCT or SELECT * on the table usually shows what went wrong (→ Step 2)."},
  {"type": "single", "q": "All three are ✅. What sends them to your mentor?", "options": ["Nothing — checking is enough", "📤 Submit at the bottom of the workspace", "Closing the page", "A screenshot in the group"], "answer": 1, "explain": "Submit sends your queries to 📤 Homework and the bot confirms it (→ Step 3)."}
]}
```

---

<details>
<summary>Optional — the computer way (GitHub Desktop and DB Browser)</summary>

Not needed for this course. Good to know for a job, where analysts keep their work in GitHub and query a database in an app.

1. Install **GitHub Desktop** (https://desktop.github.com), sign in, then *File → Clone repository* → **Raxmatov005/analytics-course** → **Clone**.
2. Install **DB Browser for SQLite** (https://sqlitebrowser.org/dl/), *Open Database* → `data/raw/nur.db` in the course folder, tab **Execute SQL**.
3. Save your answers as `submissions/practice/answers.sql` (in Notepad choose *Save as type: All files*).
4. In GitHub Desktop: *Summary* `Practice: 3 warm-up queries` → **Commit to main** → **Push origin**. Then in the bot tap **📤 Hand in homework** → **Practice day** → **I pushed it to GitHub instead**.

Both ways count the same.

</details>
