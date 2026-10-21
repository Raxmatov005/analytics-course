# Week 8 — product analytics and capstone notebooks

Built by `python scripts/make_notebooks_w8.py` and executed once with `jupyter nbconvert --to notebook --execute --inplace --allow-errors *.ipynb` (run from this folder) so the outputs you see are real. Data: `data/raw/nur.db` only (as of **2026-10-01**). The day-2 notebook and the capstone template create the course's clean views (`v_payments_clean`, `v_loan_status`) as **TEMP** views in their own connection — `nur.db` itself is never changed.

| File | Day | What is inside |
|---|---|---|
| `day1_starter.ipynb` | 1 | Loads `app_events`, `applications`, `loans`; **TODO** `session_table` (one row per app session, a 0/1 flag per funnel step + disbursed, device and version from the `app_open`) and `repeat_table` (repeat borrowing by first-loan month, blanks where not observable), each with an assert cell; an empty cell per practice task P1–P11. |
| `day2_starter.ipynb` | 2 | The assumptions in one cell (funding 18 %, LGD 60 %, acquisition and servicing by channel); the worked example for loan 1; **TODO** `unit_economics` with an assert cell; an empty cell per practice task. |
| `capstone_template.ipynb` | 3–5 | The capstone skeleton: definitions table, data checks, the fifteen sanity numbers, Q1–Q6 with a "finding" line under each, the recommendations table. |

Red cells in the saved notebooks come only from the TODO stubs (`NotImplementedError` raised when an assert cell calls a function you have not written yet). Opening and running: as in week 5 (`data/python/README.md`); these notebooks live one folder deeper, so `DATA = Path("../..")` is `data/`. In Colab, upload `nur.db` into a folder `raw/` and set `DATA = Path(".")`.

Libraries: `numpy`, `pandas`, `matplotlib` (and `sqlite3`, part of Python). The slowest cell (`unit_economics` on 92 193 instalments) takes a few seconds.

Submitting: the capstone notebook goes to `submissions/week-08/day-5/capstone.ipynb` (a draft to `day-3/` on Wednesday). Always Kernel → Restart & Run All, then save, before you copy the file.
