# Glossary — lending and product metrics

Standard definitions, with the places where companies differ marked **[varies]**. Each term says the week where you compute it on Nur Finance data. Russian terms in italics.

## The loan and its life

- **Application** (*заявка*) — a request for a loan. Status: approved / rejected / cancelled / approved but not disbursed. (W1)
- **Approval rate** (*уровень одобрения*) — approved ÷ decided applications. **[varies]** whether cancelled ones are in the denominator; say which you use. (W1 D2)
- **Disbursement** (*выдача*) — paying out the loan; also the sum paid out in a period ("disbursements in September"). (W1, W2)
- **Principal** (*основной долг, тело кредита*) — the amount lent, before interest.
- **Installment / instalment** (*платёж по графику*) — one scheduled payment: principal part + interest part. An **annuity** schedule keeps the total equal every month.
- **Outstanding balance / exposure** (*остаток долга*) — principal not yet repaid. The **portfolio** is the sum of outstanding over all live loans. (W2, W3)
- **Portfolio** (*портфель*) — all loans currently outstanding, taken together; sliced by product, branch, vintage, grade.
- **Vintage / cohort** (*винтаж, когорта*) — the loans disbursed in the same month, followed over time. Vintage curves compare months at the same age. (W3, W8)
- **Risk grade / score** (*скоринговый балл*) — the model's estimate of the borrower's risk at decision time; A–D here.

## Delinquency

- **DPD — days past due** (*дней просрочки*) — today minus the due date of the **oldest unpaid** instalment, for a loan. 0 if nothing is overdue. (W1 D3, W2)
- **DPD buckets** — 0 · 1–30 · 31–60 · 61–90 · 90+. **[varies]** some use 1–7 / 8–30, or 180+.
- **FPD / SPD / TPD — first / second / third payment default** — the 1st / 2nd / 3rd instalment was not paid within X days of its due date. **[varies]** X = 30 is common; some use 7 or 10 for FPD. FPD is the earliest signal of a bad decision or fraud, so it is watched per vintage and per channel. (W1 D3, W6)
- **PAR30 / PAR90 — portfolio at risk** — outstanding of loans with DPD > 30 (or 90) ÷ total outstanding.
- **NPL — non-performing loans** (*просроченные / проблемные кредиты*) — loans with DPD > 90 (**[varies]**: 60 in some regimes); the NPL ratio is their outstanding ÷ total.
- **Roll rate** (*миграция*) — share of loans moving from one bucket to the next between two months (e.g. 1–30 → 31–60). (W3)
- **Cure rate** — share of delinquent loans that return to DPD 0.
- **Write-off** (*списание*) — removing a loan from the live portfolio as a loss, usually at 180+ DPD **[varies]**. **Recovery** — money collected after write-off.
- **PD — probability of default** (*вероятность дефолта*) — the chance a loan defaults (usually 90+ DPD) within a horizon, typically 12 months. (W6 D1)
- **LGD — loss given default** (*потери при дефолте*) — the share of the exposure lost if the loan defaults, after recoveries. Often 40–70 % for unsecured lending. (W6 D1)
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

- **Funnel** (*воронка*) — the steps from app open to signed contract and the share that survives each step. (W8)
- **Conversion** — share moving from one step to the next.
- **Activation** — first meaningful action (here: first disbursed loan).
- **Retention / churn** (*удержание / отток*) — share of a cohort still active after N months; churn is the opposite. (W8)
- **DAU / MAU** — daily / monthly active users; the ratio is "stickiness".
- **NPS** — net promoter score, promoters − detractors.

## Data words

- **OLTP / OLAP**, **fact / dimension**, **star schema**, **grain** — see Week 1 Day 4.
- **KPI** — a metric someone is accountable for; a **metric tree** shows how KPIs decompose (W8).
- **As-of date** — the date a snapshot describes. Nur Finance data is as of **2026-10-01**.
