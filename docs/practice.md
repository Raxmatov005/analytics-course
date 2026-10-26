# Practice day — try the routine once

<span class="badge">About 40 min</span> <span class="badge hw">Practice — not graded</span>

> STORY **Monday, 9:00.** Madina hands you a coffee: *"Before Bekzod sends you real work, let's make sure the pipes work. Three tiny questions, you send them the way you will send everything, and I send feedback back. If something breaks today, nothing is lost."*

## Today in 3 lines

- You have the course on your computer (GitHub Desktop) and can open the Nur Finance database.
- You answer three warm-up questions, check them yourself, and send them in.
- You know where your feedback arrives and how a day ends (the quiz). **Nothing today counts for points** — it is a rehearsal.

---

> **Nothing to install.** Today works on this page alone: jump to **Step 3**, answer in the workspace, tap **📤 Submit**. Steps 1–2 and 4–6 show the optional *computer way* (GitHub Desktop, DB Browser) — good to know for a job, not needed for the course.

## Step 1 — the course on your computer (optional)

1. Install **GitHub Desktop**: https://desktop.github.com and sign in with your GitHub account.
2. *File → Clone repository* → choose **Raxmatov005/analytics-course** → pick a folder (e.g. Documents) → **Clone**.

Done when GitHub Desktop shows *Current repository: analytics-course*.

## Step 2 — open the database in an app (optional)

1. Install **DB Browser for SQLite**: https://sqlitebrowser.org/dl/ (Windows: *Standard installer*).
2. *Open Database* → in the course folder choose `data/raw/nur.db`.
3. Open the tab **Execute SQL**. You type a query there and press ▶ (or Ctrl+Enter).

Try it: type `SELECT * FROM branches;` and run it. You should see a small table of Nur Finance's offices.

## Step 3 — three warm-up questions

Madina's questions. Each one is a single short query; you do not need anything beyond `SELECT`, `COUNT(*)`, `WHERE` and `ORDER BY`, and the examples below show all of them.

- **Q1** How many branches (offices) does Nur Finance have? *(table `branches`)*
- **Q2** Which product has the highest annual interest rate, and what is that rate, exactly as the table stores it? *(table `products`)*
- **Q3** How many staff members work as loan officers? *(table `staff`, column `role`)*

Examples of the shapes you need (on other questions):

```sql
SELECT COUNT(*) FROM customers;                                  -- how many rows
SELECT COUNT(*) FROM customers WHERE segment = 'sme';            -- how many rows match a condition
SELECT name, min_amount FROM products ORDER BY min_amount DESC;  -- biggest first
```

Not sure what a column holds? Look first: `SELECT DISTINCT role FROM staff;`

**Answer right here** — write each query, ▶ Run it, ✔ Check it, then 📤 Submit:

```sqltask
{"check": "practice", "lesson": "Practice", "title": "Practice day", "file": "answers.sql", "tasks": [{"id": "Q1", "q": "How many branches (offices) does Nur Finance have?"}, {"id": "Q2", "q": "Which product has the highest annual interest rate, and what is that rate, exactly as the table stores it?"}, {"id": "Q3", "q": "How many staff members work as loan officers?"}]}
```

---

## Step 4 — save your answers in a file (optional, the computer way)

1. In the course folder create the folders `submissions`, then inside it `practice`.
2. Open **Notepad** and write your three answers in this shape — the question line, your query, and the result you got:

```sql
-- Q1: How many branches does Nur Finance have?
SELECT ... ;
-- result: ...
```

3. Save as `answers.sql` in `submissions/practice/`. In Notepad's *Save as type* choose **All files**, or Windows makes it `answers.sql.txt`.

## Step 5 — check before you send (optional today)

This needs Python (https://python.org — during installation tick **Add python.exe to PATH**). In the course folder, right-click → *Open in Terminal*, then:

```bash
python scripts/check.py practice
```

Each question shows **OK** or **NO** with the reason. It never shows the right answer: a NO means *look again*. No Python yet? Skip this step today; your mentor runs the same check.

## Step 6 — send it with GitHub Desktop (optional, the computer way)

In GitHub Desktop you will see `answers.sql` in the list on the left.

1. Bottom left, *Summary*: `Practice: 3 warm-up queries`
2. **Commit to main**
3. **Push origin** (top bar)

Then open the course bot (the button in the group's pinned message) and tap **📤 I pushed my homework** → **Practice day**. It checks that `answers.sql` is really in GitHub and tells your mentor — no typing needed.

## Step 7 — your feedback

Within a day a file `FEEDBACK.md` appears next to your answers. To get it: GitHub Desktop → **Fetch origin** → **Pull origin**, then open `submissions/practice/FEEDBACK.md` (or read it on github.com in your repository). It says what is right, what is wrong and why, how to fix it, and the points you would have earned. Fix and push again if you like — a second try never costs points.

---

## Practice quiz

Every real day ends with a quiz like this; 80 % finishes the day. This one is practice and does not count.

```quiz
{"id": "practice", "pass": 0.8, "questions": [
  {"type": "single", "q": "Where do you save the file for a homework?", "options": ["Anywhere on your computer, then email it", "In the folder the page names, inside submissions/ in the course folder", "In the data/raw folder next to nur.db", "Paste it into the Telegram group"], "answer": 1, "explain": "Every homework names its folder, e.g. submissions/practice/. GitHub Desktop only sends what is inside the course folder (→ Step 4)."},
  {"type": "single", "q": "You saved answers.sql. What actually sends it to your mentor?", "options": ["Saving the file", "Commit to main, then Push origin in GitHub Desktop", "Fetch origin", "Running the checker"], "answer": 1, "explain": "Commit packs the change, Push uploads it. Fetch and Pull bring the mentor's feedback down to you (→ Steps 6 and 7)."},
  {"type": "single", "q": "The checker says NO for Q2. What do you do?", "options": ["Send it anyway, the mentor will fix it", "Ask for the right answer in the group", "Look again: check what the column really holds, fix the query, run the checker again", "Delete Q2 from the file"], "answer": 2, "explain": "A NO means look again, not peek. SELECT DISTINCT or SELECT * on the table usually shows what went wrong (→ Step 5)."}
]}
```
