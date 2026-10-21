# Week 7 — Power BI data (Nur Finance, as of 2026-10-01)

Built by `python scripts/make_powerbi_data.py` from `data/raw/nur.db` (nothing random: a re-run writes the same files). The three **facts you already know** are the week-3 views, exported with exactly the week-3 SQL; the other facts and the dimensions are what a three-page dashboard needs. All files are CSV, UTF-8, comma-separated, dates as `YYYY-MM-DD` (applications also carry a time). Money is in soum, whole numbers.

**Power BI Desktop** is free and runs on Windows only (Microsoft Store or the Microsoft download page). On a Mac use a Windows virtual machine, or ask for a Windows laptop for the week. Click paths in the pages are for the current Desktop release and may differ slightly in yours — the idea of every step does not.

## The files

| File | Kind | Grain (one row is…) | Rows | Key columns |
|---|---|---|---|---|
| `v_loan_status.csv` | fact | one loan, its status as of 2026-10-01 | 7 828 | `loan_id`, `customer_id`, `product`, `branch_name`, `disbursed_at`, `principal`, `outstanding`, `dpd`, `bucket` |
| `v_portfolio_monthly.csv` | fact | one month × product × branch (empty cells are zeros) | 1 700 | `month` (first day), `product`, `branch_name`, `disbursed_count`, `disbursed_amount`, `outstanding_month_end` |
| `v_payments_clean.csv` | fact | one payment, duplicates removed, method cleaned | 52 850 | `payment_id`, `loan_id`, `installment_id`, `paid_at`, `amount`, `method` |
| `fct_installments.csv` | fact | one scheduled instalment, with what was paid on it by the as-of date | 92 193 | `installment_id`, `loan_id`, `product`, `branch_name`, `due_date`, `total_due`, `paid_to_asof` |
| `fct_first_instalment.csv` | fact | one loan whose first instalment fell due by 2026-09-01 (FPD30 scope) | 7 099 | `loan_id`, `product`, `branch_name`, `disbursed_at`, `vintage`, `first_due_date`, `fpd30` (0/1) |
| `fct_applications.csv` | fact | one loan application | 14 000 | `application_id`, `customer_id`, `product`, `branch_name`, `channel`, `applied_date`, `status`, `is_decided`, `is_approved` |
| `fct_collections_actions.csv` | fact | one collection action (call, SMS, visit, restructure offer) | 9 361 | `action_id`, `loan_id`, `product`, `branch_name`, `action_date`, `action_type`, `collector_id`, `outcome` |
| `roll_rates.csv` | summary | one from-bucket × to-bucket cell, 1 Sep → 1 Oct 2026 (week 3's matrix) | 8 | `from_bucket`, `to_bucket`, `loans` |
| `dim_date.csv` | dimension | one calendar day, 2024-01-01 … 2027-12-31 | 1 461 | `date`, `year`, `quarter`, `month`, `month_name`, `month_start`, `year_month`, `month_short`, `weekday`, `is_weekend` |
| `products.csv` | dimension | one product | 5 | `code` (MICRO, CONS, BNPL, AUTO, SME), `product_name`, `annual_rate`, `channel` |
| `branches.csv` | dimension | one branch | 10 | `branch_name`, `region`, `opened_on` |
| `customers_clean.csv` | dimension | one person (week 4's cleaning rules) | 6 000 | `customer_id`, names, `sex`, `birth_date_clean`, `region`, `segment`, `income_source`, `monthly_income` |
| `customer_id_map.csv` | helper | one duplicate customer id → the id that survived cleaning | 40 | `customer_id`, `customer_id_master` |
| `staff_collectors.csv` | dimension | one collector | 30 | `collector_id`, `collector_name`, `branch_name` |

Definitions carried over unchanged: **DPD**, **bucket** and **outstanding** (principal due after the as-of date) from week 3, day 4; **FPD30** (first instalment not fully paid within 30 days of its due date) from weeks 2 and 5; **approval rate** = approved ÷ decided (cancelled out) from week 1; **collection rate** = paid by the as-of date ÷ due, on instalments due in the period, from week 3's tile 6.

## The model (star schema)

Facts in the middle, dimensions around them, **one-to-many, single direction, from the dimension to the fact**. No fact is related to another fact.

| From (one side, unique) | To (many side) | Cardinality | Cross-filter | Note |
|---|---|---|---|---|
| `dim_date[date]` | `v_loan_status[disbursed_at]` | 1 : * | single | the loan's date is its **disbursement** date |
| `dim_date[date]` | `v_portfolio_monthly[month]` | 1 : * | single | `month` is the first day of the month |
| `dim_date[date]` | `v_payments_clean[paid_at]` | 1 : * | single | |
| `dim_date[date]` | `fct_installments[due_date]` | 1 : * | single | |
| `dim_date[date]` | `fct_first_instalment[disbursed_at]` | 1 : * | single | vintage = disbursement month |
| `dim_date[date]` | `fct_applications[applied_date]` | 1 : * | single | `applied_date` = date part of `applied_at` |
| `dim_date[date]` | `fct_collections_actions[action_date]` | 1 : * | single | |
| `products[code]` | `[product]` of v_loan_status, v_portfolio_monthly, fct_installments, fct_first_instalment, fct_applications, fct_collections_actions | 1 : * | single | six relationships |
| `branches[branch_name]` | `[branch_name]` of the same six facts | 1 : * | single | six relationships |
| `customers_clean[customer_id]` | `v_loan_status[customer_id]` and `fct_applications[customer_id]` | 1 : * | single | see "the 48 loans" below |
| `staff_collectors[collector_id]` | `fct_collections_actions[collector_id]` | 1 : * | single | |

`v_payments_clean` has no product or branch. To slice payments by product, add them in Power Query: *Merge Queries* `v_payments_clean` ← `v_loan_status` on `loan_id` (Left Outer), expand **only** `product` and `branch_name` — a lookup that adds two columns and keeps 52 850 rows. Then relate it to `products` and `branches` like the others. `roll_rates` stays unrelated (a ready-made matrix).

**Mark `dim_date` as the date table** (Table tools → Mark as date table → `date`) — the time-intelligence measures (`TOTALYTD`, `SAMEPERIODLASTYEAR`, `DATEADD`) need it. Sort `dim_date[month_name]` by `dim_date[month]` and `year_month` by `month_start` (Column tools → Sort by column), or months appear alphabetically.

**The 48 loans.** Week 4 removed 40 duplicate people; 48 loans (1 563 976 162 outstanding) still carry the removed ids, so a visual by customer segment shows a `(Blank)` row. Fix in Power Query: merge `v_loan_status` with `customer_id_map` on `customer_id` (Left Outer), then a custom column `customer_id_master ?? customer_id` (or *Replace* the id where a master exists), and relate that column to `customers_clean`. After the fix: affluent 44 253 773 349 · mass 118 769 279 493 · sme 45 700 451 588, no blank.

## Data types to set in Power Query

Whole number: ids, `principal`, `outstanding`, `dpd`, amounts, `fpd30`, `is_decided`, `is_approved`, `loans`. Date: `disbursed_at`, `month`, `paid_at`, `due_date`, `first_due_date`, `applied_date`, `action_date`, `dim_date[date]`, `month_start`. Text: `bucket` (it is `"0"`, `"1-30"`, … — if Power BI types it as a number, the "1-30" rows become errors), `product`, `branch_name`, `status`, `vintage`, `year_month`. Check after loading: row counts as in the table above, and the card `Outstanding` = **208 723 504 430**.

## Measures

`measures.dax` — 31 measures and one calculated column, each with the value it must show in a stated filter context (computed in Python from these files). Three anchors to check first: **Outstanding** (no filter) 208 723 504 430 · **PAR30 %** 3.12 % · **YTD Disbursed** at September 2026 161 480 300 000.

## Known caveats

- `v_payments_clean` keeps 24 payments dated after 2026-10-01 (forward-dated, week 4) and `fct_collections_actions` 72 actions after it; the as-of measures ignore them, a raw date axis shows them.
- `v_portfolio_monthly` has a row for October 2026 (the month of the as-of date); its `outstanding_month_end` (196 392 195 577) counts instalments due from 1 November. Show months up to September 2026.
- `fct_first_instalment` for the August 2026 vintage has only 11 loans in scope (first due date by 2026-09-01): not readable yet.
