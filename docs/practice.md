# Practice day — try the routine once

<span class="badge">About 30 min</span> <span class="badge hw">Practice — not graded</span>

> STORY **Monday, 9:00.** Madina hands you a coffee: *"Before Bekzod sends you real work, let's make sure the pipes work. Three tiny questions, you send them the way you will send everything, and I send feedback back. If something breaks today, nothing is lost."*

> 🧭 **Why the routine looks like this.** Every real day repeats the same moves: run SQL on the page → answer in a box → check → hand in → read the feedback → pass the quiz. Rehearse them once while nothing counts, so that on Day 1 the tools are invisible and only the questions are hard.

## Today in 3 lines

- You run SQL on the Nur Finance database right on this page — nothing to install.
- You answer three warm-up questions in the workspace, the site checks them, and you hand them in with one tap.
- You try a Quick check and the quiz that ends every day. **Nothing today counts for points** — it is a rehearsal.

## Step 1 — run your first query

Press **▶ Run**. You see Nur Finance's offices:

```sql
SELECT * FROM branches;
```

Change `branches` to `products` and run it again. That is the whole tool: write, Run, read the result.

**Lost a table name?** Tap **Database** at the bottom right: every table and its columns; **Show rows** shows its first 10 rows. Tap a name and it goes into your query.

## Step 2 — three warm-up questions

The shapes you need (on other questions):

```sql
SELECT COUNT(*) FROM customers;                                  -- how many rows
SELECT COUNT(*) FROM customers WHERE segment = 'sme';            -- how many rows match
SELECT name, min_amount FROM products ORDER BY min_amount DESC;  -- biggest first
```

Not sure what a column holds? Look first: `SELECT DISTINCT role FROM staff;`

Warm up your fingers first: put the pieces of the query in the right gaps.

```game
{"type": "cloze", "id": "practice-cloze", "title": "How many SME customers?", "text": "SELECT {{0}} FROM {{1}} WHERE segment {{2}} 'sme';", "blanks": [["COUNT(*)"], ["customers"], ["="]], "distractors": ["SUM(*)", "branches", "ORDER BY"]}
```

Now answer Madina in the workspace: write each query, **▶ Run** it, **✔ Check** it. A ❌ never shows the answer — it means *look again*.

```sqltask
{"check": "practice", "lesson": "Practice", "title": "Practice day", "file": "answers.sql", "tasks": [{"id": "Q1", "q": "How many branches (offices) does Nur Finance have? (table branches)"}, {"id": "Q2", "q": "Which product has the highest annual interest rate, and what is that rate, exactly as the table stores it? (table products)"}, {"id": "Q3", "q": "How many staff members work as loan officers? (table staff, column role)"}]}
```

> 💡 **Key idea.** ✔ Check compares your result with the expected one on an untouched copy of the data — it never shows the answer, and nothing you do in the [SQL playground](playground.md) can spoil it.

## Step 3 — send it

When all three are ✅, **📤 Submit** at the bottom of the workspace opens. Tap it.

- **The first time** the box asks you to **🔑 sign in**: write your name and the PIN your mentor gave you, tap **Sign in**, then **📤 Submit**. Once per device and browser.
- Submit sends your queries with the first rows of their results. Your mentor gets them in the group's **📤 Homework** topic, the bot confirms *"submitted from the website"*, and the box shows **✅ submitted** with the date.

> ⚠️ **Watch out.** Signing in belongs to this browser. On another phone or laptop — or after clearing the browser's data — the box asks you to sign in again. Your answers are saved in this browser too.

## Step 4 — your feedback

Within a day your mentor replies in **📤 Homework**: what is right, what is wrong and why, how to fix it, and the points you would have earned. Fix and submit again if you like — a second try never costs points.

At the very bottom of every day page there is a **How was today?** card: seven quick questions about the lesson, two minutes, only your mentor reads them. Try it here.

## Quick check

Every day has three questions like these, one at a time. They are not a test: answer, read the explanation, move on.

```check
{"id": "practice-sc", "questions": [
  {"type": "single", "q": "Your query runs and ✔ Check says ❌. What does the ❌ tell you?", "options": ["The right answer is hidden somewhere below — scroll down", "Your result differs from the expected one: look again at the column or the filter", "The site is broken — try tomorrow", "You must submit before you can check"], "answer": 1, "explain": "A ❌ means look again. SELECT DISTINCT or SELECT * on the table usually shows what went wrong (→ Step 2)."},
  {"type": "single", "q": "Where do you see every table, its columns and its first rows?", "options": ["Database, at the bottom right of every page", "The sidebar menu", "The Telegram group", "Only in an app you install"], "answer": 0, "explain": "The Database panel lists every table; tap a name to put it into your query (→ Step 1)."},
  {"type": "single", "q": "What does 🔑 Sign in do, and how often do you need it?", "options": ["With your name and PIN it lets this browser send your work to your mentor — once per browser", "Signs you in to GitHub — every day", "Downloads the database — on every page", "Nothing; it is optional"], "answer": 0, "explain": "Signing in gives this browser the key Submit needs. Another browser or cleared data means signing in again (→ Step 3)."}
]}
```

## Practice quiz

Every real day ends with a quiz like this; 80 % finishes the day. This one is practice and does not count.

```quiz
{"id": "practice", "pass": 0.8, "questions": [
  {"type": "single", "q": "Where do you write and run a query for this course?", "options": ["In Excel", "Right on the lesson page: write it, then press ▶ Run", "In the Telegram group", "Only in an app you install"], "answer": 1, "explain": "Every SQL box on the pages runs on the full Nur Finance database. Installing a tool is optional (→ Step 1)."},
  {"type": "single", "q": "You forgot which table has the loan officers. Fastest way to find it?", "options": ["Guess table names until one works", "Ask in the group", "Tap Database at the bottom right and look through the tables", "Skip the question"], "answer": 2, "explain": "The Database panel lists every table with its columns; Show rows shows its first 10 rows (→ Step 1)."},
  {"type": "single", "q": "✔ Check says ❌ for Q2. What do you do?", "options": ["Submit anyway, the mentor will fix it", "Ask for the right answer in the group", "Look again: see what the column really holds, fix the query, check again", "Delete Q2"], "answer": 2, "explain": "A ❌ means look again, not peek. SELECT DISTINCT or SELECT * on the table usually shows what went wrong (→ Step 2)."},
  {"type": "single", "q": "All three are ✅. What sends them to your mentor?", "options": ["Nothing — checking is enough", "📤 Submit at the bottom of the workspace", "Closing the page", "A screenshot in the group"], "answer": 1, "explain": "Submit sends your queries to 📤 Homework and the bot confirms it (→ Step 3)."}
]}
```

---

Next: **[Day 0 — where do you stand?](weeks/week-00/day-0.md)** Five short self-tests decide which weeks you can skip.

Later, for a job: **[Tools at work](tools-at-work.md)** shows how analysts do the same with installed apps. Not needed for this course.
