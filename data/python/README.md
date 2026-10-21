# Week 5 — Python notebooks

Built by `python scripts/make_notebooks.py` and executed once with `jupyter nbconvert --to notebook --execute --inplace --allow-errors` so the outputs you see are real. **As-of date: 2026-10-01** everywhere. Data comes from `data/excel/*.csv` (the week-4 extracts) and `data/raw/nur.db` (Day 4 and the checkpoint).

| File | Day | What is inside |
|---|---|---|
| `day1_starter.ipynb` | 1 | HW 5.1: eight functions as TODO cells, each followed by an assert cell. Red cells are the ones you have not written yet. |
| `day2_starter.ipynb` | 2 | pandas I on `loans_status.csv`: the walk-through from the page (run, read) + `portfolio_summary(df)` TODO. |
| `day3_starter.ipynb` | 3 | pandas II: groupby, merge, the three repairs; TODOs `clean_customers`, `clean_payments`, `dpd_per_loan` — the body of HW 5.2. |
| `day4_starter.ipynb` | 4 | matplotlib / seaborn / `pd.read_sql`; the five-figure pack for Timur, saved to `figures/`. |
| `checkpoint_template.ipynb` | 5 | Checkpoint 5: ten sections, each with the week-3 SQL number given and an empty code cell; your "match / mismatch" line under each. |
| `figures/` | 4 | The PNGs the Day-4 notebook writes (re-created on every run). |

## Opening the notebooks

**Locally (recommended).** Install Anaconda (https://www.anaconda.com/download, "Just me", defaults), open *Anaconda Prompt*, then:

```
cd "C:\path\to\Analytics Learning"
pip install -r requirements.txt        # once; Anaconda already has most of it
jupyter notebook data/python
```

The browser opens at the folder; click a notebook. Run a cell with **Shift+Enter**; *Kernel → Restart & Run All* re-runs everything from a clean state (do this before you submit). Paths inside the notebooks are relative to this folder: `DATA = Path("..")` is `data/`, so `DATA / "excel" / "loans_status.csv"` works as long as you open the notebook from here.

**Google Colab (fallback, no install).** https://colab.research.google.com → *Upload* → pick the `.ipynb`. In the left *Files* pane create folders `excel/` and `raw/` and upload the CSVs you need (and `nur.db` for Day 4 / Day 5, 9.6 MB). Then change the first cell to `DATA = Path(".")`. Colab forgets uploaded files when the session ends — download your notebook (*File → Download → .ipynb*) before you close it.

**VS Code** also opens `.ipynb` files (install the *Jupyter* extension; pick the Anaconda interpreter as the kernel).

## Submitting

Copy the finished notebook into the folder the page names (`submissions/week-05/day-1/` for HW 5.1, `day-3/` for HW 5.2, `day-5/` for the checkpoint) **after** *Restart & Run All*, so the outputs — and the green assert cells — are saved inside the file. A notebook submitted with red assert cells is graded on the cells that pass.

## If something breaks

- `ModuleNotFoundError: pandas` — the kernel is not the Anaconda one. Kernel → Change kernel → *Python 3 (Anaconda)*, or `pip install -r requirements.txt` in the prompt you started Jupyter from.
- `FileNotFoundError: ../excel/...` — the notebook was opened from a different folder. Start `jupyter notebook` from the repo root and open `data/python/…`, or set `DATA` to an absolute path.
- A cell runs forever (`[*]`) — Kernel → Interrupt. Every cell in these notebooks finishes in under two seconds; a long wait means a path or a kernel problem.
- `FULL OUTER JOIN` syntax error in the Day-4 roll-rate cell — your SQLite is older than 3.39. Print `sqlite3.sqlite_version`; the Day-4 page shows the pandas alternative (two DPD snapshots, `merge(how="outer")`).
