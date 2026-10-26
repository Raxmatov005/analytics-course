# Week 4 · Day 5 — Checkpoint: cleaned dataset + one-page report

<span class="badge">Part A 60 min</span> <span class="badge">Part B 90 min</span> <span class="badge">Interview 30 min</span> <span class="badge hw">Checkpoint · 100 points</span>

> STORY **Friday, 9:00.** Madina, with Nilufar's two CSVs on a USB stick and Monday's agenda. *"Here is Monday's export, as it comes: dirty. By 15:00 I want **one workbook**: the two files cleaned by a pipeline I can refresh, and the board page built on the clean data — pivots, three charts, the six tiles, and five sentences I can read aloud. Then eight questions, because Bekzod's team is interviewing an Excel analyst next week and you are on the panel."*

## Today in 3 lines

- **Part A (40 pts):** `customers_dirty.csv` and `payments_dirty.csv` → clean sheets through a **Power Query** (or Sheets formula) pipeline, counts matching the known numbers, with a change log.
- **Part B (40 pts):** the **one-page board report** on the clean data — pivots, three charts, six tiles, a five-sentence findings note.
- **Part C (20 pts):** **eight interview questions** on the week, answered in writing as you would say them aloud.

**Rules.** Open book: your pages, your files, the workbook. Closed: the model-answer folds until you submit. Submit to **`submissions/week-04/day-5/`**: `checkpoint.xlsx` (sheets `Raw_Customers`, `Raw_Payments` untouched; `customers_clean`, `payments_clean`, `installments_paid`; `Data` with the pivots; `OnePager`; `Checks`), `change_log.md`, `findings.md` (the five sentences), `interview.md`. Also due today: **HW 4.2** in `day-3/`. Sheets users: one spreadsheet with the same tabs, exported to `.xlsx` **and** the share link in `README.md`; formulas stay visible in the export. As of **2026-10-01** everywhere; a cell on `OnePager` says so.

**Working method.** Raw stays raw. Every clean table ends in a check cell against a number you know. Every tile has a one-line definition under it. Every chart title is a finding. Count rows after every merge. Refresh All before you save — if a number changes, something was pasted.

**Time plan** (the reviewer's, as a suggestion):

| When | What | Deliverable |
|---|---|---|
| 9:00–9:15 | copy the CSVs into a fresh folder, open a new workbook, load `installments.csv` and the two dirty files as queries | the `Source` steps |
| 9:15–10:00 | Part A — `customers_clean`, `payments_clean`, `installments_paid`, the `Checks` sheet | counts TRUE |
| 10:00–10:15 | `change_log.md`, ten lines, while the steps are fresh | the log |
| 10:15–11:45 | Part B — six pivots on `Data`, tiles, three charts, slicer, layout | `OnePager` |
| 11:45–12:00 | Refresh All, re-check, `findings.md` | five sentences |
| 13:00–13:30 | Part C | `interview.md` |
| 13:30–14:00 | reread the rubric, fix titles and formats, push | the folder |

**Known numbers** — everything you can check against, on one card (all as of 2026-10-01):

| Thing | Number |
|---|---|
| customers: raw rows → clean rows; duplicate rule; invalid birth dates | 6 040 → **6 000**; phone + birth_date; **7** (ids 927, 957, 964, 1020, 2338, 2934, 3380) |
| payments: raw → clean; Σ raw → Σ clean; duplicates removed and their Σ | 52 875 → **52 850**; 255 173 169 976 → **255 114 772 176**; 25 · 58 397 800 |
| methods: raw distinct → clean distinct; dirty rows | 10 → **5**; **180** |
| clean method counts | card 17 612 · payme 8 897 · cash 8 788 · click 8 786 · transfer 8 767 |
| forward-dated payments | 24 · 53 438 947 |
| instalments; matured; matured not fully paid | 92 193; 54 207; **1 784** |
| loans; active; with a balance; dpd > 0 | 7 828; 3 352; 3 409; 399 |
| buckets 0 / 1-30 / 31-60 / 61-90 / 90+ | 7 429 / 124 / 25 / 16 / 234 |
| outstanding; PAR30; NPL90 | **208 723 504 430**; 6 507 526 953 = **3.12 %**; 5 319 475 527 = **2.55 %** |
| outstanding by product | SME 125 892 942 411 (60.3 %) · Auto 57 684 271 333 (27.6) · Consumer 23 054 933 316 (11.0) · BNPL 1 135 251 000 (0.5) · Micro 956 106 370 (0.5) |
| disbursements 2026 (through as-of); September; October | 3 051 / 162 333 060 000; 361 / 17 015 490 000; 21 / 852 760 000 |
| top-5 branches | Tashkent Central 28.72 bn · Tashkent South 26.79 · Tashkent North 26.18 · Fergana Central 24.80 · Samarkand Central 24.66 = 62.8 % |
| FPD30 by vintage (first instalment) | May 7/377 = 1.86 % · Jun 3/373 = 0.80 % · **Jul 4/367 = 1.09 %** · Aug not mature |
| collection rate (instalment basis, paid by as-of) | Jun 96.9 · Jul 96.7 · Aug 96.5 · **Sep 94.1 %** (15 982 118 926 / 16 987 977 718) |

**Common mistakes from this week** (each costs the number point): Remove Duplicates on the raw names (24, not 40); the two namesakes deleted (5 998 rows); a pivot on a fixed range; `Average` where a ratio of sums was meant; October's one day plotted as a month; a `#N/A` hidden with `IFERROR(…, 0)` and summed; tiles typed as numbers; a dual axis nobody asked for.

---

## Part A — The cleaning pipeline (60 min, 40 pts)

Twenty points per file: 8 for the row and value counts, 6 for the pipeline being recorded and refreshable (the reviewer presses Refresh All on a copy of the CSVs), 6 for the change log line that explains each step with its count.

| Criterion | customers_clean | payments_clean | Points |
|---|---|---|---|
| rows | 6 000 | 52 850 | 2 + 2 |
| the four data problems handled | 40 duplicates on phone + birth_date; 7 dates flagged and blanked | 25 duplicates on three columns; 180 method rows → 5 values | 3 + 3 |
| nothing destroyed | 2 namesakes kept; income blanks kept as null (354 after the dedup); raw sheets untouched | 24 forward-dated rows kept and flagged; raw untouched | 3 + 3 |
| recorded and refreshable | Applied Steps renamed; Refresh All reproduces | same; `installments_paid` merge keeps 92 193 rows | 6 + 6 |
| change log | one line per change, with counts and money | | 6 (shared) |

**Sheets route** (same points): a `Raw_*` tab per CSV imported untouched; a `*_clean` tab built entirely by formulas — `=ARRAYFORMULA(PROPER(TRIM(Raw_Customers!B2:B)))`, a key column, `=UNIQUE(FILTER(…))` or `SORTN(range, 9^9, 2, key_col, TRUE)` (the *remove duplicates* mode of `SORTN`) for the dedup, `IF(OR(E2>DATE(2026,10,1), E2<DATE(1920,1,1)), TRUE, FALSE)` for the flag; the `Checks` tab the same as Excel's. Re-import the CSV over the raw tab to "refresh". State in `change_log.md` that the pipeline is formula-based.

**The step map** — every hand tool from Wednesday has a recorded equivalent; the checkpoint wants the right-hand column:

| You discovered it with | You deliver it as |
|---|---|
| `TRIM`, `PROPER` in a helper column | Transform → Format → Trim, Capitalize Each Word |
| Ctrl+H `bank transfer` → `transfer` | Replace Values (match entire cell) |
| key + `COUNTIFS` > 1 | Remove Duplicates on the key columns, after a Sort |
| `age` column, filter < 18 or > 100 | Custom column flag + Conditional column blanking the date |
| Text to Columns on a datetime | Split Column → By Delimiter, or Changed Type → Date |
| `SUMIFS` per instalment over payments | Group By (Sum, Min) + Merge Queries (Left Outer) |
| a second file pasted under the first | Append Queries |
| "I did it again on Monday" | Refresh All |

### A1. `customers_clean` (20 pts)

Deliver: 6 000 rows; `first_name`, `last_name` trimmed and capitalised; duplicates removed on `phone` + `birth_date`, keeping the row with the earlier `registered_at`; `birth_date_invalid` (TRUE for 7); `birth_date_clean` (blank for those 7); `age` as of 2026-10-01 from `birth_date_clean`; `monthly_income` numeric with blanks kept as null.

<details><summary>Model answer</summary>

```
Source                 From Text/CSV → customers_dirty.csv
Promoted Headers
Changed Type           customer_id, monthly_income → Whole Number (blanks become null); birth_date, registered_at → Date; phone → Text
Trim names             select first_name, last_name → Transform → Format → Trim
Capitalize names       → Format → Capitalize Each Word
Flag bad birth dates   Add Column → Custom: birth_date_invalid = [birth_date] > #date(2026,10,1) or [birth_date] < #date(1920,1,1)
Clean birth date       Add Column → Conditional: birth_date_clean = if birth_date_invalid = true then null else [birth_date]
Age                    Add Column → Custom: age = if [birth_date_clean] = null then null else Date.Year(#date(2026,10,1)) - Date.Year([birth_date_clean]) - (if Date.DayOfYear(#date(2026,10,1)) < Date.DayOfYear([birth_date_clean]) then 1 else 0)
Sort                   registered_at ascending   (so Remove Duplicates keeps the original, not the later copy)
Remove duplicates      select phone, birth_date → Remove Rows → Remove Duplicates          6 040 → 6 000
Close & Load To        Table customers_clean
```

Checks on `Checks`: `=ROWS(customers_clean)` → **6 000**; `=COUNTIFS(customers_clean[birth_date_invalid], TRUE)` → **7**; `=MAX(customers_clean[customer_id])` → 6 000 (no id above 6 000 survives — every duplicate was the *later* registration; if you get 6 0xx you did not sort first); `=COUNTBLANK(customers_clean[monthly_income])` → 354 (the raw file has 356; two blanks belonged to removed duplicates — and 0 if you typed blanks as 0: wrong — a zero income is a statement, a blank is a gap); `=ROWS(UNIQUE(customers_clean[phone]))` → 5 997; `=COUNTIFS(customers_clean[first_name], "*Bobur*")` returns the same whether or not a space followed. Namesakes 823/1197 and 2460/5562 are both present. Average age of valid rows 45.2.

Change-log lines (5 of the 10): *Trimmed and capitalised first_name/last_name — 18 trailing spaces, 22 all-caps first names, 40 lower-case surnames fixed* · *Flagged 7 impossible birth dates (3 × 1900-01-01, 3 × 2031-04-12, 1 × 2027-02-28) and blanked birth_date_clean for them; no value invented* · *Removed 40 duplicate customers on phone + birth_date, keeping the earlier registration (ids 6001–6040 dropped); 6 040 → 6 000* · *Kept 2 name-and-birth-date namesakes (823/1197, 2460/5562) — different phones and regions* · *monthly_income typed numeric, blanks kept as null (356 raw, 354 after the dedup).*
</details>

### A2. `payments_clean` (20 pts)

Deliver: 52 850 rows; `method` in five values (`card`, `cash`, `transfer`, `payme`, `click`); duplicates removed on `installment_id` + `paid_at` + `amount`, keeping the lower `payment_id`; `is_forward_dated` TRUE for the 24 rows after 2026-10-01 (kept); and `installments_paid` = `installments.csv` merged with the per-instalment sum of clean payments through the as-of date.

<details><summary>Model answer</summary>

```
payments_clean
  Source → Promoted Headers → Changed Type (ids, amount → Whole Number; paid_at → Date; method, product, region → Text)
  Trim method → lowercase method → Replace Values "bank transfer" → "transfer" (entire cell)
  Sort payment_id ascending → Remove Duplicates on installment_id, paid_at, amount           52 875 → 52 850
  Add Column → Custom: is_forward_dated = [paid_at] > #date(2026,10,1)
  Close & Load To → Table

paid_by_installment  (reference payments_clean)
  Filter paid_at <= 2026-10-01 → Group By installment_id: paid = Sum(amount), first_paid = Min(paid_at)   → Connection only

installments_paid
  Source installments.csv → types → Merge Queries paid_by_installment, Left Outer on installment_id → expand paid, first_paid
  → Replace null → 0 in paid → Add Column → Date → Month → Start of Month (due_date) as due_month → Close & Load To → Table
```

Checks: `=ROWS(payments_clean)` → **52 850**; `=SUM(payments_clean[amount])` → **255 114 772 176**; `=ROWS(UNIQUE(payments_clean[method]))` → **5**; counts card 17 612 · payme 8 897 · cash 8 788 · click 8 786 · transfer 8 767; `=COUNTIFS(payments_clean[is_forward_dated], TRUE)` → **24** (Σ 53 438 947); `=ROWS(installments_paid)` → **92 193** (Left Outer kept every instalment); `=COUNTIFS(installments_paid[due_date], "<="&DATE(2026,10,1), …)` with `paid < total_due` via `SUMPRODUCT` → **1 784**; instalments with `paid > total_due` → **0** (it was 25 before the dedup — the duplicates were the only over-payments).

Change-log lines: *Trimmed, lower-cased method and replaced "bank transfer" with "transfer" — 180 rows (Card 57, Click 36, PayMe 30, "CASH " 30, bank transfer 27) → 5 values* · *Removed 25 exact duplicate payments on installment_id + paid_at + amount, Σ 58 397 800, keeping the lower payment_id; 52 875 → 52 850* · *Flagged 24 payments dated after 2026-10-01 (Σ 53 438 947) as forward-dated; kept, excluded from as-of sums* · *Built installments_paid: 92 193 instalments left-joined to clean payments through 2026-10-01; 1 784 matured instalments not fully paid* · *Source path: data/excel/; Refresh All re-runs everything.*
</details>

---

## Part B — The one-page board report (90 min, 40 pts)

Points: tiles 12 (2 each: right number **and** a definition line), charts 12 (4 each: right type, honest axes, finding title), pivots and refreshability 8 (built on the clean tables, slicer connected, Refresh All leaves the page unchanged), findings note 8 (five sentences, each with a number and a *so what*).

Build on **`customers_clean` / `payments_clean` / `installments_paid` / `tblLoans`** — the Loans sheet is already clean (it was built from the de-duplicated payments), which the note should say.

| Element | Must have | Points |
|---|---|---|
| Tile 1 Outstanding | 208 723 504 430 from a formula / `GETPIVOTDATA`; definition line | 2 |
| Tile 2 Disbursements MTD | 21 / 852 760 000 with "1 day" and September beside it | 2 |
| Tile 3 PAR30 | 3.12 %, `SUMIFS(dpd > 30) / total` | 2 |
| Tile 4 NPL90 | 2.55 %, 234 loans | 2 |
| Tile 5 FPD30 | 1.09 % for July 2026, with the vintage named and the maturity rule | 2 |
| Tile 6 Collection rate | 94.1 % for September, basis stated | 2 |
| Chart 1 by product | bar, sorted, from zero, finding title | 4 |
| Chart 2 by month | line (or column), October excluded or marked, trend, finding title | 4 |
| Chart 3 buckets or top-5 | stacked column (dpd > 0) **or** top-5 bar + Others; finding title | 4 |
| Pivots and refresh | on Tables / queries; slicer connected; Refresh All changes nothing; a Checks block | 8 |
| Findings note | five sentences, each with a number and a consequence | 8 |

**Sheets route:** pivots from Insert → Pivot table on the clean tabs (`Show as % of grand total` where needed; a `due_month` column added to `installments_paid` by formula since Sheets pivots do not group dates); `QUERY` for the top-5 (`order by sum(K) desc limit 5`); charts from the pivot ranges; Data → Add a slicer on `region`; tiles with `GETPIVOTDATA` or `SUMIFS`; `=SPARKLINE()` under the tiles. Set the sheet to landscape in File → Print, and export the one page to PDF as a second deliverable.

**Building order** (so a half-finished page is still a page):

1. `Data` sheet: the product pivot and the bucket pivot (both on `tblLoans`) — ten minutes, and tiles 1, 3, 4 already have their numbers.
2. `OnePager`: title, as-of, the six tile labels and definition lines; fill tiles 1–4 by `SUMIFS` / `GETPIVOTDATA`.
3. The three charts from the two pivots plus `monthly_disbursements.csv` as a query; titles last.
4. The collection pivot on `installments_paid` → tile 6. The FPD30 pivot → tile 5 (the longest step; if time runs out, write the definition and *n/a — see A2* in the tile and lose 2 points, not 20).
5. Slicer, Report Connections, the Checks block, Refresh All, print preview.
6. `findings.md` from the finished page — the sentences describe what is on it, not what you meant to build.

If you are stuck:

| Symptom | Likely cause | Fix |
|---|---|---|
| Group by Months greyed out | a text date in the column | Changed Type → Date in the query; look for a blank or `1900-01-01` |
| pivot shows 92 193 rows' worth | wrong source table | rebuild on `tblLoans` |
| `#N/A` in the FPD30 vintage lookup | `loan_id` typed as text on one side | Changed Type → Whole Number on both |
| Refresh All asks for the file | the CSV moved | Data → Data Source Settings → Change Source |
| tile shows `#REF!` after a slicer click | the item is filtered out | expected — clear the slicer; or `IFERROR(…, "filtered")` for *this* case only |
| chart ignores the slicer | not connected | right-click slicer → Report Connections |
| `payments_clean` is 52 875 after refresh | Remove Duplicates on all columns | select the three key columns before the step |
| `customers_clean` has ids above 6 000 | no Sort before Remove Duplicates | sort `registered_at` ascending first |

<details><summary>Model one-pager — cell by cell</summary>

**Sheet `Data`** (pivots and helpers, never printed):

- `A3` pivot **P_product**: Rows `product`; Values Sum `outstanding` (`#,##0`), Sum `outstanding` as % of Grand Total (`0.0%`), Count `loan_id`; sorted by outstanding descending. Grand Total 208 723 504 430.
- `A15` pivot **P_month**: from `monthly_disbursements.csv` (loaded as a query so it refreshes); Rows `month` (grouped Months + Years), Values Sum `amount`, Sum `loans`; filter `month < 2026-10-01` so October's one day is out. 33 rows.
- `A55` pivot **P_bucket**: `tblLoans`, Rows `product`, Columns `bucket`, Values Count `loan_id`, with `bucket` filtered to exclude `0`. Column totals 124 / 25 / 16 / 234.
- `A70` pivot **P_branch**: Rows `branch`, Values Sum `outstanding`, Value Filter Top 5, sorted descending; `A78` `="Others"`, `B78 =SUM(tblLoans[outstanding])-GETPIVOTDATA("outstanding",$A$70)` → 77 590 542 486.
- `A85` pivot **P_coll**: `installments_paid`, Rows `due_month`, Values Sum `total_due`, Sum `paid`, calculated field `rate = paid / total_due` (`0.0%`); filter 2026-06 … 2026-09. September 94.1 %.
- `A95` pivot **P_fpd**: `installments_paid` filtered `installment_no = 1`, plus two helper columns added to the query — `vintage` (`XLOOKUP` of the loan's `disbursed_at` from `tblLoans`, Start of Month) and `fpd30` (`if [paid] < [total_due] or [first_paid] > Date.AddDays([due_date], 30) then 1 else 0`); Rows `vintage`, Values Sum `fpd30`, Count `installment_id`, calculated `fpd_rate`. Rows May 7 / 377 / 1.86 % · June 3 / 373 / 0.80 % · **July 4 / 367 / 1.09 %** · August 15 / 358 — not mature (only 11 first instalments due by 2026-09-01), greyed.
- Slicer `region` connected to P_product, P_bucket, P_branch (not to P_month: the monthly file has no region).

**Sheet `OnePager`** (A4 landscape, Width 1 page, gridlines off):

- `A1` `="Nur Finance — loan portfolio as of "&TEXT(Lookup!B17,"d mmmm yyyy")` bold 16; `A2` *source: tblLoans (7 828 loans), payments de-duplicated (52 850), instalments 92 193; refreshed* `&TEXT(NOW(),"yyyy-mm-dd hh:mm")`.
- Tile strip `A4:L7`, six 2-column blocks; row 4 label, row 5 the number (size 20), row 6 the definition (size 8, grey), row 7 a sparkline where it helps:
  - **Outstanding** `=GETPIVOTDATA("outstanding",Data!$A$3)` → `208.7 bn` (`#,##0.0,,," bn"`); *principal due after the as-of date, all loans*; sparkline of month-end outstanding if you built week 3's series, else blank.
  - **Disbursed MTD** `=SUMIFS(tblLoans[principal],tblLoans[disbursed_at],">="&DATE(2026,10,1))` → `0.85 bn` with `=COUNTIFS(…)` → *21 loans · 1 day*; second line *Sep: 17.0 bn / 361*; sparkline of 2026 months from P_month.
  - **PAR30** `=SUMIFS(tblLoans[outstanding],tblLoans[dpd],">30")/C5` → **3.12 %**; *outstanding of loans > 30 DPD ÷ total*.
  - **NPL90** `=SUMIFS(tblLoans[outstanding],tblLoans[dpd],">90")/C5` → **2.55 %**; *outstanding of loans > 90 DPD ÷ total; 234 loans*.
  - **FPD30 (Jul 2026)** `=GETPIVOTDATA("fpd_rate",Data!$A$95,"vintage",DATE(2026,7,1))` → **1.09 %**; *first instalment unpaid or paid > 30 days late; newest vintage with all first dues ≥ 30 days old; 4 of 367*.
  - **Collection rate (Sep)** `=GETPIVOTDATA("rate",Data!$A$85,"due_month",DATE(2026,9,1))` → **94.1 %**; *paid by 2026-10-01 on instalments due in September ÷ due*.
- Charts, `A9:F24` and `G9:L24`, `A26:F41` and `G26:L41`:
  1. **Bar** from P_product, sorted, SME highlighted, labels in bn, no legend — *"SME is 60 % of the book on 10 % of the loans"*.
  2. **Line** from P_month, 33 points, 3-period moving-average trendline, y-axis `#,##0,,,` bn from 0 — *"Monthly disbursements grew from 4 bn to a 20 bn run-rate; read the 3-month average"*.
  3. **Stacked column** from P_bucket, 90+ red, others greys, legend kept (four series) — *"Consumer and Micro have the most late loans; 234 loans are 90+"*.
  4. **Bar** from P_branch + Others, largest on top — *"Three Tashkent branches, Fergana and Samarkand hold 63 % of outstanding"*.
  (Three charts are required; the fourth is the stretch — leave the collection-rate line out unless it fits.)
- `A43:L47` the five findings (below), `A49` the definitions footnote: *DPD = days since the oldest matured instalment not fully paid; payments de-duplicated on instalment + day + amount and taken through 2026-10-01; October excluded from the monthly series (one day); all amounts UZS.*
- `N1:N8` a hidden-from-print **Checks** block: `=GETPIVOTDATA("outstanding",Data!$A$3)=SUM(tblLoans[outstanding])` → TRUE; `=SUM(Data!B56:E60)=399` → TRUE (delinquent loans); `=ROWS(payments_clean)=52850`; `=ROWS(customers_clean)=6000`.

**`findings.md` — the five sentences:**

1. The book stands at **208.7 bn UZS** across 3 409 loans with a balance, growing about 7 bn a month while 17–22 bn is disbursed monthly — most new lending replaces fast repayments on short Micro, BNPL and Consumer terms.
2. **SME is 60.3 % of outstanding on 10.0 % of the loans** (Auto another 27.6 % on 5 %), so the balance sheet is decided by fewer than 500 large decisions a year (452 SME and Auto loans in 2025), not by the 2 669 Micro loans.
3. **PAR30 is 3.12 % and NPL90 2.55 %**: 5.3 of the 6.5 bn at risk is already past 90 days (234 loans, all defaulted or written off), so the delinquent book is old debt rather than a new wave; the live 1–90 caseload is 165 loans and 5.9 bn.
4. **FPD30 on the July 2026 vintage is 1.09 % (4 of 367)**, in line with the 1.28 % history; August is not yet readable and should not be shown.
5. **September's collection rate is 94.1 %** (15.98 of 16.99 bn due) against 96.5–97 % for earlier months — the latest month always reads low until it matures, and the 5.9 % unpaid is October's inflow to the 1–30 bucket.
</details>

---

## Part C — Eight interview questions (30 min, 20 pts)

Answer in writing, 3–5 sentences each, as you would say them aloud: 2 points per question (1 correct and complete, 1 with a Nur Finance example and number) plus 4 for the "definitions I used" note at the top of `interview.md` (as-of, DPD, the dedup rule, collection rate basis, FPD30).

<details><summary>The definitions note — model</summary>

*As of 2026-10-01 throughout. **DPD** = days since the due date of the oldest matured instalment not fully paid (0 if none); buckets 0 / 1-30 / 31-60 / 61-90 / 90+ on the lower edges. **Payments** are de-duplicated on installment_id + paid_at + amount keeping the lower payment_id (52 850 rows), and summed only through the as-of date (24 forward-dated rows excluded). **Outstanding** = principal_due of instalments due after the as-of date. **PAR30 / NPL90** = outstanding of loans with DPD > 30 / > 90 ÷ total outstanding. **FPD30** = first instalment not fully paid or first payment more than 30 days after its due date, shown per disbursement-month vintage, only for vintages whose first dues are all ≥ 30 days old. **Collection rate** = paid by the as-of on instalments due in the month ÷ total due in the month (instalment basis, not cash basis).*
</details>

1. VLOOKUP vs INDEX/MATCH vs XLOOKUP — when do you use which, and what are VLOOKUP's traps?
2. When is an **approximate-match** lookup the right tool? Give the example you built.
3. Why can **Remove Duplicates** lie, in both directions? How do you de-duplicate safely in Excel?
4. **Power Query vs formulas** — when do you clean with each?
5. In a pivot, what does **% of Parent Row Total** do, and how is it different from % of Grand Total?
6. **Line vs bar chart** — how do you choose, and name two ways a chart can lie.
7. What do **absolute references** do, and where did you need them this week?
8. How do you make an Excel report **refreshable**, and what do you check after a refresh?

<details><summary>Model answers (open after submitting)</summary>

1. `XLOOKUP` when the file lives in Excel 365/2021 or Sheets: exact by default, named return column, `if_not_found`, approximate modes, search from the end. `INDEX/MATCH` when older Excel must open the file — same power, two functions. `VLOOKUP` only to read other people's files. Its traps: approximate match is the **default** (a wrong rate with no error), the column is a **count** that breaks when a column is inserted, it looks **right only**, and an unpinned range walks when copied. Example: product → annual_rate from the `Lookup` sheet, 4 491 202 901 of monthly interest run-rate — one wrong default and the figure is silently wrong.
2. When the key is a *range*, not a value: DPD → bucket, income → band, score → grade. A sorted table of lower edges (0 / 1 / 31 / 61 / 91) and `XLOOKUP(dpd, edges, labels, , -1)` (or `VLOOKUP … TRUE`, `MATCH … 1`) returns the band; it reproduced the shipped buckets with 0 mismatches — 7 429 / 124 / 25 / 16 / 234 — and a boundary change is one cell on `Lookup`, not 7 828 `IFS` edits. The key column must be sorted ascending or the result is wrong without an error.
3. It compares the ticked columns exactly as displayed (case-insensitive, space-sensitive) and keeps the first row: on raw names it **under-removes** (24 of 40 — the 18 trailing-space rows survive), on trimmed names it **over-removes** (42 — two real namesakes, 823/1197 and 2460/5562, deleted), and it records nothing. Safely: define sameness on identifying fields (phone + birth date → exactly 40), *count* the groups with `COUNTIFS` on a key and look at them, sort so the right row is kept, then remove as a recorded Power Query step on a copy, raw untouched, counts in the change log (6 040 → 6 000; payments 52 875 → 52 850, Σ 58 397 800).
4. Power Query when the same cleaning must run again (Monday's export), when there are joins, groupings or type changes, or when the data is too big for row formulas (92 193 instalments × 52 850 payments) — steps are recorded, refreshable, and the pane *is* the change log. Formulas when the result must react cell by cell (a dropdown-driven sheet), when the reader must see the logic, or in Sheets where Power Query does not exist; keep them on a clean tab fed from the raw tab. Never the mouse on the raw data.
5. Both are shares; the denominator differs. % of Grand Total divides by the whole table (Tashkent 39.1 % of the book). % of Parent Row Total divides by the row's *parent group* — Tashkent Central 35.2 % of Tashkent, and on the region row itself the parent is the grand total, so the one column shows two levels at once. It is `SUM(x) OVER (PARTITION BY region)` against `OVER ()`.
6. A line for a measure over **time** (34 monthly points; the eye reads slope), a bar/column for **categories** (five products; the eye compares lengths; sort them). Lies: a bar axis not starting at zero (7 % growth looks like doubling), a partial period plotted as a full one (October's one day as a −95 % month), 3D, a dual axis that makes two lines cross meaninglessly, and a pie with many slices. Title the finding, from zero, one highlight colour.
7. `$` pins a row, a column or both so a formula can be filled without the reference moving: `$A3` reads the region from column A on every row, `B$2` reads the bucket from row 2 in every column — the region × bucket matrix is one `SUMIFS` with three `$`. Also conditional-formatting rules (`=$M2="90+"`: column pinned, row free) and lookup ranges (`Lookup!$A$3:$F$7`). Tables remove most of the need — `tblLoans[outstanding]` is already absolute.
8. Data arrives through Power Query (or into a Table) so Refresh All re-reads the files; pivots sit on the Table or the query output, never a fixed range; tiles read pivots by `GETPIVOTDATA` or the Table by `SUMIFS`, nothing is typed; number formats live in Value Field Settings; slicers are connected; the as-of date is a cell. After refresh: row counts against the known totals (7 828 · 52 850 · 6 000 · 92 193), the grand total against the Table's `SUM`, the slicers cleared, and the six tiles against the warehouse views — a difference means a definition changed, not a formula.
</details>

---

**Follow-ups a panel asks** (one sentence each is enough; practise them aloud):

- *"Your XLOOKUP returns #N/A for a product that is clearly in the table."* — A trailing space or a number stored as text on one side; `TRIM` / `VALUE` the key, and check with `LEN` and `ISNUMBER`.
- *"Why did Remove Duplicates say 24 when you expected 40?"* — Case-insensitive but space-sensitive, on the raw names; 18 trailing-space rows survived.
- *"The pivot total is 92 193 instead of 7 828."* — Built on the instalments table, or on a merged query that multiplied; the grain is wrong, not the sum.
- *"Can I have the average rate per product?"* — As a ratio of sums, yes (calculated field); an average of per-loan rates weights a 500 000 Micro loan like a 599 m SME loan — say which one you are giving.
- *"The line chart shows a 95 % crash in October."* — One day of data plotted as a month; exclude or mark partial periods.
- *"The board wants the file by email."* — Values only is the wrong answer; send the workbook with the queries, or a PDF of the page plus the workbook; never a copy with typed numbers.
- *"Finance says the collection rate is 96 %."* — Cash basis (received in the month ÷ due in the month) versus instalment basis (paid on the month's instalments); 96.2 % versus 94.1 %; both right, name the basis.

---

## What the reviewer runs

On a copy of your workbook, with the three CSVs in `data/excel/`:

1. **Refresh All.** Row counts of `customers_clean`, `payments_clean`, `installments_paid` after refresh: 6 000 · 52 850 · 92 193. A count that changes means a pasted value somewhere.
2. **The Checks sheet**: every cell TRUE.
3. **Duplicate the last line of `payments_dirty.csv`** and refresh: `payments_clean` must stay 52 850.
4. **Clear every slicer**, read the six tiles, compare with the table above; then set the slicer to one region and confirm the tiles that should move (charts) do and the ones that should not (the as-of, the definitions) do not.
5. **Ctrl+`** on `OnePager`: every number is a formula.
6. **Print preview**: one page, landscape, readable at A4.
7. Read `findings.md` aloud: five sentences, five numbers, five consequences; `change_log.md`: ten changes with counts.
8. `interview.md`: the definitions note first, then eight answers with a Nur Finance number each.

---

## Scoring and what happens next

| Part | Points | Pass |
|---|---|---|
| A — cleaning pipeline, 2 files × 20 | 40 | |
| B — one-pager: tiles 12 + charts 12 + refreshability 8 + findings 8 | 40 | |
| C — 8 questions × 2 + definitions note | 20 | |
| **Total** | **100** | **≥ 70 → Week 5 on Monday** |

Partial credit rules, so you know what to drop when time runs out:

- A tile with the right definition line and *n/a* loses 1 of its 2 points; a wrong number with no definition loses both.
- A chart with an honest axis and a descriptive (not finding) title loses 1 of 4; a pie or a truncated bar axis loses all 4.
- A pipeline that refreshes but misses one rule (e.g. the namesakes deleted) loses the 3 "nothing destroyed" points, not the 6 refreshability points.
- A change log with the right changes but no counts scores half.

Below 70: feedback names the parts to redo (most often A1's duplicate rule and B's FPD30 tile); re-submit Monday morning before Week 5. Points go to `docs/progress.md`.

**Submission checklist** — `submissions/week-04/day-5/`: `checkpoint.xlsx` (raw sheets untouched; `customers_clean`, `payments_clean`, `installments_paid`; `Data`; `OnePager`; `Checks`), `change_log.md` (ten lines with counts), `findings.md` (five sentences), `interview.md` (definitions note + 8 answers); Sheets users add `README.md` with the link. Also due today: **HW 4.2** in `day-3/`.

<span class="badge stretch">Stretch</span> Add week 3's **month-end outstanding** series to the page: on `installments_paid`, a column `disbursed` (the loan's date via `XLOOKUP`), then for each month-end `SUMIFS(principal_due, due_date >= next month, disbursed < next month)` — a `SEQUENCE` of 2026 month-starts drives it; September 208 243 879 623, June 184 617 414 010. Plot it as the sparkline under the Outstanding tile, and explain in the footnote why 208.2 bn (month-end) and 208.7 bn (as-of) are both right.

**What Week 5 takes from today.** Monday's pandas labs reload exactly these files — `customers_dirty.csv`, `payments_dirty.csv`, `installments.csv`, `loans_status.csv` — and redo A1, A2 and the six tiles in a notebook: `str.strip().str.title()`, `drop_duplicates(subset=["phone", "birth_date"])`, `merge(how="left")`, `groupby`, `pivot_table`. Keep your `change_log.md`: the notebook's first markdown cell is the same ten lines, and the comparison "which tool was faster to redo" is the week's closing question. The numbers must not move — 6 000 · 52 850 · 208 723 504 430 · 94.1 % — only the tool does.

Madina, 17:30: *"Bekzod has his page and refreshed it himself. Nilufar's age bands no longer have a five-year-old. Timur pointed his dashboard and your workbook at the same definitions and the six numbers agree to the soum. Monday is Python — the same book, in pandas, and we will see whether the notebook or the workbook is faster to redo."*

---

### 📎 Hand in here

Write or attach each part, then **📤 Submit** — no GitHub needed. (Prefer GitHub? Push to `submissions/week-04/day-5/` and tap 📤 I pushed my homework in the bot — both count.)

```sqltask
{"check": "handin-W4D5", "lesson": "W4D5", "title": "Checkpoint 4", "tasks": [{"id": "checkpoint.xlsx", "file": "checkpoint.xlsx", "names": ["checkpoint.xlsx"], "upload": true, "accept": ".xlsx", "q": "Attach `checkpoint.xlsx` — what the page above asks for."}, {"id": "findings.md", "file": "findings.md", "text": true, "minLines": 3, "q": "Write `findings.md` here — what the page above asks for."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Anything else the page lists (one more file, or a .zip of several)."}]}
```

---

## Day quiz

Pass with 80 % to finish the day. Retry as often as you like.

```quiz
{"id": "w04d5", "pass": 0.8, "questions": [
  {"type": "single", "q": "After Refresh All, customers_clean still contains ids above 6 000. What went wrong?", "options": ["The duplicate key was wrong", "No Sort on registered_at before Remove Duplicates, so the later copy was kept instead of the original", "Remove Duplicates was run twice", "The ids were typed as text"], "answer": 1, "explain": "Remove Duplicates keeps the first row it meets; sort so the row you want to keep comes first (→ A1, model answer; If you are stuck)."},
  {"type": "number", "q": "Three customers' monthly_income (in millions). One blank was typed as 0 during cleaning. What does AVERAGE now return?", "code": "monthly_income: 10 | 20 | 0   (the 0 was a blank)\n\n=AVERAGE(customers_clean[monthly_income])", "answer": 10, "explain": "With the blank kept as null, AVERAGE skips it and returns 15; a zero income is a statement, a blank is a gap (→ A1, checks)."},
  {"type": "single", "q": "24 payments are dated after 2026-10-01. What does payments_clean do with them?", "options": ["Deletes them", "Keeps them, flags them with is_forward_dated, and excludes them from as-of sums", "Changes their date to 2026-10-01", "Moves them to a separate file"], "answer": 1, "explain": "They are real payments recorded with a future date: nothing destroyed, flagged, filtered where an as-of matters (→ A2)."},
  {"type": "single", "q": "The reviewer duplicates the last line of payments_dirty.csv and presses Refresh All. What must payments_clean show?", "options": ["One row more than before", "The same row count as before — the new line is one more copy of a known payment", "An error", "Zero rows"], "answer": 1, "explain": "The cleaning is a property of the query, not of the file; a count that changes means something was pasted (→ What the reviewer runs)."},
  {"type": "multi", "q": "Which choices keep the one-pager refreshable?", "options": ["Data arrives through Power Query or a Table", "Pivots are built on the Table or query output", "Tiles read the pivots with GETPIVOTDATA or the Table with SUMIFS", "Number formats are set in Value Field Settings", "Pivots built on a fixed range A1:M7829", "Tiles pasted as values before sending"], "answer": [0, 1, 2, 3], "explain": "A fixed range never grows and a pasted value never updates (→ Part C, question 8; Common mistakes)."},
  {"type": "single", "q": "XLOOKUP returns #N/A for a product that is clearly in the Lookup table. What is the likely cause?", "code": "A2 shows: Micro loan\n=LEN(A2)  → 11", "options": ["XLOOKUP needs FALSE as the last argument", "A trailing space in the key — 'Micro loan' has 10 characters; TRIM it", "The Lookup table is not sorted", "The product is in a hidden row"], "answer": 1, "explain": "#N/A means nothing matched: check spaces with LEN and numbers stored as text with ISNUMBER (→ Follow-ups a panel asks)."},
  {"type": "single", "q": "Finance says September's collection rate is 96 %; your tile says 94.1 %. What do you answer?", "options": ["One of the two is a formula error", "Different bases: cash basis (all money received in September ÷ due) vs instalment basis (paid on September's instalments ÷ due); both right, name the basis", "Finance used dirty payments", "Round both to 95 %"], "answer": 1, "explain": "Write the basis under the tile and the argument ends (→ Follow-ups a panel asks; Day 3, Company corner)."},
  {"type": "single", "q": "Which sentence belongs in findings.md?", "options": ["Chart 1 shows outstanding by product.", "PAR30 is 3.12 % and NPL90 2.55 %, so most at-risk money is already past 90 days: old debt, not a new wave.", "I used a pivot table on tblLoans.", "The page has six tiles."], "answer": 1, "explain": "Each finding carries a number and a consequence the board can act on (→ Part B, findings note)."}
]}
```

<!-- challenge:start -->

---

## Daily challenge

A bonus for the curious: one harder question on today's topic. Solve it for XP that grows with your challenge streak — a full week of five also adds 10 % to Friday's voucher.

```challenge
{"id": "w04d5", "q": "Collection rate for the Auto book, Q3 2026. On this week's instalment basis — instalments due 1 July to 30 September 2026; collected = clean payments on those instalments dated on or before 2026-10-01 — restricted to Auto loans: collected ÷ due. Percentage to 2 decimals.", "type": "number", "dp": 2, "h": ["4daf914bab150440deab3c1a"], "hint": "The product lives on the Loans sheet, not on the instalments — and a quarter's rate is not the average of three monthly rates.", "sol": "aW5zdGFsbG1lbnRzX3BhaWQgKFBhcnQgQSdzIG1lcmdlOiBpbnN0YWxsbWVudHMgKyBwYWlkX2J5X2luc3RhbGxtZW50IGZyb20gcGF5bWVudHNfY2xlYW4gZmlsdGVyZWQgcGFpZF9hdCA8PSAyMDI2LTEwLTAxLCBudWxsIOKGkiAwKSwgcGx1cyBhIGNvbHVtbgogIHByb2R1Y3QgPVhMT09LVVAoW0Bsb2FuX2lkXSwgdGJsTG9hbnNbbG9hbl9pZF0sIHRibExvYW5zW3Byb2R1Y3RdKSAgIChvciBhIHNlY29uZCBNZXJnZSB3aXRoIGxvYW5zX3N0YXR1cyBvbiBsb2FuX2lkKQo9U1VNSUZTKGluc3RhbGxtZW50c19wYWlkW3BhaWRdLCBpbnN0YWxsbWVudHNfcGFpZFtwcm9kdWN0XSwgIkF1dG8gbG9hbiIsIGluc3RhbGxtZW50c19wYWlkW2R1ZV9kYXRlXSwgIj49IiZEQVRFKDIwMjYsNywxKSwgaW5zdGFsbG1lbnRzX3BhaWRbZHVlX2RhdGVdLCAiPCImREFURSgyMDI2LDEwLDEpKQogLyBTVU1JRlMoaW5zdGFsbG1lbnRzX3BhaWRbdG90YWxfZHVlXSwgaW5zdGFsbG1lbnRzX3BhaWRbcHJvZHVjdF0sICJBdXRvIGxvYW4iLCBpbnN0YWxsbWVudHNfcGFpZFtkdWVfZGF0ZV0sICI+PSImREFURSgyMDI2LDcsMSksIGluc3RhbGxtZW50c19wYWlkW2R1ZV9kYXRlXSwgIjwiJkRBVEUoMjAyNiwxMCwxKSkK4oaSIDggNDU2IDAzOSA3OTEgLyA4IDkyMSAwMzcgNTMzID0gOTQuNzkgJS4gKEEgcGl2b3Qgb24gaW5zdGFsbG1lbnRzX3BhaWQgd2l0aCBwcm9kdWN0IGluIEZpbHRlcnMgYW5kIGR1ZV9kYXRlIGdyb3VwZWQgYnkgUXVhcnRlcnMgZ2l2ZXMgdGhlIHNhbWUuKQpUaGUgYXZlcmFnZSBvZiB0aGUgdGhyZWUgbW9udGhseSBBdXRvIHJhdGVzICg5Ni4xOSwgOTUuNjgsIDkyLjY1KSBpcyA5NC44NCDigJQgc2xpZ2h0bHkgd3JvbmcsIGJlY2F1c2UgdGhlIG1vbnRocyBoYXZlIGRpZmZlcmVudCBhbW91bnRzIGR1ZTogYSByYXRpbyBvZiBzdW1zLCBub3QgYW4gYXZlcmFnZSBvZiByYXRpb3MuIEF1dG8gcnVucyBiZWxvdyB0aGUgY29tcGFueSdzIDk1LjcyICUgZm9yIHRoZSBxdWFydGVyOyB3aXRoIGJpZyB0aWNrZXRzLCB0aGUgNS4yICUgbm90IGNvbGxlY3RlZCBpcyAwLjQ2IGJuLiBTZXB0ZW1iZXIgaXMgdGhlIHdlYWtlc3QgbW9udGggcGFydGx5IGJlY2F1c2UgaXRzIGxhdGUtU2VwdGVtYmVyIGluc3RhbG1lbnRzIGhhdmUgaGFkIG9ubHkgZGF5cyB0byBiZSBwYWlkLg=="}
```

<!-- challenge:end -->
