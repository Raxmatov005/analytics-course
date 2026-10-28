# Week 8 · Day 4 — Capstone II: dashboard and story

<span class="badge">Storyline 60 min</span> <span class="badge">Dashboard 75 min</span> <span class="badge">Deck 45 min</span> <span class="badge">Review + rehearsal 40 min</span> <span class="badge hw">Capstone (due Day 5)</span>

> STORY **Thursday, 9:00.** Your notebook has forty tables. Madina scrolls through it in silence, then turns the laptop back to you. *"Good work, and the board will see none of it. The chairman reads the first slide and maybe the last. Bekzod will look for his product, Nilufar for the number she can attack, Sevara for whether you understand her team, Kamola for the app. **Write me ten sentences — just the slide titles — before you open PowerPoint.** If the ten sentences read like a memo, you have a deck. If they read like a table of contents, you have a notebook."*

## Today in 3 lines

- You turn the analysis into a **storyline**: the answer first (the pyramid), **slide titles written before any slide**, the evidence each title needs, and the right chart for each message.
- You build the **two dashboard pages** the board can click, and you review deck and dashboard against a **checklist** as if they were somebody else's.
- You **rehearse the ten minutes** and prepare for the questions each board member — Bekzod, Nilufar, Sevara, Kamola — is going to ask.

---

## 1. Learn — from analysis to a story and a dashboard

Yesterday produced findings. Today they become something a busy board can act on in ten minutes. The eight subsections are the eight moves, in the order you make them; sections 2–8 then apply them to your capstone.

### The audience and the one decision

**What it is.** The **audience** is who will read or hear you, and what each of them owns. **The one decision** is what the meeting must decide when you stop talking. Every slide either serves that decision or goes to the appendix.

**How to write it.** One row per person in the room, before any slide:

| Person | Owns | Will look for | Their number |
|---|---|---|---|
| CEO | the whole plan | the decision and what it is worth | — |
| Bekzod | portfolio, product limits | growth and his products | outstanding |
| Nilufar | risk policy | the number she can attack | approval rate, FPD |
| Sevara | collections | whether you understand her team | actions in September |
| Kamola | the app | the funnel | app sessions that reach money |

```sql
-- Bekzod
SELECT (SELECT SUM(principal_due) FROM installments WHERE due_date > '2026-10-01')        AS outstanding,
       (SELECT ROUND(100.0 * SUM(CASE WHEN status IN ('approved', 'approved_not_disbursed') THEN 1 ELSE 0 END)
               / SUM(CASE WHEN status <> 'cancelled' THEN 1 ELSE 0 END), 1)
          -- Nilufar
          FROM applications WHERE applied_at >= '2026-01-01' AND applied_at < '2026-10-01') AS approval_2026_pct,
       (SELECT COUNT(*) FROM collections_actions
         -- Sevara
         WHERE action_date >= '2026-09-01' AND action_date < '2026-10-01')                AS actions_september,
       (SELECT ROUND(100.0 * COUNT(l.loan_id) / COUNT(*), 1)
          FROM (SELECT DISTINCT application_id FROM app_events) s
          LEFT JOIN loans l ON l.application_id = s.application_id)                       AS app_to_money_pct;
          -- Kamola
```

Bekzod's book is 208 723 504 430 soum. Nilufar's approval rate for 2026 is 70.4 %. Sevara's team logged 651 actions in September. Kamola's app turns 53.3 % of sessions into money. Know each of these before you walk in.

**When you use it.**
- Before the storyline: the decision decides which findings make the deck.
- Before the questions: each person's number is where their question will come from.

> ⚠️ **Watch out.** A deck written for "the board" in general is written for nobody. Name the people; a finding that none of them owns goes to the appendix.

**Your turn.** The chairman asked "where do we grow, where do we stop, what do we change?". What is the one decision the meeting must take?

```task
{"id": "w08d4-l1", "kind": "choice", "options": ["Approve the analyst's methodology", "Agree next year's lending priorities — which products, regions and processes get more, less, or a change", "Choose a dashboard tool", "Decide whether the data are good enough"], "answer": 1, "explain": "The board allocates: more here, less there, change this. Every slide must help them make that allocation; method and data quality go to the appendix."}
```

### The governing thought — the pyramid principle

**What it is.** The **governing thought** (*главная мысль*) is one sentence that answers the question you were asked. The **pyramid principle** puts it at the top, the reasons under it, and the evidence under each reason: the reader gets the answer first and stops when they believe you.

**How to write it.**

```text
                 governing thought
   "Grow X and Y, slow Z until …, change A — worth about N"
          /                  |                  \
     key line 1          key line 2          key line 3        ← the reasons, one sentence each
     evidence            evidence            evidence          ← one chart + one table each
```

On the capstone: *"Grow branch lending and repeat app loans, slow BNPL and the riskiest region until they are explained, and move collections effort to the first month of delinquency."* It names products, a region and a process, and every part can be checked against a number.

**When you use it.**
- The first slide after the title, and the first sentence you say.
- As a test: if you cannot write it, you do not have an answer yet — go back to the issue tree.

> ⚠️ **Watch out.** "We analysed the portfolio from five angles" is an agenda, not a governing thought. It answers nothing.

**Your turn.** Which sentence is a governing thought?

```task
{"id": "w08d4-l2", "kind": "choice", "options": ["Today I will present growth, risk, collections, the app and unit economics.", "The portfolio is complex and has many moving parts.", "Grow branch lending, slow BNPL until partners pay about 11 %, and contact every early-late loan in its first week.", "Key findings and recommendations."], "answer": 2, "explain": "Only the third answers the question: it says what to grow, what to slow and what to change, with a condition and a number."}
```

### The storyline — three to five key lines that are sentences

**What it is.** The **storyline** is the three to five **key lines** under the governing thought — the reasons. Each is a full sentence with a number and a comparison. Read in order, they make the argument without any chart.

**How to write it.**

```text
key line = what + number + comparison + so what

1. Money    "Per 1 000 soum lent, Auto (73) and SME (60) earn most; BNPL loses 108."
2. Risk     "Our fastest-growing region, Nukus (+90 %), carries the highest PAR30, 6.8 %."
3. Process  "Only 13 of 124 early-late loans were contacted in September; almost all effort went to loans already lost."

```

The three key lines map to the three parts of the governing thought: what to grow, what to slow, what to change.

**When you use it.**
- To pick the slides: each key line becomes one or two finding slides.
- To check the logic: if a key line does not support the governing thought, one of them is wrong.

> ⚠️ **Watch out.** Five key lines that are five topics ("Growth", "Risk", "Collections", "App", "Money") are a table of contents. Write sentences.

**Your turn.** Which is a key line?

```task
{"id": "w08d4-l3", "kind": "choice", "options": ["Collections", "Collections effort by bucket", "Collections effort goes to loans already lost: 95 % of 2026 actions went to loans now 90+", "We looked at collections"], "answer": 2, "explain": "A key line is a sentence with a number and a so-what. The others are topics or method."}
```

### The ghost deck — every slide title before any slide

**What it is.** A **ghost deck** (*черновик из заголовков*) is the whole deck as titles only, in order, before any slide is built. Read aloud in one go it takes about a minute. If the titles alone read like a memo, the deck works.

**How to write it.** Ten lines, in the order of the analytical deck from Day 2:

```text
1  title         2026 portfolio review — where to grow, where to slow, what to change (as of 1 October 2026)
2  summary       the governing thought + three bullets
3  context       Disbursements grew 46 % in January–September; the book stands at 208.7 bn with PAR30 at 3.1 %
4–8  findings    one key line each, as a sentence with a number
9  recommend.    Five changes, owners and what they are worth
10 risks         What could make us wrong, and what we analyse next
```

**When you use it.**
- Before you open PowerPoint: a weak title is cheap to fix as a line, expensive as a finished slide.
- Before Madina reviews the deck: send her the ten lines first.

> ⚠️ **Watch out.** The chairman reads slide 2 and the last slide. If either is a topic ("Summary", "Next steps"), he has read nothing.

**Your turn.** A ghost deck is good when…

```task
{"id": "w08d4-l4", "kind": "choice", "options": ["it has exactly ten slides", "every slide has a chart", "the titles alone, read in order, tell the reader what to decide and why", "the titles are short"], "answer": 2, "explain": "The test is the read-aloud: the titles must carry the whole argument. Length and slide count follow from it."}
```

### Choosing the chart — a recap

**What it is.** The chart follows the **type of message**: change over time, comparison, part of a whole, two measures per category, a funnel, cohorts, a bridge, one number. Week 5's chart rules, applied to the deck.

**How to write it.** The slide-6 message — *"the fastest-growing region carries the highest risk"* — has two measures per category, so it is a scatter with labelled points:

```python
import matplotlib.pyplot as plt

regions = ["Nukus", "Namangan", "Bukhara", "Andijan", "Samarkand", "Tashkent", "Fergana", "Termez"]
# disbursed Jan–Sep 2026 vs 2025, %  (P7)
growth  = [89.7, 83.4, 76.4, 61.2, 58.6, 38.3, 26.1, -9.1]
# PAR30 on 2026-10-01, % of outstanding
par30   = [6.8, 1.7, 4.8, 4.0, 3.0, 3.4, 0.7, 0.7]

# one colour for the point, grey for context
colours = ["#c0392b" if r == "Nukus" else "#9aa0a6" for r in regions]
plt.scatter(growth, par30, c=colours, s=60)
for r, x, y in zip(regions, growth, par30):
    plt.annotate(r, (x, y), textcoords="offset points", xytext=(5, 4), fontsize=8)
plt.xlabel("disbursement growth, Jan–Sep 2026 vs 2025 (%)")
plt.ylabel("PAR30 (%)")
plt.title("The fastest-growing region carries the highest risk")
plt.show()
```

Nukus sits alone in the top-right corner: +89.7 % growth and 6.8 % PAR30. Namangan, almost as fast (+83.4 %), sits at 1.7 % — the counter-example that keeps the slide honest.

**When you use it.**

| Message | Chart |
|---|---|
| change over time | line (bars if few periods) |
| compare categories | horizontal bars, sorted |
| two measures per category | scatter with labelled points |
| a funnel | horizontal bars with step conversion |
| cohorts / vintages | lines that stop where months are not observed |
| what explains a change | waterfall |
| one number | big number + comparison |

> ⚠️ **Watch out.** A dual-axis line invents crossings; a vintage line that continues into unobserved months drops to 0 and looks like an improvement. If a chart needs a sentence to explain how to read it, change the chart.

**Your turn.** The message is *"SME is 58.7 % of 2026 disbursements"*. Which chart?

```task
{"id": "w08d4-l5", "kind": "choice", "options": ["A pie with five slices", "A dual-axis line", "One 100 % stacked bar (or sorted bars) with SME highlighted and the others grey", "A gauge"], "answer": 2, "explain": "Part of a whole where one part matters: a single stacked bar or sorted bars, with the point in colour. A five-slice pie makes the reader compare angles."}
```

### Dashboard layout — the top-left rule, one question per tile

**What it is.** A dashboard page is read like a page of text: top-left first, then right, then down. The **top-left rule**: the most important number goes top-left. **One question per tile**: each card, chart or table answers exactly one question, which you can write above it.

**How to write it.** Draw the page as boxes, each with its question, before you build anything:

```text
┌───────────────┬───────────────┬───────────────┬───────────────┐
│ Outstanding   │ Disbursed     │ Growth vs     │ Average       │   ← cards: "how big?", "how fast?"
│ 208.7 bn      │ Jan–Sep 2026  │ Jan–Sep 2025  │ ticket        │
├───────────────┴───────────────┼───────────────┴───────────────┤
│ Disbursed by month, 2025 vs   │ Disbursed by product, sorted, │   ← "when?" and "what?"
│ 2026 (line)                   │ with growth %                 │
├───────────────────────────────┼───────────────────────────────┤
│ Region table: disbursed,      │ Mix: share of each product    │   ← "where?" and "which mix?"
│ growth %, PAR30               │                               │
└───────────────────────────────┴───────────────────────────────┘
  slicers: product · channel · region · period        as of 2026-10-01 · definitions in tooltips
```

The top row's four cards, from one query:

```sql
SELECT (SELECT SUM(principal_due) FROM installments WHERE due_date > '2026-10-01')        AS outstanding,
       SUM(CASE WHEN disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01' THEN principal ELSE 0 END) AS disbursed_2026,
       ROUND(100.0 * SUM(CASE WHEN disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01' THEN principal ELSE 0 END)
             / SUM(CASE WHEN disbursed_at >= '2025-01-01' AND disbursed_at < '2025-10-01' THEN principal ELSE 0 END) - 100, 1) AS growth_pct
FROM loans;
```

Outstanding 208 723 504 430 soum top-left; 161 480 300 000 disbursed in January–September 2026, +45.6 % against the same months of 2025. The fourth card, the average ticket, is P6.

**When you use it.**
- Before you open Power BI or Excel: the sketch is the spec.
- When a page feels busy: any tile whose question you cannot write goes.

> ⚠️ **Watch out.** Twelve visuals on one page means twelve questions and no answer. Six to eight tiles is a page; more is two pages.

**Your turn.** Which tile goes top-left on page 2, *Risk & collections*?

```task
{"id": "w08d4-l6", "kind": "choice", "options": ["The collections actions table by type", "A slicer for region", "The PAR30 card, with its comparison", "The vintage curves"], "answer": 2, "explain": "Top-left is the headline number of the page: how risky is the book today. The curves and tables below explain it."}
```

### Annotation — numbers that are read aloud

**What it is.** An **annotation** is text on the chart that states the point: the number that matters, labelled where the eye already is. Numbers on slides are **rounded to what can be said aloud** — "208.7 bn", not 208 723 504 430 — with a unit and a comparison.

```pic
{"id": "w08d4-pic1", "title": "Round to what can be said aloud — without changing the message", "caption": "Twelve digits become three, with a unit. The last row keeps the difference: \"1.7 against 1.0\", never \"about 1 % both\".", "tables": [{"name": "say()", "cols": ["exact", "said aloud"], "new": ["said aloud"], "rows": [["208 723 504 430", "208.7 bn soum"], ["161 480 300 000", "161.5 bn soum"], ["3.1178 %", "PAR30 3.1 %"], ["1.70 % vs 1.04 %", "1.7 against 1.0"]]}]}
```

**How to write it.**

```python
def say(x, unit="soum"):
    """Round a number the way you would say it in a meeting."""
    for size, word in [(1e12, "trn"), (1e9, "bn"), (1e6, "m"), (1e3, "k")]:
        if abs(x) >= size:
            return f"{x / size:.1f} {word} {unit}"
    return f"{x:.0f} {unit}"

print(say(208_723_504_430))                 # the book
print(say(161_480_300_000))                 # disbursed Jan–Sep 2026
print(say(53_293_828))                      # average ticket
print(f"PAR30 {6_507_526_953 / 208_723_504_430:.1%}")
```

The four numbers become "208.7 bn soum", "161.5 bn soum", "53.3 m soum" and "PAR30 3.1 %". On the scatter above, the annotation is one line next to the red point: *"Nukus: +90 % growth, PAR30 6.8 % — highest of eight regions"*.

**When you use it.**
- On every chart in the deck: label the point that matters, not every point.
- In every spoken sentence: say the rounded number, never "as you can see".

> ⚠️ **Watch out.** Rounding must not change the message. 1.70 % vs 1.04 % may be said as "1.7 against 1.0", not as "about 1 % both".

**Your turn.** Say 94 774 300 000 soum (SME's 2026 disbursements) as on a slide: in bn, one decimal.

```task
{"id": "w08d4-l7", "kind": "number", "answer": 94.8, "dp": 1, "unit": "bn soum", "hint": "Divide by 1 000 000 000.", "model": "94.8 bn soum — 58.7 % of the year's disbursements."}
```

### Rehearsing — the first minute, then the questions

**What it is.** **Rehearsal** is saying the talk aloud, standing, with a timer. The **first minute** carries the question, the answer and three reasons. After the talk come the **questions**: prepare one sentence and one number for each person in the room, and answer a challenge by agreeing with what is true, quantifying, and offering a check.

**How to write it.** Spoken English runs at about 130–150 words a minute. Count the words of your opening before you rehearse it:

```python
opening = """The board asked where Nur Finance should grow, where it should slow down and what it should change,
as of the first of October. My answer: grow branch lending and repeat app loans, slow BNPL and Nukus until we
understand them, and move collections effort to the first month of delinquency."""
words = len(opening.split())
print(words, "words ≈", round(words / 140 * 60), "seconds at 140 words a minute")
```

The two opening sentences are 51 words: about 22 seconds. Three reasons with one number each fill the rest of the minute.

**When you use it.**
- Twice before the meeting, the second time recorded.
- For the questions: the audience table from the first subsection tells you who asks what.

> ⚠️ **Watch out.** "Today I will talk about…" spends the first ten seconds on nothing. Start with the question or the answer.

**Your turn.** Your opening is 210 words. At 140 words a minute, how many seconds does it take?

```task
{"id": "w08d4-l8", "kind": "number", "answer": 90, "dp": 0, "unit": "seconds", "hint": "210 ÷ 140 × 60.", "model": "90 seconds — half a minute too long. Cut words, not reasons."}
```

### Putting it together

One slide, built with every move. *Audience:* Nilufar and Bekzod. *Governing thought:* "…slow the riskiest region until it is explained…". *Key line:* "Our fastest-growing region, Nukus, carries the highest PAR30." *Ghost deck:* it is title 6. *Chart:* a scatter, growth against PAR30, Nukus in colour. *Dashboard:* the same numbers sit in page 1's region table. *Annotation:* "Nukus: +90 % growth, PAR30 6.8 %". *Rehearsal:* the spoken line is the title, then one number — "ninety percent growth, six point eight percent at risk" — then the ask: "a cut by product and officer before next quarter's targets".

**Which move fixes which mistake?**

```game
{"id": "w08d4-g5", "type": "match", "title": "Mistake → move", "pairs": [["The deck answers a question nobody in the room owns", "The audience and the one decision"], ["Slide 2 reads 'Summary'", "The governing thought"], ["Five findings that are five topics", "The storyline"], ["Weak titles discovered after the slides are built", "The ghost deck"], ["A dual-axis chart for growth vs PAR30", "Choosing the chart"], ["Twelve visuals on one dashboard page", "Dashboard layout"], ["'As you can see, 208 723 504 430'", "Annotation"], ["The talk runs fourteen minutes", "Rehearsing"]]}
```

---

## 2. From analysis to the pyramid (20 min)

Four steps, on paper:

1. **Sort the findings by the board's three questions.** Every finding from yesterday goes under *grow*, *stop/slow* or *change* — or into the appendix. A finding that answers none of them is interesting, not useful.
2. **Write the governing thought**: one sentence that answers the chairman's question. *"Grow X and Y, slow Z until …, and change A and B — worth about N."* If you cannot write it, you do not have an answer yet: go back to the tree, not to PowerPoint.
3. **Three to five key lines** under it — the reasons. Each must be a sentence with a number and a comparison.
4. **Evidence under each key line**: the one chart and the one table that prove it, with the definition.

The test of a pyramid: read only the top and the key lines. Does the chairman know what to decide? Read only one branch. Does Nilufar find her number and its definition?

```game
{"type": "order", "id": "w08d4-g1", "title": "Build the pyramid", "q": "Put the four steps from yesterday's tables to a pyramid in order.", "items": ["Sort every finding under grow, stop/slow or change — or the appendix", "Write the governing thought: one sentence that answers the chairman", "Write three to five key lines — the reasons, each with a number and a comparison", "Put the one chart and one table that prove each key line underneath"], "why": "Top-down: the answer exists before the slides do. If step 2 will not come, go back to the issue tree, not to PowerPoint."}
```

> 💡 **Key idea.** If you cannot write the governing thought in one sentence, you do not have an answer yet — and no amount of formatting will give you one. Go back to the tree.

**P1.** *(the audience and the one decision)* Fill the audience table for Friday: for each of the five people in the room, what they own, what they will look for, and the one number of yours they will check first.

```task
{"id": "w08d4-p11", "kind": "free", "min": 50, "rubric": ["all five people: the CEO, Bekzod, Nilufar, Sevara, Kamola", "what each owns, in a few words", "a number of yours per person, with its value", "the one decision the meeting must take, in one line at the end"], "model": "CEO — owns the plan; looks for the decision and its value; checks the total contribution (about 8.85 bn in 2026). Bekzod — portfolio and limits; looks for growth by product; checks outstanding 208.7 bn and +45.6 % disbursement growth. Nilufar — risk policy; looks for a number to attack; checks FPD30 1.28 % (app 1.70 %) and the crude PD behind the margins. Sevara — collections; looks for whether I understand her team; checks 651 actions in September and 13 of 124 early-late loans contacted. Kamola — the app; looks for the funnel; checks 53.3 % of sessions reaching money and the 222 signed-but-unpaid. The decision: next year's lending priorities — what gets more, what gets less, what changes."}
```

**P2.** *(the governing thought)* Your governing thought: one sentence that answers *where do we grow, where do we stop, what do we change* — with what it is worth.

```task
{"id": "w08d4-p1", "kind": "free", "min": 20, "rubric": ["one sentence that answers all three parts: grow, stop/slow, change", "each part names a product, channel, region or process — not a generality", "it carries a size or a value", "a reader who stops here knows what to decide"], "model": "\"Grow branch lending and repeat app loans, slow BNPL and the riskiest region until they are explained, and move collections effort to the first month of delinquency — worth several billion soum a year in contribution and avoided losses.\""}
```

**P3.** *(the storyline)* Under your governing thought, write the three to five key lines — the reasons — each a full sentence with a number and a comparison.

```task
{"id": "w08d4-p12", "kind": "free", "min": 50, "rubric": ["three to five lines", "each is a sentence, not a topic", "each has a number and a comparison", "together they support every part of the governing thought (grow, slow, change)"], "model": "1. Per 1 000 soum lent, Auto (73) and SME (60) earn most, Consumer 32, Micro 7 — BNPL loses 108 unless partners pay about 11 %. 2. Our fastest-growing region, Nukus (+90 %), carries the highest PAR30 (6.8 %), while Namangan grew almost as fast at 1.7 %. 3. Only 13 of 124 loans in their first month late were contacted in September; 95 % of this year's actions went to loans now 90+. 4. The app turns 53 % of sessions into money and loses people evenly at each step; 222 signed contracts never paid out."}
```

*Done looks like:* one sentence on a sticky note, and three to five key lines under it, each with a number.

## 3. Slide titles first (20 min)

A **ghost deck** (*черновик из заголовков*): ten empty slides with only the titles, in order. Read them aloud in one go — about a minute. That minute is your presentation's skeleton; the rest of the ten minutes is evidence.

Good title rules (Day 2): a full sentence, a number, a comparison, the "so what". Weak → strong:

| Topic title (weak) | So-what title (strong) |
|---|---|
| "Growth by region" | "The fastest-growing region also carries the highest PAR30" |
| "Collections activity" | "Collections effort goes to loans already lost; the early bucket is barely called" |
| "Unit economics" | "Per 1 000 soum lent, Auto and SME earn ten times Micro; BNPL loses money" |

For each title, write under it: *the evidence* (which table/chart from the notebook), *the definition* (footnote), *the owner* of the action.

```game
{"type": "sort", "id": "w08d4-g2", "title": "Topic or message?", "q": "Sort the titles: which would survive in a ghost deck?", "groups": {"So-what title (keep)": ["Disbursements grew 46 % in January–September, in count as well as amount", "BNPL loses 108 soum per 1 000 lent unless partners pay about 11 %", "Only 13 of 124 early-late loans were contacted in September"], "Topic title (rewrite)": ["Portfolio overview", "Collections activity", "Unit economics by product", "Key findings"]}, "why": "A so-what title is a sentence with a number and a comparison; a topic makes the reader find the message on their own."}
```

> ⚠️ **Watch out.** A deck whose titles read like a table of contents ("Overview", "Risk", "Collections", "Next steps") is a notebook in slide form. The chairman reads slide 2 and the last one; if those are topics, he has read nothing.

**P4.** *(the ghost deck)* Your ghost deck: the ten titles, in order, one per line. Read them aloud — about a minute.

```task
{"id": "w08d4-p2", "kind": "free", "min": 80, "rubric": ["ten titles in the deck's order (title, summary, context, findings, recommendations, risks)", "every finding title is a full sentence with a number and a comparison", "slide 2 answers the chairman's question on its own", "every board member finds their area in at least one title", "the recommendations title promises owners and values"], "model": "1. 2026 portfolio review — where to grow, where to slow, what to change (as of 1 October 2026). 2. Grow branch lending and repeat app loans, slow BNPL and the riskiest region until explained, and move collections to the early bucket. 3. Disbursements grew 46 % in January–September; the book stands at 208.7 bn with PAR30 at 3.1 % and NPL at 2.6 %. 4. Per 1 000 soum lent, Auto (73) and SME (60) earn most, Consumer 32, Micro 7 — BNPL loses 108. 5. SME's margin rests on a default rate we have not yet seen: at its matured PD of 9 % it earns 19, not 60. 6. The fastest-growing region carries the highest risk: Nukus +90 % with PAR30 6.8 %. 7. The app's loans start worse than the branches' but its FPD has fallen every year. 8. The app loses people evenly at every step, and 222 signed contracts never paid out. 9. 95 % of this year's collection actions went to loans that are now 90+; only 13 of 124 early-late loans were contacted in September. 10. Five changes, owners and what they are worth."}
```

*Done looks like:* ten sentences that read like a memo when you read them in one go.

## 4. Choosing the chart (20 min)

| Message | Chart | Avoid |
|---|---|---|
| change over time (disbursement, FPD by month) | line; bars if few periods | pie, 3D |
| compare categories (product, region) | horizontal bars, sorted | unsorted bars, pie with 8 slices |
| part of a whole that matters (mix) | 100 % stacked bar, or one bar highlighted | pie with similar slices |
| two measures per category (growth vs PAR30 by region) | scatter, labelled points; or two aligned bar columns | dual-axis line chart |
| a funnel | horizontal bars with step conversion labels | a funnel graphic without numbers |
| cohorts / vintages | lines by cohort vs MOB, or a heat-mapped table with blanks | lines that continue into unobservable months |
| a bridge (what explains a change) | waterfall | a table of percentages |
| one number | big number + comparison ("3.12 % PAR30, +0.3 pt vs June") | a gauge |

One colour for "the point", grey for context; label the bar that matters, not all of them; units in the title or axis; source and definition in a footnote; as-of date on every page. (Week 5's chart rules.)

```game
{"type": "match", "id": "w08d4-g3", "title": "Message → chart", "q": "Match each message to the chart that carries it.", "pairs": [["Disbursements by month, 2025 vs 2026", "Line (bars if few periods)"], ["Net per 1 000 lent, five products", "Horizontal bars, sorted"], ["Growth vs PAR30 for eight regions", "Scatter with labelled points"], ["What explains the book's change from December to September", "Waterfall"], ["Ever 30+ by months on book, per vintage", "Lines that stop where months are not observed"], ["PAR30 today", "Big number with a comparison"]]}
```

> ⚠️ **Watch out.** Three charts that mislead without lying: a **dual-axis** line that invents crossings, vintage lines that **continue into months not yet observed** (the line drops to 0 and looks like an improvement), and a **pie** with five similar slices. If the chart needs a sentence to explain how to read it, change the chart.

**P5.** *(choosing the chart)* Slide 6 says *"the fastest-growing region carries the highest risk"*. Which chart carries it? Then, in your notes, do the same for two more of your findings: message type → chart → the one point in colour.

```task
{"id": "w08d4-p13", "kind": "choice", "options": ["Slide 6 (growth vs PAR30 by region): a dual-axis line, growth on the left axis and PAR30 on the right", "Slide 6 (growth vs PAR30 by region): a scatter with eight labelled points, Nukus in colour", "Slide 6 (growth vs PAR30 by region): two pies, one per measure", "Slide 6 (growth vs PAR30 by region): a gauge per region"], "answer": 1, "explain": "Two measures per category is a scatter (or two aligned bar columns). The dual-axis line invents crossings between unrelated scales; pies and gauges hide the comparison. Do the same reasoning for your other two findings in your notes: message type → chart → the one point in colour."}
```

## 5. The dashboard — two pages (75 min)

Power BI on week 7's model (`data/powerbi/`), or Excel on week 4's pivots. Slicers on both pages: **product, channel, region, disbursement period**.

**Page 1 — Growth & mix.** Top row, four cards: outstanding; disbursed Jan–Sep 2026; growth vs Jan–Sep 2025; average ticket. Middle: disbursed by month (line, 2025 vs 2026); disbursed by product (sorted bars) with growth %. Bottom: region table (disbursed 2026, growth %, PAR30) with conditional formatting; a small mix chart (share of SME / AUTO / CONS / MICRO / BNPL).
**Page 2 — Risk & collections.** Cards: PAR30, NPL90, FPD30 (mature loans), collection rate (last month). Middle: vintage curves by channel (ever 30+ by MOB, MOB 1–6); FPD30 by grade and channel (matrix). Bottom: buckets with balance and **share contacted in the last 30 days**; actions by bucket.

Every card shows its definition in a tooltip or a text box; numbers on the dashboard equal the notebook's (check five of them — the sanity table is your test). Export a PDF of both pages.

> 💡 **Key idea.** The dashboard and the deck are two views of **one** set of numbers. Before you format anything, put five dashboard numbers next to the notebook's — any difference is a filter or a definition you have not written down.

**P6.** *(dashboard layout)* Page 1's fourth card: the **average ticket** of loans disbursed January–September 2026 (sanity 5: 3 030 loans, 161 480 300 000 soum). Whole soum.

```task
{"id": "w08d4-p3", "kind": "number", "answer": 53293828, "dp": 0, "unit": "soum", "hint": "Amount ÷ loans, January–September 2026.", "model": "161 480 300 000 ÷ 3 030 = 53 293 828 soum (Jan–Sep 2025: 110 929 400 000 ÷ 2 159 = 51 379 991, +3.7 %). On the card: \"53.3 m, +3.7 % vs Jan–Sep 2025\" — count grew +40 % and the ticket only +4 %, so growth is more loans, not bigger ones; the SME mix is the exception to check."}
```

**P7.** *(dashboard layout — one question per tile)* Page 1's region table: by branch region, disbursed January–September 2026, growth of that amount vs January–September 2025 in %, and PAR30 in % of today's outstanding. Fastest growth first.

```task
{"id": "w08d4-p4", "kind": "sql", "note": "Eight rows: region, disbursed Jan–Sep 2026, growth in % to one decimal, PAR30 in % to one decimal — sorted by growth, highest first. PAR30 needs the DPD chain of Day 3, section 7.", "model": "WITH pay AS (\n  SELECT installment_id, paid_at, amount FROM (\n    SELECT installment_id, paid_at, amount,\n           ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn\n    FROM payments) WHERE rn = 1),\nunpaid AS (\n  SELECT i.loan_id, i.due_date FROM installments i\n  LEFT JOIN pay p ON p.installment_id = i.installment_id AND p.paid_at <= '2026-10-01'\n  WHERE i.due_date <= '2026-10-01'\n  GROUP BY i.installment_id, i.loan_id, i.due_date, i.total_due\n  HAVING COALESCE(SUM(p.amount), 0) < i.total_due),\ndpd AS (SELECT loan_id, CAST(julianday('2026-10-01') - julianday(MIN(due_date)) AS INTEGER) AS dpd FROM unpaid GROUP BY loan_id),\noutst AS (SELECT loan_id, SUM(principal_due) AS outstanding FROM installments WHERE due_date > '2026-10-01' GROUP BY loan_id),\nls AS (SELECT l.loan_id, b.region, l.disbursed_at, l.principal, COALESCE(o.outstanding, 0) AS outstanding, COALESCE(d.dpd, 0) AS dpd\n       FROM loans l JOIN branches b ON b.branch_id = l.branch_id\n       LEFT JOIN dpd d ON d.loan_id = l.loan_id LEFT JOIN outst o ON o.loan_id = l.loan_id)\nSELECT region,\n       SUM(CASE WHEN disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01' THEN principal ELSE 0 END) AS disbursed_2026,\n       ROUND(100.0 * SUM(CASE WHEN disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01' THEN principal ELSE 0 END)\n             / SUM(CASE WHEN disbursed_at >= '2025-01-01' AND disbursed_at < '2025-10-01' THEN principal ELSE 0 END) - 100, 1) AS growth_pct,\n       ROUND(100.0 * SUM(CASE WHEN dpd > 30 THEN outstanding ELSE 0 END) / SUM(outstanding), 1) AS par30_pct\nFROM ls GROUP BY region ORDER BY growth_pct DESC;"}
```

**P7 — read it.** Which region would you put on slide 6, and why?

```task
{"id": "w08d4-p4b", "kind": "choice", "options": ["Tashkent — it disburses the most", "Nukus — the fastest growth (+90 %) with the highest PAR30 (6.8 %): the risk is where the growth is", "Termez — it shrank", "Fergana — the lowest PAR30"], "answer": 1, "explain": "Nukus +89.7 % at PAR30 6.8 %, Namangan +83.4 % at 1.7 %, Bukhara +76.4 % at 4.8 %, Andijan +61.2 % at 4.0 %, Samarkand +58.6 % at 3.0 %, Tashkent +38.3 % at 3.4 %, Fergana +26.1 % at 0.7 %, Termez −9.1 % at 0.7 %. Growth and risk on one slide (a scatter), with Namangan as the counter-example: fast growth does not have to mean bad loans — so Nukus needs a cut by product, branch and officer before anyone blames growth itself."}
```

**P8.** *(annotation)* Write the annotation for the Nukus point on your slide-6 scatter, and the footnote under the chart (definition, source, as-of date). Numbers rounded as you would say them.

```task
{"id": "w08d4-p14", "kind": "free", "min": 25, "rubric": ["the annotation names the point and gives both numbers, rounded (+90 %, 6.8 %)", "it adds the comparison (highest of eight regions)", "the footnote defines PAR30 and growth", "the footnote gives the source and the as-of date"], "model": "Annotation, next to the red point: \"Nukus: +90 % growth, PAR30 6.8 % — highest of eight regions.\" Footnote: \"Growth: amount disbursed Jan–Sep 2026 vs Jan–Sep 2025, by branch region. PAR30: outstanding of loans more than 30 days past due ÷ outstanding, clean payments. Source: Nur Finance loan book; as of 1 October 2026.\""}
```

*Done looks like:* two pages, PDF exported, and five numbers on them that you have checked against the notebook.

## 6. Review your own work — the checklist (20 min)

Print it, tick it, fix what fails. Do it on Thursday evening, not on Friday morning.

**Deck / memo**
- [ ] Slide 2 answers the chairman's question in three bullets; a reader who stops there knows the decision.
- [ ] Every title is a sentence with a number; reading the titles alone tells the story.
- [ ] One message per slide; every chart has units, a source and an as-of date.
- [ ] Each recommendation has an **owner**, a **date** and **what it is worth** (or protects).
- [ ] Assumptions (funding rate, costs, LGD) and data problems on one slide or in the appendix.
- [ ] No number appears with two values in two places.

**Dashboard**
- [ ] Two pages; the main numbers match the notebook; slicers change what they should and nothing else.
- [ ] Definitions and as-of date visible; nothing needs scrolling.

**Notebook**
- [ ] Restart & Run All on a fresh copy works; the sanity numbers are in cells; every slide number is in a cell.
- [ ] Each section ends with a sentence of interpretation.

**Correctness traps** (week by week): clean payments for money; FPD on mature loans only; approval rate with its denominator written; vintage blanks; funnel = app sessions only, ending at disbursed; repeat borrowing with unobservable cells blank; intervals where n is small.

## 7. Rehearse the ten minutes (20 min)

| Minute | What | Slides |
|---|---|---|
| 0:00–1:00 | the question and **the answer** (governing thought + three bullets) | 1–2 |
| 1:00–2:00 | context: size, growth, quality in four numbers | 3 |
| 2:00–7:30 | the findings, about one minute each — title first, then the one number on the chart that proves it | 4–8 |
| 7:30–9:00 | recommendations: what, who, by when, worth | 9 |
| 9:00–10:00 | risks and assumptions; what you would do next; "questions?" | 10 |

Rehearse twice with a timer, standing, out loud; record the second one (that may be your Friday submission). Cut words, not slides. Say each title as the first sentence of each slide. When you point at a chart, say the number, not "as you can see".

**P9.** *(rehearsing — the first minute)* Write your first minute — slides 1 and 2 — exactly as you will say it. No "today I will talk about".

```task
{"id": "w08d4-p5", "kind": "free", "min": 70, "rubric": ["the first sentence is the question or the answer, not an agenda", "the governing thought is said within the first minute", "three reasons follow, each with one number", "it names what the board is asked to decide", "it is about 130–150 words (one minute spoken)"], "model": "The board asked where Nur Finance should grow, where it should slow down and what it should change, as of the first of October. My answer: grow branch lending and repeat app loans, slow BNPL and Nukus until we understand them, and move collections effort to the first month of delinquency. Three reasons. First, money: per thousand soum lent, Auto and SME earn sixty to seventy-three soum, Micro seven, and BNPL loses a hundred and eight unless partners pay us about eleven percent. Second, risk: our fastest-growing region, Nukus, grew ninety percent and carries the highest PAR30, six point eight percent. Third, process: only thirteen of a hundred and twenty-four loans in their first month late were contacted in September, while almost all our effort went to loans already lost. Today I am asking for five decisions, each with an owner — they are on slide nine."}
```

*Done looks like:* two timed rehearsals, the second recorded, 10 minutes ± 1, the answer said before the first minute is over.

## 8. The questions each board member will ask

Prepare one sentence and one number for each. Write your answer in the box **before** you compare it with the model — the model is how the course's numbers would answer, and yours may lead with a different number.

```game
{"type": "match", "id": "w08d4-g4", "title": "Who will ask what?", "q": "Match each board member to the question they are most likely to ask.", "pairs": [["Bekzod (portfolio)", "If we slow BNPL, how much volume do we lose?"], ["Nilufar (risk)", "Your PD is crude — why should I believe your margins?"], ["Sevara (collections)", "Are you saying my team calls the wrong people?"], ["Kamola (product)", "What do I fix first in the app?"], ["The CEO", "If you could do one thing, what would it be?"]]}
```

> 🎯 **Interview version.** *"A senior manager attacks your number in front of everyone. What do you do?"* — Agree with what is true in the challenge first, then restate the definition behind my number, give the one figure that shows how much the answer depends on it, and offer the check that would settle it — with a time. I never argue about a number whose definition we have not agreed, and if I do not have the cut, I say "I don't have that here; I will send it today" and write it down.

**P10.** *(rehearsing — the questions)* Bekzod: *"If we slow BNPL, how much volume do we lose — and what happens to the customers?"* · *"Is SME growth sustainable, or are we just lending bigger?"*

```task
{"id": "w08d4-p6", "kind": "free", "min": 40, "rubric": ["sizes BNPL: about 1.5 % of Jan–Sep 2026 disbursement (2.43 of 161.48 bn), about −0.27 bn contribution", "says BNPL-first customers come back as often as anyone, so 'stop' loses a door — prefers renegotiate the fee or slow", "answers SME with count AND amount growth (+40 % and +43 %)", "names the risk caveat: matured SME default rate about 9 % vs 3.7 % crude"], "model": "BNPL is 1.5 % of January–September 2026 disbursement (2.43 of 161.48 bn), 595 loans in 2026, and its 2026 contribution is about −0.27 bn under Day 2's assumptions. Customers whose first loan was BNPL come back as often as anyone (43.5 % within 12 months), so 'stop' means losing a door, not only a product — which is why 'renegotiate the merchant fee or slow it' is a better recommendation than 'stop'. SME grew +40 % in count and +43 % in amount, so it is not just bigger tickets — but its matured default rate (16 of 178, 9.0 %) is far above the crude 3.7 %; growth should wait for the 2024 vintage. Always count and amount."}
```

**P11.** *(rehearsing — the questions)* Nilufar: *"Your PD is crude. Why should I believe your margins?"* · *"Is the app really riskier, or is that noise?"* · *"Why is that region's PAR30 so high?"*

```task
{"id": "w08d4-p7", "kind": "free", "min": 40, "rubric": ["agrees first, then shows how the crude PD moves the answer (SME 60.3 → 19.4 per 1 000 at matured PD)", "answers 'app riskier?' with a test: FPD 1.70 % vs 1.04 %, p = 0.032, and the vintage curves", "adds that the app's FPD has fallen year by year (2.16 → 1.76 → 1.27 %)", "does not guess a cause for the region: offers the cut by product, branch and officer"], "model": "Agree first: \"It is crude, and here is how it moves the answer\" — at the matured PD, SME's margin falls from 60.3 to 19.4 per 1 000 lent, which is exactly why I recommend holding SME flat. App vs branch FPD: 1.70 % vs 1.04 %, z = 2.15, p = 0.032 (week 6), and the app's vintage curve sits above branch at every MOB (pooled 2025-01…2026-03, ever 30+ at MOB 6: app 9.21 %, branch 7.23 %, partner 4.99 %) — but the app's FPD has fallen year by year (loans of 2024 / 2025 / 2026: 2.16 / 1.76 / 1.27 %). For the region: the split by product, branch and officer is in the appendix — or \"I will check by officer and send it today.\" Never guess a cause in front of risk."}
```

**P12.** *(rehearsing — the questions)* Sevara: *"My team makes six hundred contacts a month. Are you saying they call the wrong people?"*

```task
{"id": "w08d4-p8", "kind": "free", "min": 40, "rubric": ["does not say 'wrong'; says what the data show", "gives the numbers: 94.6 % of 2026 actions to loans now 90+ (77.9 % to written-off), 13 of 124 early-late loans contacted in September", "raises the caveat first: today's bucket, not the bucket at the time of the action", "puts a value on early contact (about 23 m soum per loan kept out of default)", "proposes payments, not recorded outcomes, as the KPI"], "model": "Not 'wrong' — here is what the data show, and what they do not. In January–September 2026, of 5 122 actions, 94.6 % went to loans that are now 90+ (77.9 % to written-off loans — recoveries are a legitimate job), while in September only 13 of 124 loans in 1–30 DPD had any contact. The caveat, which I raise before you do: this uses each loan's bucket today, not at the time of the action — a loan contacted at 20 DPD may be 120 DPD now; with the DPD at the action date the picture may change, and I would like to build that with your team. The value: a 1–30 loan averages 38.1 m outstanding, so each one kept out of default saves about 60 % × 38.1 m ≈ 22.9 m soum. And an outcome recorded as 'paid' was followed by a payment within 7 days only about 6 % of the time — recorded outcomes cannot be the KPI; payments can."}
```

**P13.** *(rehearsing — the questions)* Kamola: *"So what do I fix first in the app?"* · *"Can I grow Micro?"*

```task
{"id": "w08d4-p9", "kind": "free", "min": 40, "rubric": ["names the two leaks: the form (552 sessions, 13.8 %) and payout after signing (222, 7.6 % of signed)", "picks the payout bug first as cheap and bad for trust", "says device and version do not matter", "answers Micro with the condition: an FPD30 guardrail of about 2.5 % vs 1.7 % today, and a hold-out"], "model": "The funnel has no single cliff; the largest user-side loss is the form (start → submit, 552 sessions, 13.8 %), the second is the payout after signing (222 signed contracts never disbursed, 7.6 % of signed) — the second is an operations bug, cheap to investigate and bad for trust, so fix it first. Device and version do not matter. Micro: thin per soum (6.8 per 1 000), but a new customer pays back the acquisition on the first loan and repeat borrowing is rising (6-month repeat 22.3 % for 2024Q1 → 38.3 % for 2026Q1); the condition is risk — Micro stops paying on new customers at FPD30 ≈ 2.5 % vs 1.7 % today, so grow it with an FPD guardrail of 2.5 % and a hold-out."}
```

**P14.** *(rehearsing — the questions)* The CEO: *"If you could do one thing, what would it be?"* — one answer, the one with the largest value and the clearest owner, in one sentence.

```task
{"id": "w08d4-p10", "kind": "free", "min": 15, "rubric": ["exactly one action", "an owner", "a value or what it protects", "said in one sentence"], "model": "\"Contact every loan in its first month of delinquency within a week — Sevara's team can start Monday, and each loan we keep out of default is worth about 23 m soum.\" (Another defensible one: \"Hold SME flat until its 2024 vintage shows its real default rate — Nilufar owns it, and it protects about two thirds of this year's contribution.\")"}
```

**Say it like in an interview.** *"Tell me about a time someone disagreed with your analysis."* Use one of today's five — what they said, what you did, what happened.

```task
{"id": "w08d4-ci", "kind": "free", "min": 40, "rubric": ["a concrete disagreement with a number in it", "agreed with what was true before defending", "restated the definition and gave the figure that shows the dependence", "offered or ran a check that settled it", "says what changed afterwards (the analysis or the decision)"], "model": "In my capstone the head of risk challenged my product margins because my default rate was crude — the share of loans now 90+ days late, which understates young, long loans. I agreed: she was right about the method. I then showed how much it mattered: on matured loans only, SME's default rate is about 9 % instead of 3.7 %, and its margin per 1 000 soum lent falls from 60 to 19. That turned the disagreement into a recommendation we both supported — hold SME growth flat until the 2024 vintage shows its real default rate — and I added the matured-PD line to the unit-economics table as a standard sensitivity."}
```

---

## 9. One possible storyline

Built from the course's numbers; **yours may differ** — a different deep-dive, a different emphasis, different words. Use it to check that your deck has the same *shape*: an answer, findings that each carry one number, recommendations with owners. Open it only after your own ten titles are written.

<details><summary>A model storyline: ten titles and the evidence each needs</summary>

| # | Title | Evidence (from the notebook) |
|---|---|---|
| 1 | *2026 portfolio review — where to grow, where to slow, what to change* (as of 1 October 2026) | — |
| 2 | **Grow branch lending and repeat app loans, slow BNPL and the riskiest region until explained, and move collections to the early bucket** | three bullets: the money, the risk, the process |
| 3 | Disbursements grew 46 % in January–September; the book stands at 208.7 bn with PAR30 at 3.1 % and NPL at 2.6 % | Jan–Sep 161.5 bn vs 110.9 bn disbursed (count +40 %); PAR30 3.12 %, NPL90 2.55 %, FPD30 1.28 % |
| 4 | Per 1 000 soum lent, Auto (73) and SME (60) earn most, Consumer 32, Micro 7 — BNPL loses 108 | Day 2 table with the assumptions in the footnote (CoF 18 %, LGD 60 %, costs by channel); SME ≈ 64 % of the 2026 contribution |
| 5 | SME's margin rests on a default rate we have not yet seen: at its matured PD of 9 % it earns 19, not 60 | matured SME loans 16 / 178 in 90+; sensitivity table; CoF sensitivity (Auto 73 → 3 at 22 %) |
| 6 | The fastest-growing region carries the highest risk: Nukus +90 % with PAR30 6.8 % — while Namangan grew +83 % at 1.7 % | region table (scatter): growth Jan–Sep vs PAR30; Bukhara +76 % at 4.8 %; Termez −9 % at 0.7 % |
| 7 | The app's loans start worse than the branches' — ever-30+ by MOB 6: 9.2 % vs 7.2 % — but its FPD has fallen every year | vintage curves by channel (2025-01…2026-03 pooled); FPD30 by disbursement year 2.16 → 1.76 → 1.27 %; app vs branch p = 0.032 |
| 8 | The app loses people evenly at every step, and 222 signed contracts never paid out | funnel 5 006 → 2 669 (53 %); form 13.8 % lost; signed-not-disbursed 7.6 %; repeat borrowing at 6 months 22 % → 38 % |
| 9 | 95 % of this year's collection actions went to loans that are now 90+; only 13 of 124 early-late loans were contacted in September | actions 2026 by current bucket (caveat: bucket now, not at the action); coverage by bucket; roll 1–30 → 31–60 19.5 %; ≈ 22.9 m saved per early loan kept out of default |
| 10 | Five changes, owners and what they are worth | **(1)** Collections: contact every 1–30 loan within the first week (Sevara; each prevented default ≈ 23 m). **(2)** BNPL: renegotiate merchant fees towards the ~11 % break-even or slow it (Bekzod + Finance; −0.27 bn a year today). **(3)** SME: hold growth flat until the 2024 vintage is read; price for a 9 % PD (Nilufar). **(4)** App: fix payout after signing and simplify the form; grow repeat Micro with an FPD30 guardrail of 2.5 % (Kamola). **(5)** Investigate Nukus (and Bukhara) by product and officer before the next quarter's targets (Nilufar + branch network). Risks: the cost figures and the funding rate are assumptions; PD is crude for young products. |

Appendix: definitions; data problems and their handling; the sanity table; the full unit-economics table; collections by action type.

</details>

---

## 10. Self-check

```check
{"id": "w08d4-sc", "questions": [
  {"type": "single", "q": "You read your ten titles aloud and the chairman could not decide from them. What is the most likely fault?", "options": ["Too few slides", "Some titles are topics, not sentences with a number and a 'so what'", "The fonts", "The appendix is too short"], "answer": 1, "explain": "The ghost-deck test: the titles alone must read like a memo (→ section 3)."},
  {"type": "single", "q": "Nilufar says your PD is crude. Best first move?", "options": ["Defend the crude PD", "Agree, then show how much the answer depends on it — SME 60 → 19 per 1 000 at the matured PD", "Change the subject to growth", "Promise a new model next quarter"], "answer": 1, "explain": "Agree, quantify, and let the recommendation survive its assumption (→ section 8)."},
  {"type": "multi", "q": "What must every recommendation on slide 9 carry?", "options": ["An owner", "A date", "What it is worth or protects", "A chart", "The SQL behind it"], "answer": [0, 1, 2], "explain": "What, who, by when, worth — the evidence lives on the finding slides and in the appendix (→ sections 2, 6)."}
]}
```

Tomorrow: you present, and then the mentor interviews you — 60 minutes, live SQL included.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w08d4", "pass": 0.8, "questions": [
  {"type": "single", "q": "What is the governing thought?", "options": ["The title of the deck", "The first finding in the notebook", "A list of the five questions", "One sentence that answers the chairman's question: grow X and Y, slow Z until …, change A and B — worth about N"], "answer": 3, "explain": "If you cannot write it, go back to the issue tree, not to PowerPoint (→ section 2)."},
  {"type": "multi", "q": "Read as a ghost deck, which titles must be rewritten?", "code": "1. Context\n2. Growth by region\n3. The fastest-growing region also carries the highest PAR30\n4. Unit economics", "options": ["1", "2", "3", "4"], "answer": [0, 1, 3], "explain": "Titles 1, 2 and 4 are topics; only 3 is a sentence with a comparison and a 'so what' (→ section 3)."},
  {"type": "single", "q": "You want to show growth vs PAR30 for each region. Which chart?", "options": ["A pie per region", "A dual-axis line chart", "A gauge", "A scatter with labelled points (or two aligned bar columns)"], "answer": 3, "explain": "Two measures per category: scatter or aligned bars; dual axes invent crossings (→ section 4)."},
  {"type": "single", "q": "How do you draw vintage curves?", "options": ["One bar per cohort", "Lines that continue to the last month for every cohort", "Lines by cohort vs MOB that stop where the months are not yet observable (or a heat-mapped table with blanks)", "A pie per cohort"], "answer": 2, "explain": "Unobservable months are blank, never 0 or a continued line (→ section 4, Day 3 correctness traps)."},
  {"type": "single", "q": "fct_first_instalment has one row per loan in FPD scope. With a product slicer on MICRO, what does this card show?", "code": "FPD30 % = DIVIDE ( SUM ( fct_first_instalment[fpd30] ), COUNTROWS ( fct_first_instalment ) )", "options": ["MICRO's FPD30 among its loans in scope", "FPD30 of all MICRO loans, immature ones included", "MICRO's share of all FPDs", "Blank — slicers cannot reach this table"], "answer": 0, "explain": "SUM of the 0/1 flag ÷ rows is the rate in the filter context; the table already applies the maturity rule (→ section 5, Day 3 sanity numbers)."},
  {"type": "single", "q": "Nilufar: 'Your PD is crude. Why should I believe your margins?' What is the best answer?", "options": ["Agree first, then show how it moves the answer — the matured-PD sensitivity", "Change the subject to growth", "Defend the crude PD", "Say risk models are her job"], "answer": 0, "explain": "Agree, then quantify: a recommendation must survive its assumptions (→ section 8)."},
  {"type": "single", "q": "Sevara's team contacts mostly loans that are 90+ now. Which caveat do you raise before she does?", "options": ["The bucket is today's, not the bucket at the time of the action — a loan called at 20 DPD may be 120 DPD now", "September is a short month", "SMS are cheaper than calls", "The data are synthetic"], "answer": 0, "explain": "Say what the data show and what you do not know; prepare the version with DPD at the action date if you can (→ section 8)."},
  {"type": "single", "q": "A board member asks for a cut you do not have. What do you say?", "options": ["Say it does not matter", "Change the subject", "'I don't have that cut here; I will check and send it today' — and write it down", "Guess the likely cause"], "answer": 2, "explain": "Never guess a cause in front of risk; a number or 'I will check' (→ section 8, Day 5 'The ten minutes')."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w08d4", "sql": true, "q": "For slide 3 Bekzod wants a bridge (waterfall) from the book at the end of December 2025 (143.60 bn: principal due from 1 Jan 2026 on loans disbursed before it) to the end of September 2026 (208.24 bn): + principal disbursed Jan–Sep 2026, − scheduled run-off. Compute the run-off bar directly: principal_due of instalments falling due from 1 January to 30 September 2026, on loans disbursed before 1 October 2026. Give it in billions of soum to 2 decimals.", "type": "number", "dp": 2, "h": ["02ee52743d196d257e4bd575"], "hint": "Compute the bar from the instalments, then check that start + disbursed − run-off lands on the end bar; a tiny gap has a known cause from week 5.", "sol": "Y29uID0gc3FsaXRlMy5jb25uZWN0KCIuLi8uLi9yYXcvbnVyLmRiIikKTCA9IHBkLnJlYWRfc3FsKCJTRUxFQ1QgbG9hbl9pZCwgZGlzYnVyc2VkX2F0LCBwcmluY2lwYWwgRlJPTSBsb2FucyIsIGNvbiwgcGFyc2VfZGF0ZXM9WyJkaXNidXJzZWRfYXQiXSkKSSA9IHBkLnJlYWRfc3FsKCJTRUxFQ1QgbG9hbl9pZCwgZHVlX2RhdGUsIHByaW5jaXBhbF9kdWUgRlJPTSBpbnN0YWxsbWVudHMiLCBjb24sIHBhcnNlX2RhdGVzPVsiZHVlX2RhdGUiXSkubWVyZ2UoTCwgb249ImxvYW5faWQiKQpzdGFydCA9IElbKEkuZGlzYnVyc2VkX2F0IDwgIjIwMjYtMDEtMDEiKSAmIChJLmR1ZV9kYXRlID49ICIyMDI2LTAxLTAxIildLnByaW5jaXBhbF9kdWUuc3VtKCkgICAgICMgMTQzIDYwNCA2MjYgNjc3CmVuZCAgID0gSVsoSS5kaXNidXJzZWRfYXQgPCAiMjAyNi0xMC0wMSIpICYgKEkuZHVlX2RhdGUgPj0gIjIwMjYtMTAtMDEiKV0ucHJpbmNpcGFsX2R1ZS5zdW0oKSAgICAgIyAyMDggMjQzIDg3OSA2MjMKZGlzYiAgPSBMWyhMLmRpc2J1cnNlZF9hdCA+PSAiMjAyNi0wMS0wMSIpICYgKEwuZGlzYnVyc2VkX2F0IDwgIjIwMjYtMTAtMDEiKV0ucHJpbmNpcGFsLnN1bSgpICAgICAjIDE2MSA0ODAgMzAwIDAwMApydW4gICA9IElbKEkuZGlzYnVyc2VkX2F0IDwgIjIwMjYtMTAtMDEiKSAmIChJLmR1ZV9kYXRlID49ICIyMDI2LTAxLTAxIikgJiAoSS5kdWVfZGF0ZSA8ICIyMDI2LTEwLTAxIildLnByaW5jaXBhbF9kdWUuc3VtKCkKcnVuIC8gMWU5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyA5Ni44NAoKVGhlIGJyaWRnZTogMTQzLjYwICsgMTYxLjQ4IOKIkiA5Ni44NCA9IDIwOC4yNCBibi4gNjAgJSBvZiB3aGF0IHdhcyBsZW50IGluIG5pbmUgbW9udGhzIG9ubHkgcmVwbGFjZWQgcHJpbmNpcGFsIHRoYXQgZmVsbCBkdWUg4oCUIHRoZSBib29rIGdyZXcgYnkgNjQuNiBibiwgbm90IGJ5IDE2MS41LgpTdGFydCArIGRpc2J1cnNlZCDiiJIgcnVuLW9mZiBvdmVyc2hvb3RzIHRoZSBlbmQgYmFyIGJ5IDQ4MiA4NTUgc291bTogdGhlIHplcm8tcmF0ZSBCTlBMIHNjaGVkdWxlcyByb3VuZCBlYWNoIGluc3RhbG1lbnQgdXAgdG8gMTAwIHNvdW0sIHNvIHRoZWlyIHByaW5jaXBhbF9kdWUgYWRkcyB1cCB0byBzbGlnaHRseSBtb3JlIHRoYW4gdGhlIHByaW5jaXBhbCAod2VlayA1LCBEYXkgNCBQNSkg4oCUIGEgZm9vdG5vdGUsIG5vdCBhbiBlcnJvciBpbiB0aGUgYnJpZGdlLgpBIHdhdGVyZmFsbCBpcyB0aGUgcmlnaHQgY2hhcnQgYmVjYXVzZSB0aGUgYm9hcmQncyBxdWVzdGlvbiBpcyAnd2hhdCBleHBsYWlucyB0aGUgY2hhbmdlJywgYW5kIHRocmVlIGJhcnMgYW5zd2VyIGl0IGluIG9uZSBsb29rLg=="}
```

<!-- challenge:end -->
