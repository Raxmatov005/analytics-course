"""The question bank for spaced review and the mistakes page (2026-10-30, the course plan's improvements B and C).

Reads every day page (docs/weeks/week-XX/day-N.md, and the Russian copies under docs/ru/) and writes
two files per language, docs/review.json + docs/tasks.json and docs/ru/review.json + docs/ru/tasks.json:

  review.json  {"v": 1, "days": {"w03d2": {"t": "<the page's title>", "p": "weeks/week-03/day-2",
                   "quiz": [<the day quiz's questions, as in the page>]}}}
  tasks.json   {"v": 1, "days": {"w03d2": {"checks": {"w03d2-sc": [<the self-check's questions>]},
                   "tasks": {"w03d2-l1": {"q": "<the Markdown above the task: its question>",
                             "h": "<the heading it sits under>", "j": <the task's JSON>}}}}}

quiz.js loads review.json for the review questions of a day quiz (small: every day quiz loads it); mistakes.js loads
both for the mistakes page (tasks.json is large, and only that page reads it).
Run it after editing any day page: python -I scripts/build_bank.py   (validate_pages.py fails while the bank is stale.)
"""
import json, os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs")
FENCE = re.compile(r"^```(quiz|check|task)\s*$")


def blocks(lines):
    """(kind, json text, index of the fence line) for every quiz / check / task block."""
    i = 0
    while i < len(lines):
        m = FENCE.match(lines[i])
        if m:
            j = i + 1
            while j < len(lines) and lines[j].strip() != "```":
                j += 1
            yield m.group(1), "\n".join(lines[i + 1:j]), i
            i = j
        i += 1


def above(lines, i):
    """The Markdown right above line i: the paragraph, or a code block and the paragraph above it."""
    out, k, took_code = [], i - 1, False
    while k >= 0 and not lines[k].strip():
        k -= 1
    if k >= 0 and lines[k].strip().startswith("```") and not took_code:
        # a code block between the question and the task belongs to the question
        e = k
        k -= 1
        while k >= 0 and not lines[k].strip().startswith("```"):
            k -= 1
        out = lines[k:e + 1]
        took_code = True
        k -= 1
        while k >= 0 and not lines[k].strip():
            k -= 1
    para = []
    while k >= 0 and lines[k].strip() and not lines[k].startswith("#") and not lines[k].strip().startswith("```"):
        para.insert(0, lines[k])
        k -= 1
    return "\n".join(para + ([""] if para and out else []) + out).strip()


def heading(lines, i):
    for k in range(i - 1, -1, -1):
        if lines[k].startswith("#"):
            return re.sub(r"\s*:id=\S+\s*$", "", lines[k].lstrip("#").strip())
    return ""


def build(lang):
    base = os.path.join(ROOT, "ru") if lang == "ru" else ROOT
    days = {}
    wk = os.path.join(base, "weeks")
    for w in sorted(os.listdir(wk)):
        for f in sorted(os.listdir(os.path.join(wk, w))):
            m = re.match(r"day-(\d)\.md$", f)
            if not m:
                continue
            day = "w%sd%s" % (w[-2:], m.group(1))
            lines = open(os.path.join(wk, w, f), encoding="utf-8").read().replace("\r\n", "\n").split("\n")
            title = next((re.sub(r"\s*:id=\S+\s*$", "", l[2:].strip()) for l in lines if l.startswith("# ")), day)
            rec = {"t": title, "p": "weeks/%s/day-%s" % (w, m.group(1)), "quiz": [], "checks": {}, "tasks": {}}
            for kind, text, i in blocks(lines):
                try:
                    d = json.loads(text)
                except ValueError as e:
                    sys.exit("%s %s line %d: %s" % (lang, f, i + 1, e))
                if kind == "quiz" and d.get("id") == day:
                    rec["quiz"] = d["questions"]
                elif kind == "check":
                    rec["checks"][d["id"]] = d["questions"]
                elif kind == "task":
                    rec["tasks"][d["id"]] = {"q": above(lines, i), "h": heading(lines, i), "j": d}
            days[day] = rec
    return {"v": 1, "days": days}


def texts(lang):
    """{path: file text} for one language."""
    days = build(lang)["days"]
    base = os.path.join(ROOT, "ru") if lang == "ru" else ROOT
    dump = lambda o: json.dumps({"v": 1, "days": o}, ensure_ascii=False, separators=(",", ":")) + "\n"
    return {os.path.join(base, "review.json"): dump({d: {k: r[k] for k in ("t", "p", "quiz")} for d, r in days.items()}),
            os.path.join(base, "tasks.json"): dump({d: {"checks": r["checks"], "tasks": r["tasks"]} for d, r in days.items()})}


def stale():
    """The bank files that differ from what the pages give now (validate_pages.py calls this)."""
    out = []
    for lang in ("en", "ru"):
        for p, t in texts(lang).items():
            # a CRLF checkout (git autocrlf) is not stale
            if not os.path.exists(p) or open(p, encoding="utf-8", newline="").read().replace("\r\n", "\n") != t:
                out.append(os.path.relpath(p, ROOT))
    return out


if __name__ == "__main__":
    for lang in ("en", "ru"):
        for p, t in texts(lang).items():
            open(p, "w", encoding="utf-8", newline="\n").write(t)
            print("%s %s: %d kB" % (lang, os.path.basename(p), len(t.encode("utf-8")) // 1024))
