# Week 4 data — Excel and Google Sheets files

Built by `python scripts/make_excel_data.py` from `data/raw/nur.db` (deterministic). **As-of date: 2026-10-01** for every status, DPD, bucket and outstanding figure. Amounts are UZS (soum), whole numbers. Dates are ISO text (`yyyy-mm-dd`) in the CSVs and real dates in the workbook. Open the workbook for Excel; upload the CSVs (File → Import) for Google Sheets.

| File | Grain (one row =) | Rows | Notes |
|---|---|---|---|
| `nur_week4_start.xlsx` | — | 7.7 MB | Sheets **Loans / Payments / Customers / Applications / Installments** (the five CSVs below as Excel Tables `tblLoans`, `tblPayments`, `tblCustomers`, `tblApplications`, `tblInstallments`; bold frozen header) + **Lookup** |
| `loans_status.csv` | a disbursed loan | 7 828 | status snapshot as of 2026-10-01 (week 3's `v_loan_status`, shortened) |
| `payments_dirty.csv` | a payment row as recorded | 52 875 | **deliberately uncleaned**: 25 exact duplicate rows and 180 inconsistent `method` spellings are kept |
| `customers_dirty.csv` | a customer row as registered | 6 040 | **deliberately uncleaned**: duplicate people and impossible birth dates are kept |
| `applications.csv` | a loan request | 14 000 | product name and branch region joined in |
| `installments.csv` | a scheduled instalment of a loan | 92 193 | needed for the collection rate and FPD30 (no other file has due dates) |
| `monthly_disbursements.csv` | a month × product cell | 170 | 34 months (2024-01 … 2026-10) × 5 products, count and amount from `loans` |

## Columns

**loans_status.csv** — `loan_id` · `customer` (trimmed first + last name, *not a key*: only 747 distinct names) · `region` · `product` (full name, e.g. *Small business loan*) · `branch` · `grade` (A–D) · `disbursed_at` · `principal` · `term` (months) · `status` (active / closed / default / written_off) · `outstanding` (sum of `principal_due` over instalments with `due_date` > as-of; 0 for closed loans) · `dpd` (as-of − due date of the oldest matured instalment not fully paid, payments de-duplicated and taken through as-of; 0 if none) · `bucket` (0 / 1-30 / 31-60 / 61-90 / 90+ from `dpd`).
Checks: 7 828 rows · Σ outstanding **208 723 504 430** · 399 rows with dpd > 0 · buckets 7 429 / 124 / 25 / 16 / 234.

**payments_dirty.csv** — `payment_id` · `loan_id` · `installment_id` · `paid_at` · `amount` · `method` (raw text) · `product` · `region`. Σ amount 255 173 169 976 (raw, with duplicates); 24 rows are dated after the as-of date.

**customers_dirty.csv** — `customer_id` · `first_name` · `last_name` · `sex` · `birth_date` · `region` · `segment` (mass / affluent / sme) · `income_source` · `monthly_income` (blank for 356 rows) · `phone` · `registered_at`.

**applications.csv** — `application_id` · `customer_id` · `product` · `branch` · `region` · `channel` (app / branch / partner) · `applied_at` (date-time) · `decided_at` · `requested_amount` · `term_months` · `credit_score` (blank for 388 rows) · `status` (approved / approved_not_disbursed / rejected / cancelled) · `officer_id`.

**installments.csv** — `installment_id` · `loan_id` · `installment_no` · `due_date` · `principal_due` · `interest_due` · `total_due`. The schedule runs to 2030-10-01.

**monthly_disbursements.csv** — `month` (first day) · `product` · `loans` · `amount`. Σ amount 404 783 280 000 over 7 828 loans.

**Lookup sheet (workbook only)** — `A2:F7` products: `product`, `code`, `annual_rate`, `min_amount`, `max_amount`, `channel` (exact-match lookups); `A10:C15` DPD buckets: `dpd_from`, `bucket`, `dpd_to` sorted ascending (approximate-match lookups); `B17` the as-of date.

The workbook stays under 15 MB so it opens in Excel, Google Sheets and LibreOffice. Do not edit the files in place — copy the workbook before you start a day's work.
