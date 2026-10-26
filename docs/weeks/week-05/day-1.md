# Week 5 · Day 1 — Python from zero: the notebook is your lab

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 5.1 (due Day 3)</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:00.** A new face at Madina's desk: Jasur, the data scientist (*дата-сайентист*) who builds the scorecard. *"Welcome to the half of the building that does not use a mouse. Everything you did in weeks 1–4 I do in Python — the same joins, the same buckets — but it runs every morning at 6:00 without me, and the next step is the model. Before pandas, prove you can **think in loops**: compute the approval rate by channel with plain Python from `applications.csv`. No library that does it for you. If you can do it with a `for`, you will understand what pandas is doing when it does it for you."* Madina: *"And install the tools today; tomorrow the data arrives."*

## Today in 3 lines

- Why analysts write Python: the analysis is a **file that re-runs** (repeatable), it scales from 7 828 rows to 70 million without changing (scalable), it is free and it is the language of the next steps (models, automation, Power BI's Python visuals).
- You install **Anaconda** (or fall back to Google Colab), open **Jupyter**, and learn the language's grammar: types, lists, dicts, `if`/`for`/`while`, functions, f-strings, list comprehensions, modules, reading a CSV with `csv`, reading a traceback.
- You have Jasur's approval rate by channel in loops (**58.2 / 63.7 / 61.9 %**, the week-2 and week-4 numbers) and the start of HW 5.1 — eight functions that must pass their asserts in `data/python/day1_starter.ipynb`.

---

## 1. Learn — the language, one notebook cell at a time

### Install: Anaconda, then Jupyter

**Anaconda** (*дистрибутив Anaconda*) is Python plus the analyst's libraries (pandas, matplotlib, Jupyter) in one installer: https://www.anaconda.com/download → Windows → *Just me* → defaults. Then open **Anaconda Prompt** from the Start menu and type:

```
cd "C:\path\to\Analytics Learning"
pip install -r requirements.txt
jupyter notebook data/python
```

The browser opens a file list; click `day1_starter.ipynb`. **Fallback:** if the installer is blocked, https://colab.research.google.com runs the same notebooks in the browser — upload the `.ipynb` and the CSVs it reads (`data/python/README.md` explains the one line to change). Everything on this page runs in both.

### Jupyter: cells, Shift+Enter, the kernel

A **notebook** (*блокнот, ноутбук*) is a list of **cells**. A *code* cell runs Python; a *Markdown* cell holds text (your findings — the same Markdown as this page). **Shift+Enter** runs the cell and moves down; **Ctrl+Enter** runs and stays. The **kernel** (*ядро*) is the Python process behind the notebook: it remembers every variable you have defined, in the order you *ran* the cells — not the order they appear. That is the first trap: if you edit cell 3 and re-run only cell 7, cell 7 still sees the *old* cell 3. Before you hand anything in: **Kernel → Restart & Run All**; if it runs top to bottom without error, it is reproducible. `[*]` on the left means the cell is still running; `[5]` means it was the fifth cell executed.

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

A function (*функция*) is a named, reusable step with inputs (**parameters**) and one output (`return`). Without `return` it returns `None`. Defaults (`decimals=1`) make a parameter optional. The habit that makes Python analysis trustworthy: every number you report comes out of a function you can test — which is what HW 5.1's asserts are: `assert approval_rate(2915, 5006) == 58.2` fails loudly if the function lies, says nothing if it is right.

### f-strings and formatting

```python
outstanding = 208_723_504_430
f"{outstanding:,}"            # '208,723,504,430'  — thousands separators
f"{outstanding / 1e9:.1f} bn" # '208.7 bn'
f"{0.0312:.2%}"               # '3.12%'
f"{'app':<8}{58.2:>6.1f} %"   # 'app       58.2 %' — padding: < left, > right, width 8
```

`f"…{expression}…"` evaluates whatever is inside the braces. The format spec after the colon is Excel's number format in a different spelling: `,` thousands, `.1f` one decimal, `.2%` percent, `>6` right-aligned in six characters.

### List comprehensions

```python
late = [r for r in loans if r["dpd"] > 0]                   # WHERE
amounts = [int(r["principal"]) for r in loans]              # SELECT one column, converted
labels = [label(int(r["dpd"])) for r in loans]              # a CASE per row
sum(1 for r in loans if r["status"] == "active")            # COUNT with a condition — 3352
```

A comprehension (*списковое включение*) is a `for` that builds a list in one line: `[expression for item in iterable if condition]`. Read it right to left: *for each loan, if late, keep it*. It is how you will think about pandas' boolean masks tomorrow.

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
len(rows)                                   # 14000
rows[0]["channel"], rows[0]["status"]       # ('branch', 'rejected')
```

`with open(...) as f:` opens the file and closes it when the block ends. `csv.DictReader` gives each row as a dict keyed by the header line — every value is a **string**: `"322610000"` not `322610000`, `""` for a blank (the 388 missing credit scores). Convert on use: `int(r["requested_amount"])`, and check for `""` first.

### Errors: how to read a traceback

```
ZeroDivisionError: division by zero                       ← the LAST line is the error; read it first
  Cell In[7], line 3                                       ← then the arrow: which line of your code
    return round(100 * approved / total, 1)
```

A **traceback** (*трассировка*) lists the calls that led to the error, newest at the bottom. Read the last line (the type and message), then the line of *your* code it points at. The ones you will meet this week: `NameError` (a variable you have not defined — or defined in a cell you did not run), `TypeError` (`"42" + 1`: text plus number — convert first), `KeyError` (a dict key or column name that does not exist — check the spelling and the header), `IndexError` (position past the end), `ValueError` (`int("n/a")`), `FileNotFoundError` (the path is relative to where Jupyter was started), `SyntaxError` (a missing colon or bracket — the arrow points *after* the problem), `IndentationError`. `try: … except ValueError: …` catches an error you expect (`parse_date` in HW 5.1 returns `None` instead of crashing on `"n/a"`).

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Jupyter (install, new notebook, markdown, shortcuts) — [Jupyter Notebook Tutorial: Introduction, Setup, and Walkthrough (Corey Schafer), 04:08](https://youtu.be/HW29067qVWk?t=248)
- ▶ Install Anaconda (what the page asks) — [Python for Data Analytics - Full Course for Beginners (Luke Barousse), 5:50:56](https://youtu.be/wUSDVGivd-8?t=21056)
- ▶ Variables and types — [Python for Data Analytics - Full Course for Beginners (Luke Barousse), 18:52](https://youtu.be/wUSDVGivd-8?t=1132)
- ▶ Lists, dicts, tuples — [same course, 1:34:24](https://youtu.be/wUSDVGivd-8?t=5664)
- ▶ if / for / while — [same course, 1:26:20](https://youtu.be/wUSDVGivd-8?t=5180)
- ▶ Functions — [same course, 2:52:12](https://youtu.be/wUSDVGivd-8?t=10332)
- ▶ Modules (import) — [same course, 3:12:46](https://youtu.be/wUSDVGivd-8?t=11566)

- RU deck `4.1 Python.pdf` (109 pages): types pp. 26–48, control flow pp. 49–61, lists / tuples / dicts / sets pp. 62–71, functions pp. 72–78, exceptions pp. 83–91, files pp. 92–107 — the recording `video1256130814.mp4` is this lecture. `En_4.2_Python.pdf` is NumPy (arrays, slicing, broadcasting, pp. 12–66): pandas sits on top of it; read it when `.values` or `np.where` puzzle you.
- *Russian terms:* переменная = variable, целое / вещественное число = int / float, строка = str, список = list, словарь = dict, кортеж = tuple, цикл = loop, функция = function, параметр / аргумент = parameter / argument, модуль = module, исключение = exception, трассировка = traceback, ядро = kernel, ячейка = cell.

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

Week 2's `GROUP BY channel`, week 4's `COUNTIFS`, now a `for`. Three things to see. The dicts are the *groups*: `.get(ch, 0) + 1` is "count one more for this key, starting at zero if new". `startswith("approved")` is the wildcard; `== "approved"` alone would give 56.6 % (Marketing's number — 678 `approved_not_disbursed` rows lost). And nothing was summed from text: `total[ch]` counts rows, so no `int()` was needed — the moment you sum `requested_amount` you must convert. Decided-only convention: a third dict counting `r["status"] != "cancelled"` → 68.2 / 72.4 / 70.5 %. Total row: sum the dict values, never average the three rates (61.4 %, not 61.3).

---

## 3. Practice (50 min)

Work in a new notebook `week5_day1.ipynb` (File → New → Notebook) next to the starters, one task per cell with a Markdown heading above it. Keep the `rows` list from the worked example loaded.

**P1.** Types: `principal = "31150000"` as read from the CSV. What does `principal * 2` give, what does `int(principal) * 2` give, and what error does `principal + 1` raise?

<details><summary>Answer</summary>
`"3115000031150000"` (a string repeated), `62300000`, `TypeError: can only concatenate str (not "int") to str`. The CSV lesson in one line: convert before arithmetic.
</details>

**P2.** A list of the five bucket labels in order. Print the last one without counting, the middle three with a slice, and the position of `"61-90"` with `.index()`.

<details><summary>Answer</summary>
`buckets[-1]` → `'90+'`; `buckets[1:4]` → `['1-30', '31-60', '61-90']`; `buckets.index("61-90")` → `3`. Slices stop *before* the second number — the half-open filter of week 1, as indexes.
</details>

**P3.** Count applications per `status` with a dict and a loop; print the dict sorted by count, largest first.

<details><summary>Answer</summary>
`approved 7917 · rejected 3588 · cancelled 1817 · approved_not_disbursed 678`; the sort is `sorted(counts.items(), key=lambda kv: kv[1], reverse=True)` — `lambda kv: kv[1]` says "sort by the value". These four sum to 14 000; `approved*` = 8 595.
</details>

**P4.** Write `label(dpd)` from section 1 and apply it with a comprehension to `[0, 7, 30, 31, 45, 90, 91, 919]`. Then count how many of `loans_status.csv`'s 7 828 rows land in each label with a dict.

<details><summary>Answer</summary>
`['0', '1-30', '1-30', '31-60', '31-60', '61-90', '90+', '90+']` — 30 is still `1-30`, 91 is `90+`. On the file: `{'0': 7429, '1-30': 124, '31-60': 25, '61-90': 16, '90+': 234}`, the week-2/3/4 buckets a fourth time (remember `int(r["dpd"])`). Checksum: 7 429 + 399 = 7 828.
</details>

**P5.** Sum `requested_amount` per channel; print each as `f"{x / 1e9:.1f} bn"`. What goes wrong without `int()`?

<details><summary>Answer</summary>
branch 681.2 bn · app 13.6 bn · partner 11.4 bn (706.2 bn requested in total against 404.8 bn disbursed — the branch asks for SME and Auto money). Without `int()` the `+=` concatenates text into one enormous string — no error, a wrong answer; run `type()` on the result when a sum looks strange.
</details>

**P6.** Missing values: how many rows have `credit_score == ""`? Compute the average credit score of the rest — and explain why `sum / len(rows)` would be wrong.

<details><summary>Answer</summary>
388 blanks (2.8 %); mean of the 13 612 others **659.6**. Dividing by 14 000 silently treats a blank as 0 and pulls the mean down to 641.3 — week 2's NULL rule (`AVG` ignores NULL; your loop must too) written by hand.
</details>

**P7.** Dates: `from datetime import date, datetime`; parse `applied_at` (`"2025-06-02 10:35:00"`) with `datetime.strptime(s, "%Y-%m-%d %H:%M:%S")`, then count applications in September 2026 with the half-open rule. Check it against `<= 2026-09-30`.

<details><summary>Answer</summary>
`>= date(2026, 9, 1) and < date(2026, 10, 1)` on `.date()` → **621**; `<= date(2026, 9, 30)` on the full datetime → **598**: 23 applications after midnight on the 30th lost — week 1's trap, in a third language. Converting to `.date()` first makes both forms agree.
</details>

**P8.** Write `top_n(d, n)` returning the n largest `(key, value)` pairs of a dict, and use it on the per-`product` counts of applications. Then a `while` loop that grows 1 000 000 by 30 % a year until it passes 10 000 000 — how many years?

<details><summary>Answer</summary>
`sorted(d.items(), key=lambda kv: kv[1], reverse=True)[:n]` → `[('Micro loan', 5006), ('Consumer loan', 4204), ('Buy now pay later', 2771)]`. The `while`: 9 years (1.3⁹ = 10.6). A `while` without the `+= 1` runs forever — Kernel → Interrupt.
</details>

**P9.** Write `approval_rate(rows, channel, convention="all")` as in the worked example, with `"decided"` as the second convention, and a `try/except` around a call with a channel that does not exist so that it returns `None` instead of crashing.

<details><summary>Answer</summary>
all: 58.2 / 63.7 / 61.9; decided: 68.2 / 72.4 / 70.5 — identical to week 4's `COUNTIFS` table. For an unknown channel the filtered list is empty and `approved / 0` raises `ZeroDivisionError`; `try: … except ZeroDivisionError: return None` (or `if not rows: return None` before dividing — the clearer version).
</details>

<span class="badge stretch">Stretch</span> **P10.** Read `loans_status.csv` and compute Σ `outstanding` by `product` with a dict, then the share of each with an f-string `:.1%`. Then write the same result to a new CSV with `csv.DictWriter` (`fieldnames=["product", "outstanding", "share"]`), open it in Excel.

<details><summary>Answer</summary>
SME 125 892 942 411 (60.3 %) · Auto 57 684 271 333 (27.6) · Consumer 23 054 933 316 (11.0) · BNPL 1 135 251 000 (0.5) · Micro 956 106 370 (0.5); Σ 208 723 504 430. `writer.writeheader()` then one `writer.writerow({...})` per product; `newline=""` in `open` or Excel shows blank lines between rows. Tomorrow this is four lines of pandas.
</details>

### Mistakes that cost a point this week

- Cells run out of order and a notebook that fails on *Restart & Run All*.
- Summing CSV text without `int()`/`float()` — concatenation, not addition.
- `== "approved"` where the status has two spellings — 678 approvals lost.
- A `for` that recomputes the same dict lookup three times instead of a variable.
- Dividing by `len(rows)` when some rows are blank — NULLs counted as zero.
- A function that `print`s the result instead of `return`ing it — nothing to assert, nothing to reuse.
- Reading the first line of a traceback instead of the last.

---

## 4. Homework <span class="badge hw">HW 5.1 — Due Day 3</span>

**Jasur's eight functions.** Open `data/python/day1_starter.ipynb`. Eight functions are stubs that raise `NotImplementedError`; under each is an **assert cell** with the expected answers. Replace the body of each stub until its assert cell runs silently, then **Kernel → Restart & Run All** and submit the executed notebook to `submissions/week-05/day-1/day1_starter.ipynb`.

1. `dpd_bucket(dpd)` — the five labels (negative → `"0"`).
2. `annuity(principal, annual_rate, term)` — the monthly payment rounded to the nearest 100 (Company corner).
3. `schedule(principal, annual_rate, term)` — the list of `(n, payment, interest, principal_part, balance_after)`.
4. `parse_date(s)` — ISO text (with or without a time) to a `date`; blank or garbage → `None`.
5. `is_valid_birth_date(d, as_of)` — week 4's rule: between 1920-01-01 and the as-of.
6. `normalise_method(s)` — `"CASH "` → `"cash"`, `"bank transfer"` → `"transfer"`.
7. `approval_rate(rows, channel, convention)` — P9.
8. `top_n(d, n)` — P8.

Section 9 of the notebook uses 6 and 8 together on `payments_dirty.csv` (five clean methods, card first).

Graded on: (a) all assert cells pass after *Restart & Run All* (8 points, one per function), (b) no function prints — every one returns (1 point), (c) a docstring on each that says what it does and what it returns, in your words (1 point).

---

## 5. Self-check

1. You changed a function in cell 4 and re-ran cell 9; the assert still fails with the old behaviour. Why, and what do you do? *(→ section 1, "Jupyter")*
2. `r["dpd"] > 30` raises `TypeError` for a row from `csv.DictReader`. Why? *(→ section 1, "Reading a CSV", P1)*
3. Write the `WHERE status LIKE 'approved%' AND channel = 'app'` of week 2 as a list comprehension. *(→ section 1, "List comprehensions", section 2)*

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

These are exactly `installments` rows 1–6 for `loan_id = 1` (`interest_due` 778 750, `principal_due` 962 950 …). The 24th row pays 1 741 193 — a little less, because the balance is cleared rather than overpaid; the principal parts sum to 31 150 000 and the interest parts to 10 650 293 (34 % on top of the principal over two years). Why an analyst cares: **outstanding** is the sum of the *principal* parts not yet due — the interest is revenue, not exposure — so loan 1, one year into its 24-month term, still has 17 865 571 outstanding — 57 % of its principal, not 50 %. The front-loaded interest is also why early repayment saves the borrower less than they expect, and why a 48-month Auto loan's balance barely moves in its first year.

> Interview version: *"How is an annuity payment computed, and how does the split change over time?"* — P·r/(1−(1+r)^−n) with the monthly rate; equal payments; interest = balance × r so it falls every month and the principal part rises by the same amount; the balance after month k is what the schedule still owes — that is the outstanding; check the function against three real loans and state the rounding rule.

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
{"id": "w05d1", "q": "Jasur wants to know how often a weak score still gets through. In data/excel/applications.csv, among the applications that have a credit score below 600 (skip the blank scores), what share were approved (status beginning with \"approved\")? Use only csv and loops. Give a percentage to 2 decimals.", "type": "number", "dp": 2, "h": ["a3e242d4afa891d50a2ef80b"], "hint": "Two counters, one pass. A blank score is the text \"\" — test for it before you call int(), and count the row nowhere.", "sol": "aW1wb3J0IGNzdgp3aXRoIG9wZW4oIi4uL2V4Y2VsL2FwcGxpY2F0aW9ucy5jc3YiLCBuZXdsaW5lPSIiLCBlbmNvZGluZz0idXRmLTgiKSBhcyBmOgogICAgcm93cyA9IGxpc3QoY3N2LkRpY3RSZWFkZXIoZikpCmxvdyA9IGFwcHJvdmVkID0gMApmb3IgciBpbiByb3dzOgogICAgaWYgclsiY3JlZGl0X3Njb3JlIl0gPT0gIiI6CiAgICAgICAgY29udGludWUKICAgIGlmIGludChyWyJjcmVkaXRfc2NvcmUiXSkgPCA2MDA6CiAgICAgICAgbG93ICs9IDEKICAgICAgICBpZiByWyJzdGF0dXMiXS5zdGFydHN3aXRoKCJhcHByb3ZlZCIpOgogICAgICAgICAgICBhcHByb3ZlZCArPSAxCnByaW50KGxvdywgYXBwcm92ZWQsIHJvdW5kKDEwMCAqIGFwcHJvdmVkIC8gbG93LCAyKSkgICAjIDIxNTUgMzYzIDE2Ljg0CgoxNi44NCAlOiAzNjMgb2YgdGhlIDIgMTU1IHNjb3JlZCBhcHBsaWNhdGlvbnMgdW5kZXIgNjAwIHdlcmUgYXBwcm92ZWQg4oCUIGFnYWluc3QgNjEuNCAlIGZvciBhbGwgYXBwbGljYXRpb25zLgpUaGUgdHdvIHRyYXBzIGFyZSB0aGUgYmxhbmsgc2NvcmVzIChpbnQoIiIpIHJhaXNlcyBWYWx1ZUVycm9yKSBhbmQgdGhlIHR3byBzcGVsbGluZ3Mgb2YgYXBwcm92YWwgKD09ICJhcHByb3ZlZCIgYWxvbmUgbG9zZXMgdGhlIGFwcHJvdmVkX25vdF9kaXNidXJzZWQgcm93cykuCkJ5IGNoYW5uZWwgdGhlIGFwcCBpcyB0aGUgc3RyaWN0ZXN0IHdpdGggd2VhayBzY29yZXMgKDExLjYgJSksIGJyYW5jaCBhbmQgcGFydG5lciBib3RoIGFib3V0IDE5LjYgJSDigJQgYSBxdWVzdGlvbiBmb3IgdGhlIHNjb3JlY2FyZCdzIGN1dC1vZmYu"}
```

<!-- challenge:end -->
