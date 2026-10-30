# Glossary — lending and product metrics

Standard definitions, with the places where companies differ marked **[varies]**. Each term says the week where you compute it on Nur Finance data. Russian terms in italics.

> 🧭 **What this page is for.** The words every request at Nur Finance is made of. Learn the sixteen cards first; come back to the full list whenever a day uses a term you cannot define in one line.

Start with the cards: read the term, say its meaning out loud, flip, and mark **Knew it** or **Again**. The cards you miss come back.

```game
{"type": "flash", "id": "glossary-flash", "title": "16 words a lending analyst uses every day", "cards": [["Portfolio", "all loans outstanding, taken together"], ["Outstanding balance", "principal not yet repaid"], ["Disbursement", "paying out the loan (or the sum paid out in a period)"], ["Instalment", "one scheduled payment: a principal part + an interest part"], ["Approval rate", "approved ÷ decided applications — say whether cancelled are in"], ["Vintage", "the loans disbursed in the same month, followed over time"], ["DPD", "days past the due date of the oldest unpaid instalment"], ["FPD", "the first instalment not paid within X days of its due date"], ["PAR30", "outstanding of loans with DPD > 30 ÷ total outstanding"], ["NPL", "non-performing loans: usually DPD > 90 (varies)"], ["Roll rate", "the share of loans moving to the next DPD bucket in a month"], ["Write-off", "removing a loan from the live book as a loss"], ["Expected loss", "PD × LGD × EAD"], ["Collection rate", "collected ÷ due for instalments due in the period"], ["Funnel", "the steps from app open to money paid out, and the share that survives each"], ["Retention", "the share of a cohort still active after N months"]]}
```

## The loan and its life

- **Application** (*заявка*) — a request for a loan. Status: approved / rejected / cancelled / approved but not disbursed. (W1)
- **Approval rate** (*уровень одобрения*) — approved ÷ decided applications. **[varies]** whether cancelled ones are in the denominator; say which you use. (W1 D2)
- **Disbursement** (*выдача*) — paying out the loan; also the sum paid out in a period ("disbursements in September"). (W1, W2)
- **Principal** (*основной долг, тело кредита*) — the amount lent, before interest.
- **Installment / instalment** (*платёж по графику*) — one scheduled payment: principal part + interest part. An **annuity** schedule keeps the total equal every month.
- **Outstanding balance / exposure** (*остаток долга*) — principal not yet repaid. The **portfolio** is the sum of outstanding over all live loans. (W2, W3)
- **Portfolio** (*портфель*) — all loans currently outstanding, taken together; sliced by product, branch, vintage, grade.
- **Vintage / cohort** (*винтаж, когорта*) — the loans disbursed in the same month, followed over time. Vintage curves compare months at the same age. (W3, W8)
- **Risk grade / score** (*скоринговый балл*) — the model's estimate of the borrower's risk at decision time; A–D here, as bands of the score. (W9)

## Delinquency

- **DPD — days past due** (*дней просрочки*) — today minus the due date of the **oldest unpaid** instalment, for a loan. 0 if nothing is overdue. (W1 D3, W2)
- **DPD buckets** — 0 · 1–30 · 31–60 · 61–90 · 90+. **[varies]** some use 1–7 / 8–30, or 180+.
- **FPD / SPD / TPD — first / second / third payment default** — the 1st / 2nd / 3rd instalment was not paid within X days of its due date. **[varies]** X = 30 is common; some use 7 or 10 for FPD. FPD is the earliest signal of a bad decision or fraud, so it is watched per vintage and per channel. (W1 D3, W2 D4, W6)
- **PAR30 / PAR90 — portfolio at risk** — outstanding of loans with DPD > 30 (or 90) ÷ total outstanding. (W2 D3, W3)
- **NPL — non-performing loans** (*просроченные / проблемные кредиты*) — loans with DPD > 90 (**[varies]**: 60 in some regimes); the NPL ratio is their outstanding ÷ total.
- **Roll rate** (*миграция*) — share of loans moving from one bucket to the next between two months (e.g. 1–30 → 31–60). (W3)
- **Cure rate** — share of delinquent loans that return to DPD 0.
- **Write-off** (*списание*) — removing a loan from the live portfolio as a loss, usually at 180+ DPD **[varies]**. **Recovery** — money collected after write-off.
- **PD — probability of default** (*вероятность дефолта*) — the chance a loan defaults (usually 90+ DPD) within a horizon, typically 12 months. (W6 D1)
- **LGD — loss given default** (*потери при дефолте*) — the share of the exposure lost if the loan defaults, after recoveries. Often 50–80 % for unsecured consumer loans. (W6 D1)
- **EAD — exposure at default** — what is owed at the moment of default; for an amortising loan, roughly the outstanding balance. (W6 D1)
- **EL — expected loss** (*ожидаемые потери*) — PD × LGD × EAD; the basis of provisions. Under **IFRS 9** banks hold 12-month EL for healthy loans and lifetime EL for loans whose risk has grown significantly. **[varies]** how each PD and LGD is estimated. (W6 D1)
- **Cost of risk** — provisions (or losses) in a period ÷ average portfolio.
- **Collection rate** — amount collected ÷ amount due in the period.

## Money and performance

- **Yield / APR** — interest earned ÷ average outstanding; the rate charged.
- **Average ticket** (*средний чек*) — average principal per loan.
- **Term** (*срок*) — months of the schedule.
- **Unit economics** — revenue and cost per loan or per customer; whether a product makes money after losses and acquisition cost. (W8)
- **LTV / CAC** — lifetime value of a customer vs the cost to acquire one. (W8)

## Product and app metrics

- **Funnel** (*воронка*) — the steps from app open to the money — signed contract, then the disbursed loan — and the share that survives each step; end it at the table that books the money. (W8)
- **Conversion** — share moving from one step to the next.
- **Activation** — first meaningful action (here: first disbursed loan).
- **Retention / churn** (*удержание / отток*) — share of a cohort still active after N months; churn is the opposite. (W8)
- **DAU / MAU** — daily / monthly active users; the ratio is "stickiness".
- **NPS** — net promoter score, promoters − detractors.

## Credit risk models

- **Correlation** (*корреляция*) — how closely two numbers move together, from −1 to +1; 0 means no straight-line relation. It is not causation. (W9 D1)
- **Pearson r / Spearman ρ** (*коэффициент корреляции Пирсона / Спирмена*) — Pearson measures a straight-line relation on the values (principal and monthly payment: r = 0.90); Spearman does the same on the ranks, so it suits skewed data and any relation that only rises or only falls. (W9 D1)
- **Linear regression** (*линейная регрессия*) — the straight line y = intercept + slope × x that makes the squared vertical distances from the points as small as possible (least squares); with several predictors, one slope per predictor. (W9 D1)
- **Slope / intercept** (*наклон / свободный член*) — the slope is how much y changes for one unit of x (soum of payment per soum of principal); the intercept is y at x = 0, often outside the data and meaningless on its own. (W9 D1)
- **R²** (*коэффициент детерминации*) — the share of the variation in y the model explains, from 0 to 1; with one predictor it equals r². A high R² proves neither a cause nor a good prediction outside the data. (W9 D1)
- **Residual** (*остаток*) — actual minus predicted, for one row. A residual plot with a pattern says the line misses something. (W9 D1)
- **Logistic regression** (*логистическая регрессия*) — a model for a yes/no outcome: a straight line in the log-odds, turned into a probability between 0 and 1 by the S-shaped logistic curve. Each coefficient, exponentiated, is an odds ratio. (W9 D2)
- **Odds / log-odds** (*шансы / логарифм шансов*) — odds = p ÷ (1 − p): a 2.99 % bad rate is odds of about 1 to 32; log-odds = ln(odds), the scale on which logistic regression is a straight line. (W9 D2)
- **Scorecard** (*скоринговая карта*) — a model turned into points: each characteristic adds points, and the total score ranks applicants (here, higher = safer). **[varies]** the scale (300–850, 0–1 000) and its direction. (W9 D2)
- **PDO — points to double the odds** — how many points of score double the odds of a good loan (often 20); with a base score at base odds it fixes the scorecard's scale. (W9 D2)
- **Calibration** (*калибровка*) — whether predicted probabilities match observed rates: in a band where the model says 4 %, about 4 % should go bad. A model can rank well and still be badly calibrated. (W9 D2)
- **Confusion matrix** (*матрица ошибок*) — at one cut-off, the 2 × 2 count of the decision (refused / approved) against the outcome (bad / good); here "bad" is the positive class. (W9 D3)
- **ROC curve** (*ROC-кривая*) — the true-positive rate (share of bads refused) against the false-positive rate (share of goods refused), one point per cut-off. (W9 D3)
- **AUC — area under the ROC curve** — the chance that a random good loan scores higher than a random bad one, ties counted half: 0.5 is a coin, 1 is perfect. It is about pairs, not about the share of loans classified right. (W9 D3)
- **Gini** (*коэффициент Джини*) — 2 × AUC − 1, from 0 (a coin) to 1 (perfect): the number credit teams quote. Application scorecards are often 0.4–0.6 **[varies]**. Always give it with its number of bads. (W9 D3)
- **KS — Kolmogorov–Smirnov statistic** — the largest gap between the cumulative share of bads and the cumulative share of goods across the scores, with the score where it happens. (W9 D3)
- **Lift / gains** (*лифт / кривая выигрыша*) — lift: how many times more bads the worst-scored X % of loans hold than an average X % would; gains: the share of all bads caught as you refuse more of the lowest scores. (W9 D3)
- **Out-of-time validation** (*проверка вне периода*) — testing a model on loans from a later period than the ones it was built on. Compare loans of the same age: young loans have not had time to go bad. (W9 D3)
- **Cut-off** (*порог отсечения*) — the score below which an application is refused ("approve score ≥ c"). It trades approvals against the bad rate; the best one is set with money, not with the bad rate alone. (W9 D4)
- **Swap set** (*swap-набор*) — the applicants whose decision changes when the cut-off or the model changes: **swap-out** (approved before, refused now) and **swap-in** (refused before, approved now). (W9 D4)
- **PSI — population stability index** (*индекс стабильности популяции*) — Σ (actual share − expected share) × ln(actual ÷ expected) over the score bands: below 0.1 stable, 0.1–0.25 watch, above 0.25 act **[varies]**. Measured on applicants, not on approved loans. (W9 D4)
- **CSI — characteristic stability index** — the PSI formula on one input of the model (income band, product, age), to find which characteristic moved. (W9 D4)
- **Champion / challenger** (*чемпион / претендент*) — the current model or policy (champion) keeps most applicants while a new one (challenger) runs on a random share; both are read on loans of the same age before the challenger may replace it. (W9 D4)

## Trends and forecasting

- **Month-on-month / year-on-year growth (MoM / YoY)** (*рост к прошлому месяцу / году*) — this period ÷ the one before (or the same period a year before) − 1. YoY is the fair comparison when months differ by season. (W8D1, Going further)
- **Seasonality / seasonal index** (*сезонность / сезонный индекс*) — a pattern that repeats with the calendar; the index is a month's value ÷ its level around it, averaged over the years. Check it on at least two years before you claim it. (W8D1, Going further)
- **Moving average** (*скользящее среднее*) — the average of the last n months; it smooths the noise and turns a month late. (W8D1, Going further)
- **Naive / seasonal naive forecast** (*наивный / сезонный наивный прогноз*) — next month = this month; or = the same month a year before. The baseline any smarter method must beat. (W8D1, Going further)
- **Holdout test** (*проверка на отложенных данных*) — hide the last months, forecast them with what came before, measure the miss. (W8D1, Going further)
- **MAE / MAPE** — the average absolute miss, in units / as a % of the actual. (W8D1, Going further)

## IFRS 9 provisions

- **Provision / loss allowance** (*резерв под ожидаемые кредитные убытки*) — the loss the lender expects on the loans it still holds: a stock on the balance sheet (gross loans − provision = net loans); its change in a month, plus write-offs minus recoveries, is that month's charge — the cost of risk. (W8D2, Going further)
- **IFRS 9 stages** (*стадии по МСФО 9*) — 1 performing (12-month expected loss), 2 significant increase in credit risk (lifetime), 3 credit-impaired (default, PD 100 %). (W8D2, Going further)
- **SICR and the 30-day backstop** (*значительное увеличение кредитного риска; критерий 30 дней*) — whatever else the bank looks at, more than 30 days past due puts a loan in stage 2; more than 90, in stage 3. (W8D2, Going further)
- **12-month vs lifetime ECL** (*ОКУ за 12 месяцев и за весь срок*) — the expected loss from defaults in the next year vs until the loan ends. (W8D2, Going further)
- **Cliff effect** (*эффект обрыва*) — the jump in a loan's provision when it moves from stage 1 to stage 2 and its horizon goes from a year to a lifetime. (W8D2, Going further)
- **Coverage ratio** (*коэффициент покрытия резервами*) — provision ÷ gross loans, for the book and per stage. (W8D2, Going further)

## Working tools

- **Data dictionary** (*словарь данных*) — per table its grain, key, rows and source; per column its type, meaning, allowed values, an example and its owner. (W3D4, Going further)
- **Data profiling** (*профилирование данных*) — measuring what a column really holds: rows, distinct values, NULL share, min / max, the values and their counts. (W3D4, Going further)
- **Scheduler** (*планировщик*) — Task Scheduler on Windows or cron on Linux: starts a script at set times, such as the weekly report every Monday. (W5D4, Going further)
- **Commit / staging area** (*коммит / область подготовки*) — `git add` puts a change in the staging area; `git commit` saves what is staged as one version with a message. (W5D4, Going further)
- **Branch / merge** (*ветка / слияние*) — a named line of commits; a merge brings its commits into another branch. (W5D4, Going further)
- **.gitignore** — the file listing what Git must never keep: data, outputs, passwords. (W5D4, Going further)

## Data words

- **OLTP / OLAP**, **fact / dimension**, **star schema**, **grain** — see Week 1 Day 4.
- **KPI** — a metric someone is accountable for; a **metric tree** shows how KPIs decompose (W8).
- **As-of date** — the date a snapshot describes. Nur Finance data is as of **2026-10-01**.
