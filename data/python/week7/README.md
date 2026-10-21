# Week 7 — A/B testing notebooks

Built by `python scripts/make_notebooks_w7.py` and executed once with `jupyter nbconvert --to notebook --execute --inplace --allow-errors *.ipynb` (run from this folder) so the outputs you see are real. Data: `data/ab/` (built by `python scripts/make_ab_data.py`; columns and dates in `data/ab/README.md`). The loader asserts 27 974 user rows, 67 215 events and 2 583 signed loans. Every random number comes from `np.random.default_rng(2026)`, so a re-run prints the same numbers as the pages.

| File | Day | What is inside |
|---|---|---|
| `day1_starter.ipynb` | 1 | Walk-through: sample size for 8.0 → 8.9 % (Cohen's h and the classic formula), the MDE-vs-days table, the power curve, randomising by hashing (and an uneven 90/10 split), the peeking simulation (5 000 A/A experiments). **HW 7.1**: `n_per_arm`, `hash_variant`, `srm_pvalue`, `conversion_table`, `two_prop_test` (TODO + asserts), then the A/A check on `aa_users.csv` / `aa_events.csv` and the Company-corner unit economics. |
| `day2_starter.ipynb` | 2 | The naive result on every row, the daily conversion chart; `srm_by`, `clean_users`, `ab_readout` (TODO + asserts); an empty cell for each practice task. |
| `checkpoint_ab_template.ipynb` | 5 | Checkpoint 7, Part A: six tasks (sanity checks, novelty, primary result, funnel and money, guardrail, segments), an empty code cell and an interpretation cell under each, and the decision-memo table. |

Red cells in the saved notebooks come only from the TODO stubs (`NotImplementedError` raised when an assert cell, or the HW 7.1 summary cell, calls a function you have not written yet) — nothing else. Opening and running: as in week 5 (`data/python/README.md`); these notebooks live one folder deeper, so `DATA = Path("../..")` is `data/`. In Colab, upload the five CSV files of `data/ab/` into a folder `ab/` and set `DATA = Path(".")`.

Libraries: `numpy`, `pandas`, `scipy`, `statsmodels`, `matplotlib` (all in Anaconda; otherwise `pip install -r requirements.txt`). `hashlib` is part of Python. The slowest cell (1 000 A/A re-splits) takes a few seconds.

Submitting: HW 7.1 → `submissions/week-07/day-1/` (`day1_starter.ipynb` executed + `experiment_design.md`); Checkpoint 7 Part A → `submissions/week-07/day-5/checkpoint_ab.ipynb`. Always Kernel → Restart & Run All, then save, before you copy the file.
