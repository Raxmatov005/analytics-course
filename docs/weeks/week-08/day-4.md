# Week 8 · Day 4 — Capstone II: dashboard and story

<span class="badge">Storyline 60 min</span> <span class="badge">Dashboard 75 min</span> <span class="badge">Deck 45 min</span> <span class="badge">Review + rehearsal 40 min</span> <span class="badge hw">Capstone (due Day 5)</span>

> STORY **Thursday, 9:00.** Your notebook has forty tables. Madina scrolls through it in silence, then turns the laptop back to you. *"Good work, and the board will see none of it. The chairman reads the first slide and maybe the last. Bekzod will look for his product, Nilufar for the number she can attack, Sevara for whether you understand her team, Kamola for the app. **Write me ten sentences — just the slide titles — before you open PowerPoint.** If the ten sentences read like a memo, you have a deck. If they read like a table of contents, you have a notebook."*

## Today in 3 lines

- You turn the analysis into a **storyline**: the answer first (the pyramid), **slide titles written before any slide**, the evidence each title needs, and the right chart for each message.
- You build the **two dashboard pages** the board can click, and you review deck and dashboard against a **checklist** as if they were somebody else's.
- You **rehearse the ten minutes** and prepare for the questions each board member — Bekzod, Nilufar, Sevara, Kamola — is going to ask.

---

## 1. From analysis to the pyramid (20 min)

Four steps, on paper:

1. **Sort the findings by the board's three questions.** Every finding from yesterday goes under *grow*, *stop/slow* or *change* — or into the appendix. A finding that answers none of them is interesting, not useful.
2. **Write the governing thought**: one sentence that answers the chairman's question. *"Grow X and Y, slow Z until …, and change A and B — worth about N."* If you cannot write it, you do not have an answer yet: go back to the tree, not to PowerPoint.
3. **Three to five key lines** under it — the reasons. Each must be a sentence with a number and a comparison.
4. **Evidence under each key line**: the one chart and the one table that prove it, with the definition.

The test of a pyramid: read only the top and the key lines. Does the chairman know what to decide? Read only one branch. Does Nilufar find her number and its definition?

## 2. Slide titles first (20 min)

A **ghost deck** (*черновик из заголовков*): ten empty slides with only the titles, in order. Read them aloud in one go — about a minute. That minute is your presentation's skeleton; the rest of the ten minutes is evidence.

Good title rules (Day 2): a full sentence, a number, a comparison, the "so what". Weak → strong:

| Topic title (weak) | So-what title (strong) |
|---|---|
| "Growth by region" | "The fastest-growing region also carries the highest PAR30" |
| "Collections activity" | "Collections effort goes to loans already lost; the early bucket is barely called" |
| "Unit economics" | "Per 1 000 soum lent, Auto and SME earn ten times Micro; BNPL loses money" |

For each title, write under it: *the evidence* (which table/chart from the notebook), *the definition* (footnote), *the owner* of the action.

## 3. Choosing the chart (20 min)

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

## 4. The dashboard — two pages (75 min)

Power BI on week 7's model (`data/powerbi/`), or Excel on week 4's pivots. Slicers on both pages: **product, channel, region, disbursement period**.

**Page 1 — Growth & mix.** Top row, four cards: outstanding; disbursed Jan–Sep 2026; growth vs Jan–Sep 2025; average ticket. Middle: disbursed by month (line, 2025 vs 2026); disbursed by product (sorted bars) with growth %. Bottom: region table (disbursed 2026, growth %, PAR30) with conditional formatting; a small mix chart (share of SME / AUTO / CONS / MICRO / BNPL).
**Page 2 — Risk & collections.** Cards: PAR30, NPL90, FPD30 (mature loans), collection rate (last month). Middle: vintage curves by channel (ever 30+ by MOB, MOB 1–6); FPD30 by grade and channel (matrix). Bottom: buckets with balance and **share contacted in the last 30 days**; actions by bucket.

Every card shows its definition in a tooltip or a text box; numbers on the dashboard equal the notebook's (check five of them — the sanity table is your test). Export a PDF of both pages.

## 5. Review your own work — the checklist (20 min)

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

## 6. Rehearse the ten minutes (20 min)

| Minute | What | Slides |
|---|---|---|
| 0:00–1:00 | the question and **the answer** (governing thought + three bullets) | 1–2 |
| 1:00–2:00 | context: size, growth, quality in four numbers | 3 |
| 2:00–7:30 | the findings, about one minute each — title first, then the one number on the chart that proves it | 4–8 |
| 7:30–9:00 | recommendations: what, who, by when, worth | 9 |
| 9:00–10:00 | risks and assumptions; what you would do next; "questions?" | 10 |

Rehearse twice with a timer, standing, out loud; record the second one (that may be your Friday submission). Cut words, not slides. Say each title as the first sentence of each slide. When you point at a chart, say the number, not "as you can see".

## 7. The questions each board member will ask

Prepare one sentence and one number for each. Then open the fold for how to handle it.

**Bekzod (portfolio):** *"If we slow BNPL, how much volume do we lose — and what happens to the customers?"* · *"Is SME growth sustainable, or are we just lending bigger?"*

<details><summary>How to prepare</summary>

BNPL is **1.5 %** of Jan–Sep 2026 disbursement (2.43 of 161.48 bn), 595 loans in 2026; its 2026 contribution is about −0.27 bn under the Day 2 assumptions. Customers whose first loan was BNPL come back as often as anyone (43.5 % within 12 months, Day 1 P11), so "stop" means losing a door, not only a product — which is why "renegotiate the merchant fee or slow" is a better recommendation than "stop". SME: count +40 % and amount +43 % (Jan–Sep), so not just bigger tickets — but its matured default rate (16 of 178, 9.0 %) is far above the crude 3.7 %; growth should wait for the 2024 vintage. Always give count *and* amount.
</details>

**Nilufar (risk):** *"Your PD is crude. Why should I believe your margins?"* · *"Is the app really riskier, or is that noise?"* · *"Why is that region's PAR30 so high?"*

<details><summary>How to prepare</summary>

Agree first: *"It is crude, and here is how it moves the answer"* — the matured-PD sensitivity (SME 60.3 → 19.3 per 1 000) is exactly the slide for her. App vs branch FPD: 1.70 % vs 1.04 %, z = 2.15, p = 0.032 (week 6) — and the app's vintage curve sits above branch at every MOB (pooled 2025-01…2026-03, ever 30+ at MOB 6: app 9.21 %, branch 7.23 %, partner 4.99 %); but the app's FPD has fallen year by year (loans disbursed in 2024 / 2025 / 2026: 2.16 / 1.76 / 1.27 %). For the region: have the split by product, branch and officer ready in the appendix, or say *"I will check by officer and send it today."* Never guess a cause in front of risk.
</details>

**Sevara (collections):** *"My team makes six hundred contacts a month. Are you saying they call the wrong people?"*

<details><summary>How to prepare</summary>

Do not say "wrong". Say what the data show and what you do not know: in Jan–Sep 2026, of 5 122 actions, **94.6 %** went to loans that are **now** 90+ (77.9 % to written-off loans — recoveries are a legitimate job), while in September only **14 of 124** loans in 1–30 DPD had any contact. The caveat she will raise and you must raise first: this uses each loan's bucket **today**, not at the time of the action — a loan contacted at 20 DPD may be 120 DPD now. Prepare the version with DPD at the action date if you can; otherwise say so. Value: a 1–30 loan averages 38.1 m outstanding, so each one that does not roll to default saves about 60 % × 38.1 m ≈ 22.9 m soum. And one process point: an outcome recorded as "paid" was followed by a payment within 7 days only about 6 % of the time — recorded outcomes cannot be her KPI; payments can.
</details>

**Kamola (product):** *"So what do I fix first in the app?"* · *"Can I grow Micro?"*

<details><summary>How to prepare</summary>

The funnel has no single cliff; the largest user-side loss is the **form** (start → submit, 552 sessions, 13.8 %), the second is the **payout after signing** (222 signed contracts never disbursed, 7.6 % of signed) — the second is an operations bug, cheap to investigate and bad for trust. Device and version do not matter. Micro: thin per soum (6.8 per 1 000) but a new customer pays back the acquisition on the first loan and repeat borrowing is rising (6-month repeat 22.3 % for 2024Q1 → 38.3 % for 2026Q1); the condition is risk — Micro stops paying on new customers at FPD30 ≈ 2.5 % vs 1.7 % today, so grow it **with an FPD guardrail of 2.5 %** and a hold-out.
</details>

**The CEO:** *"If you could do one thing, what would it be?"* — have one answer, the one with the largest value and the clearest owner, and say it in one sentence.

---

## 8. One possible storyline

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
| 9 | 95 % of this year's collection actions went to loans that are now 90+; only 14 of 124 early-late loans were contacted in September | actions 2026 by current bucket (caveat: bucket now, not at the action); coverage by bucket; roll 1–30 → 31–60 19.5 %; ≈ 22.9 m saved per early loan kept out of default |
| 10 | Five changes, owners and what they are worth | **(1)** Collections: contact every 1–30 loan within the first week (Sevara; each prevented default ≈ 23 m). **(2)** BNPL: renegotiate merchant fees towards the ~11 % break-even or slow it (Bekzod + Finance; −0.27 bn a year today). **(3)** SME: hold growth flat until the 2024 vintage is read; price for a 9 % PD (Nilufar). **(4)** App: fix payout after signing and simplify the form; grow repeat Micro with an FPD30 guardrail of 2.5 % (Kamola). **(5)** Investigate Nukus (and Bukhara) by product and officer before the next quarter's targets (Nilufar + branch network). Risks: the cost figures and the funding rate are assumptions; PD is crude for young products. |

Appendix: definitions; data problems and their handling; the sanity table; the full unit-economics table; collections by action type.
</details>

---

## 9. Self-check

1. Read your ten titles aloud. Could the chairman decide from them alone? If not, which one is a topic instead of a sentence? *(→ section 2)*
2. Which number on your deck would Nilufar attack first, and what is your answer? *(→ section 7)*
3. Pick one recommendation: who owns it, by when, and what is it worth? *(→ sections 1, 8)*

Tomorrow: you present, and then the mentor interviews you — 60 minutes, live SQL included.

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w08d4", "pass": 0.8, "questions": [
  {"type": "single", "q": "What is the governing thought?", "options": ["The title of the deck", "The first finding in the notebook", "A list of the five questions", "One sentence that answers the chairman's question: grow X and Y, slow Z until …, change A and B — worth about N"], "answer": 3, "explain": "If you cannot write it, go back to the issue tree, not to PowerPoint (→ section 1)."},
  {"type": "multi", "q": "Read as a ghost deck, which titles must be rewritten?", "code": "1. Context\n2. Growth by region\n3. The fastest-growing region also carries the highest PAR30\n4. Unit economics", "options": ["1", "2", "3", "4"], "answer": [0, 1, 3], "explain": "Titles 1, 2 and 4 are topics; only 3 is a sentence with a comparison and a 'so what' (→ section 2)."},
  {"type": "single", "q": "You want to show growth vs PAR30 for each region. Which chart?", "options": ["A pie per region", "A dual-axis line chart", "A gauge", "A scatter with labelled points (or two aligned bar columns)"], "answer": 3, "explain": "Two measures per category: scatter or aligned bars; dual axes invent crossings (→ section 3)."},
  {"type": "single", "q": "How do you draw vintage curves?", "options": ["One bar per cohort", "Lines that continue to the last month for every cohort", "Lines by cohort vs MOB that stop where the months are not yet observable (or a heat-mapped table with blanks)", "A pie per cohort"], "answer": 2, "explain": "Unobservable months are blank, never 0 or a continued line (→ section 3, Day 3 correctness traps)."},
  {"type": "single", "q": "fct_first_instalment has one row per loan in FPD scope. With a product slicer on MICRO, what does this card show?", "code": "FPD30 % = DIVIDE ( SUM ( fct_first_instalment[fpd30] ), COUNTROWS ( fct_first_instalment ) )", "options": ["MICRO's FPD30 among its loans in scope", "FPD30 of all MICRO loans, immature ones included", "MICRO's share of all FPDs", "Blank — slicers cannot reach this table"], "answer": 0, "explain": "SUM of the 0/1 flag ÷ rows is the rate in the filter context; the table already applies the maturity rule (→ section 4, Day 3 sanity numbers)."},
  {"type": "single", "q": "Nilufar: 'Your PD is crude. Why should I believe your margins?' What is the best answer?", "options": ["Agree first, then show how it moves the answer — the matured-PD sensitivity", "Change the subject to growth", "Defend the crude PD", "Say risk models are her job"], "answer": 0, "explain": "Agree, then quantify: a recommendation must survive its assumptions (→ section 7)."},
  {"type": "single", "q": "Sevara's team contacts mostly loans that are 90+ now. Which caveat do you raise before she does?", "options": ["The bucket is today's, not the bucket at the time of the action — a loan called at 20 DPD may be 120 DPD now", "September is a short month", "SMS are cheaper than calls", "The data are synthetic"], "answer": 0, "explain": "Say what the data show and what you do not know; prepare the version with DPD at the action date if you can (→ section 7)."},
  {"type": "single", "q": "A board member asks for a cut you do not have. What do you say?", "options": ["Say it does not matter", "Change the subject", "'I don't have that cut here; I will check and send it today' — and write it down", "Guess the likely cause"], "answer": 2, "explain": "Never guess a cause in front of risk; a number or 'I will check' (→ section 7, Day 5 'The ten minutes')."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w08d4", "q": "For slide 3 Bekzod wants a bridge (waterfall) from the book at the end of December 2025 (143.60 bn: principal due from 1 Jan 2026 on loans disbursed before it) to the end of September 2026 (208.24 bn): + principal disbursed Jan–Sep 2026, − scheduled run-off. Compute the run-off bar directly: principal_due of instalments falling due from 1 January to 30 September 2026, on loans disbursed before 1 October 2026. Give it in billions of soum to 2 decimals.", "type": "number", "dp": 2, "h": ["02ee52743d196d257e4bd575"], "hint": "Compute the bar from the instalments, then check that start + disbursed − run-off lands on the end bar; a tiny gap has a known cause from week 5.", "sol": "Y29uID0gc3FsaXRlMy5jb25uZWN0KCIuLi8uLi9yYXcvbnVyLmRiIikKTCA9IHBkLnJlYWRfc3FsKCJTRUxFQ1QgbG9hbl9pZCwgZGlzYnVyc2VkX2F0LCBwcmluY2lwYWwgRlJPTSBsb2FucyIsIGNvbiwgcGFyc2VfZGF0ZXM9WyJkaXNidXJzZWRfYXQiXSkKSSA9IHBkLnJlYWRfc3FsKCJTRUxFQ1QgbG9hbl9pZCwgZHVlX2RhdGUsIHByaW5jaXBhbF9kdWUgRlJPTSBpbnN0YWxsbWVudHMiLCBjb24sIHBhcnNlX2RhdGVzPVsiZHVlX2RhdGUiXSkubWVyZ2UoTCwgb249ImxvYW5faWQiKQpzdGFydCA9IElbKEkuZGlzYnVyc2VkX2F0IDwgIjIwMjYtMDEtMDEiKSAmIChJLmR1ZV9kYXRlID49ICIyMDI2LTAxLTAxIildLnByaW5jaXBhbF9kdWUuc3VtKCkgICAgICMgMTQzIDYwNCA2MjYgNjc3CmVuZCAgID0gSVsoSS5kaXNidXJzZWRfYXQgPCAiMjAyNi0xMC0wMSIpICYgKEkuZHVlX2RhdGUgPj0gIjIwMjYtMTAtMDEiKV0ucHJpbmNpcGFsX2R1ZS5zdW0oKSAgICAgIyAyMDggMjQzIDg3OSA2MjMKZGlzYiAgPSBMWyhMLmRpc2J1cnNlZF9hdCA+PSAiMjAyNi0wMS0wMSIpICYgKEwuZGlzYnVyc2VkX2F0IDwgIjIwMjYtMTAtMDEiKV0ucHJpbmNpcGFsLnN1bSgpICAgICAjIDE2MSA0ODAgMzAwIDAwMApydW4gICA9IElbKEkuZGlzYnVyc2VkX2F0IDwgIjIwMjYtMTAtMDEiKSAmIChJLmR1ZV9kYXRlID49ICIyMDI2LTAxLTAxIikgJiAoSS5kdWVfZGF0ZSA8ICIyMDI2LTEwLTAxIildLnByaW5jaXBhbF9kdWUuc3VtKCkKcnVuIC8gMWU5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyA5Ni44NAoKVGhlIGJyaWRnZTogMTQzLjYwICsgMTYxLjQ4IOKIkiA5Ni44NCA9IDIwOC4yNCBibi4gNjAgJSBvZiB3aGF0IHdhcyBsZW50IGluIG5pbmUgbW9udGhzIG9ubHkgcmVwbGFjZWQgcHJpbmNpcGFsIHRoYXQgZmVsbCBkdWUg4oCUIHRoZSBib29rIGdyZXcgYnkgNjQuNiBibiwgbm90IGJ5IDE2MS41LgpTdGFydCArIGRpc2J1cnNlZCDiiJIgcnVuLW9mZiBvdmVyc2hvb3RzIHRoZSBlbmQgYmFyIGJ5IDQ4MiA4NTUgc291bTogdGhlIHplcm8tcmF0ZSBCTlBMIHNjaGVkdWxlcyByb3VuZCBlYWNoIGluc3RhbG1lbnQgdXAgdG8gMTAwIHNvdW0sIHNvIHRoZWlyIHByaW5jaXBhbF9kdWUgYWRkcyB1cCB0byBzbGlnaHRseSBtb3JlIHRoYW4gdGhlIHByaW5jaXBhbCAod2VlayA1LCBEYXkgNCBQNSkg4oCUIGEgZm9vdG5vdGUsIG5vdCBhbiBlcnJvciBpbiB0aGUgYnJpZGdlLgpBIHdhdGVyZmFsbCBpcyB0aGUgcmlnaHQgY2hhcnQgYmVjYXVzZSB0aGUgYm9hcmQncyBxdWVzdGlvbiBpcyAnd2hhdCBleHBsYWlucyB0aGUgY2hhbmdlJywgYW5kIHRocmVlIGJhcnMgYW5zd2VyIGl0IGluIG9uZSBsb29rLg=="}
```

<!-- challenge:end -->
