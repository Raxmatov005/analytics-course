# Week 7 — the offer-screen experiment (A/B test data)

Generated once by the mentors (seeded). Synthetic, like everything at Nur Finance, but shaped like a real app experiment export.

**The experiment.** Product (Kamola) redesigned the **loan-offer screen** in the Nur app: variant **A** is the current screen, **B** the new one. Every app user who opened the offer screen between **2026-08-01 00:00 and 2026-08-28 23:59** was assigned at that first view. Assignment rule (the experiment service's specification): `variant = "A" if int(sha256("offer_screen_v2" + str(user_id)), 16) % 2 == 0 else "B"` — a 50/50 split by hashing the user id. App loans are Micro loans (0.5–5 m soum).

**The A/A run.** Before the experiment, the same service ran an **A/A test** from **2026-07-01 to 2026-07-14**: two groups, both shown the **current** screen, salt `"offer_screen_aa_2026_07"`. Files `aa_users.csv`, `aa_events.csv`, same columns.

## Files

| File | Grain | Rows | Columns |
|---|---|---|---|
| `users.csv` | one assignment logged by the experiment service (intended: one per user) | 27 974 | `user_id`, `assigned_at` (timestamp of the first offer view = assignment), `variant` (A/B), `device` (Android/iOS), `region` (8), `segment` (mass / affluent / sme), `new_vs_returning` (new = first app session in the experiment window) |
| `events.csv` | one app event | 67 215 | `user_id`, `event_name`, `event_time` |
| `loans_followup.csv` | one signed loan contract | 2 583 | `user_id`, `loan_id`, `signed_at`, `principal` (soum), `first_instalment_paid_within_30d` (1 = the first instalment was fully paid within 30 days of its due date; 0 = a first-payment default, FPD) |
| `aa_users.csv` | one assignment in the A/A run | 12 852 | as `users.csv` |
| `aa_events.csv` | one app event in the A/A run | 30 313 | as `events.csv` |

**Events** (`event_name`), in funnel order: `view_offer` (the first one is the assignment moment; users may view the offer again later) → `start_application` → `submit_application` → `approved` (the scorecard said yes) → `contract_signed`. Events are logged until 2026-09-09 (experiment) and 2026-07-25 (A/A), so every user has at least 7 days of follow-up.

**Follow-up.** The first instalment of an app loan falls due 30 days after signing; `loans_followup.csv` was extracted when every listed loan had had 30 more days to pay it. It is the one file of the course dated after the as-of date of 1 October 2026: the last loan was signed on 9 September, its first instalment fell due on 9 October, so the extract was taken after 8 November 2026. Everything else in `data/ab/` ends by 9 September, inside the as-of date. It is the source of the **FPD guardrail**.

## Definitions used in the pages

- **Conversion (primary metric):** a user converts if they have a `contract_signed` event within **7 days** (7 × 24 h) of `assigned_at`. Denominator: assigned users.
- **Funnel step rates:** share of users with at least one event of each name.
- **FPD (guardrail):** `1 − first_instalment_paid_within_30d`, per signed loan.
- **Principal per loan** and **disbursed per viewer** (principal of converted users ÷ assigned users).

Times are local (Tashkent), `YYYY-MM-DD HH:MM:SS`. Load with `pd.read_csv(..., parse_dates=[...])`.
