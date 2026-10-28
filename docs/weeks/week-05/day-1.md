# Week 5 · Day 1 — Python from zero: the notebook is your lab

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge hw">HW 5.1 (due Day 3)</span> <span class="badge company">Company corner</span>

> STORY **Monday, 9:00.** A new face at Madina's desk: Jasur, the data scientist (*дата-сайентист*) who builds the scorecard. *"Welcome to the half of the building that does not use a mouse. Everything you did in weeks 1–4 I do in Python — the same joins, the same buckets — but it runs every morning at 6:00 without me, and the next step is the model. Before pandas, prove you can **think in loops**: compute the approval rate by channel with plain Python from `applications.csv`. No library that does it for you. If you can do it with a `for`, you will understand what pandas is doing when it does it for you."* Madina: *"And get the tools running today; tomorrow the data arrives."*

## Today in 3 lines

- Why analysts write Python: the analysis is a **file that re-runs** (repeatable), it scales from 7 828 rows to 70 million without changing (scalable), it is free and it is the language of the next steps (models, automation, Power BI's Python visuals).
- You run Python **right on this page** (▶ Run under every code block), meet **Jupyter** — where the homework notebook lives — and learn the language's grammar: types, lists, dicts, `if`/`for`/`while`, functions, f-strings, modules, reading a CSV with `csv`, list comprehensions, reading a traceback.
- You have Jasur's approval rate by channel in loops (**58.2 / 63.7 / 61.9 %**, the week-2 and week-4 numbers) and the start of HW 5.1 — eight functions that must pass their asserts in `data/python/day1_starter.ipynb`.

---

## 1. Learn — the language, one notebook cell at a time

Every concept below has the same five parts: what it is, how to write it (a box you can run), when you use it, the trap, and a small task. Run the boxes from top to bottom — later boxes use the names earlier boxes made.

### Where your code runs — this page and Jupyter

**What it is.** Every Python block on this page has a **▶ Run** button. The first run loads Python into your browser — about 15 MB, once, then cached — together with pandas, NumPy and matplotlib; after that a block runs in about a second. A **notebook** (*блокнот, ноутбук*) is the same thing saved as one `.ipynb` file: a list of **cells**, code or text, run top to bottom. **Jupyter** is the program that opens notebooks; the homework is a notebook.

**How to write it.** Three rules of the page, and the three keys of Jupyter:

- **Blocks share one memory, in the order you run them.** A name made in one block exists in the next one — if you ran it.
- **The data files are already there.** `open("../excel/applications.csv")` reads the course's file — the same path the notebooks use.
- **Every task has its own editor** with ▶ Run and ✔ Check. The check looks for the right number among what your code prints, so print your result.

| In Jupyter | does |
|---|---|
| **Shift+Enter** | runs the cell and moves to the next one |
| **Ctrl+Enter** | runs the cell and stays on it |
| **Kernel → Restart & Run All** | forgets everything, then runs every cell from the top |

The **kernel** (*ядро*) is the Python process behind the notebook. It remembers names in the order cells were *run*, not the order they appear. `[5]` to the left of a cell means it was the fifth cell run; `[*]` means it is still running.

**Setting up Jupyter (by Day 3).** **Anaconda** (*дистрибутив Anaconda*) is Python plus pandas, matplotlib and Jupyter in one installer: https://www.anaconda.com/download → Windows → *Just me* → defaults. Then open **Anaconda Prompt** from the Start menu and type:

```
cd "C:\path\to\Analytics Learning"
pip install -r requirements.txt
jupyter notebook data/python
```

The browser opens a file list; click `day1_starter.ipynb`. If the installer is blocked, https://colab.research.google.com runs the same notebooks — upload the `.ipynb` and the CSVs it reads (`data/python/README.md` names the one line to change).

**When you use it.**
- The page: to learn, to try, to check a number.
- The notebook: for the file you hand in, which anyone must be able to re-run.

> 💡 **Key idea.** The page is where you learn and practise; the **notebook** is the file you hand in. Both run code blocks top to bottom.

> ⚠️ **Watch out.** Edit block 3, re-run only block 7, and block 7 still sees the *old* block 3. When a number looks stale, run again from the top — in Jupyter, **Kernel → Restart & Run All**. A notebook that survives Restart & Run All is reproducible.

**Your turn.** You changed the function in cell 3 and ran only cell 7, which calls it. Which version does cell 7 use?

```task
{"id": "w05d1-l1", "kind": "choice", "options": ["The new one — Jupyter re-reads every cell above before it runs a cell", "The old one — the kernel holds what was last run, until you run cell 3 again", "Neither — cell 7 raises an error", "The new one, but only after you save the file"], "answer": 1, "explain": "The kernel remembers what was run, not what is on the screen. Run cell 3 again — or, better, Kernel → Restart & Run All."}
```

### Values and types — int, float, str, bool, None

**What it is.** Every value in Python has a **type** (*тип*). The type decides what you can do with the value: you can add two numbers, but not a number and a piece of text. `type(x)` tells you the type.

**How to write it.**

```python
type(31_150_000), type(0.30), type("Consumer loan"), type(True), type(None)
```

| value | type | what it is |
|---|---|---|
| `31_150_000` | `int` | a whole number; the underscores are only for your eyes |
| `0.30` | `float` | a number with a decimal point |
| `"Consumer loan"` | `str` | text (a *string*), in single or double quotes |
| `True` / `False` | `bool` | yes or no, with capital letters |
| `None` | `NoneType` | "no value" — Python's NULL |
| `"31150000"` | `str` | **text that looks like a number** — what a CSV gives you |

The box shows five types — `int`, `float`, `str`, `bool`, `NoneType` — one per value, in the order written.

`int("42")` turns text into a whole number, `float("3.12")` into a decimal, `str(42)` a number into text.

**When you use it.**
- Before any arithmetic on data from a file: is this column a number or text?
- When an error says `TypeError` — two values of types that do not mix.

> ⚠️ **Watch out.** `"31150000"` in quotes is text. `"31150000" * 2` does not double it: it repeats the text, `"3115000031150000"`. Convert first: `int("31150000") * 2` → `62300000`.

**Your turn.** Which of these values is a `str`?

```task
{"id": "w05d1-l2", "kind": "choice", "options": ["7828", "0.30", "\"7828\"", "True"], "answer": 2, "explain": "Quotes make text: \"7828\" is a str, even though it looks like a number. 7828 is an int, 0.30 a float, True a bool."}
```

### Variables — a name for a value

**What it is.** A **variable** (*переменная*) is a name that points at a value. `=` gives the name its value. Later lines use the name instead of the value.

**How to write it.**

```python
customer = "Gulbahor Sobirova"  # name = value
principal = 31_150_000
status = "active"
# a new value for the same name — "active" is gone
status = "closed"
print(customer, principal, status)
```

```text
Gulbahor Sobirova 31150000 closed
```

The line prints `closed`, not `active`: a name holds only its latest value.

Rules for names: letters, digits and `_`, not starting with a digit; `snake_case` by habit (`annual_rate`, not `AnnualRate`); upper and lower case differ (`Status` is another name). `=` gives a value; `==` asks "are these equal?" and answers `True` or `False`.

**When you use it.**
- Every value you will use twice: a rate, a file path, the as-of date.
- To give a number a meaning: `AS_OF`, `principal`, `late_count` read better than `2026-10-01`, `31150000`, `399`.

> ⚠️ **Watch out.** `NameError: name 'principal' is not defined` means the line that makes the name has not run — in this browser or in this kernel. Run the block that defines it first.

**Your turn.** What does this print? `status = "active"`, then `status = "closed"`, then `print(status)`.

```task
{"id": "w05d1-l3", "kind": "choice", "options": ["active", "closed", "active closed", "NameError"], "answer": 1, "explain": "The second = replaces the value. A variable holds only its latest value."}
```

### Strings and f-strings — text, and numbers inside text

**What it is.** A **string** (*строка*) is text. String **methods** return a cleaned or changed copy: `.strip()` removes spaces at both ends, `.lower()` / `.upper()` / `.title()` change the case, `.replace(a, b)` swaps text, `.startswith(x)` tests the beginning. `s[:7]` takes the first seven characters. An **f-string** (*f-строка*) — `f"…{name}…"` — puts values inside text.

**How to write it.**

```python
method = "  Bank Transfer "
# 'bank transfer' — week 2's LOWER(TRIM())
clean = method.strip().lower()
print(clean.replace("bank transfer", "transfer"))
day = "2025-03-28"
# the month, and the length of the text
print(day[:7], len(day))
status = "approved_not_disbursed"
print(status.startswith("approved"))  # week 4's "approved*" wildcard
outstanding = 208_723_504_430
print(f"Outstanding: {outstanding:,} soum = {outstanding / 1e9:.1f} bn; PAR30 {0.0312:.2%}")
```

```text
transfer
2025-03 10
True
Outstanding: 208,723,504,430 soum = 208.7 bn; PAR30 3.12%
```

The method name becomes `transfer`, the date gives its month `2025-03` (10 characters in all), and one f-string writes 208.7 bn with thousands separators and a percent.

The part after the colon inside `{ }` is the **format spec** — Excel's number format in another spelling:

| spec | value | result |
|---|---|---|
| `:,` | `208723504430` | `208,723,504,430` |
| `:.1f` | `208.7235` | `208.7` |
| `:.2%` | `0.0312` | `3.12%` |
| `:>8` | `"app"` | `"     app"` — right-aligned in 8 characters (`<` left) |

**When you use it.**
- Cleaning text columns: spaces, case, spellings (week 4's TRIM / PROPER / SUBSTITUTE).
- Cutting a date written as text: `applied_at[:7]` is the month.
- Printing a result a person will read: separators, one decimal, a percent sign.

> ⚠️ **Watch out.** A string never changes in place. `method.strip()` *returns* a clean copy and leaves `method` as it was. Keep the result: `method = method.strip()`.

**Your turn.** Clean a payment method the way week 4 did.

```task
{"id": "w05d1-l4", "kind": "python", "starter": "raw = \"  Bank Transfer \"      # as typed by a cashier\n\n# your code: make it 'transfer' (strip, lower, replace), then print it and its length\n", "answer": 8, "dp": 0, "hint": "Chain the methods: raw.strip().lower().replace(\"bank transfer\", \"transfer\"); len() gives the length.", "model": "clean = raw.strip().lower().replace(\"bank transfer\", \"transfer\")\nprint(clean, len(clean))     # transfer 8\n\nThe order reads like the change log: strip the spaces, lower the case, then replace the spelling."}
```

### Numbers and arithmetic — operators and rounding

**What it is.** Python does arithmetic with `+ - * /` and three more operators: `//` (whole-number division), `%` (the remainder) and `**` (a power). `round(x, n)` rounds to `n` decimals; a negative `n` rounds to tens, hundreds…

**How to write it.**

```python
principal = 31_150_000          # loan 1
annual_rate = 0.30
# month 1's interest: a year's interest on the balance, ÷ 12
interest_1 = principal * annual_rate / 12
term = 24
print(interest_1)
print(term // 12, term % 12)    # whole years, months left over
print(round(1_741_684.35, -2))  # to the nearest 100 soum
# the monthly rate — look at the last digits
print(annual_rate / 12, round(annual_rate / 12, 4))
```

```text
778750.0
2 0
1741700.0
0.024999999999999998 0.025
```

Month 1's interest is 778 750 soum — exactly `interest_due` of loan 1's first row in `installments`. 24 months are 2 whole years with 0 months over, and the payment 1 741 684.35 rounds to 1 741 700. The monthly rate prints as 0.024999999999999998 — the trap below.

| operator | example | result |
|---|---|---|
| `/` | `7 / 2` | `3.5` — always a float |
| `//` | `7 // 2` | `3` — whole part |
| `%` | `7 % 2` | `1` — remainder |
| `**` | `1.025 ** 2` | `1.050625` — power |
| `round(x, 1)` | `round(58.23, 1)` | `58.2` |
| `round(x, -2)` | `round(1741684.35, -2)` | `1741700.0` |

Brackets work as in school: `100 * approved / total` and `(1 + r) ** -term` are read the way you expect. `abs(-5)` is 5; `min(a, b)` and `max(a, b)` pick one of two.

**When you use it.**
- Every rate, share and payment: `100 * part / whole`.
- `round` for display, or where the business rounds (Nur Finance rounds payments to 100 soum).

> ⚠️ **Watch out.** A float is stored in binary, so `0.30 / 12` comes out as `0.024999999999999998`, not `0.025`. The error is tiny, but `0.30 / 12 == 0.025` is `False`. Round for display (`round(x, 4)`, `f"{x:.4f}"`) and never test two floats with `==`. And `int(2.9)` is `2`: `int()` cuts the decimals off — use `round()` when you mean rounding.

**Your turn.** Month 1's interest of loan 2.

```task
{"id": "w05d1-l5", "kind": "python", "starter": "principal = 40_060_000      # loan 2\nannual_rate = 0.30\n\n# your code: month 1's interest — print it\n", "answer": 1001500, "dp": 0, "hint": "principal * annual_rate / 12.", "model": "print(principal * annual_rate / 12)     # 1001500.0\n\nThe same as interest_due of loan 2's first instalment in installments.csv."}
```

### Lists — an ordered column of values

**What it is.** A **list** (*список*) holds several values in order, inside `[ ]`. Each value has a **position** (an *index*) starting at **0**. Negative positions count from the end.

```pic
{"id": "w05d1-pic1", "title": "A slice stops before its end position", "caption": "Positions start at 0. `buckets[1:3]` takes positions 1 and 2 (green) and stops **before** 3. The last column is what negative positions mean: `buckets[-1]` is `\"90+\"`.", "tables": [{"id": "b", "name": "buckets", "cols": ["position", "value", "from end"], "rows": [[0, "\"0\"", -5], [1, "\"1-30\"", -4], [2, "\"31-60\"", -3], [3, "\"61-90\"", -2], [4, "\"90+\"", -1]], "keep": [1, 2]}, {"id": "s", "name": "buckets[1:3]", "cols": ["position", "value"], "rows": [[0, "\"1-30\""], [1, "\"31-60\""]], "via": "buckets[1:3]"}]}
```

**How to write it.**

```python
buckets = ["0", "1-30", "31-60", "61-90", "90+"]
print(buckets[0], buckets[-1], buckets[1:3])
# loans 1–5
principals = [31_150_000, 40_060_000, 1_590_000, 2_520_000, 25_590_000]
print(len(principals), sum(principals), max(principals))
principals.append(4_990_000)  # add one at the end
print(len(principals), "1-30" in buckets)
```

| position | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| value | `"0"` | `"1-30"` | `"31-60"` | `"61-90"` | `"90+"` |
| from the end | −5 | −4 | −3 | −2 | −1 |

```text
0 90+ ['1-30', '31-60']
5 100910000 40060000
6 True
```

The first bucket is `"0"`, the last `"90+"`, and the slice `[1:3]` takes positions 1 and 2 — it stops *before* 3. The five loans add up to 100 910 000; the largest is loan 2's 40 060 000; after `append` the list has six values.

A **tuple** (*кортеж*) looks like a list in round brackets and cannot be changed after it is made:

| | list `[ ]` | tuple `( )` |
|---|---|---|
| can change | yes: `append`, `x[0] = …` | no |
| used for | a column of values | a fixed pair or row: `("Tashkent Central", 1001)` |

**When you use it.**
- A column of values to add up, count, sort (`sorted(x)`), or walk through with a loop.
- A list of labels in a fixed order — buckets, months, products.

> ⚠️ **Watch out.** Positions start at 0, so the fifth value is `x[4]`, and `x[5]` on a five-value list is `IndexError: list index out of range`. A slice `x[a:b]` stops before `b`.

**Your turn.** The average principal of loans 1–5.

```task
{"id": "w05d1-l6", "kind": "python", "starter": "principals = [31_150_000, 40_060_000, 1_590_000, 2_520_000, 25_590_000]   # loans 1–5\n\n# your code: the average principal of these five loans\n", "answer": 20182000, "dp": 0, "hint": "sum(principals) / len(principals).", "model": "print(sum(principals) / len(principals))     # 20182000.0\n\nThe average is 20.2 m, yet two of the five loans are under 3 m: a few large loans pull the mean up. Week 3's mean vs median, on five numbers."}
```

### Dicts — a lookup table key → value

**What it is.** A **dict** (*словарь*) stores pairs **key → value** inside `{ }`. You look a value up by its key, not by a position. It is week 4's `XLOOKUP` in one line.

**How to write it.**

```python
rates = {"Micro loan": 0.42, "Consumer loan": 0.30, "Buy now pay later": 0.0,
         # products.annual_rate
         "Auto loan": 0.24, "Small business loan": 0.26}
print(rates["Auto loan"])  # look up by key
# .get: a default instead of an error
print(rates.get("Mortgage", "no such product"))
counts = {"card": 17612, "payme": 8897}
# add a key (or replace its value)
counts["cash"] = 8788
print(counts, len(counts), "card" in counts)
```

```pic
{"id": "w05d1-pic2", "title": "A dict is a two-column lookup table", "caption": "You find a value by its key, not by a position: `counts[\"card\"]` → 17612. Assigning to a new key adds a row (green); assigning to a key that is already there would replace its value.", "tables": [{"id": "before", "name": "counts", "cols": ["key", "value"], "rows": [["\"card\"", 17612], ["\"payme\"", 8897]], "tags": {"key": "look up by"}}, {"id": "after", "name": "counts", "cols": ["key", "value"], "rows": [["\"card\"", 17612], ["\"payme\"", 8897], ["\"cash\"", 8788]], "keep": [2], "via": "counts[\"cash\"] = 8788"}]}
```

```text
0.24
no such product
{'card': 17612, 'payme': 8897, 'cash': 8788} 3 True
```

Auto loans cost 24 % a year; the missing product returns the default instead of crashing; `counts` now has three keys, and `"card" in counts` is `True`.

Walk a dict with `.keys()`, `.values()` and `.items()` (the pairs): `sum(counts.values())` adds the values.

**When you use it.**
- A lookup: a product's rate, a branch's region, a status's label.
- **Counting per group**: one key per group, the count as the value — the loops below build this.

> ⚠️ **Watch out.** `d["key"]` on a key that is not there raises `KeyError`. Use `d.get("key", 0)` when a missing key is normal.

**Your turn.** The clean payments per method — how many in total?

```task
{"id": "w05d1-l7", "kind": "python", "starter": "counts = {\"card\": 17612, \"payme\": 8897, \"cash\": 8788, \"click\": 8786, \"transfer\": 8767}   # clean payments per method\n\n# your code: the total number of payments\n", "answer": 52850, "dp": 0, "hint": "sum(counts.values()).", "model": "print(sum(counts.values()))     # 52850\n\n52 850 — the clean payments book: the 52 875 recorded rows minus 25 duplicates (Day 3)."}
```

### if / elif / else — choose by a condition

**What it is.** `if` runs a block only when its condition is `True`. `elif` ("else if") tries the next condition; `else` catches the rest. The **first** true branch wins; the others are skipped. It is week 2's `CASE WHEN` and week 4's nested `IF`.

**How to write it.**

```python
dpd = 45
if dpd <= 0:              # the colon opens the block …
    bucket = "0"          # … four spaces mark what belongs to it
elif dpd <= 30:
    bucket = "1-30"
elif dpd <= 60:
    bucket = "31-60"
elif dpd <= 90:
    bucket = "61-90"
else:
    bucket = "90+"
print(bucket)
```

```text
31-60
```

45 days fails `<= 0` and `<= 30`, passes `<= 60` — so the bucket is `31-60`, and the last two tests never run.

| `dpd` | 0 | 7 | 30 | 31 | 45 | 90 | 91 | 919 |
|---|---|---|---|---|---|---|---|---|
| bucket | 0 | 1-30 | 1-30 | 31-60 | 31-60 | 61-90 | 90+ | 90+ |

Comparisons: `==` equal, `!=` not equal, `<`, `<=`, `>`, `>=`, `in` (inside a list or a text). Join conditions with `and`, `or`, `not`: `if status == "active" and dpd > 0:`.

**Indentation is the syntax** (*отступы*): no `END`, no braces — four spaces after a line that ends in `:`.

**When you use it.**
- A label from a number: buckets, bands, grades.
- A rule: skip a blank value, count only the approved.

> ⚠️ **Watch out.** The order of the branches matters. Put `elif dpd <= 60` before `elif dpd <= 30` and a 7-day loan lands in `31-60`, because the first true test wins. Write the tests from the smallest edge up.

**Your turn.** With the code above, which bucket does `dpd = 90` get?

```task
{"id": "w05d1-l8", "kind": "choice", "options": ["0", "1-30", "61-90", "90+"], "answer": 2, "explain": "90 fails <= 0, <= 30 and <= 60 and passes <= 90: 61-90. The buckets are right-closed — day 90 is still 61-90, day 91 is 90+."}
```

### for loops — once per element

**What it is.** A **for loop** (*цикл for*) runs its block once for every element of a list (or the keys of a dict, or the rows of a file). Inside the block, the loop variable is the current element.

```pic
{"id": "w05d1-pic3", "title": "A loop and a dict count per group", "caption": "Each step adds 1 to the key of the current element, starting at 0 when the key is new. The three card steps (same colour) end as `'card': 3` — `GROUP BY method` with `COUNT(*)`, by hand.", "tables": [{"id": "m", "name": "methods", "cols": ["position", "m"], "rows": [[0, "\"card\""], [1, "\"cash\""], [2, "\"card\""], [3, "\"payme\""], [4, "\"card\""]], "tone": ["a", "b", "a", "c", "a"]}, {"id": "c", "name": "counts", "cols": ["key", "value"], "rows": [["\"card\"", 3], ["\"cash\"", 1], ["\"payme\"", 1]], "tone": ["a", "b", "c"], "via": "counts.get(m, 0) + 1"}]}
```

**How to write it.** A running total, and a count per group with a dict:

```python
# the monthly payments of loans 1, 2, 3
amounts = [1_741_700, 2_791_000, 567_500]
total = 0            # start BEFORE the loop
for amount in amounts:
    total += amount  # += adds to the variable
print(total)

methods = ["card", "cash", "card", "payme", "card"]
counts = {}
for m in methods:
    # one more for this key, starting at 0 if new
    counts[m] = counts.get(m, 0) + 1
print(counts)
```

| step | `amount` | `total` after the step |
|---|---|---|
| 1 | 1 741 700 | 1 741 700 |
| 2 | 2 791 000 | 4 532 700 |
| 3 | 567 500 | 5 100 200 |

```text
5100200
{'card': 3, 'cash': 1, 'payme': 1}
```

Three steps, three payments: 5 100 200 a month from the first three loans. The second loop counts three card payments, one cash, one Payme — `GROUP BY method` with `COUNT(*)`, written by hand.

More ways to loop: `for i, x in enumerate(items)` gives the position too; `for k, v in counts.items()` walks a dict's pairs; `for n in range(1, 25)` counts 1 … 24. `break` leaves the loop; `continue` skips to the next element.

| | `for` | `while` |
|---|---|---|
| runs | once per element | as long as a condition is `True` |
| ends | by itself, after the last element | only when the condition becomes `False` |
| use for | rows, lists, dicts | "until the balance passes 10 m" |

**When you use it.**
- Totals, counts and sums per group — everything `GROUP BY` did.
- Doing the same step to every row of a file.

> ⚠️ **Watch out.** A total that starts *inside* the loop is reset on every step, so you get only the last value. And a `while` whose condition never becomes `False` runs forever — on the page press ↺ Restart Python, in Jupyter Kernel → Interrupt.

**Your turn.**

```game
{"type": "bug", "id": "w05d1-g5", "title": "The total that forgets", "q": "This should print 5 100 200, the three payments added up. It prints 567 500. Tap the line that breaks it.", "code": "amounts = [1741700, 2791000, 567500]\nfor amount in amounts:\n    total = 0\n    total += amount\nprint(total)", "answer": [2], "why": "total = 0 inside the loop resets the total on every step, so only the last payment is left. Start the total once, before the for."}
```

### List comprehensions — a for loop that builds a list

**What it is.** A **list comprehension** (*списковое включение*) is a `for` that builds a list in one line: `[expression for item in items if condition]`. Read it from the middle: *for each item, if the condition holds, keep the expression*.

**How to write it.**

```python
dpds = [0, 7, 30, 31, 45, 90, 91, 919]
late = [d for d in dpds if d > 0]              # WHERE dpd > 0
doubled = [d * 2 for d in dpds]                # an expression for every element
print(late, len(late))
print(sum(1 for d in dpds if d > 90))          # COUNT with a condition
```

```text
[7, 30, 31, 45, 90, 91, 919] 7
2
```

Seven of the eight values are late; two are past 90 days. Tomorrow the same filter, in pandas, is a boolean mask.

| SQL | comprehension |
|---|---|
| `SELECT dpd … WHERE dpd > 0` | `[d for d in dpds if d > 0]` |
| `SELECT dpd * 2` | `[d * 2 for d in dpds]` |
| `SELECT COUNT(*) … WHERE dpd > 90` | `sum(1 for d in dpds if d > 90)` |

**When you use it.**
- A filtered or converted copy of a list: the late ones, the amounts as `int`.
- A count with a condition, in one line.

> ⚠️ **Watch out.** A comprehension that does three things at once is hard to read. When the line grows past one condition and one expression, write the plain `for` loop.

**Your turn.** The big loans among loans 1–5.

```task
{"id": "w05d1-l9", "kind": "python", "starter": "principals = [31_150_000, 40_060_000, 1_590_000, 2_520_000, 25_590_000]   # loans 1–5\n\n# your code: with a comprehension, the principals of 10 m or more — print the list and how many there are\n", "answer": 3, "dp": 0, "hint": "[p for p in principals if p >= 10_000_000], then len().", "model": "big = [p for p in principals if p >= 10_000_000]\nprint(big, len(big))     # [31150000, 40060000, 25590000] 3"}
```

### Functions — def, parameters, return

**What it is.** A **function** (*функция*) is a named, reusable step. It takes inputs (**parameters**, *параметры*), does its work, and hands back one result with `return`. You write it once with `def` and **call** it as often as you like.

**How to write it.**

```python
def approval_rate(approved, total, decimals=1):
    # the docstring: what it does, for the next reader
    """Approval rate in percent."""
    if total == 0:
        # never divide by zero; None is "no answer"
        return None
    return round(100 * approved / total, decimals)

def label(dpd):
    """The DPD bucket of a number of days past due."""
    if dpd <= 0: return "0"
    elif dpd <= 30: return "1-30"
    elif dpd <= 60: return "31-60"
    elif dpd <= 90: return "61-90"
    else: return "90+"

print(approval_rate(2915, 5006), approval_rate(2915, 5006, 2), approval_rate(0, 0))
print(label(30), label(91))
```

| call | returns |
|---|---|
| `approval_rate(2915, 5006)` | `58.2` |
| `approval_rate(2915, 5006, 2)` | `58.23` — `decimals` given |
| `approval_rate(0, 0)` | `None` |
| `label(30)`, `label(91)` | `'1-30'`, `'90+'` |

The app channel approved 2 915 of 5 006 applications: 58.2 %, or 58.23 with two decimals. A channel with no applications gets `None` instead of a crash.

`decimals=1` is a **default**: the parameter becomes optional. A short `if` fits on one line (`if dpd <= 0: return "0"`) when its block is one line.

| `return` | `print` |
|---|---|
| hands the value back — you can store it, test it, reuse it | only shows it on the screen |
| `x = approval_rate(2915, 5006)` holds 58.2 | `x = print(58.2)` holds `None` |
| `assert approval_rate(2915, 5006) == 58.2` can check it | nothing to check |

**When you use it.**
- Any step you do twice: a bucket label, a rate, the annuity payment.
- Any number you will report: put it in a function, then test the function with `assert` (HW 5.1).

> ⚠️ **Watch out.** A function without `return` gives back `None`. A function that `print`s its answer looks right on screen and is useless to the next line of code.

**Your turn.** A function for month 1's interest, tried on loan 3.

```task
{"id": "w05d1-l10", "kind": "python", "starter": "# your code: def first_interest(principal, annual_rate) that RETURNS round(principal * annual_rate / 12)\n\n\nprint(first_interest(1_590_000, 0.42))     # loan 3, a Micro loan\n", "answer": 55650, "dp": 0, "hint": "def first_interest(principal, annual_rate):\n    return round(principal * annual_rate / 12)", "model": "def first_interest(principal, annual_rate):\n    return round(principal * annual_rate / 12)\n\nprint(first_interest(1_590_000, 0.42))     # 55650 — loan 3's first interest_due"}
```

### Importing modules — someone else's functions

**What it is.** A **module** (*модуль*) is a file of ready-made functions. `import` makes it available. Python's **standard library** comes with dozens: `csv` for files, `datetime` for dates, `math` for rounding up and logarithms. Tomorrow's `import pandas as pd` is the same mechanism.

**How to write it.**

```python
import math                # the whole module; use it as math.something
from datetime import date  # one name from a module; use it directly
import statistics as st    # a module under a short alias

print(math.ceil(24 / 5))   # round UP
days = date(2026, 10, 1) - date(2025, 3, 28)
print(days.days)           # loan 1: days from disbursement to the as-of
print(st.median([31_150_000, 40_060_000, 1_590_000, 2_520_000, 25_590_000]))
```

```text
5
552
25590000
```

24 ÷ 5 = 4.8 rounds up to 5. Loan 1 has been on the book for 552 days on the as-of date. The median of loans 1–5 is 25 590 000 — the middle value, against a mean of 20 182 000.

| import | gives you | example |
|---|---|---|
| `import csv` | read and write CSV files | `csv.DictReader(f)` |
| `from datetime import date, datetime` | dates and date arithmetic | `date(2026, 10, 1)`, `datetime.strptime(s, fmt)` |
| `import math` | rounding up, logs, square roots | `math.ceil(4.8)` → 5 |
| `import statistics as st` | mean, median | `st.median(x)` |
| `import pandas as pd` | tables (tomorrow) | `pd.read_csv(path)` |

**When you use it.**
- At the top of every notebook: one cell with all the imports.
- Whenever you are about to write something general (a date difference, a median) — the library has it.

> ⚠️ **Watch out.** `import datetime` and `from datetime import datetime` are different: after the first, the class is `datetime.datetime`; after the second, `datetime`. Mixing them gives `AttributeError: module 'datetime' has no attribute 'strptime'`. Pick one style per notebook.

**Your turn.** Days on book of loan 4.

```task
{"id": "w05d1-l11", "kind": "python", "starter": "from datetime import date\n\n# your code: how many days from loan 4's disbursement (2026-08-23) to the as-of (2026-10-01)?\n", "answer": 39, "dp": 0, "hint": "(date(2026, 10, 1) - date(2026, 8, 23)).days", "model": "print((date(2026, 10, 1) - date(2026, 8, 23)).days)     # 39\n\nThe difference of two dates is a timedelta; .days turns it into a number."}
```

### Reading a CSV with the csv module

**What it is.** `csv.DictReader` reads a CSV file row by row. Each row becomes a **dict** whose keys are the header line. `list(...)` collects all rows into a list — a list of dicts, one per row.

**How to write it.**

```python
import csv
with open("../excel/applications.csv", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))   # a list of dicts, one per row
with open("../excel/loans_status.csv", newline="", encoding="utf-8") as f:
    loans = list(csv.DictReader(f))  # the 7 828 loans, the same way
print(len(rows), len(loans))
print(rows[0]["channel"], rows[0]["status"], rows[0]["requested_amount"], type(rows[0]["requested_amount"]))
```

The first two rows of `rows`, five of their keys:

| `rows[i]` | `"channel"` | `"product"` | `"requested_amount"` | `"credit_score"` | `"status"` |
|---|---|---|---|---|---|
| 0 | `"branch"` | `"Auto loan"` | `"322610000"` | `"658"` | `"rejected"` |
| 1 | `"branch"` | `"Consumer loan"` | `"31150000"` | `"631"` | `"approved"` |

```text
14000 7828
branch rejected 322610000 <class 'str'>
```

14 000 applications and 7 828 loans. The first application is a rejected branch request for 322 610 000 — and that amount is a `str`: every value in the file arrives as text.

`with open(...) as f:` opens the file and closes it when the block ends. `newline=""` stops blank lines on Windows; `encoding="utf-8"` reads every letter right. A blank cell arrives as the empty string `""` — 388 applications have `credit_score == ""`.

**When you use it.**
- Any file you need before pandas, or in a small script with no libraries.
- To see exactly what a file contains, with no type guessing.

> 💡 **Key idea.** A CSV knows no types. Every value arrives as text — `"0"` is not `0`, `""` is not a missing number but an empty string — so you convert at the moment you compute, and you decide what a blank means before you divide.

> ⚠️ **Watch out.** `FileNotFoundError` means the path is wrong for where Python is running. On this page and in the course notebooks the path is `../excel/…`; in your own folder, put the file next to the notebook and use its bare name.

**Your turn.**

```game
{"type": "bug", "id": "w05d1-g2", "title": "Find the broken line", "q": "This loop should total requested_amount per channel from the rows above. One line breaks it.", "code": "total = {}\nfor r in rows:\n    ch = r[\"channel\"]\n    total[ch] = total.get(ch, 0) + r[\"requested_amount\"]\nprint(total)", "answer": [3], "why": "Every value from csv.DictReader is text: 0 + \"322610000\" raises TypeError. Convert on use — int(r[\"requested_amount\"])."}
```

### Errors — how to read a traceback, and try/except

**What it is.** When Python cannot run a line it stops and prints a **traceback** (*трассировка*): the calls that led to the error, newest at the bottom, and on the **last line** the error's type and message. `try: … except SomeError: …` catches an error you expect and does something sensible instead.

**How to write it.** This box fails on purpose — run it and read the bottom line first:

```python
def approval_rate(approved, total):
    return round(100 * approved / total, 1)

approval_rate(0, 0)          # a channel with no applications
```

```text
Traceback (most recent call last):
  Cell In[7], line 4
    approval_rate(0, 0)
  Cell In[7], line 2, in approval_rate
    return round(100 * approved / total, 1)      ← the line of YOUR code where it broke
ZeroDivisionError: division by zero              ← the LAST line: what went wrong — read it first
```

The last line names the error: a division by a total of zero. The line above it points at `return round(100 * approved / total, 1)`, inside `approval_rate`.

Catch an error you expect:

```python
def safe_int(text):
    try:
        return int(text)
    except ValueError:            # int("") or int("n/a") — not a number
        return None

print(safe_int("658"), safe_int(""), safe_int("n/a"))
```

```text
658 None None
```

A real score becomes the number 658; the blank and the garbage become `None` instead of stopping the run.

| error | usually means | fix |
|---|---|---|
| `NameError` | a name not defined — or defined in a block you did not run | run the block above |
| `TypeError` | text and number mixed: `"42" + 1` | convert with `int()` / `float()` |
| `KeyError` | a dict key or column that does not exist | check the spelling against the header |
| `IndexError` | a position past the end of a list | positions start at 0 |
| `ValueError` | the right type, a wrong value: `int("n/a")` | test the value first, or `try/except` |
| `ZeroDivisionError` | a division by 0 | check the total first |
| `FileNotFoundError` | the wrong path for where Python runs | check the folder |
| `SyntaxError` / `IndentationError` | a missing `:` or bracket; wrong spaces | look *just before* the arrow |

**When you use it.**
- Every error: read the last line, then the line of your own code it points at.
- `try/except` only for errors you expect and know how to handle — a blank score, a bad date.

> ⚠️ **Watch out.** A bare `except:` with no error name hides every mistake, typos included. Name the error you expect: `except ValueError:`.

**Your turn.** A loop over `rows` stops with `KeyError: 'Channel'` on the line `ch = r["Channel"]`. What does it mean?

```task
{"id": "w05d1-l12", "kind": "choice", "options": ["The file is empty", "The dict has no key 'Channel' — the header spells it 'channel'", "Python cannot read dicts", "The row is a str, not a dict"], "answer": 1, "explain": "KeyError names the missing key. Keys are case-sensitive: the header line of applications.csv says channel, so r[\"channel\"] works and r[\"Channel\"] does not."}
```

### Putting it together

One question, every tool of the day: *what share of loans is late (`dpd > 0`) in each product?* Read the file (**csv**), walk the rows (**for**), convert the text (**types**), test the condition (**if**), count per product in two **dicts**, compute the share in a **function**, print with an **f-string**.

```python
import csv

def share(part, whole):
    """part as a percent of whole, two decimals."""
    return round(100 * part / whole, 2) if whole else None

with open("../excel/loans_status.csv", newline="", encoding="utf-8") as f:
    loans = list(csv.DictReader(f))

total, late = {}, {}
for r in loans:
    p = r["product"]
    total[p] = total.get(p, 0) + 1
    if int(r["dpd"]) > 0:  # text → number before comparing
        late[p] = late.get(p, 0) + 1

for p in sorted(total, key=lambda k: share(late.get(k, 0), total[k]), reverse=True):
    print(f"{p:<20}{total[p]:>6}{late.get(p, 0):>5}{share(late.get(p, 0), total[p]):>7.2f} %")
```

| product | loans | late | share late |
|---|---|---|---|
| Auto loan | 391 | 29 | 7.42 % |
| Small business loan | 781 | 47 | 6.02 % |
| Consumer loan | 2 418 | 138 | 5.71 % |
| Micro loan | 2 669 | 121 | 4.53 % |
| Buy now pay later | 1 569 | 64 | 4.08 % |

Auto loans are late most often — 29 of 391, 7.42 % — and BNPL least, 4.08 %. The late loans add up to 399, the week-2 number. `sorted(…, key=…, reverse=True)` orders the products by their share, largest first; `key=lambda k: …` says "sort by this value of each key".

**Your turn.** The share of *all* loans that are late, in % with two decimals.

```task
{"id": "w05d1-l13", "kind": "python", "starter": "import csv\nwith open(\"../excel/loans_status.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    loans = list(csv.DictReader(f))\n\n# your code: how many loans have dpd > 0, and what share of all loans is that (in %, two decimals)?\n", "answer": 5.1, "dp": 2, "hint": "late = sum(1 for r in loans if int(r[\"dpd\"]) > 0), then round(100 * late / len(loans), 2).", "model": "late = sum(1 for r in loans if int(r[\"dpd\"]) > 0)\nprint(late, round(100 * late / len(loans), 2))     # 399 5.1\n\n399 of 7 828 loans, 5.10 %. The total row is computed from the counts, never as an average of the five product shares."}
```

**Review the words of the day.**

```game
{"type": "flash", "id": "w05d1-g1", "title": "Python words of the day", "cards": [["int / float", "a whole number / a number with a decimal point"], ["str", "text — everything a CSV gives you, until you convert it"], ["bool", "True or False, with capital letters"], ["None", "Python's NULL — what a function without return gives back"], ["list", "an ordered, changeable column of values: buckets[0], buckets[-1]"], ["dict", "a lookup table key → value: counts[\"card\"], counts.get(k, 0)"], ["tuple", "a frozen pair or row: (\"Tashkent Central\", 1001)"], ["kernel", "the Python process that remembers variables in the order cells were run"], ["traceback", "the error report — read the last line first"], ["list comprehension", "[expression for item in items if condition] — a for that builds a list"]]}
```

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

The ask: approval rate = approved ÷ applications, per channel. Each step uses one concept from section 1, in the order you learned them.

1. **Step 1 — reading a CSV** (`csv.DictReader`). One row = one application; 14 000 rows; every value is text.
2. **Step 2 — two dicts as the groups.** `total` and `approved`, one key per channel; `.get(ch, 0) + 1` counts one more, starting at 0 for a new key.
3. **Step 3 — a for loop with an if.** One pass over the rows. The `if` uses a string method, `startswith("approved")` — week 4's `"approved*"` wildcard, because the status has two approved spellings.
4. **Step 4 — an f-string per channel.** `sorted(total)` gives a fixed order; `:<8`, `:>6` and `:>7.1f` line the columns up.

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

**P1.** *(values and types)* `principal = "31150000"` as read from the CSV. What does `principal * 2` give, what does `int(principal) * 2` give, and what error does `principal + 1` raise?

```task
{"id": "w05d1-p1", "kind": "python", "starter": "principal = \"31150000\"      # as read from the CSV\n\n# your code: print principal * 2, then int(principal) * 2,\n# then try principal + 1 and read the last line of the error\n", "answer": 62300000, "dp": 0, "hint": "int() turns the text into a number; only then does * 2 double it.", "model": "print(principal * 2)        # 3115000031150000 — the text, repeated\nprint(int(principal) * 2)   # 62300000\nprint(principal + 1)        # TypeError: can only concatenate str (not \"int\") to str\n\nThe CSV lesson in one line: convert before arithmetic."}
```

**P2.** *(variables, strings and f-strings)* A customer as typed at the branch: `name = "  gulbahor SOBIROVA "`, `principal = 31150000`, `outstanding = 9593064`. Clean the name with `.strip().title()` and print one line with an f-string: `Gulbahor Sobirova: 9,593,064 of 31,150,000 left (30.8%)`.

```task
{"id": "w05d1-l14", "kind": "python", "starter": "name = \"  gulbahor SOBIROVA \"\nprincipal = 31150000\noutstanding = 9593064\n\n# your code: clean the name, then one f-string with separators and the share left (one decimal, %)\n", "answer": 30.8, "dp": 1, "hint": "name.strip().title(); then f\"{name}: {outstanding:,} of {principal:,} left ({outstanding / principal:.1%})\".", "model": "name = name.strip().title()\nprint(f\"{name}: {outstanding:,} of {principal:,} left ({outstanding / principal:.1%})\")\n# Gulbahor Sobirova: 9,593,064 of 31,150,000 left (30.8%)\n\n.strip() before .title(), and keep the result in the name — a string never changes in place. :.1% multiplies by 100 for you."}
```

**P3.** *(numbers and arithmetic)* Loan 2: 40 060 000 at 30 % for 18 months, monthly payment 2 791 000. How many whole years and months is the term (`//` and `%`)? If all 18 payments were 2 791 000, how much would the borrower pay in total, and how much of it is interest?

```task
{"id": "w05d1-l15", "kind": "python", "starter": "principal = 40_060_000\nterm = 18\npayment = 2_791_000\n\n# your code: years and months of the term, the total paid, the interest — print the interest last\n", "answer": 10178000, "dp": 0, "hint": "term // 12 and term % 12; payment * term; then minus the principal.", "model": "print(term // 12, term % 12)        # 1 6\ntotal = payment * term\nprint(total)                        # 50238000\nprint(total - principal)            # 10178000\n\n1 year and 6 months; 50 238 000 paid, 10 178 000 of it interest — 25 % on top of the principal. The real schedule's last payment is a little smaller (it clears the balance instead of overpaying), so installments.csv sums to 50 237 628, with 10 177 628 of interest."}
```

**P4.** *(lists)* A list of the five bucket labels in order. Print the last one without counting, the middle three with a slice, and the position of `"61-90"` with `.index()`.

```task
{"id": "w05d1-p2", "kind": "python", "starter": "buckets = [\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"]\n\n# your code: the last label, the middle three (a slice), the position of \"61-90\"\n", "answer": 3, "dp": 0, "hint": "Negative positions count from the end; a slice stops before its second number.", "model": "print(buckets[-1])             # 90+\nprint(buckets[1:4])            # ['1-30', '31-60', '61-90']\nprint(buckets.index(\"61-90\"))  # 3\n\nSlices stop before the second number — the half-open filter of week 1, as indexes."}
```

**P5.** *(dicts)* Count applications per `status` with a dict and a loop; print the dict sorted by count, largest first.

```task
{"id": "w05d1-p3", "kind": "python", "starter": "import csv\nwith open(\"../excel/applications.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\n# your code\n", "answer": 7917, "dp": 0, "hint": "The check looks for the count of plain \"approved\". sorted(d.items(), key=lambda kv: kv[1], reverse=True) sorts by the value.", "model": "counts = {}\nfor r in rows:\n    counts[r[\"status\"]] = counts.get(r[\"status\"], 0) + 1\nprint(sorted(counts.items(), key=lambda kv: kv[1], reverse=True))\n# [('approved', 7917), ('rejected', 3588), ('cancelled', 1817), ('approved_not_disbursed', 678)]\n\nlambda kv: kv[1] says \"sort by the value\". The four sum to 14 000; approved* = 8 595."}
```

**P6.** *(if / elif / else)* Write `label(dpd)` from section 1 and apply it with a comprehension to `[0, 7, 30, 31, 45, 90, 91, 919]`. Then count how many of `loans_status.csv`'s 7 828 rows land in each label with a dict.

```task
{"id": "w05d1-p4", "kind": "python", "starter": "import csv\nwith open(\"../excel/loans_status.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    loans = list(csv.DictReader(f))\n\n# your code: label(dpd), the comprehension, then the count per label\n", "answer": 234, "dp": 0, "hint": "The check looks for the 90+ count. Remember int(r[\"dpd\"]) — the file gives text.", "model": "def label(dpd):\n    if dpd <= 0: return \"0\"\n    elif dpd <= 30: return \"1-30\"\n    elif dpd <= 60: return \"31-60\"\n    elif dpd <= 90: return \"61-90\"\n    else: return \"90+\"\nprint([label(d) for d in [0, 7, 30, 31, 45, 90, 91, 919]])\n# ['0', '1-30', '1-30', '31-60', '31-60', '61-90', '90+', '90+'] — 30 is still 1-30, 91 is 90+\nby_label = {}\nfor r in loans:\n    k = label(int(r[\"dpd\"]))\n    by_label[k] = by_label.get(k, 0) + 1\nprint(by_label)   # {'0': 7429, '1-30': 124, '31-60': 25, '61-90': 16, '90+': 234}\n\nThe week-2/3/4 buckets a fourth time. Checksum: 7 429 + 399 = 7 828."}
```

**P7.** *(for loops)* Sum `requested_amount` per channel; print each as `f"{x / 1e9:.1f} bn"`. What goes wrong without `int()`?

```task
{"id": "w05d1-p5", "kind": "python", "starter": "import csv\nwith open(\"../excel/applications.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\n# your code\n", "answer": 681.2, "dp": 1, "hint": "The check looks for the branch total in bn, one decimal.", "model": "req = {}\nfor r in rows:\n    req[r[\"channel\"]] = req.get(r[\"channel\"], 0) + int(r[\"requested_amount\"])\nfor ch, x in req.items():\n    print(ch, f\"{x / 1e9:.1f} bn\")\n# branch 681.2 bn · app 13.6 bn · partner 11.4 bn\n\n706.2 bn requested in total against 404.8 bn disbursed — the branch asks for SME and Auto money. Without int(), 0 + \"322610000\" raises TypeError: unsupported operand type(s) for +: 'int' and 'str'. Worse, if you start the total from \"\" instead of 0, += glues the texts into one enormous string — no error, a wrong answer; run type() on a sum that looks strange."}
```

**P8.** *(functions)* Write `top_n(d, n)` returning the n largest `(key, value)` pairs of a dict, and use it on the per-`product` counts of applications. Then a `while` loop that grows 1 000 000 by 30 % a year until it passes 10 000 000 — how many years?

```task
{"id": "w05d1-p8", "kind": "python", "starter": "import csv\nwith open(\"../excel/applications.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\n# your code: top_n, then the while loop — print the number of years last\n", "answer": 9, "dp": 0, "hint": "The check looks for the number of years. A while without years += 1 never ends.", "model": "def top_n(d, n):\n    return sorted(d.items(), key=lambda kv: kv[1], reverse=True)[:n]\nby_product = {}\nfor r in rows:\n    by_product[r[\"product\"]] = by_product.get(r[\"product\"], 0) + 1\nprint(top_n(by_product, 3))   # [('Micro loan', 5006), ('Consumer loan', 4204), ('Buy now pay later', 2771)]\nx, years = 1_000_000, 0\nwhile x <= 10_000_000:\n    x *= 1.3\n    years += 1\nprint(years)                  # 9 (1.3^9 = 10.6)\n\nA while without the += 1 runs forever — in Jupyter, Kernel → Interrupt; on the page, reload it."}
```

**P9.** *(importing modules)* Dates: `from datetime import date, datetime`; parse `applied_at` (`"2025-06-02 10:35:00"`) with `datetime.strptime(s, "%Y-%m-%d %H:%M:%S")`, then count applications in September 2026 with the half-open rule. Check it against `<= 2026-09-30`.

```task
{"id": "w05d1-p7", "kind": "python", "starter": "import csv\nfrom datetime import date, datetime\nwith open(\"../excel/applications.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\n# your code\n", "answer": 621, "dp": 0, "hint": "The check looks for the half-open count. Compare .date() with date(2026, 9, 1) and date(2026, 10, 1).", "model": "ds = [datetime.strptime(r[\"applied_at\"], \"%Y-%m-%d %H:%M:%S\") for r in rows]\nprint(sum(1 for d in ds if date(2026, 9, 1) <= d.date() < date(2026, 10, 1)))      # 621\nprint(sum(1 for d in ds if datetime(2026, 9, 1) <= d <= datetime(2026, 9, 30)))    # 598\n\n23 applications after midnight on the 30th are lost by <= — week 1's trap, in a third language. Converting to .date() first makes both forms agree."}
```

**P10.** *(reading a CSV)* Missing values: how many rows have `credit_score == ""`? Compute the average credit score of the rest — and explain why `sum / len(rows)` would be wrong.

```task
{"id": "w05d1-p6", "kind": "python", "starter": "import csv\nwith open(\"../excel/applications.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\n# your code\n", "answer": 659.6, "dp": 1, "hint": "The check looks for the mean of the non-blank scores, one decimal. Filter out \"\" before int().", "model": "scores = [int(r[\"credit_score\"]) for r in rows if r[\"credit_score\"] != \"\"]\nprint(len(rows) - len(scores))              # 388 blanks (2.8 %)\nprint(round(sum(scores) / len(scores), 1))  # 659.6\n\nDividing by 14 000 silently treats a blank as 0 and pulls the mean down to 641.3 — week 2's NULL rule (AVG ignores NULL; your loop must too) written by hand."}
```

**P11.** *(errors and try/except)* Write `approval_rate(rows, channel, convention="all")` as in the worked example, with `"decided"` as the second convention, and a `try/except` around a call with a channel that does not exist so that it returns `None` instead of crashing.

```task
{"id": "w05d1-p9", "kind": "python", "starter": "import csv\nwith open(\"../excel/applications.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\n# your code\n", "answer": 68.2, "dp": 1, "hint": "The check looks for the app channel under the decided convention (cancelled applications left out).", "model": "def approval_rate(rows, channel, convention=\"all\"):\n    sub = [r for r in rows if r[\"channel\"] == channel\n           and (convention == \"all\" or r[\"status\"] != \"cancelled\")]\n    try:\n        return round(100 * sum(r[\"status\"].startswith(\"approved\") for r in sub) / len(sub), 1)\n    except ZeroDivisionError:\n        return None\nfor ch in [\"app\", \"branch\", \"partner\"]:\n    print(ch, approval_rate(rows, ch), approval_rate(rows, ch, \"decided\"))\nprint(approval_rate(rows, \"crypto\"))   # None\n\nall: 58.2 / 63.7 / 61.9; decided: 68.2 / 72.4 / 70.5 — week 4's COUNTIFS table. For an unknown channel the list is empty and / 0 raises ZeroDivisionError; if not sub: return None before dividing is the clearer version."}
```

> 🚀 **Stretch (optional, +5 XP).** **P12.** *(putting it together)* Read `loans_status.csv` and compute Σ `outstanding` by `product` with a dict, then the share of each with an f-string `:.1%`. Then write the same result to a new CSV with `csv.DictWriter` (`fieldnames=["product", "outstanding", "share"]`) and read it back (in Jupyter, open it in Excel).

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
7. `approval_rate(rows, channel, convention)` — P11.
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
  {"type": "single", "q": "You changed a function in cell 4 and re-ran only cell 9; the assert still fails with the old behaviour. What do you do?", "options": ["Run cell 9 again", "Re-run cell 4 first — better, Kernel → Restart & Run All: the kernel still holds the old function", "Delete the assert", "Copy the function into cell 9"], "answer": 1, "explain": "The kernel remembers what was last run, not what is on the screen (→ section 1, 'Where your code runs')."},
  {"type": "single", "q": "r[\"dpd\"] > 30 raises TypeError for a row from csv.DictReader. Why?", "options": ["dpd is a float", "Every value DictReader gives is a string, and text cannot be compared with a number — write int(r[\"dpd\"]) > 30", "The column is called DPD", "30 must be written 30.0"], "answer": 1, "explain": "A CSV knows no types; convert on use (→ section 1, 'Reading a CSV', P1)."},
  {"type": "single", "q": "Which comprehension is week 2's WHERE status LIKE 'approved%' AND channel = 'app'?", "options": ["[r for r in rows if r[\"status\"] == \"approved\" and r[\"channel\"] == \"app\"]", "[r for r in rows if r[\"status\"].startswith(\"approved\") and r[\"channel\"] == \"app\"]", "[r for r in rows if r[\"status\"].startswith(\"approved\") or r[\"channel\"] == \"app\"]", "[r[\"status\"] for r in rows if r[\"channel\"] == \"app\"]"], "answer": 1, "explain": "startswith is the LIKE 'approved%' wildcard; and joins the two conditions (→ section 1, 'List comprehensions', section 2)."},
  {"type": "number", "q": "How many applications in applications.csv have a blank credit_score?", "answer": 388, "tol": 0, "explain": "388 of 14 000 (2.8 %) — they arrive as \"\", so test for the empty string before int() (→ P10)."}
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
  {"type": "single", "q": "You change the function in cell 3, then re-run only cell 7, which calls it. Which version does cell 7 use?", "options": ["Whichever cell is higher on the page", "None — it raises NameError", "The new one — Jupyter re-reads every cell above", "The old one — the kernel remembers what was last run, not what is on the screen"], "answer": 3, "explain": "The kernel keeps variables in the order cells were run; Kernel → Restart & Run All is the only proof that a notebook works top to bottom (→ section 1, 'Where your code runs')."},
  {"type": "single", "q": "What does this print?", "code": "principal = \"31150000\"      # as read by csv.DictReader\nprint(principal * 2)", "options": ["3115000031150000", "62300000", "TypeError", "62300000.0"], "answer": 0, "explain": "Every value from a CSV is text, and a string times 2 is the string repeated — convert with int() before any arithmetic (→ P1)."},
  {"type": "single", "q": "With label() from section 1, what does the last line print?", "code": "def label(dpd):\n    if dpd <= 0: return \"0\"\n    elif dpd <= 30: return \"1-30\"\n    elif dpd <= 60: return \"31-60\"\n    elif dpd <= 90: return \"61-90\"\n    else: return \"90+\"\n\nprint(label(30), label(91))", "options": ["1-30 61-90", "31-60 61-90", "1-30 90+", "31-60 90+"], "answer": 2, "explain": "dpd <= 30 is still 1-30, and 91 is past 90 — the right-closed buckets of week 2 (→ P6)."},
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
