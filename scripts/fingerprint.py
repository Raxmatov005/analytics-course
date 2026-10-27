"""Fingerprints for answers the site checks without knowing them (same rule as scripts/check.py and the pages).

  python scripts/fingerprint.py number 7828            # -> {"h": "...", "dp": 0}
  python scripts/fingerprint.py number 60.3 1          # one decimal
  python scripts/fingerprint.py text "foreign key"     # a text answer (daily challenge style: lower-cased, quotes dropped)
  python scripts/fingerprint.py sql "SELECT COUNT(*) FROM loans"          # runs on data/raw/nur.db
  python scripts/fingerprint.py sql-file path/to/query.sql [dp]           # the same, query from a file

For "sql": prints the result (first rows) and a ready task entry for checks.json:
  {"values": [{"h": fp(first cell of the first row), "dp": dp}], "rows": {"h": fp(row count), "dp": 0}}
Use --cell r,c to fingerprint another cell, --no-rows to leave the row count out.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import sqlite3
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB = os.path.join(ROOT, "data", "raw", "nur.db")
SALT = json.load(open(os.path.join(ROOT, "checks", "checks.json"), encoding="utf-8"))["salt"]


def fp(x: float, dp: int) -> str:
    return hashlib.sha256((SALT + f"{round(x, dp):.{dp}f}").encode()).hexdigest()[:24]


def fp_text(s: str) -> str:
    c = re.sub(r"[\"'`«»]", "", str(s).lower())
    c = re.sub(r"[\s ]+", " ", c).strip().rstrip(".;").strip()
    return hashlib.sha256((SALT + c).encode()).hexdigest()[:24]


def translate(sql: str) -> str:
    s = re.sub(r"\[([^\]]+)\]", r'"\1"', sql)
    s = re.sub(r'"?\bdbo"?\.', "", s, flags=re.I)
    s = re.sub(r"\bYEAR\s*\(([^()]+)\)", r"CAST(strftime('%Y', \1) AS INTEGER)", s, flags=re.I)
    s = re.sub(r"\bMONTH\s*\(([^()]+)\)", r"CAST(strftime('%m', \1) AS INTEGER)", s, flags=re.I)
    s = re.sub(r"\bDAY\s*\(([^()]+)\)", r"CAST(strftime('%d', \1) AS INTEGER)", s, flags=re.I)
    s = re.sub(r"\bISNULL\s*\(", "IFNULL(", s, flags=re.I)
    s = re.sub(r"\bLEN\s*\(", "LENGTH(", s, flags=re.I)
    s = re.sub(r"\bGETDATE\s*\(\s*\)", "'2026-10-01'", s, flags=re.I)
    m = re.search(r"\bSELECT\s+(DISTINCT\s+)?TOP\s*\(?\s*(\d+)\s*\)?", s, flags=re.I)
    if m:
        s = s[: m.start()] + "SELECT " + (m.group(1) or "") + s[m.end():]
        s = s.rstrip().rstrip(";") + f" LIMIT {m.group(2)}"
    return s


def run_sql(text: str):
    con = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
    rows, cols = [], []
    stmts = [s for s in "\n".join(l.split("--")[0] for l in text.splitlines()).split(";") if s.strip()]
    for stmt in stmts:
        for attempt in (stmt, translate(stmt)):
            try:
                cur = con.execute(attempt)
                rows = cur.fetchall()
                cols = [d[0] for d in cur.description] if cur.description else []
                break
            except sqlite3.Error as e:
                err = e
        else:
            raise SystemExit(f"SQL error: {err}")
    return cols, rows


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 1
    kind, args = argv[1], argv[2:]
    if kind == "number":
        dp = int(args[1]) if len(args) > 1 else 0
        print(json.dumps({"h": fp(float(args[0]), dp), "dp": dp}))
        return 0
    if kind == "text":
        print(json.dumps({"h": fp_text(args[0])}))
        return 0
    if kind in ("sql", "sql-file"):
        text = open(args[0], encoding="utf-8").read() if kind == "sql-file" else args[0]
        rest = args[1:]
        dp = int(rest[0]) if rest and rest[0].isdigit() else 0
        cell = (0, 0)
        if "--cell" in rest:
            r, c = rest[rest.index("--cell") + 1].split(",")
            cell = (int(r), int(c))
        cols, rows = run_sql(text)
        print("columns:", cols)
        for r in rows[:8]:
            print("  ", r)
        if len(rows) > 8:
            print(f"   … {len(rows)} rows")
        if not rows:
            raise SystemExit("no rows: nothing to fingerprint")
        v = rows[cell[0]][cell[1]]
        try:
            num = float(str(v).replace(",", "").rstrip("%"))
        except ValueError:
            raise SystemExit(f"cell {cell} is not a number: {v!r}; pick another with --cell r,c")
        entry = {"values": [{"h": fp(num, dp), "dp": dp}]}
        if "--no-rows" not in rest:
            entry["rows"] = {"h": fp(len(rows), 0), "dp": 0}
        print("entry:", json.dumps(entry))
        return 0
    print(__doc__)
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
