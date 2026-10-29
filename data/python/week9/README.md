# Week 9 — credit risk notebooks

Written for Week 9 (credit risk models) and executed once so the outputs you see are real. Data comes from
`data/raw/nur.db`. **Bad** = a loan whose status is `default` or `written_off` (234 of 7 828 loans, 2.99 %; 223 of the
7 615 loans with a credit score).

| File | Day | What is inside |
|---|---|---|
| `day1_starter.ipynb` | 1 | Walk-through: scatter plots, Pearson and Spearman, the least-squares line, R², residuals, several predictors. **HW 9.1**: TODO functions with assert cells, then Consumer loans' payment line, one prediction, three sentences. |
| `day2_starter.ipynb` | 2 | Walk-through: odds and log-odds, the logistic fit (statsmodels and by hand), bad rate by score band, the scorecard's PDO, calibration. **HW 9.2**: TODO functions with assert cells, Consumer loans' PD at 600 and 700, a calibration table. |
| `day3_starter.ipynb` | 3 | Walk-through: the confusion matrix, ROC, AUC, Gini, KS, lift, out-of-time. **HW 9.3**: TODO functions with assert cells, AUC / Gini / KS by product and by year. |
| `day4_starter.ipynb` | 4 | Walk-through: the cut-off table, expected loss, profit by cut-off, swap-in / swap-out, PSI and CSI. **HW 9.4**: TODO functions with assert cells, the cut-off table, PSI on ten bins. |
| `checkpoint.ipynb` | 5 | Checkpoint 9: Parts A (performance), B (stability) and C (the cut-off), an empty code cell and an interpretation cell under each; the memo goes into `memo.md`. |

Red cells in the saved notebooks are the TODO stubs (`NotImplementedError`) — nothing else. Opening and running: the
same as week 6 (`data/python/week6/README.md`): these notebooks live one folder deeper, so `DATA = Path("../..")` is
`data/`. In Colab, upload `nur.db` into a folder `raw/` and set `DATA = Path(".")`.

Libraries: `numpy`, `pandas`, `scipy`, `statsmodels`, `matplotlib`.

Submitting: HW 9.1 → `submissions/week-09/day-1/day1_starter.ipynb`; HW 9.2 → `submissions/week-09/day-2/`; HW 9.3 →
`submissions/week-09/day-3/`; HW 9.4 → `submissions/week-09/day-4/`; Checkpoint 9 → `submissions/week-09/day-5/`
(`checkpoint.ipynb` + `memo.md`) — or simply the 📎 box at the end of each homework on the lesson page. Always Kernel →
Restart & Run All, then save, before you hand it in.
