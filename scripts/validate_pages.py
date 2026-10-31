"""Validate the course pages: every fenced JSON block parses, English and Russian copies match block for block,
and the ids the site relies on are unique.

  python scripts/validate_pages.py            # whole site
  python scripts/validate_pages.py week-03    # one folder (substring of the path)
"""
from __future__ import annotations

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, "docs")
JSON_LANGS = {"quiz", "challenge", "sqltask", "game", "task", "check", "videoquiz", "sqllab", "explore", "mistakes"}   # sqlplay holds SQL, not JSON
FENCE = re.compile(r"^(```|~~~)([\w-]*)[^\n]*\n(.*?)^\1[ \t]*$", re.S | re.M)


def blocks(text):
    return [(m.group(2), m.group(3), text[: m.start()].count("\n") + 1) for m in FENCE.finditer(text)]


def pages(sub):
    for base, _, files in os.walk(DOCS):
        for f in files:
            if f.endswith(".md") and f != "TRANSLATING.md":
                p = os.path.join(base, f)
                rel = os.path.relpath(p, DOCS).replace("\\", "/")
                if not rel.startswith("ru/") and sub in rel:
                    yield rel, p


def main(sub=""):
    bad = 0
    ids = {}
    for rel, path in pages(sub):
        en = open(path, encoding="utf-8").read()
        ru_path = os.path.join(DOCS, "ru", rel)
        ru = open(ru_path, encoding="utf-8").read() if os.path.exists(ru_path) else None
        eb = blocks(en)
        rb = blocks(ru) if ru is not None else None
        # each language links videos in its own language since 2026-10-31 (the English page drops the Russian videos and
        # their ```videoquiz): those blocks are matched by video below, every other block stays paired in order
        vq_en = {json.loads(b).get("video"): (b, n) for l, b, n in eb if l == "videoquiz" and b.strip().startswith("{")}
        vq_ru = {json.loads(b).get("video"): (b, n) for l, b, n in (rb or []) if l == "videoquiz" and b.strip().startswith("{")}
        pair_en = [x for x in eb if x[0] != "videoquiz"]
        pair_ru = [x for x in rb if x[0] != "videoquiz"] if rb is not None else None
        if ru is None:
            print(f"MISSING RU  {rel}")
            bad += 1
        elif [b[0] for b in pair_en] != [b[0] for b in pair_ru]:
            print(f"FENCES DIFFER  {rel}: en={[b[0] for b in eb]}\n                ru={[b[0] for b in rb]}")
            bad += 1
        for lang, body, line in eb:
            if lang in JSON_LANGS:
                try:
                    d = json.loads(body)
                except json.JSONDecodeError as e:
                    print(f"BAD JSON  {rel}:{line} ({lang}): {e}")
                    bad += 1
                    continue
                i = d.get("id")
                if i:
                    key = (lang if lang != "game" else "game", i)
                    if key in ids and ids[key] != rel:
                        print(f"DUP ID  {lang} {i}: {ids[key]} and {rel}")
                        bad += 1
                    ids[key] = rel
        if rb:
            for v in set(vq_en) & set(vq_ru):   # the same video on both pages: the same questions at the same seconds
                pair_en.append(("videoquiz", vq_en[v][0], vq_en[v][1]))
                pair_ru.append(("videoquiz", vq_ru[v][0], vq_ru[v][1]))
            for (l1, b1, n1), (l2, b2, n2) in zip(pair_en, pair_ru):
                if l1 in JSON_LANGS and l2 == l1:
                    try:
                        d1, d2 = json.loads(b1), json.loads(b2)
                    except json.JSONDecodeError as e:
                        print(f"BAD JSON  ru/{rel}:{n2} ({l2}): {e}")
                        bad += 1
                        continue
                    def same_answer(a, b):   # a Russian copy may ADD Russian aliases to a list of text answers
                        if isinstance(a, list) and isinstance(b, list) and all(isinstance(x, str) for x in a + b):
                            return b[: len(a)] == a
                        return json.dumps(a, sort_keys=True) == json.dumps(b, sort_keys=True)
                    for k in ("id", "answer", "h", "check", "type", "kind", "want", "at", "video"):
                        if not same_answer(d1.get(k), d2.get(k)):
                            print(f"EN/RU DIFF  {rel}:{n1} ({l1}) key {k}: {d1.get(k)!r} vs {d2.get(k)!r}")
                            bad += 1
                    if l1 in ("quiz", "check", "videoquiz"):
                        q1 = d1.get("questions") or d1.get("stops") or []
                        q2 = d2.get("questions") or d2.get("stops") or []
                        if len(q1) != len(q2) or any(not same_answer(a.get("answer"), b.get("answer")) or a.get("at") != b.get("at") for a, b in zip(q1, q2)):
                            print(f"EN/RU DIFF  {rel}:{n1} ({l1}) questions/stops")
                            bad += 1
    # the question bank of the review questions and My mistakes (scripts/build_bank.py) follows the day pages
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import build_bank
    for p in build_bank.stale():
        print(f"STALE BANK  {p}: run python -I scripts/build_bank.py")
        bad += 1
    print("OK" if not bad else f"{bad} problem(s)")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else ""))
