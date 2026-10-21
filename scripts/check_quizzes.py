"""Validate every day quiz in docs/weeks/ (run before committing).

  python scripts/check_quizzes.py           # all days
  python scripts/check_quizzes.py week-03   # one week

Checks: exactly one ```quiz block per day page, valid JSON, id = wNNdD matching the file,
6-10 questions, known types, answers in range, an explanation on every question, no duplicate questions.
Prints one line per page and a final OK / FAIL count. Exit code 1 on any failure.
"""
from __future__ import annotations

import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TYPES = {"single", "multi", "number", "text"}


def check_page(path: str) -> list[str]:
    md = open(path, encoding="utf-8").read()
    m = re.search(r"week-(\d\d)[\\/]day-(\d)\.md$", path)
    want_id = f"w{m.group(1)}d{m.group(2)}"
    blocks = re.findall(r"```quiz\s*\n(.*?)\n```", md, re.S)
    if len(blocks) != 1:
        return [f"{len(blocks)} quiz blocks (need exactly 1)"]
    try:
        quiz = json.loads(blocks[0])
    except json.JSONDecodeError as e:
        return [f"invalid JSON: {e}"]
    errs = []
    if quiz.get("id") != want_id:
        errs.append(f"id {quiz.get('id')!r}, expected {want_id!r}")
    if quiz.get("pass", 0.8) != 0.8:
        errs.append("pass must be 0.8")
    qs = quiz.get("questions", [])
    if not 6 <= len(qs) <= 10:
        errs.append(f"{len(qs)} questions (need 6-10)")
    seen = set()
    for i, q in enumerate(qs, 1):
        t = q.get("type")
        if t not in TYPES:
            errs.append(f"Q{i}: unknown type {t!r}")
            continue
        if not q.get("q"):
            errs.append(f"Q{i}: no question text")
        if not q.get("explain"):
            errs.append(f"Q{i}: no explanation")
        key = (q.get("q"), q.get("code"))
        if key in seen:
            errs.append(f"Q{i}: duplicate question")
        seen.add(key)
        if t in ("single", "multi"):
            opts = q.get("options") or []
            if len(opts) < 2:
                errs.append(f"Q{i}: fewer than 2 options")
            ans = q.get("answer")
            idx = [ans] if t == "single" else (ans if isinstance(ans, list) else [None])
            if not idx or any(not isinstance(a, int) or not 0 <= a < len(opts) for a in idx):
                errs.append(f"Q{i}: answer {ans!r} out of range")
            if t == "multi" and len(set(idx)) != len(idx):
                errs.append(f"Q{i}: repeated index in answer")
        elif t == "number":
            if not isinstance(q.get("answer"), (int, float)):
                errs.append(f"Q{i}: number answer must be numeric")
        elif t == "text":
            a = q.get("answer")
            if not (isinstance(a, str) or (isinstance(a, list) and a and all(isinstance(x, str) for x in a))):
                errs.append(f"Q{i}: text answer must be a string or a list of strings")
    if not re.search(r"^## Day quiz\s*$", md, re.M):
        errs.append("no '## Day quiz' heading")
    return errs


def main() -> None:
    week = sys.argv[1] if len(sys.argv) > 1 else "*"
    pages = sorted(glob.glob(os.path.join(ROOT, "docs", "weeks", week if week != "*" else "week-*", "day-*.md")))
    bad = 0
    for p in pages:
        errs = check_page(p)
        rel = os.path.relpath(p, ROOT)
        if errs:
            bad += 1
            print(f"FAIL {rel}: " + "; ".join(errs))
        else:
            print(f"OK   {rel}")
    print(f"\n{len(pages) - bad} OK, {bad} FAIL of {len(pages)} pages")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
