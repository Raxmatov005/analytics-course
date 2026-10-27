# Week 5 · Day 1 — Python from zero: the notebook is your lab

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 5.1 (due Day 3)</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:00.** A new face at Madina's desk: Jasur, the data scientist (*дата-сайентист*) who builds the scorecard. *"Welcome to the half of the building that does not use a mouse. Everything you did in weeks 1–4 I do in Python — the same joins, the same buckets — but it runs every morning at 6:00 without me, and the next step is the model. Before pandas, prove you can **think in loops**: compute the approval rate by channel with plain Python from `applications.csv`. No library that does it for you. If you can do it with a `for`, you will understand what pandas is doing when it does it for you."* Madina: *"And get the tools running today; tomorrow the data arrives."*

## Today in 3 lines

- Why analysts write Python: the analysis is a **file that re-runs** (repeatable), it scales from 7 828 rows to 70 million without changing (scalable), it is free and it is the language of the next steps (models, automation, Power BI's Python visuals).
- You run Python **right on this page** (▶ Run under every code block), meet **Jupyter** — where the homework notebook lives — and learn the language's grammar: types, lists, dicts, `if`/`for`/`while`, functions, f-strings, modules, reading a CSV with `csv`, list comprehensions, reading a traceback.
- You have Jasur's approval rate by channel in loops (**58.2 / 63.7 / 61.9 %**, the week-2 and week-4 numbers) and the start of HW 5.1 — eight functions that must pass their asserts in `data/python/day1_starter.ipynb`.

---

## 1. Learn — the language, one notebook cell at a time

### Where your code runs: this page, or Jupyter

Every Python block on this page has a **▶ Run** button. The first run loads Python into your browser — about 15 MB, once, then it is cached — together with pandas, NumPy and matplotlib; after that a block runs in about a second. Three rules of the page:

- **Blocks share one memory, in the order you run them.** A variable made in one block exists in the next one — if you ran it. The first time, run the page from top to bottom.
- **The data files are already there.** `open("../excel/applications.csv")` reads the course's file — the same path the notebooks use.
- **Every Practice task has its own editor** with ▶ Run and ✔ Check: the check looks for the right number among what your code prints, so print your result.

> 💡 **Key idea.** The page is where you learn and practise; the **notebook** is the file you hand in. A notebook is the same thing as this page — code blocks and text, run top to bottom — saved as one `.ipynb` file that anyone can re-run.

**Jupyter, for the homework (set it up by Day 3).** HW 5.1 is a notebook you hand in *executed*, so you need Jupyter once this week. **Anaconda** (*дистрибутив Anaconda*) is Python plus the analyst's libraries (pandas, matplotlib, Jupyter) in one installer: https://www.anaconda.com/download → Windows → *Just me* → defaults. Then open **Anaconda Prompt** from the Start menu and type:

```
cd "C:\path\to\Analytics Learning"
pip install -r requirements.txt
jupyter notebook data/python
```

The browser opens a file list; click `day1_starter.ipynb`. **Fallback:** if the installer is blocked, https://colab.research.google.com runs the same notebooks in the browser — upload the `.ipynb` and the CSVs it reads (`data/python/README.md` explains the one line to change). Everything on this page runs on the page, in Jupyter and in Colab.

### Jupyter: cells, Shift+Enter, the kernel

A **notebook** (*блокнот, ноутбук*) is a list of **cells**. A *code* cell runs Python; a *Markdown* cell holds text (your findings — the same Markdown as this page). **Shift+Enter** runs the cell and moves down; **Ctrl+Enter** runs and stays. The **kernel** (*ядро*) is the Python process behind the notebook: it remembers every variable you have defined, in the order you *ran* the cells — not the order they appear. That is the first trap: if you edit cell 3 and re-run only cell 7, cell 7 still sees the *old* cell 3. Before you hand anything in: **Kernel → Restart & Run All**; if it runs top to bottom without error, it is reproducible. `[*]` on the left means the cell is still running; `[5]` means it was the fifth cell executed.

> ⚠️ **Watch out.** This page has the same trap. Edit a block and re-run only a later one, and the later one still sees the old version. When a number looks stale, run the page again from the top — in Jupyter, Kernel → Restart & Run All.

### Variables and the four scalar types

```python
principal = 31_150_000        # int   — a whole number; underscores are ignored (31150000)
annual_rate = 0.30            # float — a number with a decimal point
product = "Consumer loan"     # str   — text, in single or double quotes
is_active = True              # bool  — True / False (capital letters)
type(principal), type(annual_rate), type(product), type(is_active)
```

`=` assigns; `==` compares. `/` always gives a float (`7 / 2` → `3.5`); `//` is integer division (`7 // 2` → `3`); `%` the remainder (`7 % 2` → `1`); `**` the power (`(1 + r) ** -term`). `int("42")` and `float("3.12")` convert text to numbers — everything that comes out of a CSV is text until you convert it, exactly like week 4's dates stored as text. `round(x, 1)` rounds to one decimal; `round(x, -2)` to the nearest hundred (Nur Finance's monthly payment is rounded this way).

### Lists, dicts, tuples

```python
buckets = ["0", "1-30", "31-60", "61-90", "90+"]      # list: ordered, changeable; buckets[0] is "0", buckets[-1] is "90+"
buckets.append("written off"); len(buckets)            # 6
counts = {"card": 17612, "payme": 8897}                # dict: key → value; counts["card"] → 17612
counts["cash"] = 8788                                  # add a key
counts.get("crypto", 0)                                # 0 — .get never crashes on a missing key
row = ("Tashkent Central", 1001)                       # tuple: like a list but frozen; used for "a pair of things"
buckets[1:3]                                           # slice: ['1-30', '31-60'] — from 1 up to but not including 3
```

A **list** (*список*) is a column; a **dict** (*словарь*) is a lookup table — the `XLOOKUP` of week 4 with one line: `rate = rates[product]`. A **tuple** (*кортеж*) is a row. Half of pandas is these three with a faster engine: a `Series` is a list with an index, a `DataFrame` is a dict of columns.

```game
{"type": "flash", "id": "w05d1-g1", "title": "Python words of the day", "cards": [["int / float", "a whole number / a number with a decimal point"], ["str", "text — everything a CSV gives you, until you convert it"], ["bool", "True or False, with capital letters"], ["None", "Python's NULL — what a function without return gives back"], ["list", "an ordered, changeable column of values: buckets[0], buckets[-1]"], ["dict", "a lookup table key → value: counts[\"card\"], counts.get(k, 0)"], ["tuple", "a frozen pair or row: (\"Tashkent Central\", 1001)"], ["kernel", "the Python process that remembers variables in the order cells were run"], ["traceback", "the error report — read the last line first"], ["list comprehension", "[expression for item in items if condition] — a for that builds a list"]]}
```

### Control flow: if / for / while

```python
def label(dpd):                           # the week-2 CASE, the week-4 nested IF
    if dpd <= 0:
        return "0"
    elif dpd <= 30:
        return "1-30"
    elif dpd <= 60:
        return "31-60"
    elif dpd <= 90:
        return "61-90"
    else:
        return "90+"

total = 0
for amount in [1_741_700, 2_791_000, 567_500]:     # for: once per element
    total += amount                                 # += adds to the variable
n = 0
while n < 3:                                        # while: as long as the condition holds — beware the loop that never ends
    n += 1
```

**Indentation is the syntax** (*отступы*): four spaces mark what belongs to the `if`, the `for`, the `def`. No `END`, no braces. The colon at the end of the line opens the block. `break` leaves a loop early; `continue` skips to the next element. `for i, x in enumerate(items)` gives you the position too; `for key, value in counts.items()` walks a dict.

### Functions: parameters, return, defaults

```python
def approval_rate(approved, total, decimals=1):
    """Approval rate in percent."""          # the docstring — what it does, for the next reader (you, in a month)
    if total == 0:
        return None                          # never divide by zero; None is Python's NULL
    return round(100 * approved / total, decimals)

approval_rate(2915, 5006)        # 58.2
approval_rate(2915, 5006, 2)     # 58.23
```

A function (*функция*) is a named, reusable step with inputs (**parameters**) and one output (`return`). Without `return` it returns `None`. Defaults (`decimals=1`) make a parameter optional. The habit that makes Python analysis trustworthy: every number you report comes out of a function you can test. That is what HW 5.1's asserts are: `assert approval_rate(2915, 5006) == 58.2` fails loudly if the function lies and says nothing if it is right. A function that `print`s instead of `return`s gives you nothing to assert.

### f-strings and formatting

```python
outstanding = 208_723_504_430
f"{outstanding:,}"            # '208,723,504,430'  — thousands separators
f"{outstanding / 1e9:.1f} bn" # '208.7 bn'
f"{0.0312:.2%}"               # '3.12%'
f"{'app':<8}{58.2:>6.1f} %"   # 'app       58.2 %' — padding: < left, > right, width 8
```

`f"…{expression}…"` evaluates whatever is inside the braces. The format spec after the colon is Excel's number format in a different spelling: `,` thousands, `.1f` one decimal, `.2%` percent, `>6` right-aligned in six characters.

### Modules: import

```python
import csv                       # standard library: read/write CSV files
from datetime import date        # one name from a module
import math                      # math.ceil, math.log
from pathlib import Path         # file paths that work on Windows and Mac
date(2026, 10, 1) - date(2026, 9, 28)        # datetime.timedelta(days=3) → .days gives 3
```

A module (*модуль*) is someone else's functions. `import pandas as pd` tomorrow is the same mechanism; today the standard library is enough.

### Reading a CSV with the csv module

```python
with open("../excel/applications.csv", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))          # a list of dicts, one per row, keys = the header
with open("../excel/loans_status.csv", newline="", encoding="utf-8") as f:
    loans = list(csv.DictReader(f))         # the 7 828 loans, the same way
len(rows), len(loans)                       # (14000, 7828)
rows[0]["channel"], rows[0]["status"]       # ('branch', 'rejected')
```

`with open(...) as f:` opens the file and closes it when the block ends. `csv.DictReader` gives each row as a dict keyed by the header line — every value is a **string**: `"322610000"` not `322610000`, `""` for a blank (the 388 missing credit scores). Convert on use: `int(r["requested_amount"])`, and check for `""` first.

> 💡 **Key idea.** A CSV knows no types. Every value arrives as text — `"0"` is not `0`, `""` is not a missing number but an empty string — so you convert at the moment you compute, and you decide what a blank means before you divide.

```game
{"type": "bug", "id": "w05d1-g2", "title": "Find the broken line", "q": "This loop should total requested_amount per channel from the rows above. One line breaks it.", "code": "total = {}\nfor r in rows:\n    ch = r[\"channel\"]\n    total[ch] = total.get(ch, 0) + r[\"requested_amount\"]\nprint(total)", "answer": [3], "why": "Every value from csv.DictReader is text: 0 + \"322610000\" raises TypeError. Convert on use — int(r[\"requested_amount\"])."}
```

### List comprehensions

```python
late = [r for r in loans if int(r["dpd"]) > 0]              # WHERE — 399 loans
amounts = [int(r["principal"]) for r in loans]              # SELECT one column, converted
labels = [label(int(r["dpd"])) for r in loans]              # a CASE per row
sum(1 for r in loans if r["status"] == "active")            # COUNT with a condition — 3352
```

A comprehension (*списковое включение*) is a `for` that builds a list in one line: `[expression for item in iterable if condition]`. Read it right to left: *for each loan, if late, keep it*. It is how you will think about pandas' boolean masks tomorrow. Note the `int(...)` in the first line — `r["dpd"] > 0` on the raw text raises `TypeError`.

### Errors: how to read a traceback

```
ZeroDivisionError: division by zero                       ← the LAST line is the error; read it first
  Cell In[7], line 3                                       ← then the arrow: which line of your code
    return round(100 * approved / total, 1)
```

A **traceback** (*трассировка*) lists the calls that led to the error, newest at the bottom. Read the last line (the type and message), then the line of *your* code it points at. The ones you will meet this week: `NameError` (a variable you have not defined — or defined in a cell you did not run), `TypeError` (`"42" + 1`: text plus number — convert first), `KeyError` (a dict key or column name that does not exist — check the spelling and the header), `IndexError` (position past the end), `ValueError` (`int("n/a")`), `FileNotFoundError` (the path is relative to where Jupyter was started), `SyntaxError` (a missing colon or bracket — the arrow points *after* the problem), `IndentationError`. `try: … except ValueError: …` catches an error you expect (`parse_date` in HW 5.1 returns `None` instead of crashing on `"n/a"`).

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Jupyter (install, new notebook, markdown, shortcuts) — [Jupyter Notebook Tutorial: Introduction, Setup, and Walkthrough (Corey Schafer), 04:08](https://youtu.be/HW29067qVWk?t=248&end=961)
- ▶ Install Anaconda (the Jupyter path) — [Python for Data Analytics - Full Course for Beginners (Luke Barousse), 5:50:56](https://youtu.be/wUSDVGivd-8?t=21056&end=21634)
- ▶ Variables and types — [Python for Data Analytics - Full Course for Beginners (Luke Barousse), 18:52](https://youtu.be/wUSDVGivd-8?t=1132&end=1465)
- ▶ Lists, dicts, tuples — [same course, 1:34:24](https://youtu.be/wUSDVGivd-8?t=5664&end=6582)
- ▶ if / for / while — [same course, 1:26:20](https://youtu.be/wUSDVGivd-8?t=5180&end=5664)
- ▶ Functions — [same course, 2:52:12](https://youtu.be/wUSDVGivd-8?t=10332&end=10923)
- ▶ Modules (import) — [same course, 3:12:46](https://youtu.be/wUSDVGivd-8?t=11566&end=12496)

- RU deck (TBC Data Analytics 2.0, if you have it) `4.1 Python.pdf` (109 pages): types pp. 26–48, control flow pp. 49–61, lists / tuples / dicts / sets pp. 62–71, functions pp. 72–78, exceptions pp. 83–91, files pp. 92–107 — the recording `video1256130814.mp4` is this lecture. `En_4.2_Python.pdf` is NumPy (arrays, slicing, broadcasting, pp. 12–66): pandas sits on top of it; read it when `.values` or `np.where` puzzle you.
- *Russian terms:* переменная = variable, целое / вещественное число = int / float, строка = str, список = list, словарь = dict, кортеж = tuple, цикл = loop, функция = function, параметр / аргумент = parameter / argument, модуль = module, исключение = exception, трассировка = traceback, ядро = kernel, ячейка = cell.

```videoquiz
{"video": "HW29067qVWk", "stops": [
  {"at": 420, "q": "In Jupyter, what does Shift+Enter do?", "options": ["Runs the cell and moves to the next one", "Saves the notebook", "Restarts the kernel", "Deletes the cell"], "answer": 0, "explain": "Shift+Enter runs and moves down; Ctrl+Enter runs and stays on the cell.", "back": 60},
  {"at": 640, "q": "What is a Markdown cell for?", "options": ["Running Python faster", "Text — headings, notes and your findings", "Installing packages", "Storing data files"], "answer": 1, "explain": "Code cells run Python; Markdown cells hold the words around the numbers — where your findings go.", "back": 60},
  {"at": 860, "q": "The number in [5] to the left of a code cell means…", "options": ["the cell's position on the page", "it was the fifth cell executed in this kernel session", "the number of errors in the cell", "the number of lines"], "answer": 1, "explain": "The counter shows the run order, not the page order — which is why Restart & Run All is the proof that a notebook works top to bottom.", "back": 60}]}
```

```videoquiz
{"video": "wUSDVGivd-8", "stops": [
  {"at": 1300, "q": "What type does the value 0.30 have?", "options": ["int", "str", "float", "bool"], "answer": 2, "explain": "A number with a decimal point is a float; 31_150_000 is an int; anything in quotes is a str.", "back": 60},
  {"at": 5420, "q": "What marks the body of a for loop in Python?", "options": ["Curly braces", "The END keyword", "Indentation after a line ending in a colon", "Parentheses"], "answer": 2, "explain": "Indentation is the syntax: the colon opens the block, four spaces mark what belongs to it.", "back": 60},
  {"at": 6100, "q": "How do you read a dict value without crashing when the key is missing?", "options": ["d[key]", "d.get(key, default)", "d.find(key)", "d.index(key)"], "answer": 1, "explain": "d[key] raises KeyError on a missing key; d.get(key, 0) returns the default — the counting trick of the worked example.", "back": 60},
  {"at": 10600, "q": "A function without a return statement gives back…", "options": ["0", "None", "whatever it printed", "an error"], "answer": 1, "explain": "No return means None — which is why a function that only prints gives you nothing to assert or reuse.", "back": 60}]}
```

---

## 2. Worked example — Jasur's approval rate by channel, in loops (15 min)

Grain of `applications.csv`: one row = one application; 14 000 rows. The rate = approved ÷ applications, per channel; approved = `status` beginning with `approved` (week 4's `"approved*"` wildcard). Two dicts, one pass over the rows:

```python
import csv
with open("../excel/applications.csv", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

total, approved = {}, {}
for r in rows:
    ch = r["channel"]
    total[ch] = total.get(ch, 0) + 1
    if r["status"].startswith("approved"):
        approved[ch] = approved.get(ch, 0) + 1

for ch in sorted(total):
    print(f"{ch:<8}{total[ch]:>6}{approved[ch]:>6}{100 * approved[ch] / total[ch]:>7.1f} %")
```

```
app       5006  2915   58.2 %
branch    6223  3965   63.7 %
partner   2771  1715   61.9 %
```

Week 2's `GROUP BY channel`, week 4's `COUNTIFS`, now a `for`. Three things to see. The dicts are the *groups*: `.get(ch, 0) + 1` is "count one more for this key, starting at zero if new". `startswith("approved")` is the wildcard. And nothing was summed from text: `total[ch]` counts rows, so no `int()` was needed — the moment you sum `requested_amount` you must convert. Decided-only convention: a third dict counting `r["status"] != "cancelled"` → 68.2 / 72.4 / 70.5 %.

> ⚠️ **Watch out.** `== "approved"` alone gives 56.6 % for the app — Marketing's number — because the status has two spellings and 678 `approved_not_disbursed` rows are lost. Look at the distinct values of a column before you test it for one of them.

> 💡 **Key idea.** The total row sums the counts: 8 595 / 14 000 = **61.4 %**. Averaging the three channel rates gives 61.3 % — never average rates for a total.

```game
{"type": "cloze", "id": "w05d1-g3", "title": "Fill the approval loop", "text": "for r in rows:\n    ch = r[\"channel\"]\n    total[ch] = total.get(ch, {{0}}) + 1\n    if r[\"status\"].{{1}}(\"approved\"):\n        approved[ch] = approved.get(ch, 0) + 1\nrate = 100 * approved[ch] / {{2}}", "blanks": [["0"], ["startswith"], ["total[ch]"]], "distractors": ["1", "endswith", "len(rows)"]}
```

---

## 3. Practice (50 min)

Every task below has its own editor that already reads the file it needs. Write your code under `# your code`, press **▶ Run**, then **✔ Check** — the check looks for the answer among the numbers your code prints, so print the result. Working in Jupyter instead? Do the task in a notebook `week5_day1.ipynb` (File → New → Notebook), one task per cell, then paste your code into the editor to check it.

**P1.** Types: `principal = "31150000"` as read from the CSV. What does `principal * 2` give, what does `int(principal) * 2` give, and what error does `principal + 1` raise?

```task
{"id": "w05d1-p1", "kind": "python", "starter": "principal = \"31150000\"      # as read from the CSV\n\n# your code: print principal * 2, then int(principal) * 2,\n# then try principal + 1 and read the last line of the error\n", "answer": 62300000, "dp": 0, "hint": "int() turns the text into a number; only then does * 2 double it.", "model": "print(principal * 2)        # 3115000031150000 — the text, repeated\nprint(int(principal) * 2)   # 62300000\nprint(principal + 1)        # TypeError: can only concatenate str (not \"int\") to str\n\nThe CSV lesson in one line: convert before arithmetic."}
```

**P2.** A list of the five bucket labels in order. Print the last one without counting, the middle three with a slice, and the position of `"61-90"` with `.index()`.

```task
{"id": "w05d1-p2", "kind": "python", "starter": "buckets = [\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"]\n\n# your code: the last label, the middle three (a slice), the position of \"61-90\"\n", "answer": 3, "dp": 0, "hint": "Negative positions count from the end; a slice stops before its second number.", "model": "print(buckets[-1])             # 90+\nprint(buckets[1:4])            # ['1-30', '31-60', '61-90']\nprint(buckets.index(\"61-90\"))  # 3\n\nSlices stop before the second number — the half-open filter of week 1, as indexes."}
```

**P3.** Count applications per `status` with a dict and a loop; print the dict sorted by count, largest first.

```task
{"id": "w05d1-p3", "kind": "python", "starter": "import csv\nwith open(\"../excel/applications.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\n# your code\n", "answer": 7917, "dp": 0, "hint": "The check looks for the count of plain \"approved\". sorted(d.items(), key=lambda kv: kv[1], reverse=True) sorts by the value.", "model": "counts = {}\nfor r in rows:\n    counts[r[\"status\"]] = counts.get(r[\"status\"], 0) + 1\nprint(sorted(counts.items(), key=lambda kv: kv[1], reverse=True))\n# [('approved', 7917), ('rejected', 3588), ('cancelled', 1817), ('approved_not_disbursed', 678)]\n\nlambda kv: kv[1] says \"sort by the value\". The four sum to 14 000; approved* = 8 595."}
```

**P4.** Write `label(dpd)` from section 1 and apply it with a comprehension to `[0, 7, 30, 31, 45, 90, 91, 919]`. Then count how many of `loans_status.csv`'s 7 828 rows land in each label with a dict.

```task
{"id": "w05d1-p4", "kind": "python", "starter": "import csv\nwith open(\"../excel/loans_status.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    loans = list(csv.DictReader(f))\n\n# your code: label(dpd), the comprehension, then the count per label\n", "answer": 234, "dp": 0, "hint": "The check looks for the 90+ count. Remember int(r[\"dpd\"]) — the file gives text.", "model": "def label(dpd):\n    if dpd <= 0: return \"0\"\n    elif dpd <= 30: return \"1-30\"\n    elif dpd <= 60: return \"31-60\"\n    elif dpd <= 90: return \"61-90\"\n    else: return \"90+\"\nprint([label(d) for d in [0, 7, 30, 31, 45, 90, 91, 919]])\n# ['0', '1-30', '1-30', '31-60', '31-60', '61-90', '90+', '90+'] — 30 is still 1-30, 91 is 90+\nby_label = {}\nfor r in loans:\n    k = label(int(r[\"dpd\"]))\n    by_label[k] = by_label.get(k, 0) + 1\nprint(by_label)   # {'0': 7429, '1-30': 124, '31-60': 25, '61-90': 16, '90+': 234}\n\nThe week-2/3/4 buckets a fourth time. Checksum: 7 429 + 399 = 7 828."}
```

**P5.** Sum `requested_amount` per channel; print each as `f"{x / 1e9:.1f} bn"`. What goes wrong without `int()`?

```task
{"id": "w05d1-p5", "kind": "python", "starter": "import csv\nwith open(\"../excel/applications.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\n# your code\n", "answer": 681.2, "dp": 1, "hint": "The check looks for the branch total in bn, one decimal.", "model": "req = {}\nfor r in rows:\n    req[r[\"channel\"]] = req.get(r[\"channel\"], 0) + int(r[\"requested_amount\"])\nfor ch, x in req.items():\n    print(ch, f\"{x / 1e9:.1f} bn\")\n# branch 681.2 bn · app 13.6 bn · partner 11.4 bn\n\n706.2 bn requested in total against 404.8 bn disbursed — the branch asks for SME and Auto money. Without int(), 0 + \"322610000\" raises TypeError: unsupported operand type(s) for +: 'int' and 'str'. Worse, if you start the total from \"\" instead of 0, += glues the texts into one enormous string — no error, a wrong answer; run type() on a sum that looks strange."}
```

**P6.** Missing values: how many rows have `credit_score == ""`? Compute the average credit score of the rest — and explain why `sum / len(rows)` would be wrong.

```task
{"id": "w05d1-p6", "kind": "python", "starter": "import csv\nwith open(\"../excel/applications.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\n# your code\n", "answer": 659.6, "dp": 1, "hint": "The check looks for the mean of the non-blank scores, one decimal. Filter out \"\" before int().", "model": "scores = [int(r[\"credit_score\"]) for r in rows if r[\"credit_score\"] != \"\"]\nprint(len(rows) - len(scores))              # 388 blanks (2.8 %)\nprint(round(sum(scores) / len(scores), 1))  # 659.6\n\nDividing by 14 000 silently treats a blank as 0 and pulls the mean down to 641.3 — week 2's NULL rule (AVG ignores NULL; your loop must too) written by hand."}
```

**P7.** Dates: `from datetime import date, datetime`; parse `applied_at` (`"2025-06-02 10:35:00"`) with `datetime.strptime(s, "%Y-%m-%d %H:%M:%S")`, then count applications in September 2026 with the half-open rule. Check it against `<= 2026-09-30`.

```task
{"id": "w05d1-p7", "kind": "python", "starter": "import csv\nfrom datetime import date, datetime\nwith open(\"../excel/applications.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\n# your code\n", "answer": 621, "dp": 0, "hint": "The check looks for the half-open count. Compare .date() with date(2026, 9, 1) and date(2026, 10, 1).", "model": "ds = [datetime.strptime(r[\"applied_at\"], \"%Y-%m-%d %H:%M:%S\") for r in rows]\nprint(sum(1 for d in ds if date(2026, 9, 1) <= d.date() < date(2026, 10, 1)))      # 621\nprint(sum(1 for d in ds if datetime(2026, 9, 1) <= d <= datetime(2026, 9, 30)))    # 598\n\n23 applications after midnight on the 30th are lost by <= — week 1's trap, in a third language. Converting to .date() first makes both forms agree."}
```

**P8.** Write `top_n(d, n)` returning the n largest `(key, value)` pairs of a dict, and use it on the per-`product` counts of applications. Then a `while` loop that grows 1 000 000 by 30 % a year until it passes 10 000 000 — how many years?

```task
{"id": "w05d1-p8", "kind": "python", "starter": "import csv\nwith open(\"../excel/applications.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\n# your code: top_n, then the while loop — print the number of years last\n", "answer": 9, "dp": 0, "hint": "The check looks for the number of years. A while without years += 1 never ends.", "model": "def top_n(d, n):\n    return sorted(d.items(), key=lambda kv: kv[1], reverse=True)[:n]\nby_product = {}\nfor r in rows:\n    by_product[r[\"product\"]] = by_product.get(r[\"product\"], 0) + 1\nprint(top_n(by_product, 3))   # [('Micro loan', 5006), ('Consumer loan', 4204), ('Buy now pay later', 2771)]\nx, years = 1_000_000, 0\nwhile x <= 10_000_000:\n    x *= 1.3\n    years += 1\nprint(years)                  # 9 (1.3^9 = 10.6)\n\nA while without the += 1 runs forever — in Jupyter, Kernel → Interrupt; on the page, reload it."}
```

**P9.** Write `approval_rate(rows, channel, convention="all")` as in the worked example, with `"decided"` as the second convention, and a `try/except` around a call with a channel that does not exist so that it returns `None` instead of crashing.

```task
{"id": "w05d1-p9", "kind": "python", "starter": "import csv\nwith open(\"../excel/applications.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\n# your code\n", "answer": 68.2, "dp": 1, "hint": "The check looks for the app channel under the decided convention (cancelled applications left out).", "model": "def approval_rate(rows, channel, convention=\"all\"):\n    sub = [r for r in rows if r[\"channel\"] == channel\n           and (convention == \"all\" or r[\"status\"] != \"cancelled\")]\n    try:\n        return round(100 * sum(r[\"status\"].startswith(\"approved\") for r in sub) / len(sub), 1)\n    except ZeroDivisionError:\n        return None\nfor ch in [\"app\", \"branch\", \"partner\"]:\n    print(ch, approval_rate(rows, ch), approval_rate(rows, ch, \"decided\"))\nprint(approval_rate(rows, \"crypto\"))   # None\n\nall: 58.2 / 63.7 / 61.9; decided: 68.2 / 72.4 / 70.5 — week 4's COUNTIFS table. For an unknown channel the list is empty and / 0 raises ZeroDivisionError; if not sub: return None before dividing is the clearer version."}
```

> 🚀 **Stretch (optional, +5 XP).** **P10.** Read `loans_status.csv` and compute Σ `outstanding` by `product` with a dict, then the share of each with an f-string `:.1%`. Then write the same result to a new CSV with `csv.DictWriter` (`fieldnames=["product", "outstanding", "share"]`) and read it back (in Jupyter, open it in Excel).

```task
{"id": "w05d1-p10", "kind": "python", "starter": "import csv\nwith open(\"../excel/loans_status.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    loans = list(csv.DictReader(f))\n\n# your code\n", "answer": 60.3, "dp": 1, "xp": 2, "hint": "The check looks for SME's share in %, one decimal (print 100 * share, or read it off the :.1% text).", "model": "out = {}\nfor r in loans:\n    out[r[\"product\"]] = out.get(r[\"product\"], 0) + int(r[\"outstanding\"])\ntotal = sum(out.values())                      # 208 723 504 430\nwith open(\"outstanding_by_product.csv\", \"w\", newline=\"\", encoding=\"utf-8\") as f:\n    w = csv.DictWriter(f, fieldnames=[\"product\", \"outstanding\", \"share\"])\n    w.writeheader()\n    for p, v in out.items():\n        w.writerow({\"product\": p, \"outstanding\": v, \"share\": f\"{v / total:.1%}\"})\nprint(open(\"outstanding_by_product.csv\").read())\nprint(round(100 * out[\"Small business loan\"] / total, 1))   # 60.3\n\nSME 125 892 942 411 (60.3 %) · Auto 57 684 271 333 (27.6) · Consumer 23 054 933 316 (11.0) · BNPL 1 135 251 000 (0.5) · Micro 956 106 370 (0.5). newline=\"\" in open, or Excel shows blank lines between rows. Tomorrow this is four lines of pandas."}
```

### Mistakes that cost a point this week

- Cells run out of order and a notebook that fails on *Restart & Run All*.
- Summing CSV text without `int()`/`float()` — a `TypeError`, or worse, text glued together.
- `== "approved"` where the status has two spellings — 678 approvals lost.
- A `for` that recomputes the same dict lookup three times instead of a variable.
- Dividing by `len(rows)` when some rows are blank — NULLs counted as zero.
- A function that `print`s the result instead of `return`ing it — nothing to assert, nothing to reuse.
- Reading the first line of a traceback instead of the last.

---

## 4. Homework <span class="badge hw">HW 5.1 — Due Day 3</span>

**Jasur's eight functions.** Open `data/python/day1_starter.ipynb` in Jupyter or Colab (section 1, "Where your code runs"). Eight functions are stubs that raise `NotImplementedError`; under each is an **assert cell** with the expected answers. Replace the body of each stub until its assert cell runs silently, then **Kernel → Restart & Run All** and hand in the executed notebook (`day1_starter.ipynb`) with the 📎 box below.

1. `dpd_bucket(dpd)` — the five labels (negative → `"0"`).
2. `annuity(principal, annual_rate, term)` — the monthly payment rounded to the nearest 100 (Company corner).
3. `schedule(principal, annual_rate, term)` — the list of `(n, payment, interest, principal_part, balance_after)`.
4. `parse_date(s)` — ISO text (with or without a time) to a `date`; blank or garbage → `None`.
5. `is_valid_birth_date(d, as_of)` — week 4's rule: between 1920-01-01 and the as-of.
6. `normalise_method(s)` — `"CASH "` → `"cash"`, `"bank transfer"` → `"transfer"`.
7. `approval_rate(rows, channel, convention)` — P9.
8. `top_n(d, n)` — P8.

Section 9 of the notebook uses 6 and 8 together on `payments_dirty.csv` (five clean methods, card first).

**Check your key numbers before you hand in.** Paste your functions from the notebook into these two editors; the check compares what they print with the warehouse.

```task
{"id": "w05d1-hw1", "kind": "python", "starter": "# paste your annuity() from the notebook here\n\n\nprint(annuity(31_150_000, 0.30, 24))   # loan 1\nprint(annuity(1_590_000, 0.42, 3))     # loan 3\n", "answer": 1741700, "dp": 0, "hint": "r = annual_rate / 12; round to the nearest 100 with round(x, -2); a zero rate divides principal / term.", "model": "1 741 700 — loan 1's monthly_payment in nur.db (loan 3: 567 500). With the round-to-100 rule the formula matches all 7 828 loans."}
```

```task
{"id": "w05d1-hw2", "kind": "python", "starter": "# paste your annuity() and schedule() from the notebook here\n\n\nrows = schedule(31_150_000, 0.30, 24)\nprint(rows[0])                    # month 1\nprint(sum(r[2] for r in rows))    # total interest over the 24 months\n", "answer": 10650293, "dp": 0, "hint": "Each month interest = round(balance × r) and principal_part = payment − interest; the last month clears the balance instead of overpaying.", "model": "10 650 293 — the interest parts of loan 1's 24 instalments in installments. Month 1 is (1, 1741700, 778750, 962950, 30187050); month 24 pays 1 741 193."}
```

### 📎 Hand in here

```sqltask
{"check": "handin-W5D1", "lesson": "W5D1", "title": "HW 5.1", "why": "These eight functions are the building blocks Jasur's scheduled scripts reuse — bucket labels, the annuity, dates, method names — and an assert is how you prove a function tells the truth before anyone relies on it.", "graded": ["All eight assert cells pass after Kernel → Restart & Run All — 8 points, one per function", "No function prints; every one returns — 1 point", "A docstring on each, in your words: what it does and what it returns — 1 point"], "tasks": [{"id": "day1_starter.ipynb", "file": "day1_starter.ipynb", "names": ["day1_starter.ipynb"], "upload": true, "accept": ".ipynb", "q": "Attach `day1_starter.ipynb` — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## 5. Self-check

```check
{"id": "w05d1-sc", "questions": [
  {"type": "single", "q": "You changed a function in cell 4 and re-ran only cell 9; the assert still fails with the old behaviour. What do you do?", "options": ["Run cell 9 again", "Re-run cell 4 first — better, Kernel → Restart & Run All: the kernel still holds the old function", "Delete the assert", "Copy the function into cell 9"], "answer": 1, "explain": "The kernel remembers what was last run, not what is on the screen (→ section 1, 'Jupyter')."},
  {"type": "single", "q": "r[\"dpd\"] > 30 raises TypeError for a row from csv.DictReader. Why?", "options": ["dpd is a float", "Every value DictReader gives is a string, and text cannot be compared with a number — write int(r[\"dpd\"]) > 30", "The column is called DPD", "30 must be written 30.0"], "answer": 1, "explain": "A CSV knows no types; convert on use (→ section 1, 'Reading a CSV', P1)."},
  {"type": "single", "q": "Which comprehension is week 2's WHERE status LIKE 'approved%' AND channel = 'app'?", "options": ["[r for r in rows if r[\"status\"] == \"approved\" and r[\"channel\"] == \"app\"]", "[r for r in rows if r[\"status\"].startswith(\"approved\") and r[\"channel\"] == \"app\"]", "[r for r in rows if r[\"status\"].startswith(\"approved\") or r[\"channel\"] == \"app\"]", "[r[\"status\"] for r in rows if r[\"channel\"] == \"app\"]"], "answer": 1, "explain": "startswith is the LIKE 'approved%' wildcard; and joins the two conditions (→ section 1, 'List comprehensions', section 2)."},
  {"type": "number", "q": "How many applications in applications.csv have a blank credit_score?", "answer": 388, "tol": 0, "explain": "388 of 14 000 (2.8 %) — they arrive as \"\", so test for the empty string before int() (→ P6)."}
]}
```

---

## 6. Company corner <span class="badge company">The annuity formula</span>

Every instalment in `installments` (92 193 rows) was produced by one formula. An **annuity** (*аннуитет*) loan pays the same amount every month; inside that amount the **interest** part shrinks and the **principal** part grows as the balance falls:

```
payment = P × r / (1 − (1 + r)^−n)        P = principal, r = annual_rate / 12, n = term in months
```

Nur Finance rounds the payment to the nearest **100 soum** (`round(x, -2)`), and zero-rate BNPL simply divides `P / n`. In Python:

```python
def annuity(principal, annual_rate, term):
    r = annual_rate / 12
    pay = principal / term if r == 0 else principal * r / (1 - (1 + r) ** -term)
    return int(round(pay, -2))

annuity(31_150_000, 0.30, 24)     # 1741700 — loan 1
```

```game
{"type": "build", "id": "w05d1-g4", "title": "Build the annuity payment", "q": "Assemble Nur Finance's monthly payment, with r = annual_rate / 12 already computed.", "tokens": ["pay =", "principal", "*", "r", "/", "(1 - (1 + r) ** -term)"], "distractors": ["(1 + r) ** term", "+ interest"]}
```

**Check against three real loans** (`loans.principal`, `annual_rate`, `term_months`, `monthly_payment` from `nur.db`; the same three head `loans_status.csv`):

| loan | principal | rate | term | formula | `monthly_payment` |
|---|---|---|---|---|---|
| 1 (Consumer) | 31 150 000 | 30 % | 24 | 1 741 684.35 → **1 741 700** | 1 741 700 |
| 2 (Consumer) | 40 060 000 | 30 % | 18 | 2 790 983.43 → **2 791 000** | 2 791 000 |
| 3 (Micro) | 1 590 000 | 42 % | 3 | 567 525.35 → **567 500** | 567 500 |

Run over all 7 828 loans, `annuity()` equals `monthly_payment` for **7 828** — the rounding rule is the whole difference between "approximately right" (590 matches with `int()`, 579 with `round()`) and exactly right. When a company's number does not match your formula, the gap is almost always a rounding or day-count convention; find it, write it down, and then your function *is* the definition.

**Principal vs interest over the schedule** — loan 1, the first six of 24 rows, each month `interest = round(balance × r)`, `principal_part = payment − interest`:

```
n  payment    interest  principal  balance after
1  1 741 700   778 750    962 950   30 187 050
2  1 741 700   754 676    987 024   29 200 026
3  1 741 700   730 001  1 011 699   28 188 327
4  1 741 700   704 708  1 036 992   27 151 335
5  1 741 700   678 783  1 062 917   26 088 418
6  1 741 700   652 210  1 089 490   24 998 928
```

These are exactly `installments` rows 1–6 for `loan_id = 1` (`interest_due` 778 750, `principal_due` 962 950 …). The 24th row pays 1 741 193 — a little less, because the balance is cleared rather than overpaid; the principal parts sum to 31 150 000 and the interest parts to 10 650 293 (34 % on top of the principal over two years).

> 💡 **Key idea.** **Outstanding** is the sum of the *principal* parts not yet due — the interest is revenue, not exposure. Because interest is front-loaded, loan 1, one year into its 24-month term, still has 17 865 571 outstanding — 57 % of its principal, not 50 %. The same reason makes early repayment save the borrower less than they expect, and keeps a 48-month Auto loan's balance almost still in its first year.

> 🎯 **Interview version.** *"How is an annuity payment computed, and how does the split change over time?"* — P·r/(1−(1+r)^−n) with the monthly rate; equal payments; interest = balance × r so it falls every month and the principal part rises by the same amount; the balance after month k is what the schedule still owes — that is the outstanding; check the function against three real loans and state the rounding rule.

**Say it like in an interview.** Answer the question above in your own words, as you would say it aloud, with one Nur Finance number.

```task
{"id": "w05d1-int", "kind": "free", "min": 30, "model": "An annuity pays the same amount every month: P × r / (1 − (1 + r)^−n), where r is the monthly rate (annual rate / 12) and n the term in months. Inside each payment the interest is balance × r, so it is largest in month 1 and falls every month, while the principal part grows by the same amount. The balance after month k — the principal not yet due — is the outstanding: Nur Finance's loan 1 (31.15 m at 30 % for 24 months) still has 57 % outstanding after a year, not 50 %. I would check the function against three real loans and state the rounding rule: Nur Finance rounds to the nearest 100 soum, and with that rule the formula matches all 7 828 loans.", "rubric": ["Gives the formula with the monthly rate (annual / 12)", "Says interest = balance × r, so interest falls and the principal part rises", "Links the remaining principal to outstanding", "Checks against real loans and names the rounding rule"]}
```

Tomorrow: pandas — the `rows` list becomes a DataFrame, and the loops become one line each. Bekzod's monthly notebook.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w05d1", "pass": 0.8, "questions": [
  {"type": "single", "q": "You change the function in cell 3, then re-run only cell 7, which calls it. Which version does cell 7 use?", "options": ["Whichever cell is higher on the page", "None — it raises NameError", "The new one — Jupyter re-reads every cell above", "The old one — the kernel remembers what was last run, not what is on the screen"], "answer": 3, "explain": "The kernel keeps variables in the order cells were run; Kernel → Restart & Run All is the only proof that a notebook works top to bottom (→ section 1, 'Jupyter')."},
  {"type": "single", "q": "What does this print?", "code": "principal = \"31150000\"      # as read by csv.DictReader\nprint(principal * 2)", "options": ["3115000031150000", "62300000", "TypeError", "62300000.0"], "answer": 0, "explain": "Every value from a CSV is text, and a string times 2 is the string repeated — convert with int() before any arithmetic (→ P1)."},
  {"type": "single", "q": "With label() from section 1, what does the last line print?", "code": "def label(dpd):\n    if dpd <= 0: return \"0\"\n    elif dpd <= 30: return \"1-30\"\n    elif dpd <= 60: return \"31-60\"\n    elif dpd <= 90: return \"61-90\"\n    else: return \"90+\"\n\nprint(label(30), label(91))", "options": ["1-30 61-90", "31-60 61-90", "1-30 90+", "31-60 90+"], "answer": 2, "explain": "dpd <= 30 is still 1-30, and 91 is past 90 — the right-closed buckets of week 2 (→ P4)."},
  {"type": "single", "q": "This loop gives approval rates a few points below week 4's 58.2 / 63.7 / 61.9 %. Why?", "code": "for r in rows:\n    ch = r[\"channel\"]\n    total[ch] = total.get(ch, 0) + 1\n    if r[\"status\"] == \"approved\":\n        approved[ch] = approved.get(ch, 0) + 1", "options": ["total.get(ch, 0) resets the count on every row", "The rows were not converted with int()", "The dicts are not sorted", "== \"approved\" misses the approved_not_disbursed rows"], "answer": 3, "explain": "Status has two 'approved' spellings; startswith(\"approved\") is week 4's \"approved*\" wildcard — == alone loses 678 approvals (→ section 2)."},
  {"type": "number", "q": "Approved / applications: app 2 915 / 5 006, branch 3 965 / 6 223, partner 1 715 / 2 771. What is the total approval rate, in %, one decimal?", "answer": 61.4, "tol": 0.05, "explain": "Sum the counts: 8 595 / 14 000 = 61.4 %. Averaging the three channel rates gives 61.3 % — never average rates for a total row (→ section 2)."},
  {"type": "multi", "q": "Which statements about rows read with csv.DictReader are true?", "options": ["Numeric columns are converted to int automatically", "Every value is a string", "A blank cell arrives as an empty string \"\"", "Each row is a dict keyed by the header line", "sum() skips blank credit scores by itself"], "answer": [1, 2, 3], "explain": "DictReader gives text keyed by the header; convert on use and test for \"\" first — 388 credit scores are blank (→ section 1, 'Reading a CSV')."},
  {"type": "single", "q": "A cell fails with a long traceback. What do you read first?", "options": ["The first line", "Nothing — re-run the cell until it works", "The frames inside the library", "The last line (the error type and message), then the arrow at your own code"], "answer": 3, "explain": "The newest call is at the bottom: the last line names the error, the arrow shows the line of your code (→ section 1, 'Errors')."},
  {"type": "single", "q": "Company corner: loan 1 (24-month annuity) is one year into its term. Its outstanding is…", "options": ["the sum of the 12 remaining payments, interest included", "more than 50 %, because the early payments are mostly interest", "exactly 50 % of the principal", "less than 50 %, because interest is paid off first"], "answer": 1, "explain": "Interest = balance × r is front-loaded, so the principal parts start small; outstanding = principal not yet due — 57 % for loan 1 (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w05d1", "q": "Jasur wants to know how often a weak score still gets through. In data/excel/applications.csv, among the applications that have a credit score below 600 (skip the blank scores), what share were approved (status beginning with \"approved\")? Use only csv and loops. Give a percentage to 2 decimals.", "type": "number", "dp": 2, "python": true, "h": ["a3e242d4afa891d50a2ef80b"], "hint": "Two counters, one pass. A blank score is the text \"\" — test for it before you call int(), and count the row nowhere.", "sol": "aW1wb3J0IGNzdgp3aXRoIG9wZW4oIi4uL2V4Y2VsL2FwcGxpY2F0aW9ucy5jc3YiLCBuZXdsaW5lPSIiLCBlbmNvZGluZz0idXRmLTgiKSBhcyBmOgogICAgcm93cyA9IGxpc3QoY3N2LkRpY3RSZWFkZXIoZikpCmxvdyA9IGFwcHJvdmVkID0gMApmb3IgciBpbiByb3dzOgogICAgaWYgclsiY3JlZGl0X3Njb3JlIl0gPT0gIiI6CiAgICAgICAgY29udGludWUKICAgIGlmIGludChyWyJjcmVkaXRfc2NvcmUiXSkgPCA2MDA6CiAgICAgICAgbG93ICs9IDEKICAgICAgICBpZiByWyJzdGF0dXMiXS5zdGFydHN3aXRoKCJhcHByb3ZlZCIpOgogICAgICAgICAgICBhcHByb3ZlZCArPSAxCnByaW50KGxvdywgYXBwcm92ZWQsIHJvdW5kKDEwMCAqIGFwcHJvdmVkIC8gbG93LCAyKSkgICAjIDIxNTUgMzYzIDE2Ljg0CgoxNi44NCAlOiAzNjMgb2YgdGhlIDIgMTU1IHNjb3JlZCBhcHBsaWNhdGlvbnMgdW5kZXIgNjAwIHdlcmUgYXBwcm92ZWQg4oCUIGFnYWluc3QgNjEuNCAlIGZvciBhbGwgYXBwbGljYXRpb25zLgpUaGUgdHdvIHRyYXBzIGFyZSB0aGUgYmxhbmsgc2NvcmVzIChpbnQoIiIpIHJhaXNlcyBWYWx1ZUVycm9yKSBhbmQgdGhlIHR3byBzcGVsbGluZ3Mgb2YgYXBwcm92YWwgKD09ICJhcHByb3ZlZCIgYWxvbmUgbG9zZXMgdGhlIGFwcHJvdmVkX25vdF9kaXNidXJzZWQgcm93cykuCkJ5IGNoYW5uZWwgdGhlIGFwcCBpcyB0aGUgc3RyaWN0ZXN0IHdpdGggd2VhayBzY29yZXMgKDExLjYgJSksIGJyYW5jaCBhbmQgcGFydG5lciBib3RoIGFib3V0IDE5LjYgJSDigJQgYSBxdWVzdGlvbiBmb3IgdGhlIHNjb3JlY2FyZCdzIGN1dC1vZmYu"}
```

<!-- challenge:end -->
