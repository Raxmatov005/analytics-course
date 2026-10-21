# Week 6 — statistics notebooks

Built by `python scripts/make_notebooks_w6.py` and executed once with `jupyter nbconvert --to notebook --execute --inplace --allow-errors *.ipynb` (run from this folder) so the outputs you see are real. **As-of date: 2026-10-01.** Data comes from `data/raw/nur.db`; every notebook's loader builds the same frames as week 5 (payments de-duplicated, FPD30 on first instalments due by 2026-08-31) and asserts 7 828 loans, 7 099 FPD loans, 91 FPDs and 52 850 clean payments. Every random number comes from `np.random.default_rng(2026)`, so a re-run prints the same numbers as the pages.

| File | Day | What is inside |
|---|---|---|
| `day1_starter.ipynb` | 1 | Walk-through: Bin(400, 1.28 %) table and simulation, the credit-score histogram and QQ plot, applications per hour vs Poisson. **HW 6.1**: eight TODO functions, each followed by an assert cell. |
| `day2_starter.ipynb` | 2 | Walk-through: the CLT on loan principal (four panels), z vs t on 50 Consumer loans. **HW 6.2**: `wald_ci`, `wilson_ci`, `bootstrap_ci`, bonus `clopper_pearson`, `fpd_ci_table`, the error-bar chart, five sentences. |
| `day3_starter.ipynb` | 3 | `two_prop_ztest`, `relative_risk`, `cohens_d` (TODO + asserts); chi-square, Welch, Levene, Shapiro, paired vs independent; the risk-committee note cell. |
| `day4_starter.ipynb` | 4 | `perm_test`, `holm`, `n_per_arm`, `achieved_power`, `mde_rate` (TODO + asserts); Mann–Whitney vs Welch, Kruskal–Wallis, Fisher vs chi-square, the ten-branch simulation, power by simulation, the A/A idea. |
| `checkpoint_template.ipynb` | 5 | Checkpoint 6, Part A: five tasks, an empty code cell and an interpretation cell under each. Parts B and C go into `quiz.md`. |

Red cells in the saved notebooks are the TODO stubs (`NotImplementedError`) — nothing else. Opening and running: the same as week 5 (`data/python/README.md`), except the paths: these notebooks live one folder deeper, so `DATA = Path("../..")` is `data/`. In Colab, upload `nur.db` into a folder `raw/` and set `DATA = Path(".")`.

Libraries: `numpy`, `pandas`, `scipy`, `statsmodels`, `matplotlib` (all in Anaconda; otherwise `pip install -r requirements.txt`). The slowest cells (the CLT chart, the bootstrap tables, the 10 000-shuffle permutation test) take a few seconds each.

Submitting: HW 6.1 → `submissions/week-06/day-1/day1_starter.ipynb`; HW 6.2 → `submissions/week-06/day-2/` (the notebook + `hw62_fpd_ci.png`); Checkpoint 6 → `submissions/week-06/day-5/` (`checkpoint.ipynb` + `quiz.md`). Always Kernel → Restart & Run All, then save, before you copy the file.
