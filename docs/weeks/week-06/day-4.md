# Week 6 · Day 4 — Hypothesis tests II: non-parametric tests, multiple comparisons and power

<span class="badge">Learn 60 min</span> <span class="badge">Worked example 15 min</span> <span class="badge">Practice 50 min</span> <span class="badge">Reference card</span> <span class="badge hw">Checkpoint tomorrow</span> <span class="badge company">Company corner</span>

> STORY **Thursday, 9:00.** Jasur, laptop open, a slide from marketing on the screen: *"New SMS reminder three days before the first due date — cuts first-payment defaults!"* *"Your risk-committee note worked: Nilufar wants a fix for the app's FPD, and marketing has one. They want to send the SMS to **2 000 loans** and compare. My question is the one nobody in marketing asks: **is 2 000 enough?** If the SMS really takes FPD from 1.28 % to 1 %, what is the chance a test on 2 000 loans even notices? And while you are at it — Nilufar circled Bukhara as 'the worst branch'. Ten branches, ten tests. Tell me what that does to your 5 %."*

## Today in 3 lines

- When the t-test's assumptions break — skewed days late, a few huge values, tiny groups — use tests on **ranks** (**Mann–Whitney**, **Wilcoxon**, **Kruskal–Wallis**), a **permutation test** built by shuffling, and **Fisher's exact test** instead of χ² when expected counts fall below 5.
- Ten tests at α = 5 % give a **30–40 %** chance of at least one false alarm: **Bonferroni** and **Holm** fix the family-wise error — Bukhara's p = 0.020 becomes 0.199.
- **Power** decides whether a test can answer before you run it: detecting FPD 1.28 % → 1.00 % needs **22 481 loans per arm**; Jasur's 2 000 loans have **9 % power** (13 % even at 2 000 per arm) — and you leave with a one-page **test-choice card** for tomorrow's checkpoint.

---

## 1. Learn — when the textbook test does not fit

Eight short stories. Each one tells **one idea in small steps**: read a sentence, watch the picture change, press **Next**. A dotted word shows its meaning when you tap it. Tired of reading? Press **▶ Play as a video**: the page reads every step aloud and moves the picture for you.

The Python for each idea, and the extra topics, are in **Going further — the full version** near the end of the page (optional).

### One late payment and the average — when to use ranks

```story
{"id": "w06d4-s1", "title": "One payment, 30 days late", "min": 5, "steps": [{"say": "Ten payments, one dot each, placed by **days late** (below zero = paid early): {b|5 Auto payments} and {y|5 SME payments}. Most land near the due date. {o|One SME payment} came 30 days late.", "show": {"kind": "ranks", "a": [-3, -1, 2, 4, 30], "b": [-2, 0, 1, 3, 5], "col": ["y", "b"], "lo": -5, "hi": 35, "tick": 5, "hot": ["a", 4], "words": {"a": "SME", "b": "Auto", "axis": "days late"}}}, {"say": "The averages are the triangles under the line: {y|SME 6.4 days}, {b|Auto 1.4}. SME looks 5 days later than Auto.", "show": {"mark": ["mean"]}, "f": "SME average = (−3 − 1 + 2 + 4 + 30) ÷ 5 = {y|6.4}", "fs": "The SME average: the five payments add up to 32; divided by 5, that is 6.4."}, {"say": "Cover the 30-day payment with your finger: the other four SME payments average just 0.5 days. One payment makes the whole gap.", "f": "without it: (−3 − 1 + 2 + 4) ÷ 4 = {y|0.5}"}, {"say": "Tap **+30 days** to make that payment even later. The {y|SME average} runs after it; Auto's stays put. The [[t-test|a test that compares two averages, trusting each to behave like a bell]] compares exactly these averages — so one payment decides it.", "show": {"hi": 125, "tick": 25}, "act": [{"label": "+30 days", "rep": 2, "do": "nudge", "g": "a", "i": 4, "by": 30}]}, {"say": "Your turn.", "ask": {"q": "Why is the t-test weak on these ten payments?", "options": ["Days late can be negative", "One extreme payment drags SME's average, and 5 values are far too few for the bell (the CLT) to help", "Ten payments are too few for any test"], "answer": 1, "why": "With 5 values the average is mostly that one payment. The CLT needs many values before an average behaves like a bell."}}, {"say": "Another way to look: line all ten payments up, smallest to largest, and number them 1 to 10. That number is the [[rank|a value's place after sorting both groups together]]. The late payment is simply **rank 10**.", "show": {"mark": ["row", "rank"]}}, {"say": "Tap **+30 days** again. The dot flies right, but in the row nothing moves: it is still rank 10. Ranks ignore **how far** — only the order counts.", "act": [{"label": "+30 days", "rep": 1, "do": "nudge", "g": "a", "i": 4, "by": 30}]}, {"say": "Add up each group's ranks: {y|SME 28}, {b|Auto 27}. By ranks the two groups are alike. Tests that work on ranks are called [[non-parametric|they need no bell shape; most of them replace the values by ranks]].", "show": {"mark": ["row", "rank", "sum"]}, "f": "rank sums: SME 1 + 3 + 6 + 8 + 10 = {y|28} · Auto 2 + 4 + 5 + 7 + 9 = {b|27}"}, {"say": "Ranks also rescue data that only have an **order**: risk grade A < B < C < D, a 1–5 score. “B minus A” has no size, so an average grade means nothing — but the order is real.", "ask": {"q": "Which comparison should **not** use a t-test?", "options": ["Average loan amount, 3 000 app loans vs 3 000 branch loans", "Call rating (bad / OK / good / excellent), 40 calls vs 40 calls", "Average credit score, 2 000 applicants per channel"], "answer": 1, "why": "A rating is an ordered label: compare ranks. The other two are averages of real numbers over thousands of values — Welch copes."}}, {"say": "With thousands of values the CLT does rescue the average: 4 688 Auto and 8 222 SME payments are plenty for Welch. Then the **question** decides: the average, or the typical payment? Never run both and report the smaller p.", "f": "small n with skew or outliers, or ordered labels → ranks · thousands of values + a question about the average → Welch"}]}
```

### Who wins more pairs — the Mann–Whitney test

```story
{"id": "w06d4-s2", "title": "Who wins more pairs?", "min": 6, "steps": [{"say": "Two small groups: {b|A = 2, 5, 9} and {y|B = 1, 3, 4, 7}. Does A tend to have the bigger values?", "show": {"kind": "ranks", "a": [2, 5, 9], "b": [1, 3, 4, 7], "lo": 0, "hi": 10, "tick": 1, "stat": "u", "words": {"a": "A", "b": "B", "axis": "value"}}}, {"say": "Play a tournament: every A against every B, 3 × 4 = **12 pairs**. Lined up in the row, a value beats everything to its left.", "show": {"mark": ["row"]}}, {"say": "Over each {b|A}: how many {y|B} values it beats. 2 beats 1 → {b|+1}; 5 beats 1, 3 and 4 → {b|+3}; 9 beats all four → {b|+4}. A wins **8** pairs in all. We call this count **U**.", "show": {"mark": ["row", "wins"]}, "f": "U = 1 + 3 + 4 = {b|8} of 12 pairs", "fs": "U is 1 plus 3 plus 4: 8 of 12 pairs."}, {"say": "So a random A beats a random B {y|67 %} of the time. The [[Mann–Whitney test|compares two groups by how often a random value of one beats a random value of the other]] asks: could that share really be ½ — the groups alike?", "f": "U ÷ (n₁ × n₂) = 8 ÷ 12 = {y|0.67}"}, {"say": "Your turn.", "ask": {"q": "A = 4, 6 and B = 1, 2, 8. What is U for A?", "options": ["2", "4", "5", "6"], "answer": 1, "why": "4 beats 1 and 2, 6 beats 1 and 2: U = 4 of the 2 × 3 = 6 pairs. Nobody beats 8."}}, {"say": "With thousands of values nobody counts pairs. Rank everything together instead: A holds ranks 2, 5 and 7. Their sum minus a fixed amount gives the same {b|8}.", "show": {"mark": ["row", "rank", "sum"]}, "f": "U = A's rank sum − n₁(n₁ + 1) ÷ 2 = (2 + 5 + 7) − 3 × 4 ÷ 2 = 14 − 6 = {b|8}", "fs": "U is A's rank sum, 14, minus 6: 8."}, {"say": "Now the real payments, Auto vs SME: U ÷ (n₁ × n₂) = {y|0.495}. A random Auto payment is later than a random SME one 49.5 % of the time — a coin toss. p = 0.32.", "f": "Auto vs SME: U ÷ (4 688 × 8 222) = {y|0.495} → p = 0.32"}, {"say": "Welch's t-test on the same payments says p = 0.0195: the **averages** differ, because SME has a slightly heavier tail of very late payments. Both are right — they answer different questions.", "f": "Welch: the averages differ, p = 0.0195 · Mann–Whitney: the typical payment does not, p = 0.32"}, {"say": "Which one would you trust?", "ask": {"q": "Same data: Welch p = 0.02, Mann–Whitney p = 0.32. Which test is wrong?", "options": ["Welch — the data are skewed", "Mann–Whitney — it ignores the tail", "Neither: Welch asks about the average, Mann–Whitney about the typical payment"], "answer": 2, "why": "Pick the business question first, then the test — never run both and quote the smaller p."}}, {"say": "Careful: Mann–Whitney is **not** a test of medians. Auto and SME have the same median (−1 day) and can still differ. Say it as: “a random X tends to be larger (or not) than a random Y”."}, {"say": "Three groups or more? Rank everything together and compare the groups' average ranks: the [[Kruskal–Wallis test|Mann–Whitney for three or more groups: are the average ranks further apart than luck allows?]]. Which product differs? Pairwise Mann–Whitney tests, with a correction (story 6).", "f": "Kruskal–Wallis, five products: p = 1.8 × 10⁻¹² → at least one differs"}]}
```

### The same branches twice — the Wilcoxon test

```story
{"id": "w06d4-s3", "title": "The same ten branches, twice", "min": 5, "steps": [{"say": "Ten branches, each measured **twice**: the FPD of its 2026 loans minus its 2025 loans. {g|Green}: FPD fell. {o|Orange}: it rose — only Tashkent North, +0.99 points.", "show": {"kind": "ranks", "d": [-0.11, -0.4, -0.46, -0.49, -0.56, -0.68, 0.99, -1.21, -1.37, -1.46], "lo": -1.6, "hi": 1.2, "tick": 0.5, "dp": 2, "words": {"axis": "2026 − 2025, FPD points"}}}, {"say": "The same branches twice are [[paired|the same units measured twice: compare each one with itself]] data: only the 10 differences matter. Most are below zero. More than luck?"}, {"say": "Line the changes up by **size**, ignoring the sign: the smallest change first, the biggest last.", "show": {"mark": ["row"]}}, {"say": "Number them 1 to 10. Samarkand's −0.11 is rank 1, Namangan's −1.46 is rank 10. Tashkent North's rise, +0.99, is the 7th-biggest change: rank {o|7}.", "show": {"mark": ["row", "rank"]}}, {"say": "Add the ranks of the rises: [[W+|the sum of the ranks of the positive differences]] = {o|7}. Of the falls: {g|48}. If nothing had changed, rises and falls would mix: both sums near 27.5.", "show": {"mark": ["row", "rank", "sum"]}, "f": "W+ = {o|7}  ·  W− = 1 + 2 + 3 + 4 + 5 + 6 + 8 + 9 + 10 = {g|48}"}, {"say": "Your turn.", "ask": {"q": "Four differences: +2, −1, −5, −3. What is W+?", "options": ["2", "1", "4", "9"], "answer": 0, "why": "Sizes 1, 2, 3, 5 get ranks 1 to 4. The only positive one, +2, has rank 2: W+ = 2."}}, {"say": "The luck world: if 2026 changed nothing, each sign is a coin toss. Tap **Flip the signs**: every change keeps its size and rank, but gets a random + or −.", "act": [{"label": "Flip the signs", "rep": 3, "n": 1, "do": "flip"}]}, {"say": "Flip 100 times. W+ piles up around 27.5. Ours, {o|7}, sits far out on the left — few sign patterns are that lopsided.", "act": [{"label": "Flip 100 times", "rep": 1, "n": 100, "do": "flip"}]}, {"say": "Ten signs have only 2¹⁰ = 1 024 patterns, so we can count them all (dashed). 38 are as lopsided as ours: p = {y|0.037}. This is the [[Wilcoxon signed-rank test|the paired rank test: rank the sizes of the differences, then compare the ranks of the + ones with the − ones]].", "show": {"exact": true}, "f": "p = 38 ÷ 1 024 = {y|0.037}", "fs": "p is 38 out of 1024: 0.037."}, {"say": "The paired t-test gives p = 0.031 — the same verdict: 2026 loans are better. Wilcoxon only needs the differences to be roughly symmetric, not bell-shaped, so with ten branches it is the safer choice."}, {"say": "Last one.", "ask": {"q": "Which data need a **paired** test?", "options": ["App loans vs branch loans", "The same 200 customers' credit scores in January and in July", "Days late of five products"], "answer": 1, "why": "The same customers twice: compare each one with itself. The first is two independent groups (Mann–Whitney or Welch); the last is five groups (Kruskal–Wallis)."}}]}
```

> 🎬 **Didn't get the Wilcoxon test?** [zedstatistics explains it · 9 min](https://youtu.be/IcLSKko2tsg?t=686&end=1230)

### Shuffle the labels — the permutation test and the bootstrap

```story
{"id": "w06d4-s4", "title": "Shuffle the labels", "min": 7, "steps": [{"say": "Story 1's ten payments again. {y|SME}'s average is {y|5 days} later than {b|Auto}'s. Real, or luck?", "show": {"kind": "ranks", "a": [-3, -1, 2, 4, 30], "b": [-2, 0, 1, 3, 5], "col": ["y", "b"], "lo": -5, "hi": 35, "tick": 5, "mark": ["mean"], "stat": "gap", "words": {"a": "SME", "b": "Auto", "axis": "days late", "tally": "gap of the averages, SME − Auto, days"}}, "f": "gap = SME average − Auto average = 6.4 − 1.4 = {y|+5.0} days"}, {"say": "If the label meant nothing, any 5 of these payments could have been SME's. So keep the values and **shuffle the labels**: the colours jump, the dots stay. Each shuffle drops its gap into the chart below.", "act": [{"label": "Shuffle the labels", "rep": 3, "n": 1, "do": "shuffle"}]}, {"say": "Shuffle 100 times. The gaps pile up in **two humps**: whichever group gets the 30-day payment gets the big average.", "act": [{"label": "Shuffle 100 times", "rep": 1, "n": 100, "do": "shuffle"}]}, {"say": "Guess, then look at the orange bars.", "ask": {"q": "How often does a shuffle give a gap of 5 days or more, either way?", "options": ["Almost never", "About 1 time in 10", "Most of the time"], "answer": 2, "why": "Most shuffles land that far out: here luck makes 5-day gaps all the time."}}, {"say": "Ten payments split 5 + 5 in only 252 ways, so we can count them all (dashed): 182 give a gap of 5 days or more, p = {y|0.72}. This is the [[permutation test|shuffle the group labels; p = the share of shuffles at least as extreme as the real result]]: the luck world, built from your data.", "show": {"exact": true}, "f": "p = 182 ÷ 252 = {y|0.72}"}, {"say": "Now real loans. App: {o|41 FPDs} in 2 411 loans (1.70 %). Branch: 34 in 3 263 (1.04 %). The gap, {o|+0.66 points}, is the orange line.", "show": {"kind": "deal", "nA": 2411, "nB": 3263, "K": 75, "k": 41, "stat": "gap", "tails": "two", "words": {"axis": "app − branch, FPD points", "unit": " pt", "n": "Shuffles: **%n**", "real": "The real loans: {o|41} of the 75 FPDs are app loans.", "last": "the last gap: {b|%x}"}}, "f": "gap = 41 ÷ 2 411 − 34 ÷ 3 263 = 1.70 % − 1.04 % = {o|+0.66} points"}, {"say": "Shuffle the labels of all 5 674 loans: the 75 FPDs land on random loans. Each shuffle gives one gap; a thousand of them build the luck world.", "act": [{"label": "Shuffle 1 000 times", "rep": 2, "n": 1000, "do": "deal"}]}, {"say": "A gap of 0.66 points or more, either way, turns up in only about {o|3 shuffles in 100}: p ≈ 0.03 (10 000 shuffles give 0.033) — the same answer as yesterday's z-test. Unlikely to be luck.", "f": "p ≈ {o|0.03}: a gap this big is rare in the luck world"}, {"say": "The shuffle works for **any** number you can compute — a gap in medians, in the 90th percentile, in collection rates — with no formula. One assumption: without a real difference, any loan could have carried any label."}, {"say": "A second tool, the [[bootstrap|redraw each group from itself, with replacement, many times — to see how much a result wobbles]] (Day 2): redraw the app loans from the app loans, the branch loans from the branch loans, recompute the gap. Tap the button.", "show": {"kind": "hist", "gen": "gap", "pA": 0.017005, "nA": 2411, "pB": 0.01042, "nB": 3263, "band": 2, "truth": 0, "dp": 2, "words": {"thing": "Resamples", "axis": "app − branch, FPD points", "truth": "zero"}}, "act": [{"label": "Resample 1 000 times", "rep": 1, "n": 1000, "do": "sample"}]}, {"say": "The shaded middle 95 % runs from about {b|+0.05 to +1.30 points}. **Zero is outside** → significant at 5 %. And unlike a p-value, the interval also says how big the gap could be.", "f": "95 % interval: +0.05 … +1.30 points — zero is outside → significant"}, {"say": "Partner vs branch: the interval runs from about −0.55 to +0.76 and **holds zero** (the green line) → not significant. But not “no difference”: the gap could still be as big as +0.76.", "show": {"pA": 0.011228, "nA": 1425, "words": {"thing": "Resamples", "axis": "partner − branch, FPD points"}}, "act": [{"label": "Resample 1 000 times", "rep": 1, "n": 1000, "do": "sample"}], "ask": {"q": "An interval for a gap in days late runs from −0.3 to +0.9 days. What do you conclude?", "options": ["Significant: most of it is above zero", "Not significant at 5 % — zero is inside — but a gap of up to +0.9 days is still possible", "The two groups are proven equal"], "answer": 1, "why": "The test is “is 0 inside?”. It is — yet the interval also shows how big the gap might be."}}]}
```

**Now check yourself.**

```game
{"id": "w06d4-g5", "type": "order", "title": "Steps of a permutation test", "items": ["Compute the statistic on the real labels", "Shuffle the labels at random", "Recompute the statistic on the shuffled labels", "Repeat the shuffle 10 000 times", "p = share of shuffles at least as extreme as the real statistic"], "why": "The shuffles build the world where H₀ is true; the p-value asks how often that world produces your result.", "alts": [["Shuffle the labels at random", "Recompute the statistic on the shuffled labels", "Repeat the shuffle 10 000 times", "Compute the statistic on the real labels", "p = share of shuffles at least as extreme as the real statistic"]]}
```

### Small tables — deal the FPDs again (Fisher)

```story
{"id": "w06d4-s5", "title": "Six FPDs, dealt again", "min": 5, "steps": [{"say": "The May 2026 vintage: {b|67 partner loans} and {m|179 branch loans}, one dot each. {o|6 FPDs}: 4 in partner, 2 in branch. Partner looks five times worse — on six events.", "show": {"kind": "deal", "nA": 67, "nB": 179, "K": 6, "k": 4, "stat": "count", "tails": "fisher", "grid": true, "col": ["b", "m"], "labels": ["partner, 67 loans", "branch, 179 loans"], "words": {"axis": "FPDs that land in partner", "real": "The real table: {o|4} of the 6 FPDs are partner loans.", "last": "the last deal: {b|%x} in partner"}}, "f": "partner 4 ÷ 67 = 6.0 %  ·  branch 2 ÷ 179 = 1.1 %"}, {"say": "If channel made no difference, the 6 FPDs would split like the loans: partner holds 67 of the 246, so it should get about {p|1.63}. That is the [[expected count|row total × column total ÷ grand total: what a cell would hold if the groups were alike]].", "show": {"expected": true}, "f": "expected in partner = 67 × 6 ÷ 246 = {p|1.63}  ·  in branch = {p|4.37}", "fs": "Expected in partner: 67 times 6 divided by 246, 1.63."}, {"say": "Yesterday's χ² test is a smooth approximation, and it needs every expected count to be **at least 5**. Here two are 1.63 and 4.37, and its two versions disagree: p = 0.028 and p = 0.083.", "f": "χ² needs every expected count ≥ 5 — here 1.63 and 4.37 → p = 0.028 or 0.083?"}, {"say": "Your turn.", "ask": {"q": "Another table: 10 FPDs in 500 app loans, 10 in 500 branch loans. How many FPDs are expected in the app row?", "options": ["5", "10", "20", "2"], "answer": 1, "why": "500 × 20 ÷ 1 000 = 10 — at least 5, so χ² is fine there."}}, {"say": "Fisher's idea: keep the totals — 6 FPDs, 67 + 179 loans — and **deal the 6 FPDs again**, at random. Tap **Deal the 6 FPDs** and count how many land in partner.", "act": [{"label": "Deal the 6 FPDs", "rep": 3, "n": 1, "do": "deal"}]}, {"say": "Deal 1 000 times. Most deals put 0, 1 or 2 FPDs in partner. Ours — 4 or more — is rare: the {o|orange bars}.", "act": [{"label": "Deal 1 000 times", "rep": 1, "n": 1000, "do": "deal"}]}, {"say": "Fisher doesn't even deal: it counts every possible deal exactly (dashed). Deals as unlikely as ours, or more: {o|4.85 %}. That is [[Fisher's exact test|deal the events again with the totals fixed and count exactly how unlikely the real table is]]: p = 0.0485.", "show": {"exact": true}, "f": "Fisher: P(4 or more in partner) = {o|0.0485}"}, {"say": "Fisher is exact at any size: with an expected count below 5 you must use it, and with a computer you can simply use it for every 2 × 2 table."}, {"say": "One more.", "ask": {"q": "Which test do you report for 4 / 67 vs 2 / 179?", "options": ["χ² without correction, p = 0.028", "Fisher's exact test, p = 0.0485 — two expected counts are below 5", "χ² with Yates, p = 0.083"], "answer": 1, "why": "χ² is unreliable when expected counts fall below 5, and its two versions disagree. Fisher counts exactly."}}, {"say": "And still: six FPDs are very few, p = 0.0485 is borderline, and this was one vintage and one channel pair out of many. The next story shows why “one out of many” matters."}]}
```

**Now check yourself.**

```game
{"type": "sort", "id": "w06d4-g1", "title": "Which test?", "q": "Put each Nur question under the test that answers it.", "groups": {"Mann–Whitney": ["Does a typical Micro payment arrive later than a typical BNPL payment?", "Are days late different for two small, skewed groups?"], "Wilcoxon signed-rank": ["The same ten branches, FPD in 2025 vs 2026, skewed differences"], "Kruskal–Wallis": ["Days late across the five products"], "Fisher's exact": ["4 FPDs in 67 vs 2 in 179 — expected counts below 5"], "Permutation test": ["Collection rate Σ paid / Σ due, two strategies", "Difference in 90th percentiles of days late"]}}
```

### Many tests at once — Bonferroni, Holm, BH

```story
{"id": "w06d4-s6", "title": "Twenty tests, nothing real", "min": 6, "steps": [{"say": "Twenty tests at once — say, 20 customer segments, each compared with the rest. **Nothing is real**: in every test the two groups are truly the same. Still, each test has a {o|5 %} chance of a false alarm.", "show": {"kind": "dots", "groups": [[20, "g", "t"]], "cols": 10, "legend": [["g", "a test — nothing real"], ["o", "false alarm: p < 0.05"]], "rollSay": "This run: {o|%k} of %n tests raised a false alarm."}}, {"say": "Tap **Run the 20 tests**: each dot rolls its own 5 % dice. Some runs stay clean; many light up one or two {o|orange} dots.", "act": [{"label": "Run the 20 tests", "rep": 3, "do": "roll", "p": 0.05}]}, {"say": "Keep score: each run of 20 tests drops into the bar of its number of false alarms. Tap **100 runs**. {o|Orange} = at least one false alarm.", "show": {"kind": "months", "dist": "binom", "n": 20, "p": 0.05, "alarm": 1, "words": {"unit": "runs", "thing": "false alarms", "axis": "false alarms among 20 tests"}}, "act": [{"label": "1 run", "rep": 3, "n": 1, "do": "run"}, {"label": "100 runs", "rep": 1, "n": 100, "do": "run"}], "film": 1}, {"say": "Tap **1 000 runs**: about {o|64 in 100} have at least one false alarm. Each test is clean 95 % of the time; all 20 together, only 0.95²⁰ = 36 %. That 64 % is the [[family-wise error rate|the chance of at least one false alarm among many tests]].", "f": "P(at least one) = 1 − 0.95²⁰ = {o|64 %}", "fs": "One minus 0.95 to the power of 20: 64 percent.", "act": [{"label": "1 000 runs", "rep": 1, "n": 1000, "do": "run"}]}, {"say": "Fewer tests: tap **1 000 runs** for 10 tests.", "show": {"n": 10, "words": {"unit": "runs", "thing": "false alarms", "axis": "false alarms among 10 tests"}}, "act": [{"label": "1 000 runs", "rep": 1, "n": 1000, "do": "run"}], "ask": {"q": "10 tests, nothing real. The chance of at least one false alarm is…", "options": ["5 %", "about 40 %", "50 % (10 × 5 %)", "64 %"], "answer": 1, "why": "1 − 0.95¹⁰ = 40.1 %. It grows with every test, a little more slowly than 10 × 5 %."}}, {"say": "Now Nilufar's ten branches, each tested against the other nine. Each bar is a p-value (short = strong evidence). {o|Bukhara: p = 0.020} — below 0.05, “significant”! But it is one of ten tests, picked **because** it came out lowest.", "show": {"kind": "pvals", "p": [0.0199, 0.2733, 0.3769, 0.4326, 0.4345, 0.5779, 0.7425, 1, 1, 1], "labels": ["Bukhara", "Tashkent N.", "Nukus", "Tashkent C.", "Tashkent S.", "Andijan", "Fergana", "Namangan", "Samarkand", "Termez"], "rule": "raw"}}, {"say": "The simplest fix, [[Bonferroni|test each of m tests at α ÷ m — or multiply each p by m]]: with 10 tests the line moves to 0.05 ÷ 10 = 0.005. Bukhara no longer passes. (Twenty nothing-tests at 0.0025 each raise an alarm only about 5 % of the time.)", "show": {"rule": "bonf", "adj": true}, "f": "Bonferroni: each p × 10 → Bukhara 0.020 × 10 = {o|0.20}"}, {"say": "[[Holm|sort the p-values; the smallest must beat α ÷ m, the next α ÷ (m − 1), and so on; stop at the first that fails]] is Bonferroni's smarter twin: the line climbs like a staircase. Same protection, never less power — the default. Bukhara still fails the first step.", "show": {"rule": "holm"}, "f": "Holm: the smallest p × 10, the next × 9, … → Bukhara {o|0.199}"}, {"say": "Yesterday's three channel pairs: one family of three tests.", "show": {"p": [0.0318, 0.153, 0.804], "labels": ["app–branch", "app–partner", "partner–branch"], "adj": false}, "ask": {"q": "p = 0.0318, 0.153, 0.804. Holm multiplies the smallest by 3, the next by 2, the last by 1 (each kept at least as big as the one before). What comes out?", "options": ["0.0954, 0.306, 0.804", "0.0954, 0.459, 1", "0.0318, 0.153, 0.804"], "answer": 0, "why": "0.0318 × 3 = 0.0954, 0.153 × 2 = 0.306, 0.804 × 1. (× 3 for all three would be Bonferroni.)"}}, {"say": "The corrected values sit on the right: as one of three tests, app vs branch is no longer below 0.05. Count **every** test you ran — including the ones you looked at and dropped.", "show": {"adj": true}, "f": "Holm: 0.0954 · 0.306 · 0.804 — nothing below 0.05"}, {"say": "Three segment tests: p = 0.02, 0.03, 0.04. Holm: 0.02 × 3 = 0.06 fails at once — nothing flagged.", "show": {"p": [0.02, 0.03, 0.04], "labels": ["segment 1", "segment 2", "segment 3"]}}, {"say": "[[Benjamini–Hochberg|controls the expected share of false alarms among the results you flag — the false discovery rate]] is softer: its line climbs up to α, and all three pass. Use it to screen hundreds of segments for leads; Holm when a wrong “yes” is costly.", "show": {"rule": "bh"}, "f": "BH: the k-th smallest p × m ÷ k → 0.04 · 0.04 · 0.04"}]}
```

### Peeking at a running test

```story
{"id": "w06d4-s7", "title": "Peeking every month", "min": 5, "steps": [{"say": "An SMS that does **nothing**: both arms 13.34 % late, 150 new loans per arm each month, for 12 months. The line shows the test's verdict month by month: inside the band p > 0.05, outside “significant”.", "show": {"kind": "peek", "p": 0.1334, "per": 150, "months": 12, "mode": "once", "words": {"x": "month of the test"}}}, {"say": "Tap **Run one experiment**. The line wanders from month to month — pure luck, since the SMS does nothing.", "act": [{"label": "Run one experiment", "rep": 3, "n": 1, "do": "run"}]}, {"say": "Run 500. Read **once**, at month 12: about {o|5 in 100} end outside the band. Those are the 5 % false alarms we agreed to when we chose α.", "act": [{"label": "500 experiments", "rep": 1, "n": 500, "do": "run"}]}, {"say": "Now an impatient analyst looks **every month** and stops at the first p < 0.05 (the {o|big orange dot}). That is [[peeking|testing a running experiment again and again and stopping at the first p < 0.05]]. Same experiments: about {o|21 in 100} “win”.", "show": {"mode": "peek"}, "f": "1 look → 5 %  ·  a look every month → about {o|21 %}", "act": [{"label": "500 experiments", "rep": 1, "n": 500, "do": "run"}]}, {"say": "Think about it.", "ask": {"q": "Why not 12 × 5 % = 60 %?", "options": ["Each look adds only one month of loans to the earlier ones, so the 12 tests move together", "Because the SMS works a little", "Because a p-value can't be smaller than 0.05"], "answer": 0, "why": "The looks share most of their loans, so they are not 12 separate tests — yet every look is one more chance to step outside the band."}}, {"say": "Peek less: only at months 6 and 12 (the dashed lines). Run 500: false wins drop to about {o|8 %} — fewer looks, fewer accidents, but still above 5 %.", "show": {"looks": [6, 12]}, "act": [{"label": "500 experiments", "rep": 1, "n": 500, "do": "run"}]}, {"say": "The fix: write the sample size and the end date into the plan **before the first loan**, and read the result once. (Designs built for peeking come in week 7.)", "f": "before the first loan: the sample size, the end date, one look"}, {"say": "Your turn.", "ask": {"q": "A team checks its running test every Monday and stops when it turns green. Its false-alarm rate is…", "options": ["5 %, as planned", "below 5 %: it stops earlier", "well above 5 %: every Monday is one more chance"], "answer": 2, "why": "Monthly looks gave 21 %; weekly looks are worse still."}}, {"say": "A cousin of this check is the [[A/A test|both groups get the same thing; the planned test should come out “significant” only about α of the time]]. On real Nur loans, 2 000 random A/A splits came out “significant” 4.9 % of the time — about α: the split and the test behave."}, {"say": "Last one.", "ask": {"q": "A new experiment platform's A/A test comes out “significant” in 160 of 1 000 runs. What does it mean?", "options": ["Nothing — 16 % is close to 5 %", "Something is broken — the split, the logging or the test. Fix it before any A/B test", "The SMS works even without being sent"], "answer": 1, "why": "Nothing differs in an A/A test, so “significant” should turn up about 5 % of the time. Three times that means a broken system."}}]}
```

**Now play.** The same idea with sliders — try the challenges.

```explore
{"id": "w06d4-x2", "type": "peeking", "title": "Peek every month, win by accident", "predict": {"q": "An SMS that does **nothing**, tested for 12 months. One analyst reads the result once, at month 12. Another looks every month and stops at the first p < 0.05. How often does the second one declare a “winner”?", "options": ["5 % — every look is a 5 % test", "about 20 %", "about 46 % — that is 1 − 0.95¹²", "60 % — 12 looks × 5 %"], "why": "Every look is one more chance for a wandering p to dip below 0.05, so the false wins climb — to about **21 %**. Not 46 %: the twelve looks share most of their loans, so they are not twelve independent tests. Run the experiments below.", "answer": 1}, "start": {"p": 0.1334, "perMonth": 150, "months": 12, "looks": 12}, "challenges": [{"id": "c1", "text": "Run at least **200** experiments. Read once at month 12, do the false wins stay near **5 %**?", "when": {"runs": [">=", 200], "once": ["between", 0.025, 0.08]}}, {"id": "c2", "text": "Now the peeker, **every month**: with 200 or more experiments, the false wins climb above **15 %**.", "when": {"runs": [">=", 200], "looks": ["=", 12], "peek": [">", 0.15]}}, {"id": "c3", "text": "Peek less: with only **2 looks** (months 6 and 12) and at least **300** experiments, keep the false wins under **10 %**. Still above 5 %?", "when": {"runs": [">=", 300], "looks": ["=", 2], "peek": ["<", 0.1]}}]}
```

### Can the test see it? — power and sample size

```story
{"id": "w06d4-s8", "title": "Can the test see it?", "min": 6, "steps": [{"say": "Jasur's question: marketing hopes the SMS cuts FPD from 1.28 % to 1.00 %. First the **luck world**: the SMS does nothing, 2 000 loans per arm. Each experiment gives one gap between the arms.", "show": {"kind": "hist", "gen": "gap", "pA": 0.0114, "pB": 0.0114, "nA": 2000, "nB": 2000, "lo": -1.425, "hi": 1.775, "bins": 32, "dp": 2, "obs": 0.66, "tails": "two", "words": {"thing": "Experiments", "axis": "FPD gap, control − SMS, points", "obs": "“significant” from"}}, "act": [{"label": "Run one experiment", "rep": 3, "n": 1, "do": "sample"}]}, {"say": "Run 1 000. The gaps pile up around 0. Only about {o|1 in 20} lands beyond ±0.66 points — so 0.66 is where this test starts to say “significant”.", "act": [{"label": "1 000 experiments", "rep": 1, "n": 1000, "do": "sample"}]}, {"say": "Now the **SMS world**: it really works, 1.28 % → 1.00 %. Run 1 000. The pile moves right — to about +0.28 points. But the line stays at 0.66.", "show": {"pA": 0.0128, "pB": 0.01, "tails": "right"}, "act": [{"label": "1 000 experiments", "rep": 1, "n": 1000, "do": "sample"}]}, {"say": "Only the {o|orange} part crosses the line: about **1 experiment in 8** (12–13 %). That share is the test's [[power|the chance that a test says “significant” when the effect is real]]. Seven times in eight, a working SMS comes back “not significant”.", "f": "power = P(“significant” | the SMS really works) ≈ {o|1 in 8}", "fs": "Power: the chance of “significant” when the SMS really works, about 1 in 8."}, {"say": "What would a “no” mean?", "ask": {"q": "Jasur's plan is even smaller — 1 000 loans per arm, power about 9 %. The test says “not significant”. What does that tell you?", "options": ["The SMS doesn't work", "Almost nothing: the test would miss a working SMS about 91 times in 100", "FPD rose"], "answer": 1, "why": "Never read “not significant” from a weak test as “no effect”."}}, {"say": "More loans make the pile **narrow**. With about {b|22 500 loans per arm} the line moves in to 0.20 points, and about {o|80 %} of SMS-world experiments cross it. That is the usual target: 80 % power.", "show": {"nA": 22481, "nB": 22481, "obs": 0.196}, "act": [{"label": "1 000 experiments", "rep": 1, "n": 1000, "do": "sample"}]}, {"say": "A formula gives that number before any data: 1.96 is the 5 % line, 0.84 buys 80 % power, and {b|h} — [[Cohen's h|the size of a gap between two rates, measured so that rare and common rates compare fairly]] — is the effect. Small h, huge n: 11 years of Nur's loans.", "f": "n per arm = 2 × ( (1.96 + 0.84) ÷ h )²  ·  h = 2·asin√0.0128 − 2·asin√0.0100 = {b|0.0264}", "fs": "n per arm is 2 times the square of 1.96 plus 0.84, divided by h; and h is 0.0264."}, {"say": "And the other way round, from n to power: the bell's share of the SMS pile past the line, read with [[Φ|the share of the standard bell to the left of a point (Day 3)]]. The second term is the tiny left tail. Your `power_at` computes exactly this.", "f": "power = Φ( h × √(n ÷ 2) − 1.96 ) + Φ( −h × √(n ÷ 2) − 1.96 )", "fs": "Power is Phi of h times the root of n over 2, minus 1.96, plus a tiny second term."}, {"say": "Four things set the power, all known in advance: **n**, the **effect** (a bigger cut moves the pile further), **α** (a looser line lets more through) and **how rare** the outcome is — a rare one needs far more loans.", "f": "power ↑ when: n ↑ · effect ↑ · α ↑ · rate further from 0 % (−22 % on 12.8 % → about 2 000 per arm)"}, {"say": "Your turn.", "ask": {"q": "Which of these does **not** change a test's power?", "options": ["n", "the size of the effect", "α", "the p-value you got afterwards"], "answer": 3, "why": "Power is fixed before the data exist: by n, the effect, α and how noisy (how rare) the outcome is."}}, {"say": "Turn it round: with n fixed, the [[MDE|minimum detectable effect: the smallest true change the test catches with 80 % power]] says what the test **can** see. Jasur's 1 000 per arm only catch an SMS that cuts FPD by 80 % — no reminder does that.", "f": "MDE at 1 000 per arm: 1.28 % → {o|0.26 %}, a cut of 80 %"}, {"say": "So, before any test, compute its power. Too low? Change the metric (a frequent one, like “first instalment paid late”, 13.3 %), the n, or decide on cost. Never read “not significant” from a weak test as “no effect”."}]}
```

> 🎬 **Didn't get power?** [StatQuest explains it · 2 min](https://youtu.be/Rsc5znwR5FA?t=199&end=297)

> 🎬 **Didn't get the sample size?** [StatQuest explains it · 3 min](https://youtu.be/VX_M3tIyiYk?t=708&end=910)

**Now play.** The same idea with sliders — try the challenges.

```explore
{"id": "w06d4-x1", "type": "power", "title": "How many loans does a test need?", "predict": {"q": "To see the SMS cut FPD from **1.28 %** to **1.00 %** with 80 % power, a test needs 22 481 loans per arm. If the effect were only **half** as big (1.28 % → 1.14 %), it would need about…", "options": ["the same 22 481", "twice as many: about 45 000", "four times as many: about 90 000", "half as many: about 11 000"], "why": "n grows like 1 / effect²: half the effect needs about four times the loans (here 95 658, ×4.3). Small effects on rare outcomes are expensive — see it on the curves below.", "answer": 2}, "start": {"p1": 0.0128, "p2": 0.01, "n": 2000, "alpha": 0.05}, "power": 0.8, "p2Label": "True FPD with the SMS (without it: 1.28 %)", "axisLabel": "How much lower the SMS arm's FPD comes out, points — one curve per world", "challenges": [{"id": "c1", "text": "Keep the lesson's effect (1.28 % → 1.00 %) and α = 5 %. Move only **n** until the power reaches **80 %**. Does your n match the lesson's number?", "when": {"power": [">=", 0.8], "n": ["<=", 23000]}, "only": ["n"]}, {"id": "c2", "text": "Now **halve** the effect: the SMS arm at **1.14 %**. Find the **smallest** n that gives 80 % again — how many times more loans is that?", "when": {"p2": ["=", 0.0114], "power": [">=", 0.8], "n": ["<=", 100000]}, "only": ["n", "p2"]}, {"id": "c3", "text": "Back to Jasur's **2 000** loans per arm and α = 5 %: move only the SMS arm's FPD. What is the **highest** rate it can keep and still be seen 80 % of the time — how big a cut is that?", "when": {"n": ["=", 2000], "power": [">=", 0.8], "p2": [">=", 0.0047]}, "only": ["p2"]}]}
```

**Now check yourself.**

```game
{"type": "cloze", "id": "w06d4-g2", "title": "Loans per arm", "text": "n per arm = 2 · ( ( {{0}} + {{1}} ) / {{2}} )²", "blanks": [["z₁₋α/₂ (1.960)", "z₁₋β (0.842)"], ["z₁₋β (0.842)", "z₁₋α/₂ (1.960)"], ["Cohen's h"]], "distractors": ["the p-value", "σ / √n"], "why": "α and power set the two z values; the effect size h sits in the denominator, so halving the effect quadruples n."}
```

**Now check yourself.**

```game
{"type": "flash", "id": "w06d4-g3", "title": "Words of the day", "cards": [["Rank", "a value's position after sorting both groups together; ties share the average rank"], ["Family-wise error rate", "the chance of at least one false alarm among many tests: 1 − 0.95^m"], ["Bonferroni", "test each at α / m (or multiply each p by m)"], ["Holm", "sort the p-values, multiply by m, m − 1, …, keep the running maximum — same guarantee, more power"], ["Benjamini–Hochberg", "controls the share of false discoveries, for screening hundreds of segments"], ["Power", "P(reject H₀ | the effect is real) = 1 − β; plan for 80 %"], ["MDE", "the smallest true effect the test detects with 80 % power"], ["Peeking", "testing again and again as data arrive and stopping at the first p < 0.05"], ["A/A test", "two groups with the same treatment: checks the split, the logging and the test"]]}
```

## 2. Reference card — which test? (keep it open tomorrow)

| Outcome | Groups | Paired? | Test (Python) | When it breaks → instead |
|---|---|---|---|---|
| rate (yes/no) | 1 vs a known value | — | exact binomial `stats.binomtest` | — |
| rate | 2 | no | two-proportion z `proportions_ztest`, or χ² 2 × 2 | expected < 5 → **Fisher** `fisher_exact` |
| rate | 2 | yes (same loans, two moments) | **McNemar** `statsmodels.stats.contingency_tables.mcnemar` | — |
| rate | 3+ (or two categoricals) | no | **χ² of independence** `chi2_contingency` | thin cells → pool, or Fisher–Freeman–Halton / permutation |
| mean of a number | 1 vs a value | — | one-sample t `ttest_1samp` | skewed, small n → Wilcoxon signed-rank vs the value |
| number | 2 | no | **Welch t** `ttest_ind(equal_var=False)` | skewed + small n, outliers, "typical" question → **Mann–Whitney**; any statistic → permutation |
| number | 2 | yes | paired t `ttest_rel` | → **Wilcoxon** `wilcoxon` |
| number | 3+ | no | one-way ANOVA `f_oneway` (+ Tukey) | → **Kruskal–Wallis** `kruskal` (+ pairwise MW with Holm) |
| two numbers together | — | — | Pearson `pearsonr` | outliers, monotone not linear → Spearman `spearmanr` |
| median, ratio, percentile | any | either | bootstrap CI / permutation | — |
| many tests at once | — | — | add **Holm** (`multipletests`) | screening hundreds → BH (FDR) |
| before running anything | — | — | **power / sample size** `zt_ind_solve_power`, `TTestIndPower` | MDE too large → change the metric or the n |

Three questions pick the row: **what kind of outcome** (rate or number), **how many groups**, **same units twice or not**. Then the last column asks whether the default's assumptions hold.

---

## 3. Worked example — "Bukhara is the worst branch" (15 min)

**1. The claim.** Bukhara Central: 14 FPDs in 586 loans = 2.39 %, against 1.28 % for the book.

**2. One branch, small counts — Fisher's exact test.** Bukhara vs the other nine: 14 / 586 vs 77 / 6 513. The counts are small, so Fisher, not χ²: **p = 0.020** (odds ratio 2.05). Taken alone, "significant".

**3. Effect size — how big, if it is real.** 2.39 % against 1.18 % for the other nine: +1.21 points, RR 2.0. Large if real — and it rests on 14 FPDs.

**4. Multiple comparisons — it was chosen because it was the highest of ten.** Test all ten branches the same way (section 1, the branch table) and correct with **Holm**: Bukhara's adjusted p is **0.199**; no other branch is below 0.27 even before the correction. The omnibus χ² across the ten branches agrees: **p = 0.35**.

**5. The family-wise error rate — what chance does.** In books where all ten branches share the same true rate, 31 % have at least one branch flagged at 5 % (the notebook's simulation); Tuesday's Company corner showed the top branch averaging 2.00 % by luck alone.

**6. Reporting the result — one sentence.** *"Bukhara's 2.39 % is the highest of ten branches, but once we account for testing ten branches it is within what chance produces (Holm-adjusted p = 0.20); we will watch its Q4 vintages and its product mix rather than act now."*

---

## 4. Practice (50 min)

Every task has its own answer box. The Python boxes share the session of section 1's blocks: `f`, `x`, `pmf`, `cdf`, `mann_whitney`, `fisher`, `holm`, `bh`, `cohens_d`, `cohens_h`, `n_per_arm`, `power_at`, `mde_rate`, `Phi` and `zq` are ready once you have pressed ▶ Run on them. The days-late tasks use `x`, the 52 850 payments with `days_late`, which section 1's first block builds (the notebook `data/python/week6/day4_starter.ipynb` builds the same `f` and `x`, with `scipy`).

**First, press ▶ Run on this box once.** It loads the tools and the data that every Python box below uses.

```python
# the tools and the data from the full version of section 1 — run once
import math, sqlite3
import numpy as np
import pandas as pd
from statistics import NormalDist
Phi, zq = NormalDist().cdf, NormalDist().inv_cdf
def pmf(k, n, p):
    return math.comb(n, k) * p**k * (1 - p)**(n - k)
def cdf(k, n, p):  # binomial P(X <= k)
    return sum(pmf(i, n, p) for i in range(k + 1))
f = pd.read_csv("data/powerbi/fct_first_instalment.csv")
con = sqlite3.connect("data/raw/nur.db")
x = pd.read_sql("""
    WITH pay AS (SELECT MIN(payment_id) AS payment_id, installment_id, paid_at, amount
                 FROM payments GROUP BY installment_id, paid_at, amount)      -- 52 850 clean payments, repeats removed
    SELECT p.payment_id, pr.code, l.risk_grade,
           CAST(julianday(date(p.paid_at)) - julianday(i.due_date) AS INTEGER) AS days_late
    FROM pay p
    JOIN installments i ON i.installment_id = p.installment_id
    JOIN loans l        ON l.loan_id = i.loan_id
    JOIN products pr    ON pr.product_id = l.product_id""", con)
two = x[x["code"].isin(["AUTO", "SME"])].groupby("code")["days_late"]
def mann_whitney(a, b):
    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)
    n1, n2 = len(a), len(b)
    pooled = pd.Series(np.concatenate([a, b]))
    # ranks of all values together; ties get the average rank
    r = pooled.rank().to_numpy()
    u = r[:n1].sum() - n1 * (n1 + 1) / 2  # U for group a
    n, t = n1 + n2, pooled.value_counts().to_numpy().astype(float)
    # the spread of U under H0
    sd = math.sqrt(n1 * n2 / 12 * ((n + 1) - (t**3 - t).sum() / (n * (n - 1))))
    # 0.5 = continuity correction
    z = (abs(u - n1 * n2 / 2) - 0.5) / sd
    # U, P(a random a > a random b), p-value
    return u, u / (n1 * n2), 2 * (1 - Phi(z))
w = f[f.year.isin([2025, 2026])].pivot_table(index="branch_name", columns="year", values="fpd30", aggfunc="mean") * 100
d = (w[2026] - w[2025]).to_numpy()
d = d[d != 0]
r = pd.Series(np.abs(d)).rank().to_numpy()
def kruskal(groups):
    pooled = pd.concat(groups, ignore_index=True)
    r, n = pooled.rank().to_numpy(), len(pooled)
    h, start = 0.0, 0
    # each group's mean rank against the overall (n + 1) / 2
    for g in groups:
        rg = r[start:start + len(g)]; start += len(g)
        h += len(g) * (rg.mean() - (n + 1) / 2) ** 2
    h *= 12 / (n * (n + 1))
    t = pooled.value_counts().to_numpy().astype(float)
    return h / (1 - (t**3 - t).sum() / (n**3 - n))
H = kruskal([g["days_late"] for _, g in x.groupby("code")])
ab = f[f["channel"].isin(["app", "branch"])]
y, is_app = ab["fpd30"].to_numpy(), (ab["channel"] == "app").to_numpy()
g = np.random.default_rng(2026)
diffs = np.array([(lambda s: y[s].mean() - y[~s].mean())(g.permutation(is_app)) for _ in range(10_000)])
g = np.random.default_rng(2026)
a, b = f.loc[f.channel == "app", "fpd30"].to_numpy(), f.loc[f.channel == "branch", "fpd30"].to_numpy()
d = [g.choice(a, len(a)).mean() - g.choice(b, len(b)).mean() for _ in range(10_000)]
t = np.array([[4, 63], [2, 177]])
def fisher(a, b, c, d):
    r1, c1, n = a + b, a + c, a + b + c + d
    # P(k in the top-left cell) with the margins fixed
    def table_p(k):
        return math.comb(c1, k) * math.comb(n - c1, r1 - k) / math.comb(n, r1)
    p_obs = table_p(a)
    # every possible top-left count
    ks = range(max(0, r1 - (n - c1)), min(r1, c1) + 1)
    # tables as unlikely as ours, or more
    return sum(table_p(k) for k in ks if table_p(k) <= p_obs * (1 + 1e-7))
def holm(pvals):
    pvals = np.asarray(pvals, dtype=float)
    m, adj, run = len(pvals), np.empty(len(pvals)), 0.0
    for rank, i in enumerate(np.argsort(pvals)):     # smallest p first
        # × m, × (m − 1), … keeping the running maximum
        run = max(run, min(1.0, (m - rank) * pvals[i]))
        adj[i] = run
    return adj
def bh(pvals):
    pvals = np.asarray(pvals, dtype=float)
    m, adj, run = len(pvals), np.empty(len(pvals)), 1.0
    for k, i in enumerate(np.argsort(pvals)[::-1]):  # largest p first
        # × m / rank, keeping the running minimum
        run = min(run, pvals[i] * m / (m - k))
        adj[i] = run
    return adj
br = f.groupby("branch_name")["fpd30"].agg(["sum", "size"])
k_all, n_all = f["fpd30"].sum(), len(f)
br["p"] = [fisher(k, n - k, k_all - k, n_all - n - (k_all - k)) for k, n in zip(br["sum"], br["size"])]
g = np.random.default_rng(2026)
p_late, runs, per_month = 947 / 7099, 20_000, 150
ka = g.binomial(per_month, p_late, size=(runs, 12)).cumsum(axis=1)
kb = g.binomial(per_month, p_late, size=(runs, 12)).cumsum(axis=1)
n_arm = per_month * np.arange(1, 13)
pool = (ka + kb) / (2 * n_arm)
z = (ka - kb) / n_arm / np.sqrt(pool * (1 - pool) * 2 / n_arm)
def cohens_h(p1, p2):
    return 2 * math.asin(math.sqrt(p1)) - 2 * math.asin(math.sqrt(p2))
def n_per_arm(p1, p2, alpha=0.05, power=0.80):
    return 2 * ((zq(1 - alpha / 2) + zq(power)) / cohens_h(p1, p2)) ** 2
def power_at(p1, p2, n, alpha=0.05):
    h, za = abs(cohens_h(p1, p2)), zq(1 - alpha / 2)
    return Phi(h * math.sqrt(n / 2) - za) + Phi(-h * math.sqrt(n / 2) - za)
def mde_rate(p1, n, alpha=0.05, power=0.80):
    h = (zq(1 - alpha / 2) + zq(power)) * math.sqrt(2 / n)
    return math.sin(math.asin(math.sqrt(p1)) - h / 2) ** 2
def cohens_d(a, b):
    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)
    sp = math.sqrt(((len(a) - 1) * a.var(ddof=1) + (len(b) - 1) * b.var(ddof=1)) / (len(a) + len(b) - 2))
    return (a.mean() - b.mean()) / sp
gr = x.groupby("risk_grade")["days_late"]
g = np.random.default_rng(2026)
y_all, hits = f["fpd30"].to_numpy(), 0
for _ in range(2000):
    # 4 000 real loans: the first 2 000 are "A", the rest "A" again
    s = g.choice(y_all, 4000, replace=False)
    ka, kb = s[:2000].sum(), s[2000:].sum()
    pool = (ka + kb) / 4000
    hits += abs(ka - kb) / 2000 / math.sqrt(pool * (1 - pool) * 2 / 2000) > 1.96
micro = x.loc[x.code == "MICRO", "days_late"]
others = ["CONS", "BNPL", "AUTO", "SME"]
res = pd.DataFrame(
    [(c, *mann_whitney(micro, x.loc[x.code == c, "days_late"])[1:], cohens_d(micro, x.loc[x.code == c, "days_late"])) for c in others],
    columns=["vs", "P(Micro later)", "p", "d"])
print('ready')
```

**P1.** *(when the t-test is wrong)* For which two comparisons is Welch's t-test the wrong tool?

```task
{"id": "w06d4-p11", "kind": "multi", "options": ["Average days late, 4 688 Auto vs 8 222 SME payments", "A 1–5 satisfaction score, 25 app customers vs 25 branch customers", "Principal of 12 SME loans in Nukus vs 15 in Termez, one of them 590 m soum", "Credit scores of 2 000 vs 2 000 applicants"], "answer": [1, 2], "explain": "A 1–5 score is ordinal (its average has no meaning), and 12 vs 15 loans with one huge value is small and outlier-driven: use Mann–Whitney or a permutation test. Thousands of values and a question about the average are fine for Welch."}
```

<details><summary>Answer</summary>

The satisfaction score and the 12-vs-15 SME principals. A 1–5 score is an ordered label, so compare ranks, not means. Twelve and fifteen loans with one 590 m loan: the mean of each group is mostly that one loan, and n is too small for the CLT to rescue it — Mann–Whitney, or a permutation test on the median. The other two have thousands of values and ask about averages: Welch is right.

</details>

**P2.** *(Mann–Whitney U)* Auto vs SME days late: describe both (n, mean, median, share late, 99th percentile), then Welch and Mann–Whitney. Marketing asks "do SME borrowers pay later than Auto borrowers?" — which test answers that, and what is your answer?

```task
{"id": "w06d4-p1", "kind": "choice", "options": ["Welch (p = 0.02): yes, SME borrowers pay later", "Mann–Whitney (p = 0.32): no — a random SME payment is no more likely to be later than a random Auto one (0.505); what differs is the late tail, a proportions question", "Both, and quote the smaller p", "Neither — the medians are equal, so there is nothing to test"], "answer": 1, "explain": "'Do they pay later' is about the typical payment → a rank test. The means differ (Welch) because SME has a slightly heavier late tail: 12.4 % vs 10.1 % paid late at all."}
```

<details><summary>Answer</summary>

Auto 4 688 payments, mean −0.21, median −1, 10.1 % late, 99th pct 28; SME 8 222, +0.04, −1, 12.4 %, 31. Welch t = −2.34, **p = 0.0195**; Mann–Whitney **p = 0.32**, P(Auto later than SME) = 0.495. "Do SME borrowers pay later" is a question about the typical payment → Mann–Whitney: **no**, a random SME payment is no more likely to be later. What *is* different is the tail: 12.4 vs 10.1 % paid late at all (a proportions question: test it as one).

</details>

**P3.** *(Wilcoxon signed-rank)* Wilcoxon signed-rank on the ten branches' FPD30, 2025 vs 2026, next to the paired t-test. Why might you prefer Wilcoxon here?

```task
{"id": "w06d4-p2", "kind": "choice", "options": ["Wilcoxon always gives a smaller p", "With only ten differences (one of them +0.99) you cannot show they are near normal; Wilcoxon needs only symmetry and loses little power", "The paired t-test cannot be used on rates", "Wilcoxon uses the medians of the two years"], "answer": 1, "explain": "W = 7, p = 0.037 against the paired t-test's 0.031 — both agree that 2026 vintages are better."}
```

<details><summary>Answer</summary>

`stats.wilcoxon(w[2026], w[2025])` → W = 7, **p = 0.037** (exact); paired t p = 0.031. With n = 10, the paired t leans on the differences being roughly normal, which ten branch-level differences (one of them +0.99, Tashkent North) cannot show; Wilcoxon needs only symmetry of the differences and is barely less powerful. Both agree: 2026 vintages are better.

</details>

**P4.** *(Kruskal–Wallis)* Kruskal–Wallis on days late across the five products, then one-way ANOVA (`stats.f_oneway`). Which product drives the result?

```task
{"id": "w06d4-p3", "kind": "choice", "options": ["SME — the biggest loans", "Micro — mean days late +0.56 and 16.3 % of payments late against 10–12 % elsewhere", "Auto — the lowest mean", "None: Kruskal–Wallis only says that at least one product differs"], "answer": 1, "explain": "H = 61.0, p = 1.8 × 10⁻¹². The omnibus test says 'some differ'; the descriptive table shows Micro; pairwise Mann–Whitney with Holm would confirm which."}
```

<details><summary>Answer</summary>

Kruskal–Wallis H = 61.0, **p = 1.8 × 10⁻¹²**; ANOVA F = 19.3, p = 7.5 × 10⁻¹⁶. Means: Micro **+0.56**, SME +0.04, Consumer −0.01, BNPL −0.02, Auto −0.21 (all medians −1). Micro is the odd one out: 16.3 % of its payments are late against 10–12 % elsewhere. Next step: pairwise Mann–Whitney Micro vs each (four tests → Holm).

</details>

**P5.** *(permutation test)* Permutation test for the difference in **mean** days late, Auto − SME (10 000 shuffles, `default_rng(2026)`). Compare with Welch.

```task
{"id": "w06d4-p4", "kind": "choice", "options": ["The permutation p (≈ 0.02) contradicts Welch", "It agrees with Welch (≈ 0.02 vs 0.0195): the MEANS differ because of the tail, while Mann–Whitney says the TYPICAL payment does not — same data, two questions", "It agrees with Mann–Whitney, so Welch was wrong", "A permutation test cannot use the mean"], "answer": 1, "explain": "Observed −0.248 days, permutation p = 0.023. Any statistic works in a permutation test — here the mean, with no normality assumption."}
```

<details><summary>Answer</summary>

Observed −0.248 days; permutation **p = 0.023**; Welch 0.0195. The permutation test makes no normality assumption about the mean and agrees: the *means* differ (the tail), while Mann–Whitney (P2) says the *typical* payment does not. Same data, three tests, two questions.

</details>

**P6.** *(bootstrap as a test)* Bootstrap the difference in **mean** days late, Micro − Auto: 2 000 resamples, `default_rng(2026)`, the 95 % percentile interval. Is zero inside?

```task
{"id": "w06d4-p12", "kind": "choice", "options": ["Yes — the interval is about −0.2 to +0.2 days", "No — the interval is about +0.57 to +0.99 days: Micro payments are later on average", "No — the interval is about +5 to +7 days", "The bootstrap cannot be used for a difference in means"], "answer": 1, "explain": "Observed +0.77 days; the interval stays well above zero, so the difference is significant at 5 % — and the interval gives its size, give or take."}
```

<details><summary>Answer</summary>

```python
g = np.random.default_rng(2026)
m, a = x.loc[x.code == "MICRO", "days_late"].to_numpy(), x.loc[x.code == "AUTO", "days_late"].to_numpy()
d = [g.choice(m, len(m)).mean() - g.choice(a, len(a)).mean() for _ in range(2000)]
# 0.774 and about [0.57 0.99]
print(round(m.mean() - a.mean(), 3), np.quantile(d, [0.025, 0.975]).round(2))
```
Observed **+0.77 days**; interval about **+0.57 to +0.99**. Zero is outside: significant at 5 %. The interval is the part to report — "Micro payments arrive 0.6 to 1.0 days later on average than Auto payments".

</details>

**P7.** *(chi-square or Fisher)* The 2026-05 vintage, partner vs branch (4 / 67 vs 2 / 179). Expected counts, χ² with and without Yates, Fisher. Which do you report, and what do you conclude?

```task
{"id": "w06d4-p5", "kind": "choice", "options": ["χ² without correction, p = 0.028 — partner's May vintage is worse", "Fisher, p = 0.0485 — borderline, and one vintage of 32 and one channel pair of three: after any correction it is noise", "χ² with Yates, p = 0.083 — no difference", "No test: six FPDs are too few for any test"], "answer": 1, "explain": "Expected FPDs 1.63 and 4.37: two cells below 5, so χ² is unreliable and its two versions disagree. Fisher is exact; six FPDs still cannot carry a decision."}
```

<details><summary>Answer</summary>

Expected FPDs 1.63 and 4.37 — two cells below 5, χ² unreliable. Yates **0.083**, uncorrected **0.028**, Fisher **0.0485**. Report Fisher. Conclusion: borderline evidence that partner's May vintage was worse — and it is one vintage of 32 and one channel pair of three, so after any correction it is noise. Six FPDs in total cannot carry a decision.

</details>

**P8.** *(multiple comparisons)* Holm by hand (your TODO) on the three channel-pair p-values from yesterday: app–branch 0.0318, app–partner 0.153, partner–branch 0.804. Then Bonferroni.

```task
{"id": "w06d4-p6", "kind": "python", "starter": "pv = np.array([0.0318, 0.153, 0.804])     # app–branch, app–partner, partner–branch\nprint(holm(pv))\n# add Bonferroni: each p × 3, capped at 1 — print the three values\n", "answer": 0.459, "dp": 3, "model": "print(np.minimum(1, pv * 3))     # [0.0954 0.459 1.   ] — Holm [0.0954 0.306 0.804]: app vs branch is no longer below 0.05"}
```

<details><summary>Answer</summary>

Sorted 0.0318, 0.153, 0.804 → × 3, × 2, × 1 = 0.0954, 0.306, 0.804 → running max unchanged → Holm **0.095 / 0.306 / 0.804**; Bonferroni 0.095 / 0.459 / 1.000. Corrected for three comparisons, app vs branch is no longer significant at 5 %. That is why the committee note says "moderate": the answer depends on whether app vs branch was *the* question (it was Bekzod's, asked from the dashboard) or one of three.

</details>

**P9.** *(multiple comparisons: screening)* The vintage screen: test each of the 31 monthly vintages with ≥ 50 loans against the book rate 1.28 % (exact two-sided binomial). How many are "significant" at 5 %, how many would chance produce, and what survives Holm?

```task
{"id": "w06d4-p7", "kind": "python", "starter": "p0 = 91 / 7099\nv = f.groupby(\"vintage\")[\"fpd30\"].agg([\"sum\", \"size\"])\nv = v[v[\"size\"] >= 50]                     # 31 vintages\nv[\"p\"] = [min(1, 2 * min(cdf(k, n, p0), 1 - cdf(k - 1, n, p0) if k > 0 else 1)) for k, n in zip(v[\"sum\"], v[\"size\"])]\nprint(v.sort_values(\"p\").head(3))\n# add the Holm-adjusted p-values (holm from section 1) and print the smallest one, 2 decimals\n", "answer": 0.88, "dp": 2, "model": "v[\"holm\"] = holm(v[\"p\"])\nprint(round(v[\"holm\"].min(), 2))      # 0.88 — 2026-03 (0 FPDs in 330, raw p = 0.028) does not survive; chance alone gives ~1.6 'hits' in 31"}
```

<details><summary>Answer</summary>

`p = min(1, 2·min(binom.cdf(k, n, p0), binom.sf(k − 1, n, p0)))` per vintage: **1 of 31** below 0.05 — **2026-03**, with **0 FPDs in 330** loans (p = 0.028), a suspiciously *good* month; 2025-04 (7 / 225) is next at 0.054. Chance alone would give 31 × 0.05 ≈ 1.6. Holm: 0.88 for 2026-03 — nothing survives. Check 2026-03's zero against the payment data before celebrating (Day 1, P8).

</details>

**P10.** *(peeking)* Marketing ran a reminder test for eight weeks, looked at the dashboard every Monday and stopped in week 3, when p = 0.04. What do you tell them?

```task
{"id": "w06d4-p13", "kind": "choice", "options": ["Well done — p = 0.04 is below 0.05", "The result cannot be trusted: with weekly looks and a stop at the first p < 0.05, the false-positive rate is far above 5 %. Rerun with the sample size and the end date fixed in advance", "Lower α to 0.01 for the remaining weeks", "Continue to week 8 and report whichever week had the smallest p"], "answer": 1, "explain": "Each look is another test. The page's simulation: one look at the end gives 5 %, monthly looks 21 % — weekly looks are worse still."}
```

<details><summary>Answer</summary>

The p = 0.04 is one of up to eight looks, and the test stopped *because* it crossed 0.05. Section 1's simulation: a test that changes nothing, read once at the end, is "significant" 5 % of the time; read monthly and stopped at the first p < 0.05, 21 %. Weekly looks inflate it further. Rerun with n from a power calculation and the end date written down before the first SMS, and read the result once.

</details>

**P11.** *(power and sample size)* Sample size for the SMS test with other settings: 90 % power; one-sided 80 %. And the achieved power of 1 000 vs 1 000.

```task
{"id": "w06d4-p8", "kind": "python", "starter": "print(math.ceil(n_per_arm(0.0128, 0.010)))              # 80 % power, two-sided: 22481\n# add: 90 % power (two-sided), loans per arm, rounded up\n", "answer": 30096, "dp": 0, "model": "print(math.ceil(n_per_arm(0.0128, 0.010, power=0.90)))       # 30096\nprint(math.ceil(n_per_arm(0.0128, 0.010, alpha=0.10)))       # 17709 — one-sided at 5 % = two-sided at 10 %\nprint(round(power_at(0.0128, 0.010, 1000), 3))               # 0.091"}
```

<details><summary>Answer</summary>

90 % power: **30 096** per arm; one-sided 80 %: **17 709** per arm (one-sided is cheaper — and only legitimate if "SMS makes it worse" and "no change" lead to the same decision, which for a cheap SMS they arguably do); 1 000 per arm: **9.1 %** power. Every setting is far beyond Nur's ~337 new loans a month (January–September 2026).

</details>

**P12.** *(MDE)* MDE: with 1 000, 2 000 and 10 000 loans per arm (α 5 %, power 80 %), what FPD rate must the SMS reach to be detectable from 1.28 %? Use your `mde_rate`.

```task
{"id": "w06d4-p9", "kind": "python", "starter": "print(round(100 * mde_rate(0.0128, 1000), 2))     # 1 000 per arm, in %\n# add 2 000 and 10 000 per arm\n", "answer": 0.48, "dp": 2, "model": "print([round(100 * mde_rate(0.0128, n), 2) for n in (1000, 2000, 10000)])   # [0.26, 0.48, 0.87] — cuts of 80 %, 63 %, 32 %"}
```

<details><summary>Answer</summary>

1 000 → **0.26 %** (an 80 % cut); 2 000 → **0.48 %** (63 %); 10 000 → **0.87 %** (32 %). No reminder SMS cuts first-payment defaults by two thirds — the people who default on the first instalment are mostly not people who forgot. So a 2 000-loan FPD test is designed to fail: its most likely outcome is "not significant", which marketing will then read as "the SMS does not work".

</details>

**P13.** *(effect size)* Cohen's d for days late, grade C vs grade A, with `cohens_d` from section 1. Small, medium or large? Then the share of payments paid late in each grade.

```task
{"id": "w06d4-p14", "kind": "python", "starter": "gr = x.groupby(\"risk_grade\")[\"days_late\"]\n# Cohen's d, grade C minus grade A, rounded to 2 decimals\n", "answer": 0.3, "dp": 2, "model": "print(round(cohens_d(gr.get_group(\"C\"), gr.get_group(\"A\")), 2))   # 0.3 — between small and medium\nprint(gr.apply(lambda d: (d > 0).mean()).round(3))   # A 0.051, B 0.098, C 0.196, D 0.356"}
```

<details><summary>Answer</summary>

d = **0.30** — between small (0.2) and medium (0.5); grade D vs A is 0.70. Shares paid late: A **5.1 %**, B 9.8 %, C **19.6 %**, D 35.6 %. In the business's units, grade C pays late almost four times as often as grade A. The p-value of the C-vs-A comparison is essentially 0 and says nothing about this size; d and the shares do.

</details>

**P14.** *(A/A test)* An A/A design on the share of payments paid late: the ten branches are split into two groups of five, nobody gets any treatment, and a payment-level two-proportion z-test compares the groups. Over all 252 possible splits, 42 (16.7 %) come out "significant" at 5 %. Why so many?

```task
{"id": "w06d4-p15", "kind": "choice", "options": ["252 splits is too few to judge", "The unit that was split is the branch, and branches really differ (11.2 % to 13.6 % of payments late); a test that treats 52 850 payments as independent reads a branch difference as an effect. Randomise loans, or analyse by branch", "The z-test needs α = 1 % for payments", "16.7 % is within the normal range of an A/A test"], "answer": 1, "explain": "An A/A test should be 'significant' about α of the time. Far above α means the split or the test is wrong — here the split follows a real grouping (the branch) that the test ignores."}
```

<details><summary>Answer</summary>

The split was made by **branch**, but the test counts **payments** as if each were assigned on its own. Branches differ for reasons that have nothing to do with any treatment (from 11.2 % of payments late in the smallest branches to 13.6 % in the latest one), and payments of the same loan move together. So a branch difference looks like a treatment effect, and 42 of the 252 splits are "significant" — three times α. That is what A/A tests are for: they catch a split that follows a real grouping (branch, region, day of the week) before a real test is read. Fix: randomise loans, or analyse at the level you randomised (ten branches is very little data).

</details>

> 🚀 **Stretch (optional, +5 XP).** **P15.** *(power and sample size: choosing the metric)* Change the metric. "First instalment paid late at all" (any day after the due date, or not in full) is far more common than FPD30. Compute its rate on the 7 099 loans, the n per arm to detect a 20 % relative cut, the power of 1 000 vs 1 000, and confirm that power by simulation (20 000 runs, `default_rng(2026)`).

```task
{"id": "w06d4-p10", "kind": "python", "starter": "p1 = 947 / 7099                       # 13.34 % of first instalments paid late at all\np2 = p1 * 0.8                         # a 20 % relative cut\n# loans per arm (rounded up), then the power of 1 000 vs 1 000\n", "answer": 2324, "dp": 0, "model": "print(math.ceil(n_per_arm(p1, p2)), round(power_at(p1, p2, 1000), 3))   # 2324 0.452\ng = np.random.default_rng(2026)\na, b = g.binomial(1000, p1, 20_000) / 1000, g.binomial(1000, p2, 20_000) / 1000\npool = (a + b) / 2\nzs = (a - b) / np.sqrt(pool * (1 - pool) * 2 / 1000)\nprint(np.mean(np.abs(zs) > 1.96))     # ≈ 0.45 by simulation", "xp": 2}
```

<details><summary>Answer</summary>

947 / 7 099 = **13.34 %** (app 15.9 %, branch 11.8 %, partner 12.6 %). A 20 % cut (13.34 → 10.67 %): **2 324 per arm** (`ceil(2 323.1)`); with 1 000 per arm, power **45 %** by formula, **45.5 %** by simulation. Ten times fewer loans than the FPD30 test needs, because the outcome is ten times more frequent and the SMS acts directly on it (a reminder prevents *lateness*; whether it prevents *default* is a second question). The standard design: a frequent **leading** metric as the primary outcome, FPD30 as a guardrail you monitor but do not power for.

</details>

### Mistakes people make

- Mann–Whitney reported as "the medians differ" — it compares distributions; equal medians can still give p ≈ 0.
- Running t and Mann–Whitney and quoting the smaller p.
- χ² on a table with expected counts of 1–2 (use Fisher).
- Testing ten branches, quoting the one with p < 0.05, no correction — and then "investigating" the noise.
- Bonferroni when Holm gives the same guarantee with more power.
- Planning a test without a power calculation; reading "not significant" from an underpowered test as "no effect".
- Powering for the effect you *hope* for (−50 %) instead of the one that is plausible and worth money.
- An A/B test without an A/A check of the split.
- Peeking every month and stopping at the first p < 0.05 — a 5 % test becomes a 21 % one.

---

## 5. Homework

None today: **Checkpoint 6 is tomorrow** (intervals on Nur data, the test-choice quiz, interview questions). Finish the five TODO functions in `day4_starter.ipynb`; the checkpoint's power task uses them. **HW 6.2** is due tomorrow in Day 2's hand-in box. Check two of your functions here:

**H1.** Your `n_per_arm(0.0128, 0.010)` — loans per arm for 80 % power at α = 5 %, two-sided (rounded up)?

```task
{"id": "w06d4-hw1", "kind": "number", "answer": 22481, "dp": 0, "unit": "loans per arm", "hint": "h = 2·asin√0.0128 − 2·asin√0.010 = 0.02642; n = 2 · ((1.960 + 0.842) / h)².", "model": "2 · (2.802 / 0.02642)² = 22 480.8 → 22 481 per arm, 44 962 in total — 11 years of Nur's new loans."}
```

**H2.** And the power of 1 000 vs 1 000 for the same effect, in %, to 1 decimal?

```task
{"id": "w06d4-hw2", "kind": "number", "answer": 9.1, "dp": 1, "unit": "%", "hint": "Φ(h·√(n/2) − 1.96) + Φ(−h·√(n/2) − 1.96) with n = 1 000.", "model": "h·√500 = 0.591 → Φ(−1.369) ≈ 0.091: the test misses a real 1.28 → 1.00 % effect 91 times in 100."}
```

---

## 6. Self-check

Three questions, one at a time. Wrong? The explanation points to the part of section 1 to reread.

```check
{"id": "w06d4-sc", "questions": [
  {"type": "single", "q": "Welch says p = 0.02, Mann–Whitney says p = 0.32 on the same days-late data. Which is wrong?", "options": ["Welch", "Mann–Whitney", "Neither — Welch asks about the average, Mann–Whitney about the typical payment", "Both"], "answer": 2, "explain": "Pick the business question first, then the test (→ section 1, 'When the t-test is wrong', P2)."},
  {"type": "number", "q": "You test 20 segments at α = 5 % and nothing is real. What is the chance of at least one false alarm, in %?", "answer": 64.2, "tol": 0.3, "explain": "1 − 0.95²⁰ = 64.2 %. Correct with Holm before acting on the one hit (→ section 1, 'Multiple comparisons', P9)."},
  {"type": "multi", "q": "Which of these does power depend on?", "options": ["α", "the effect size", "the p-value you observed", "n", "how rare the outcome is"], "answer": [0, 1, 3, 4], "explain": "Power is fixed before the data; an outcome near 0 % (FPD) needs far more loans (→ section 1, 'Power and sample size', Company corner)."}
]}
```

---

## 7. Company corner <span class="badge company">Sample size for a risk experiment</span>

Jasur's question, answered before anyone sends an SMS.

**Design as proposed.** 2 000 loans: 1 000 get the SMS three days before the first due date, 1 000 do not (random split). Primary outcome: FPD30. Hoped-for effect: 1.28 % → 1.00 % (−22 %). α = 5 %, two-sided.

| Question | Answer | How |
|---|---|---|
| Loans needed per arm for 80 % power | **22 481** (44 962 in total) | `zt_ind_solve_power(proportion_effectsize(0.0128, 0.010), alpha=0.05, power=0.8)` |
| At Nur's pace (337 new loans a month, January–September 2026) | **133 months — 11 years** | 44 962 / 337 |
| Power of the proposed 1 000 vs 1 000 | **9.1 %** | `NormalIndPower().power(h, nobs1=1000, alpha=0.05)` |
| … even with 2 000 SMS vs 2 000 control | **13.3 %** (simulation: 12.5 %) | `nobs1=2000` |
| What 1 000 per arm *can* detect (MDE) | FPD 1.28 → **0.26 %** (−80 %) | `mde_rate(0.0128, 1000)` |
| What 2 000 per arm can detect | 1.28 → **0.48 %** (−63 %) | `mde_rate(0.0128, 2000)` |

**The business reading.** As designed, the test has a 91 % chance of returning "not significant" **even if the SMS works exactly as marketing hopes** — and that result would then be used to kill a good idea. Four honest options for Nilufar and marketing:

1. **Change the primary metric** to a frequent one the SMS acts on: *first instalment paid late at all* (13.3 %). A 20 % cut needs 2 324 per arm — about 14 months of all new loans, or 1 000 + 1 000 with 45 % power. Keep FPD30 as a guardrail.
2. **Use a continuous outcome** (days late on the first instalment) with a t-test or Mann–Whitney — more information per loan than a yes/no.
3. **Run longer, on every new loan**, with a pre-registered stopping date, accepting that FPD30 is a 2027 answer.
4. **Do not test — decide on cost.** An SMS costs a few hundred soum; the 25 m-soum app FPD problem from yesterday's note is small. If the downside of sending it to everyone is negligible, roll it out and monitor; a test is worth its cost only when the decision is expensive to reverse.

What goes back to Jasur, in two sentences: *"2 000 loans give 9 % power for a 1.28 → 1.00 % FPD effect; you would need 22 481 per arm. Test 'first instalment paid late' instead (2 324 per arm for a 20 % cut) with FPD30 as a guardrail — or just send the SMS if it costs less than the analysis."*

Marketing's test plan has one fatal line — tap it:

```game
{"type": "bug", "id": "w06d4-g4", "title": "The SMS test plan", "q": "One line of the plan breaks the experiment.", "code": "Randomly split 2 000 new loans: 1 000 get the SMS, 1 000 do not.\nPrimary outcome: FPD30; hoped-for effect 1.28 % → 1.00 %.\nα = 5 %, two-sided; the end date is fixed before the first SMS.\nIf the result is not significant, we conclude that the SMS does not work.\nFPD30 and lateness are reported with their n and 95 % intervals.", "answer": [3], "why": "With 9 % power the test misses a real effect 91 times in 100 — a null result from it says almost nothing. Size the test first, or change the metric."}
```

> 🎯 **Interview version.** *"How would you size an experiment on default rates?"* — Fix α, power and the smallest effect worth acting on; compute Cohen's h and n per arm; translate n into calendar time at the real volume; if it is years, change the metric (a frequent leading indicator), the design (all traffic, longer) or the question — and never read a null result from an underpowered test as "no effect".

**Say it like in an interview.** *"Marketing wants to test an SMS reminder on 2 000 loans to cut first-payment defaults from 1.28 % to 1 %. Is that enough?"* — answer in 3–5 sentences, as you would to an interviewer.

```task
{"id": "w06d4-cc", "kind": "free", "min": 30, "model": "No. For 1.28 % → 1.00 % at α = 5 % and 80 % power, Cohen's h is 0.026 and you need about 22 500 loans per arm — 11 years of our volume; with 1 000 per arm the power is only 9 %, so a 'not significant' result would mean almost nothing. I would change the primary metric to something frequent that the SMS acts on directly, such as 'first instalment paid late at all' (13 %), where a 20 % cut needs about 2 300 per arm, and keep FPD30 as a guardrail — or, since an SMS is cheap, roll it out and monitor.", "rubric": ["says it is not enough and gives n per arm (≈ 22 500) or the power (≈ 9 %)", "translates n into time at the real volume", "warns that a null result from an underpowered test is not 'no effect'", "proposes a fix: a frequent metric, longer/all traffic, or decide on cost"]}
```

Tomorrow: Checkpoint 6 — five analyses on Nur data, twelve test-choice scenarios, eight interview questions.

---

## Going further — the full version, with Python (optional, 60 min)

The same ideas as the stories, written out in full with Python, plus Kruskal–Wallis in detail, the power curve and the MDE table, effect size (Cohen's d), the A/A test and one request answered with all of today's tools. Optional: nothing here counts toward the day.

### When the t-test is wrong — skew, outliers, ordinal data

**What it is.** The **t-test** compares two **means**. It trusts the CLT to make the mean of each group roughly normal. It goes wrong in three situations:

1. **Skew with a small n.** The CLT has not had enough data yet, so the mean is not yet normal.
2. **Outliers.** A few extreme values move the mean, and the test moves with it.
3. **Ordinal data.** Risk grade A–D or a 1–5 satisfaction score: the distance between two values means nothing, so their average means nothing either.

The way out is a **non-parametric test** (*непараметрический критерий*). Most of them replace each value by its **rank** (*ранг*) — its position after sorting. Ranks need no normality, and an outlier is only "the highest rank".

**How to write it.** Look at the shape before you pick a test. Press ▶ Run: this first block loads the tools and two frames for the whole page — `f`, one row per first instalment (FPD30), and `x`, one row per clean payment with its days late.

```python
import math, sqlite3
import numpy as np
import pandas as pd
from statistics import NormalDist
# the normal CDF and its inverse (z for a probability)
Phi, zq = NormalDist().cdf, NormalDist().inv_cdf
# binomial P(X = k), from Day 1
def pmf(k, n, p):
    return math.comb(n, k) * p**k * (1 - p)**(n - k)
def cdf(k, n, p):  # binomial P(X <= k)
    return sum(pmf(i, n, p) for i in range(k + 1))

# 7 099 first instalments, fpd30 = 0/1
f = pd.read_csv("data/powerbi/fct_first_instalment.csv")
f["channel"] = f["product"].map({"MICRO": "app", "BNPL": "partner"}).fillna("branch")

con = sqlite3.connect("data/raw/nur.db")
x = pd.read_sql("""
    WITH pay AS (SELECT MIN(payment_id) AS payment_id, installment_id, paid_at, amount
                 FROM payments GROUP BY installment_id, paid_at, amount)      -- 52 850 clean payments, repeats removed
    SELECT p.payment_id, pr.code, l.risk_grade,
           CAST(julianday(date(p.paid_at)) - julianday(i.due_date) AS INTEGER) AS days_late
    FROM pay p
    JOIN installments i ON i.installment_id = p.installment_id
    JOIN loans l        ON l.loan_id = i.loan_id
    JOIN products pr    ON pr.product_id = l.product_id""", con)

two = x[x["code"].isin(["AUTO", "SME"])].groupby("code")["days_late"]
# 52850; AUTO 4688 −0.21 −1 5.85; SME 8222 0.04 −1 5.53
print(len(x), two.agg(["size", "mean", "median", "skew"]).round(2))
# share paid late: AUTO 0.101, SME 0.124
print(two.apply(lambda d: (d > 0).mean()).round(3))
```

| | n payments | mean days | median | skew | share paid late | share > 30 days | 99th percentile |
|---|---|---|---|---|---|---|---|
| Auto | 4 688 | −0.21 | −1 | 5.85 | 10.1 % | 0.85 % | 28 |
| SME | 8 222 | +0.04 | −1 | 5.53 | 12.4 % | 1.02 % | 31 |

Both products pay one day early in the middle (median −1), and both have a thin tail of 30-day payments that pulls the mean up — a skew near 6, where 0 is symmetric.

**When you use it.**

| Situation | Why the t-test is weak | Use instead |
|---|---|---|
| skewed data, fewer than ~30 per group | the mean is not normal yet | Mann–Whitney, permutation test |
| a few extreme values | they pull the mean | a rank test, or a bootstrap of the median |
| ordinal scale (grade, 1–5 score) | an average of labels has no meaning | a rank test |
| large n, a question about the average | the CLT works | Welch's t-test is fine |

> ⚠️ **Watch out.** With thousands of values, skew alone does not break Welch: 4 688 and 8 222 payments are plenty for the CLT. The real choice is the question — the **average** (t-test) or the **typical** value (rank test). Decide it first; never run both and report the smaller p.

**Your turn.** Which comparison should not use a t-test?

```task
{"id": "w06d4-l1", "kind": "choice", "options": ["Average principal, Auto vs SME, about 4 000 loans each", "Risk grade (A, B, C, D) of app loans vs branch loans", "Mean credit score of 2 000 applicants per channel", "Average days late of 8 000 payments per product"], "answer": 1, "explain": "A grade is an ordered label: 'B minus A' has no size, so a mean grade means nothing. Compare the grades with a rank test (or as a table of counts). The other three are averages of real numbers with large n — Welch works."}
```

### Mann–Whitney U — two independent groups by ranks

**What it is.** The **Mann–Whitney U test** (*U-критерий Манна–Уитни*, also called the Wilcoxon rank-sum test) pools both groups, ranks every value and checks whether one group's ranks are systematically higher. **U** counts the pairs — one value from each group — in which the A value is larger (a tie counts ½). **U / (n₁·n₂)** is the probability that a random A beats a random B. H₀: that probability is ½.

```pic
{"id": "w06d4-pic1", "title": "Pool, sort, rank: A holds ranks 2, 5 and 7", "caption": "A = [2, 5, 9] in teal, B = [1, 3, 4, 7] in amber, sorted together. A's ranks add up to 14, so U = 14 − 3·4/2 = **8**: A wins 8 of the 12 pairs.", "chart": {"type": "bars", "labels": ["1", "2", "3", "4", "5", "6", "7"], "values": [1, 2, 3, 4, 5, 7, 9], "tone": ["b", "a", "b", "b", "a", "b", "a"], "show": true, "note": "x: rank · y: value"}}
```

**How to write it.** U = (sum of A's ranks) − n₁·(n₁ + 1) / 2. On a tiny example, A = [2, 5, 9] and B = [1, 3, 4, 7]:

| value | 1 | 2 | 3 | 4 | 5 | 7 | 9 |
|---|---|---|---|---|---|---|---|
| group | B | A | B | B | A | B | A |
| rank | 1 | 2 | 3 | 4 | 5 | 6 | 7 |

A's ranks add up to 2 + 5 + 7 = 14, so U = 14 − 3·4/2 = **8**: A wins 8 of the 3 × 4 = 12 pairs, a share of 0.67.

```python
# two-sided; normal approximation with the tie correction
def mann_whitney(a, b):
    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)
    n1, n2 = len(a), len(b)
    pooled = pd.Series(np.concatenate([a, b]))
    # ranks of all values together; ties get the average rank
    r = pooled.rank().to_numpy()
    u = r[:n1].sum() - n1 * (n1 + 1) / 2  # U for group a
    n, t = n1 + n2, pooled.value_counts().to_numpy().astype(float)
    # the spread of U under H0
    sd = math.sqrt(n1 * n2 / 12 * ((n + 1) - (t**3 - t).sum() / (n * (n - 1))))
    # 0.5 = continuity correction
    z = (abs(u - n1 * n2 / 2) - 0.5) / sd
    # U, P(a random a > a random b), p-value
    return u, u / (n1 * n2), 2 * (1 - Phi(z))

# (8.0, 0.667) — the small table
print(mann_whitney([2, 5, 9], [1, 3, 4, 7])[:2])
auto, sme = x.loc[x.code == "AUTO", "days_late"], x.loc[x.code == "SME", "days_late"]
# [19075370.5, 0.495, 0.323]
print([round(v, 3) for v in mann_whitney(auto, sme)])
# scipy (the notebook): scipy.stats.mannwhitneyu(auto, sme) — the same U and p
```

U / (n₁n₂) = 0.495: a random Auto payment is later than a random SME payment 49.5 % of the time — a coin toss, and p = 0.32 says so.

**When you use it.**
- Two independent groups, a number or an ordered label, and the question "does one group tend to have larger values?".
- Small or skewed groups, or data with outliers.

| | Welch t-test | Mann–Whitney U |
|---|---|---|
| Asks | are the **averages** different? | does a random A tend to beat a random B? |
| Works on | the values | the ranks |
| A 60-day payment | pulls the mean | is only the top rank |
| Auto vs SME days late | t = −2.34, **p = 0.0195** | **p = 0.32** |

Both answers are right: the averages differ because SME has a slightly heavier late tail; the typical payment does not.

> ⚠️ **Watch out.** Mann–Whitney is not "a test of medians". Auto and SME have the same median (−1 day) and could still differ in the tail. Report it as "a random X tends to be larger (or not) than a random Y", with U / (n₁n₂).

**Your turn.** A = [3, 8, 10], B = [1, 2, 6, 9]. What is U for A? Count the pairs, or use `mann_whitney`.

```task
{"id": "w06d4-l2", "kind": "number", "answer": 9, "dp": 0, "unit": "pairs", "hint": "For each A value, count the B values below it: 3 beats 1 and 2; 8 beats …; 10 beats …", "model": "3 beats 2, 8 beats 3, 10 beats 4: U = 9 of 12 pairs (0.75). By ranks: A's ranks 3 + 5 + 7 = 15, U = 15 − 3·4/2 = 9."}
```

### Wilcoxon signed-rank — the paired version

**What it is.** For **paired** data — the same unit measured twice — the **Wilcoxon signed-rank test** (*критерий Вилкоксона для связанных выборок*) works on the differences. Drop the zero differences, rank the rest by size, then add the ranks of the positive differences (**W+**) and of the negative ones (**W−**). Under H₀ the differences are symmetric around 0, so W+ and W− should be close. W is the smaller of the two.

**How to write it.** The same ten branches, FPD30 of their 2025 vintages against their 2026 vintages:

| branch | 2026 − 2025, points | rank of the size | sign |
|---|---|---|---|
| Samarkand Central | −0.11 | 1 | − |
| Fergana Central | −0.40 | 2 | − |
| Nukus Central | −0.46 | 3 | − |
| Tashkent Central | −0.49 | 4 | − |
| Tashkent South | −0.56 | 5 | − |
| Andijan Central | −0.68 | 6 | − |
| **Tashkent North** | **+0.99** | **7** | **+** |
| Bukhara Central | −1.21 | 8 | − |
| Termez Central | −1.37 | 9 | − |
| Namangan Central | −1.46 | 10 | − |

```python
f["year"] = pd.to_datetime(f["disbursed_at"]).dt.year
w = f[f.year.isin([2025, 2026])].pivot_table(index="branch_name", columns="year", values="fpd30", aggfunc="mean") * 100
d = (w[2026] - w[2025]).to_numpy()
# a zero difference has no sign
d = d[d != 0]
# rank the sizes of the differences
r = pd.Series(np.abs(d)).rank().to_numpy()
w_plus, w_minus = r[d > 0].sum(), r[d < 0].sum()
W = min(w_plus, w_minus)
# exact p-value: under H0 every pattern of + and − signs on the ranks is equally
# likely (2^10 = 1 024 patterns)
signs = (np.arange(2 ** len(d))[:, None] >> np.arange(len(d))) & 1
plus = signs @ r  # W+ of every pattern
# 7.0 48.0 0.037
print(w_plus, w_minus, np.mean(np.minimum(plus, r.sum() - plus) <= W))
# scipy (the notebook): scipy.stats.wilcoxon(w[2026], w[2025]) → W = 7, p =
# 0.037
```

W+ = 7: only Tashkent North got worse, and its rise is the 7th-largest change of ten; 38 of the 1 024 sign patterns are this lopsided, so p = 0.037.

**When you use it.**
- The same units twice (branches in two years, customers before and after), with few pairs or skewed differences.

| | paired t-test | Wilcoxon signed-rank |
|---|---|---|
| Works on | the mean difference | the ranks of the differences |
| Needs | differences roughly normal | differences roughly symmetric |
| Ten branches, 2025 vs 2026 | p = 0.031 | p = 0.037 |

**Your turn.** Five differences: +3, −1, −4, −2, −5. What is W+ (the sum of the ranks of the positive differences)?

```task
{"id": "w06d4-l3", "kind": "number", "answer": 3, "dp": 0, "unit": "rank sum", "hint": "Rank the sizes 1, 2, 3, 4, 5. Which rank belongs to the only positive difference?", "model": "Sizes 1, 2, 3, 4, 5 get ranks 1 to 5. The only positive difference, +3, has rank 3: W+ = 3, W− = 1 + 2 + 4 + 5 = 12."}
```

### Kruskal–Wallis — three or more groups

**What it is.** The **Kruskal–Wallis test** (*критерий Краскела–Уоллиса*) is Mann–Whitney for k groups — the rank version of one-way ANOVA. In one line: rank everything together, and **H** measures how far each group's mean rank sits from the overall mean rank; under H₀ it follows χ² with k − 1 degrees of freedom.

**How to write it.** H = 12 / (n(n + 1)) · Σ nᵢ · (mean rank of group i − (n + 1)/2)², divided by a tie correction.

```python
def kruskal(groups):
    pooled = pd.concat(groups, ignore_index=True)
    r, n = pooled.rank().to_numpy(), len(pooled)
    h, start = 0.0, 0
    # each group's mean rank against the overall (n + 1) / 2
    for g in groups:
        rg = r[start:start + len(g)]; start += len(g)
        h += len(g) * (rg.mean() - (n + 1) / 2) ** 2
    h *= 12 / (n * (n + 1))
    t = pooled.value_counts().to_numpy().astype(float)
    return h / (1 - (t**3 - t).sum() / (n**3 - n))  # tie correction
H = kruskal([g["days_late"] for _, g in x.groupby("code")])
# 61.0 1.8e-12 — for 4 df, P(χ² > H) = e^(−H/2)·(1 + H/2)
print(round(H, 1), math.exp(-H / 2) * (1 + H / 2))
# Micro +0.56 stands out; the others −0.21 to +0.04
print(x.groupby("code")["days_late"].mean().round(2))
# scipy (the notebook): scipy.stats.kruskal(*groups); one-way ANOVA:
# scipy.stats.f_oneway(*groups) → F = 19.3
```

H = 61.0 on 4 degrees of freedom, p = 1.8 × 10⁻¹²: the days late of at least one product differ from the rest, and the means point at Micro.

**When you use it.**
- Three or more independent groups, skewed data or ordered labels.
- Then pairwise Mann–Whitney tests with a correction (Multiple comparisons, below) to say *which* groups differ.

> ⚠️ **Watch out.** A significant Kruskal–Wallis says "at least one group differs", not which one. Do not name a product until the pairwise tests and the correction are done.

**Your turn.** Kruskal–Wallis on days late across the five products gives H = 61.0, p = 1.8 × 10⁻¹². Which conclusion is right?

```task
{"id": "w06d4-l4", "kind": "choice", "options": ["Micro is the worst product — p = 1.8 × 10⁻¹²", "At least one product's days late differ; pairwise tests with a correction say which", "All five products differ from each other", "The medians of the five products differ"], "answer": 1, "explain": "An omnibus test answers one question: are all groups alike? 'No' does not say which ones differ — and here all five medians are the same (−1)."}
```

### Permutation test — build the null by shuffling

**What it is.** If H₀ is true, the group label carries no information, so shuffling it should often produce gaps as large as the real one. A **permutation test** (*перестановочный тест*) shuffles the labels many times, recomputes the statistic each time and reports p = the share of shuffles at least as extreme as the observed value.

**How to write it.** Observed statistic → shuffle the labels 10 000 times → recompute → count. App vs branch FPD:

```python
ab = f[f["channel"].isin(["app", "branch"])]
y, is_app = ab["fpd30"].to_numpy(), (ab["channel"] == "app").to_numpy()
# the real gap: +0.6586 points
obs = y[is_app].mean() - y[~is_app].mean()
# seeded, so you get the same shuffles
g = np.random.default_rng(2026)
diffs = np.array([(lambda s: y[s].mean() - y[~s].mean())(g.permutation(is_app)) for _ in range(10_000)])
# 0.6586 and p ≈ 0.033 (notebook 0.0326; z-test 0.0318, Fisher 0.0344)
print(round(100 * obs, 4), np.mean(np.abs(diffs) >= abs(obs)))
```

A gap of 0.66 points or more appeared in about 3.3 % of 10 000 shuffles, so p ≈ 0.033 — the same answer as yesterday's z-test.

**When you use it.**
- Any statistic with no formula: a difference in medians, in collection rates (Σ paid / Σ due), in the 90th percentile.
- Small or odd-shaped samples. The only assumption: under H₀ the units are exchangeable (any unit could have had any label).

### The bootstrap as a test — is zero in the interval?

**What it is.** The **bootstrap** (Day 2) resamples each group with replacement and recomputes the difference each time. As a test: build the 95 % interval of the difference and check whether **0** is inside. Zero outside → significant at 5 %.

```pic
{"id": "w06d4-pic2", "title": "Zero outside the interval: significant. Inside: not", "caption": "Bootstrap 95 % intervals for the FPD gap in points, 10 000 resamples each (seed 2026). App − branch runs from +0.05 to +1.30 and leaves zero out; partner − branch runs from −0.55 to +0.76 and holds it.", "chart": {"type": "intervals", "rows": [{"label": "app − branch", "lo": 0.05, "mid": 0.66, "hi": 1.3}, {"label": "partner − br", "lo": -0.55, "mid": 0.08, "hi": 0.76}], "ref": {"at": 0, "label": "zero"}, "min": -1, "max": 1.5, "unit": " pt"}}
```

**How to write it.** Resample each group → difference → repeat 10 000 times → 2.5th and 97.5th percentiles.

```python
g = np.random.default_rng(2026)
a, b = f.loc[f.channel == "app", "fpd30"].to_numpy(), f.loc[f.channel == "branch", "fpd30"].to_numpy()
d = [g.choice(a, len(a)).mean() - g.choice(b, len(b)).mean() for _ in range(10_000)]
# ≈ +0.0005 to +0.0130, i.e. +0.05 to +1.30 points — zero is outside; Newcombe
# gave +0.05 to +1.33
print(np.quantile(d, [0.025, 0.975]))
```

The app's FPD is higher by somewhere between 0.05 and 1.30 points; zero is outside, so the difference is significant at 5 %.

**When you use it.**

| | Permutation test | Bootstrap interval |
|---|---|---|
| Answers | could the labels be irrelevant? | how big is the difference, give or take? |
| Gives | a p-value | an interval (and "is 0 inside?") |
| Use for | a yes/no decision | the size you report |

> ⚠️ **Watch out.** Zero just inside the interval is "not significant", not "no difference". Report the interval itself; it shows how large the difference could be.

**Your turn.** A bootstrap interval for the difference in a late rate comes out as −0.4 to +1.1 points. What do you conclude?

```task
{"id": "w06d4-l5", "kind": "choice", "options": ["Significant at 5 % — the interval is mostly positive", "Not significant at 5 % — zero is inside the interval, though a gap of up to +1.1 points is still possible", "The two groups are proven equal", "The test failed; increase the resamples to 100 000"], "answer": 1, "explain": "The test is 'is 0 inside the 95 % interval?'. It is, so no significance — but the interval also says the gap could be as large as +1.1 points: absence of evidence, not evidence of absence."}
```


### Chi-square or Fisher — small tables

**What it is.** The χ² test is an approximation. It needs every **expected count** (row total × column total / grand total) to be **at least 5**. **Fisher's exact test** (*точный критерий Фишера*) needs no approximation: it adds up the probabilities of every table with the same row and column totals that is as unlikely as the one you saw or more. It is exact at any n.

**How to write it.** The 2026-05 vintage, partner vs branch: 4 FPDs in 67 vs 2 in 179.

| | FPD | no FPD | total |
|---|---|---|---|
| partner | 4 (expected 1.63) | 63 | 67 |
| branch | 2 (expected 4.37) | 177 | 179 |
| total | 6 | 240 | 246 |

```python
# partner vs branch: FPD / no FPD
t = np.array([[4, 63], [2, 177]])
# [[1.63 65.37] [4.37 174.63]] — two cells below 5
print((np.outer(t.sum(axis=1), t.sum(axis=0)) / t.sum()).round(2))

# two-sided Fisher exact test for [[a, b], [c, d]]
def fisher(a, b, c, d):
    r1, c1, n = a + b, a + c, a + b + c + d
    # P(k in the top-left cell) with the margins fixed
    def table_p(k):
        return math.comb(c1, k) * math.comb(n - c1, r1 - k) / math.comb(n, r1)
    p_obs = table_p(a)
    # every possible top-left count
    ks = range(max(0, r1 - (n - c1)), min(r1, c1) + 1)
    # tables as unlikely as ours, or more
    return sum(table_p(k) for k in ks if table_p(k) <= p_obs * (1 + 1e-7))
print(round(fisher(4, 63, 2, 177), 4))  # 0.0485
# scipy (the notebook): scipy.stats.chi2_contingency(t)[1] → 0.083 (Yates),
# correction=False → 0.028; scipy.stats.fisher_exact(t) → p 0.0485
```

Two expected counts are below 5, the two χ² versions disagree (0.028 and 0.083), and Fisher gives the exact answer, p = 0.0485.

**When you use it.**
- Any 2 × 2 table with an expected count below 5: a vintage × channel, a branch-month, a small campaign.
- With a computer you can simply use Fisher for every 2 × 2.

**Your turn.** A branch-month: 3 FPDs in 40 app loans, 1 FPD in 120 branch loans. What is the expected number of FPDs in the app row?

```task
{"id": "w06d4-l6", "kind": "number", "answer": 1, "dp": 1, "unit": "FPDs", "hint": "Expected = row total × column total / grand total: 40 × 4 / 160.", "model": "40 × 4 / 160 = 1.0 — far below 5, so χ² is unreliable here: use Fisher."}
```

### Multiple comparisons — Bonferroni, Holm, Benjamini–Hochberg

**What it is.** Each test at α = 5 % raises a false alarm 5 % of the time when nothing is real. Run m tests and the chance of **at least one** false alarm — the **family-wise error rate** (*групповая вероятность ошибки*, FWER) — is 1 − 0.95^m: **40 %** for 10 tests. **Corrections for multiple comparisons** (*поправки на множественные сравнения*) adjust the p-values:

- **Bonferroni** (*поправка Бонферрони*): multiply every p by m (cap at 1). Keeps FWER ≤ α; strict.
- **Holm**: sort p from smallest; multiply the smallest by m, the next by m − 1, … and keep the running maximum. The same guarantee, never less power — the default.
- **Benjamini–Hochberg** (*процедура Бенджамини–Хохберга*, BH): controls the **false discovery rate** (FDR) — the expected share of false alarms among the results you flag. Less strict; for screening hundreds of segments.

**How to write it.** Each branch against the other nine (Fisher), then the three corrections:

```python
# 0.401 — at least one false alarm in 10 tests
print(round(1 - 0.95 ** 10, 3))

def holm(pvals):
    pvals = np.asarray(pvals, dtype=float)
    m, adj, run = len(pvals), np.empty(len(pvals)), 0.0
    for rank, i in enumerate(np.argsort(pvals)):     # smallest p first
        # × m, × (m − 1), … keeping the running maximum
        run = max(run, min(1.0, (m - rank) * pvals[i]))
        adj[i] = run
    return adj
def bh(pvals):
    pvals = np.asarray(pvals, dtype=float)
    m, adj, run = len(pvals), np.empty(len(pvals)), 1.0
    for k, i in enumerate(np.argsort(pvals)[::-1]):  # largest p first
        # × m / rank, keeping the running minimum
        run = min(run, pvals[i] * m / (m - k))
        adj[i] = run
    return adj
# [0.0954 0.306 0.804] — yesterday's three channel pairs
print(holm([0.0318, 0.153, 0.804]))

br = f.groupby("branch_name")["fpd30"].agg(["sum", "size"])
k_all, n_all = f["fpd30"].sum(), len(f)              # 91 FPDs in 7 099 loans
br["p"] = [fisher(k, n - k, k_all - k, n_all - n - (k_all - k)) for k, n in zip(br["sum"], br["size"])]
br["bonferroni"] = np.minimum(1, br["p"] * len(br))
br["holm"], br["bh"] = holm(br["p"]), bh(br["p"])
print(br.sort_values("p").head(3).round(3))
# statsmodels (the notebook): statsmodels.stats.multitest.multipletests(p,
# method="holm") — also "bonferroni", "fdr_bh"
```

| branch | FPD / loans | p | Bonferroni | Holm | BH |
|---|---|---|---|---|---|
| Bukhara Central | 14 / 586 | **0.020** | 0.199 | **0.199** | 0.199 |
| Tashkent North | 8 / 921 | 0.273 | 1 | 1 | 0.869 |
| Nukus Central | 3 / 440 | 0.377 | 1 | 1 | 0.869 |

Bukhara's p = 0.020 looks "significant" alone; tested as one of ten, every correction puts it at 0.199. The omnibus χ² of FPD × branch agrees: χ² = 9.97 on 9 df, p = 0.35.

**When you use it.**
- Several branches, segments, products or KPIs tested at once: Holm.
- Hundreds of segments screened for leads to follow up: BH.
- One test chosen in advance: no correction.

> ⚠️ **Watch out.** Count every test you ran, including the ones you looked at and dropped. "We tested ten branches and report the one that came out" without a correction is the false alarm the correction exists to stop.

**Your turn.** Four segment tests give p = 0.01, 0.02, 0.03, 0.20. Run `holm()` and `bh()` on them in the box above. How many stay below 0.05 under BH?

```task
{"id": "w06d4-l7", "kind": "number", "answer": 3, "dp": 0, "unit": "tests", "hint": "bh([0.01, 0.02, 0.03, 0.20]) — then count the values below 0.05.", "model": "BH: 0.04, 0.04, 0.04, 0.20 → three below 0.05. Holm: 0.04, 0.06, 0.06, 0.20 → only one. BH accepts some false discoveries in exchange for power."}
```

### Peeking — multiple comparisons in time


**What it is.** **Peeking** (*подглядывание*) is testing a running experiment again and again as data arrive, and stopping at the first p < 0.05. Each look is another test, so the false-alarm rate grows like in the previous subsection.

**How to write it.** Simulate an SMS that does **nothing**: both arms 13.34 % late, 150 loans per arm per month, 12 months, 20 000 runs.

```python
g = np.random.default_rng(2026)
p_late, runs, per_month = 947 / 7099, 20_000, 150
# arm A: late first instalments so far, month by month
ka = g.binomial(per_month, p_late, size=(runs, 12)).cumsum(axis=1)
# arm B: identical — the SMS does nothing
kb = g.binomial(per_month, p_late, size=(runs, 12)).cumsum(axis=1)
# loans per arm after 1, 2, …, 12 months
n_arm = per_month * np.arange(1, 13)
pool = (ka + kb) / (2 * n_arm)
# the two-proportion z at every monthly look
z = (ka - kb) / n_arm / np.sqrt(pool * (1 - pool) * 2 / n_arm)
# ≈ 0.05 once at the end, ≈ 0.21 looking monthly
print(np.mean(np.abs(z[:, -1]) > 1.96), np.mean((np.abs(z) > 1.96).any(axis=1)))
```

Testing once at the end gives a false positive about 5 % of the time (the notebook: 5.05 %); looking every month and stopping at the first p < 0.05 gives about **21 %** (20.9 %) — a "winning" SMS one time in five, usually declared in month 3.

**When you use it.**
- Any experiment that runs for weeks or months, and any dashboard that people check while it runs.
- The fix: write the sample size and the end date into the plan before the first loan, and read the result once (or use a sequential design built for peeking — week 7).

> ⚠️ **Watch out.** "Let's check the dashboard every Monday and stop when it turns green" is peeking. It turns a 5 % test into a 21 % one.

**Your turn.** A team checks a test that changes nothing every month for a year and stops at the first p < 0.05. What happens to the 5 % false-positive rate?

```task
{"id": "w06d4-l8", "kind": "choice", "options": ["It stays 5 % — each look is a 5 % test", "It falls, because the test stops earlier", "It grows to about 20 %: every look is one more chance for a false alarm", "It becomes exactly 12 × 5 % = 60 %"], "answer": 2, "explain": "Twelve looks are twelve correlated tests: the simulation gives about 21 %, not 60 % (the looks share most of their data) and not 5 %."}
```


### Power and sample size


**What it is.** **Power** (*мощность критерия*) = P(the test rejects H₀ | the effect is real) = 1 − β. It is fixed before any data exist, by five inputs: **α**, the **power** you want, the **baseline** rate, the **effect** you want to detect and **n**. Convention: plan for 80 % power at α = 5 %. For two rates the effect is measured by **Cohen's h** = 2·arcsin√p₁ − 2·arcsin√p₂, and the loans needed **per arm** are:

```
n per arm
  = 2 · ( (z for α/2
           + z for the power) / h )²

FPD 1.28 % → 1.00 %:
  h = 0.02642
  n = 2 · ((1.960 + 0.842) / 0.02642)²
    = 22 481
```

**How to write it.** One calculator for the whole page — sample size, power and (next subsection) MDE:

```python
# the effect size for two rates
def cohens_h(p1, p2):
    return 2 * math.asin(math.sqrt(p1)) - 2 * math.asin(math.sqrt(p2))
# loans needed in EACH group
def n_per_arm(p1, p2, alpha=0.05, power=0.80):
    return 2 * ((zq(1 - alpha / 2) + zq(power)) / cohens_h(p1, p2)) ** 2
# two-sided power with n loans per arm
def power_at(p1, p2, n, alpha=0.05):
    h, za = abs(cohens_h(p1, p2)), zq(1 - alpha / 2)
    return Phi(h * math.sqrt(n / 2) - za) + Phi(-h * math.sqrt(n / 2) - za)
# the lowest rate the treated arm must reach to be seen
def mde_rate(p1, n, alpha=0.05, power=0.80):
    h = (zq(1 - alpha / 2) + zq(power)) * math.sqrt(2 / n)
    return math.sin(math.asin(math.sqrt(p1)) - h / 2) ** 2

# 0.02642 22481 — the base case
print(round(cohens_h(0.0128, 0.010), 5), math.ceil(n_per_arm(0.0128, 0.010)))
# 33452 30096
print(math.ceil(n_per_arm(0.0128, 0.010, alpha=0.01)), math.ceil(n_per_arm(0.0128, 0.010, power=0.90)))
# 3541 2016
print(math.ceil(n_per_arm(0.0128, 0.0064)), math.ceil(n_per_arm(0.128, 0.100)))
# 0.091 — power with 1 000 per arm
print(round(power_at(0.0128, 0.010, 1000), 3))
# statsmodels (the notebook): proportion_effectsize(0.0128, 0.010);
# zt_ind_solve_power(effect_size=h, alpha=0.05, power=0.80)
# Excel:
# =2*((NORM.S.INV(0.975)+NORM.S.INV(0.8))/(2*ASIN(SQRT(0.0128))-2*ASIN(SQRT(0.01))))^2
# → 22 481
```

Change one input at a time from the base case (FPD 1.28 % → 1.00 %, α 5 %, power 80 %):

| Input changed | Loans per arm | What it does |
|---|---|---|
| none — the base case | **22 481** | — |
| α 1 % (stricter) | 33 452 | stricter α → more loans |
| α 10 % (= one-sided 5 %) | 17 709 | looser α → fewer loans |
| power 90 % | 30 096 | more power → more loans |
| effect twice as large: 1.28 → 0.64 % | 3 541 | bigger effect → far fewer (n ∝ 1 / h²) |
| a frequent outcome: 12.8 → 10.0 % (the same −22 %) | 2 016 | a rate far from 0 % → about 11 times fewer |
| n fixed at 1 000 per arm | power **9.1 %** | the test misses a real effect 91 times in 100 |

Detecting FPD falling from 1.28 % to 1.00 % needs 22 481 loans in each arm; with 1 000 per arm the test has a 9 % chance of noticing.

**When you use it.**
- Before every experiment: "how many loans do we need?" and "how long will that take at our volume?".
- Before reading a "not significant": was the test able to see the effect at all?

> ⚠️ **Watch out.** Rare outcomes are expensive to test. A −22 % effect on a 1.28 % rate needs 22 481 loans per arm; the same −22 % on a 12.8 % rate needs 2 016.

### MDE and the power curve — what can this test see?

**What it is.** Turn the sample-size question round. With n fixed, the **minimum detectable effect** (*минимальный детектируемый эффект*, MDE) is the smallest true change the test detects with 80 % power. The **power curve** shows power against n for one effect.

```pic
{"id": "w06d4-pic3", "title": "Power grows with n — far faster for a frequent metric", "caption": "Power to detect the SMS effect, by loans per arm (α 5 %). Teal: FPD30 falling from 1.28 % to 1.00 % — only 46.4 % with 10 000 per arm. Amber: \"late at all\" falling from 13.3 % to 10.7 % — 73.9 % already at 2 000.", "chart": {"type": "bars", "labels": ["2 000", "2 000", "5 000", "5 000", "10 000", "10 000", "30 000", "30 000"], "values": [13.3, 73.9, 26.2, 98.4, 46.4, 100.0, 89.9, 100.0], "tone": ["a", "b", "a", "b", "a", "b", "a", "b"], "show": true, "unit": "%", "note": "x: loans per arm · teal FPD30 · amber late at all"}}
```

**How to write it.** `mde_rate` and `power_at` from the calculator:

```python
# [0.26, 0.48, 0.87, 1.0]
print([round(100 * mde_rate(0.0128, n), 2) for n in (1000, 2000, 10000, 22481)])
ns = [1000, 2000, 5000, 10000, 22481, 30000]
# FPD30 1.28 → 1.00 %
print([round(100 * power_at(0.0128, 0.010, n), 1) for n in ns])
# late at all 13.3 → 10.7 %
print([round(100 * power_at(947 / 7099, 0.8 * 947 / 7099, n), 1) for n in ns])
```

| loans per arm | 1 000 | 2 000 | 5 000 | 10 000 | 22 481 | 30 000 |
|---|---|---|---|---|---|---|
| MDE from 1.28 % FPD | 0.26 % | 0.48 % | 0.73 % | 0.87 % | 1.00 % | — |
| power, FPD30 1.28 → 1.00 % | 9.1 % | 13.3 % | 26.2 % | 46.4 % | **80.0 %** | 89.9 % |
| power, late at all 13.3 → 10.7 % | 45.2 % | **73.9 %** | 98.4 % | ≈ 100 % | ≈ 100 % | ≈ 100 % |

With 1 000 loans per arm the SMS must cut FPD from 1.28 % to 0.26 % — by 80 % — before the test reliably sees it.

**When you use it.**
- When n is fixed by the business (a month of loans, one region): say what the test *can* see before it runs.
- When you compare metrics: the same SMS judged on a frequent metric reaches 80 % power with ten times fewer loans.

> 💡 **Key idea.** If the MDE is larger than any effect the change could plausibly have, the test cannot succeed. A test with 9 % power is not a cheap test; it is a test whose "no effect" answer is already written.

**Your turn.** With 5 000 loans per arm, how low must the SMS arm's FPD rate fall to be detected (α 5 %, power 80 %)? Use `mde_rate`, answer in % to 2 decimals.

```task
{"id": "w06d4-l9", "kind": "number", "answer": 0.73, "dp": 2, "unit": "%", "hint": "100 * mde_rate(0.0128, 5000)", "model": "0.73 % — a 43 % cut from 1.28 %. Still far more than an SMS reminder is likely to achieve."}
```

### Effect size — how big the difference is

**What it is.** An **effect size** (*размер эффекта*) says **how big** a difference is, in units that do not grow with n. A p-value says only whether the difference could be chance; with enough data a tiny difference becomes "significant".

- For means: **Cohen's d** (*d Коэна*) = difference of the means / pooled standard deviation. Rough guide: 0.2 small, 0.5 medium, 0.8 large.
- For rates: the **difference in points** (p₁ − p₂), the **relative risk** RR = p₁ / p₂ (*относительный риск*), and Cohen's h (for power).

**How to write it.**

```python
# difference of means in pooled standard deviations
def cohens_d(a, b):
    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)
    sp = math.sqrt(((len(a) - 1) * a.var(ddof=1) + (len(b) - 1) * b.var(ddof=1)) / (len(a) + len(b) - 2))
    return (a.mean() - b.mean()) / sp
# -0.042 — Welch p = 0.02, yet the effect is nothing
print(round(cohens_d(auto, sme), 3))
gr = x.groupby("risk_grade")["days_late"]
# 0.7 — grade D vs grade A: a real difference
print(round(cohens_d(gr.get_group("D"), gr.get_group("A")), 2))
pa, pb = f.loc[f.channel == "app", "fpd30"].mean(), f.loc[f.channel == "branch", "fpd30"].mean()
# 0.66 1.63 0.057
print(round(100 * (pa - pb), 2), round(pa / pb, 2), round(cohens_h(pa, pb), 3))
```

| Comparison | p-value | Effect size | Reading |
|---|---|---|---|
| days late, Auto vs SME | 0.0195 | d = −0.04 | significant, negligible |
| days late, grade D vs A | ≈ 0 | d = 0.70 | large |
| FPD, app vs branch | 0.032 | +0.66 points, RR 1.63 | 6.6 extra FPDs per 1 000 loans; 63 % more often |

Auto and SME differ by 0.04 standard deviations — significant only because there are 12 910 payments; grade D pays 0.7 standard deviations later than grade A, a difference a collector can feel.

**When you use it.**
- In every result you report, next to the p-value.
- In power calculations: the effect size is the input that drives n.

> ⚠️ **Watch out.** "Highly significant" is not "large". Report the difference in the business's units (days, points, soum, RR) with its interval; the p-value only says it is probably not chance.

**Your turn.** Grade C payments average +1.05 days late, grade B −0.31; the pooled standard deviation is 6.44 days. What is Cohen's d (C minus B), to 2 decimals?

```task
{"id": "w06d4-l10", "kind": "number", "answer": 0.21, "dp": 2, "unit": "standard deviations", "hint": "(1.05 − (−0.31)) / 6.44", "model": "1.36 / 6.44 = 0.21 — a small effect, though with 38 238 payments its p-value is essentially 0."}
```

### The A/A test

**What it is.** An **A/A test** (*A/A-тест*) splits units into two groups that get the **same** treatment and runs the planned analysis. With nothing different, it should come out "significant" about α of the time. It checks the experiment system — the random split, the logging, the metric pipeline, the test — before a real A/B test trusts it.

**How to write it.** Split real FPD loans into two random groups of 2 000, 2 000 times, and count the false alarms:

```python
g = np.random.default_rng(2026)
y_all, hits = f["fpd30"].to_numpy(), 0
for _ in range(2000):
    # 4 000 real loans: the first 2 000 are "A", the rest "A" again
    s = g.choice(y_all, 4000, replace=False)
    ka, kb = s[:2000].sum(), s[2000:].sum()
    pool = (ka + kb) / 4000
    hits += abs(ka - kb) / 2000 / math.sqrt(pool * (1 - pool) * 2 / 2000) > 1.96
# ≈ 0.05 (the notebook's run: 0.049) — about α, as it should be
print(hits / 2000)
```

About 5 % of the A/A splits come out "significant" (the notebook: 4.9 %) — that is α, so the split and the test behave.

**When you use it.**
- Before the first A/B test on a new system, and after any change to how units are assigned or logged.
- A false-positive rate well above α (say 15 %) means a broken split or a wrong test, not bad luck.

**Your turn.** An A/A test, run 1 000 times on the new experiment platform, comes out "significant" 15 % of the time. What does that mean?

```task
{"id": "w06d4-l11", "kind": "choice", "options": ["Nothing — 15 % is close enough to 5 %", "The SMS works even in the A/A test", "Something in the system is broken: the split, the logging or the test. Fix it before any A/B test", "Use α = 15 % from now on"], "answer": 2, "explain": "In an A/A test nothing differs, so 'significant' should appear about α = 5 % of the time. Three times that is a broken split (for example, by branch or by time) or a test that ignores clustering."}
```


### Putting it together

One request, several of today's tools. *"Micro payments look late. Is Micro really different from each other product, and by how much?"*

```python
micro = x.loc[x.code == "MICRO", "days_late"]
others = ["CONS", "BNPL", "AUTO", "SME"]
res = pd.DataFrame(
    [(c, *mann_whitney(micro, x.loc[x.code == c, "days_late"])[1:], cohens_d(micro, x.loc[x.code == c, "days_late"])) for c in others],
    columns=["vs", "P(Micro later)", "p", "d"])
# four pairwise tests → correct for four
res["holm"] = holm(res["p"])
# P 0.52–0.53, every Holm p below 1e-6, d 0.08–0.12
print(res.round({"P(Micro later)": 3, "d": 3}))
```

Read it with the questions from this section:

1. **Which test?** Days late are skewed and the question is about the typical payment → ranks. Five groups → **Kruskal–Wallis** first: H = 61.0, p = 1.8 × 10⁻¹² — some product differs.
2. **Which one?** Four pairwise **Mann–Whitney** tests, Micro against each other product.
3. **Four tests, one family** → **Holm**. All four stay below 10⁻⁶.
4. **How big?** **Effect size**: a Micro payment is later than another product's 52–53 % of the time, d = 0.08–0.12. Real, consistent and small: worth a reminder on Micro loans, not a pricing change.

### Depth (optional)

**Videos (free, YouTube; each link opens at the right minute):**

- ▶ Mann–Whitney — [Mann-Whitney U Test [Simply explained] (numiqo), 00:23](https://youtu.be/LcxB56PzylA?t=23)
- ▶ Wilcoxon signed-rank and the other rank tests — [Non-parametric tests - Sign test, Wilcoxon signed rank, Mann-Whitney (zedstatistics), 11:26](https://youtu.be/IcLSKko2tsg?t=686&end=1230)
- ▶ Multiple comparisons — [The Bonferroni Correction - Clearly Explained (Steven Bradburn), 01:31](https://youtu.be/HLzS5wPqWR0?t=91)
- ▶ Multiple comparisons and false discovery rate — [False Discovery Rates, FDR, clearly explained (StatQuest), 12:28](https://youtu.be/K8LQSvtjcEo?t=748)
- ▶ Statistical power — [Statistical Power, Clearly Explained!!! (StatQuest), 03:19](https://youtu.be/Rsc5znwR5FA?t=199&end=297)
- ▶ Power and sample size calculation — [Power Analysis, Clearly Explained!!! (StatQuest), 11:48](https://youtu.be/VX_M3tIyiYk?t=708&end=910)
- ▶ Power calculations (also p-hacking) — [p-hacking and power calculations (StatQuest), 14:12](https://youtu.be/UFhJefdVCjE?t=852)

- RU deck (TBC Data Analytics 2.0, if you have it) `Непараметрические тесты_latest.pdf` (lesson 5.5): normality checks and log-transform pp. 9–12, which test to choose pp. 13–14, ranks and Mann–Whitney pp. 15–16, Wilcoxon for paired samples pp. 17–18, Kruskal–Wallis p. 19, bootstrap pp. 20–21, power p. 22, MDE p. 23, A/A tests p. 24. Multiple comparisons: `Параметрические тесты (2).pdf` pp. 47–49 (Bonferroni, Tukey HSD).
- Notebooks: `non-parametric.ipynb` (sample-mean normality, Mann–Whitney on exponential data, Wilcoxon, Kruskal–Wallis, bootstrap), `power.ipynb` (power by simulation: 1 000 t-tests on a 1 % shift — the same idea as our simulation cell). `стат_критерии.docx` is a reading list (Habr / YouTube articles on test choice, Mann–Whitney pitfalls, sample size); the card in section 2 is our own.
- *Russian terms:* непараметрический критерий = non-parametric test, ранг = rank, U-критерий Манна–Уитни = Mann–Whitney U, критерий Вилкоксона = Wilcoxon signed-rank, критерий Краскела–Уоллиса = Kruskal–Wallis, перестановочный тест = permutation test, точный критерий Фишера = Fisher's exact test, множественные сравнения = multiple comparisons, поправка Бонферрони / Холма = Bonferroni / Holm correction, мощность = power, объём выборки = sample size, MDE (минимальный детектируемый эффект) = minimum detectable effect, A/A-тест = A/A test.

**Questions inside the videos.** Open a video from the panel: it stops at these points and asks one question about the bit you just watched.

```videoquiz
{"video": "LcxB56PzylA", "stops": [
  {"at": 150, "q": "What does the Mann–Whitney U test work with?", "options": ["The raw values", "The ranks of the values, both groups pooled", "The means and the variances", "Only the medians"], "answer": 1, "explain": "A 60-day payment is simply 'the highest rank' — that is why outliers do not dominate."},
  {"at": 400, "q": "When is Mann–Whitney the natural choice over a t-test?", "options": ["Large, normal samples", "Paired data", "Three or more groups", "Small or skewed samples, or a question about the typical value"], "answer": 3, "explain": "Days late: skew ≈ 5, the same median — and the question 'is a typical payment later?'."}]}
```

```videoquiz
{"video": "IcLSKko2tsg", "stops": [
  {"at": 850, "q": "The Wilcoxon signed-rank test is for…", "options": ["paired data — it ranks the absolute differences and compares positive with negative ranks", "two independent groups", "three or more groups", "counts in a table"], "answer": 0, "explain": "The ten branches, 2025 vs 2026: W = 7, p = 0.037."},
  {"at": 1100, "q": "Compared with the sign test, Wilcoxon uses…", "options": ["only the signs of the differences", "the signs and the sizes (ranks) of the differences", "the means", "nothing extra"], "answer": 1, "explain": "More information from the same differences — so more power."}]}
```

```videoquiz
{"video": "HLzS5wPqWR0", "stops": [
  {"at": 200, "q": "Why is a correction needed when you run many tests?", "options": ["Each test becomes less accurate", "The chance of at least one false positive grows with the number of tests", "p-values get larger", "The data run out"], "answer": 1, "explain": "10 tests at 5 %: 40 % chance of at least one false alarm."},
  {"at": 400, "q": "Bonferroni for m tests:", "options": ["divide each p by m", "add m to each p", "compare each p with α / m (or multiply p by m)", "use α × m"], "answer": 2, "explain": "Bukhara among ten: 0.020 × 10 = 0.20 (Holm gives 0.199)."}]}
```

```videoquiz
{"video": "K8LQSvtjcEo", "stops": [
  {"at": 900, "q": "The false discovery rate controls…", "options": ["the chance of any false positive", "the type II error", "the power", "the expected share of false positives among the results you call significant"], "answer": 3, "explain": "BH: for screening hundreds of segments, where a few false leads are acceptable."},
  {"at": 1200, "q": "Compared with Bonferroni, Benjamini–Hochberg is…", "options": ["stricter", "less strict — it flags more results", "the same", "only for paired data"], "answer": 1, "explain": "It accepts some false discoveries in exchange for power."}]}
```


```videoquiz
{"video": "Rsc5znwR5FA", "stops": [
  {"at": 240, "q": "Statistical power is the probability of…", "options": ["rejecting H₀ when it is true", "getting p < 0.001", "correctly rejecting H₀ when the effect is real", "a type I error"], "answer": 2, "explain": "1 − β. Jasur's 2 000-loan SMS test: 9 %."},
  {"at": 290, "q": "Which change raises power?", "options": ["A smaller sample", "A larger sample", "A smaller effect", "A stricter α"], "answer": 1, "explain": "More n, a bigger effect or a looser α raise power."}]}
```

```videoquiz
{"video": "VX_M3tIyiYk", "stops": [
  {"at": 780, "q": "A power analysis tells you…", "options": ["the p-value you will get", "how many observations you need to detect an effect of a given size", "whether H₀ is true", "the effect size"], "answer": 1, "explain": "FPD 1.28 → 1.00 %: 22 481 per arm at 80 % power."},
  {"at": 890, "q": "When should the power analysis be done?", "options": ["Before collecting the data", "After the test, to explain a null result", "Only if p > 0.05", "Never for rates"], "answer": 0, "explain": "Before: it decides whether the test can answer at all."}]}
```

```videoquiz
{"video": "UFhJefdVCjE", "stops": [
  {"at": 1000, "q": "Adding observations to a test until p < 0.05 is…", "options": ["good practice", "p-hacking — it inflates the false-positive rate", "a power analysis", "a sequential design"], "answer": 1, "explain": "Peeking: monthly looks turned a 5 % test into a 21 % one."},
  {"at": 1300, "q": "How do you avoid it?", "options": ["Look more often", "Use a one-sided test", "Lower the sample size", "Fix the sample size with a power calculation before the test"], "answer": 3, "explain": "Fix n, the metric and the end date in advance."}]}
```


---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w06d4", "pass": 0.8, "questions": [
  {"type": "single", "q": "On the same Auto vs SME days late, Welch gives p = 0.02 and Mann–Whitney p = 0.32. Which is wrong?", "options": ["Mann–Whitney — it ignores the tail", "Welch — the data are skewed", "Both — run a third test", "Neither: Welch asks about the average days late, Mann–Whitney whether a typical payment is later"], "answer": 3, "explain": "Decide which question the business asks before choosing the test, never run both and quote the smaller p (→ section 1, 'When the t-test is wrong', P2)."},
  {"type": "single", "q": "What does the Mann–Whitney U test compare?", "options": ["The means", "The medians", "The variances", "Whether a random value from one group tends to be larger than one from the other — under H₀, P(X > Y) = ½"], "answer": 3, "explain": "It works on ranks and compares whole distributions; equal medians can still differ (→ section 1, 'Mann–Whitney U')."},
  {"type": "single", "q": "Which test do you report for this table?", "code": "t = [[4, 63], [2, 177]]          # partner vs branch, FPD / no FPD\nstats.chi2_contingency(t)[3]      # expected [[1.63, 65.37], [4.37, 174.63]]", "options": ["χ² without correction (p = 0.028)", "A t-test on the two rates", "Fisher's exact test — two expected counts are below 5", "χ² with Yates (p = 0.083)"], "answer": 2, "explain": "χ² is an approximation that needs expected counts ≥ 5; Fisher is exact at any n (→ section 1, 'Chi-square or Fisher', P7)."},
  {"type": "number", "q": "You run 10 independent tests at α = 5 % and nothing is real. What is the chance of at least one false alarm, in %?", "answer": 40.1, "tol": 0.2, "explain": "1 − 0.95¹⁰ = 40.1 % — the family-wise error rate; Holm or Bonferroni bring it back to 5 % (→ section 1, 'Multiple comparisons')."},
  {"type": "single", "q": "What does this return?", "code": "multipletests([0.0318, 0.153, 0.804], method=\"holm\")[1]", "options": ["[0.0954, 0.306, 0.804]", "[0.0318, 0.153, 0.804]", "[0.0106, 0.051, 0.268]", "[0.0954, 0.459, 1.0]"], "answer": 0, "explain": "Holm: the smallest × 3, the next × 2, the last × 1, keeping the running maximum; [0.0954, 0.459, 1.0] is Bonferroni (→ P8)."},
  {"type": "multi", "q": "Power depends on…", "options": ["α", "the noise — for a rate, how close it is to 0 %", "the p-value you observed", "n", "the seed of the simulation", "the effect size"], "answer": [0, 1, 3, 5], "explain": "Power is fixed before the data: α, effect, n and variability; rare outcomes like FPD are expensive to test (→ section 1, 'Power and sample size')."},
  {"type": "single", "q": "You look at a running experiment every month and stop at the first p < 0.05. What happens to the 5 % false-positive rate?", "options": ["It grows: in the simulation one look gave 5 %, monthly looks about 21 %", "It falls, because you stop earlier", "It becomes exactly 10 %", "Nothing — each look is a 5 % test"], "answer": 0, "explain": "Each look is another test; fix the sample size and the end date in advance, or use a sequential design (→ section 1, 'Peeking')."},
  {"type": "single", "q": "Company corner: the 2 000-loan SMS test has 9 % power for FPD 1.28 → 1.00 %. What would a 'not significant' result mean?", "options": ["Almost nothing — the test would miss a real effect 91 % of the time; change the metric (first instalment paid late) or decide on cost", "Run it again with 2 000 more loans and it will be significant", "The SMS does not work", "FPD rose"], "answer": 0, "explain": "Never read a null result from an underpowered test as 'no effect' (→ Company corner)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w06d4", "q": "Jasur takes option 1 — primary metric 'first instalment paid late at all' (947 / 7 099 = 13.34 % today) — but he can only wait six months: 337 new loans a month (January–September 2026), split evenly, so 1 011 loans per arm. With Cohen's h, two-sided α = 5 % and 80 % power, what is the LOWEST late rate the SMS arm must reach for this test to detect it (the MDE as a rate)? Give a percentage to 3 decimals.", "type": "number", "dp": 3, "python": true, "h": ["2c3dbc0bb304d536c1cf4748"], "hint": "Let the power solver give you the effect size for that n, then turn h back into a rate — h is a difference of 2·arcsin√p.", "sol": "aW1wb3J0IG51bXB5IGFzIG5wCmZyb20gc3RhdHNtb2RlbHMuc3RhdHMucG93ZXIgaW1wb3J0IHp0X2luZF9zb2x2ZV9wb3dlcgpwMSA9IDk0NyAvIDcwOTkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIDAuMTMzNDAKaCA9IHp0X2luZF9zb2x2ZV9wb3dlcihub2JzMT0xMDExLCBhbHBoYT0wLjA1LCBwb3dlcj0wLjgwKSAgICAgICAgIyAwLjEyNDYKcDIgPSBucC5zaW4obnAuYXJjc2luKG5wLnNxcnQocDEpKSAtIGggLyAyKSAqKiAyICAgICAgICAgICAgICAgICAjIDAuMDkzOTgKIyBjaGVjazogTm9ybWFsSW5kUG93ZXIoKS5wb3dlcihwcm9wb3J0aW9uX2VmZmVjdHNpemUocDEsIHAyKSwgbm9iczE9MTAxMSwgYWxwaGE9MC4wNSkg4oaSIDAuODAKCk1ERSA5LjM5OCAlOiBpbiBzaXggbW9udGhzIHRoZSB0ZXN0IGNhbiBvbmx5IHNlZSB0aGUgbGF0ZSByYXRlIGZhbGxpbmcgZnJvbSAxMy4zNCAlIHRvIGFib3V0IDkuNCAlIOKAlCBhIDMwICUgcmVsYXRpdmUgY3V0LCBoYWxmIGFzIGxhcmdlIGFnYWluIGFzIHRoZSAyMCAlIHRoYXQgbWFya2V0aW5nIGhvcGVzIGZvci4KU28gZXZlbiBvbiB0aGUgZnJlcXVlbnQgbWV0cmljLCBhIHNpeC1tb250aCB0ZXN0IGlzIHVuZGVycG93ZXJlZCBmb3IgYSByZWFsaXN0aWMgZWZmZWN0ICh0aGUgMjAgJSBjdXQgbmVlZHMgMiAzMjQgcGVyIGFybSwgYWJvdXQgMTQgbW9udGhzKS4KVGhlIGhvbmVzdCBvcHRpb25zIHN0YXkgdGhlIHNhbWU6IHJ1biBsb25nZXIgb24gYWxsIG5ldyBsb2FucyB3aXRoIGEgZml4ZWQgZW5kIGRhdGUsIHVzZSBkYXlzIGxhdGUgYXMgYSBjb250aW51b3VzIG91dGNvbWUsIG9yIGRlY2lkZSBvbiBjb3N0Lg=="}
```

<!-- challenge:end -->
