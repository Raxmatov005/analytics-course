"""The course as a few text files for a ChatGPT or Claude project (docs/ai/; the founder, 2026-11-02: an assistant that
has the whole course). The learner uploads them once into a ChatGPT project (her plan), the mentor into a Claude project
(his), and asks about anything in the course there; docs/ai-helper.md explains the setup.

What goes in: every lesson and reading page as she reads it (prose, tables, SQL / Python / Excel code, the story steps'
words). What stays out: answer folds and model answers, quiz / check / game / challenge / task JSON (their answers), the
mentor's material (never in this repository anyway). Three parts per language, so each file stays easy to upload.

  python -I scripts/build_ai_pack.py          write docs/ai/course-en-1..3.md and docs/ai/course-ru-1..3.md
  python -I scripts/build_ai_pack.py --check  exit 1 if a file would change (the pack is stale)

Standard library only. Run it after page edits, like build_bank.py.
"""
from __future__ import annotations

import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.environ.get("AL_DOCS") or os.path.join(ROOT, "docs")   # AL_DOCS: read the pages from another copy (e.g. a git archive)
OUT = os.path.join(ROOT, "docs", "ai")
SITE = "https://raxmatov005.github.io/analytics-course/#/"
ANSWER = re.compile(r"answer|model|solution|ответ|образец|решени", re.I)
KEEP_CODE = {"sql", "python", "text", "excel", "dax", "powerquery", "output", "bash", "markdown", ""}
PARTS = [(0, 3), (4, 6), (7, 9)]
READING = ["README.md", "map.md", "tools-at-work.md", "sources.md", "homework/how-to-submit.md"]


def story_words(body: str) -> str:
    """The words of a ```story block: its title and each step's "say" (the explanation), nothing of its answers."""
    try:
        s = json.loads(body)
    except ValueError:
        return ""
    lines = [s.get("title", "")]
    for st in s.get("steps", []):
        say = st.get("say") if isinstance(st, dict) else None
        if isinstance(say, str):
            lines.append("- " + re.sub(r"\{\w\|([^}]*)\}", r"\1", re.sub(r"\[\[([^|\]]+)\|[^\]]*\]\]", r"\1", say)))
    return "\n".join(x for x in lines if x)


def clean(md: str) -> str:
    md = re.sub(r"<!--.*?-->", "", md, flags=re.S)

    def fence(m: re.Match) -> str:
        lang, body = m.group(1).strip().lower(), m.group(2)
        if lang == "story":
            w = story_words(body)
            return "\n(Animated explanation)\n" + w + "\n" if w else ""
        if lang in KEEP_CODE:
            return m.group(0)
        return ""   # quiz, check, game, challenge, task, sqltask, videoquiz, explore, pic, sqllab, mistakes, review …

    md = re.sub(r"^```([^\n]*)\n(.*?)^```[ \t]*$", fence, md, flags=re.S | re.M)

    def details(m: re.Match) -> str:
        return "" if ANSWER.search(m.group(1)) else m.group(0)

    md = re.sub(r"<details[^>]*>\s*<summary>(.*?)</summary>.*?</details>", details, md, flags=re.S | re.I)
    md = re.sub(r":id=[\w-]+", "", md)
    return re.sub(r"\n{3,}", "\n\n", md).strip() + "\n"


def page(path: str, base: str) -> str:
    rel = os.path.relpath(path, base).replace(os.sep, "/")
    md = open(path, encoding="utf-8").read()
    title = re.search(r"^# (.+)$", md, re.M)
    url = SITE + ("ru/" if base.endswith("ru") else "") + rel[:-3]
    return f"\n\n=====\nPAGE: {title.group(1).strip() if title else rel} ({rel})\nLINK: {url}\n=====\n\n" + clean(md)


def build(lang: str) -> dict[str, str]:
    base = os.path.join(DOCS, "ru") if lang == "ru" else DOCS
    head = ("Курс «Analytics Learning» — полный текст для ИИ-помощника. Ответы к заданиям здесь намеренно не включены.\n"
            if lang == "ru" else
            "The Analytics Learning course — the full text for an AI helper. Answers to the tasks are deliberately left out.\n")
    out = {}
    for i, (a, b) in enumerate(PARTS, 1):
        parts = [head + f"Part {i} of {len(PARTS)}: weeks {a}–{b}.\n"]
        if i == 1:
            parts += [page(os.path.join(base, p), base) for p in READING if os.path.exists(os.path.join(base, p))]
        for w in range(a, b + 1):
            for p in sorted(glob.glob(os.path.join(base, "weeks", f"week-{w:02d}", "day-*.md"))):
                parts.append(page(p, base))
        if i == len(PARTS):
            parts += [page(p, base) for p in sorted(glob.glob(os.path.join(base, "company", "*.md")))]
        out[f"course-{lang}-{i}.md"] = "".join(parts)
    return out


def main() -> None:
    files = {**build("en"), **build("ru")}
    os.makedirs(OUT, exist_ok=True)
    stale = []
    for name, text in files.items():
        p = os.path.join(OUT, name)
        old = open(p, encoding="utf-8").read() if os.path.exists(p) else None
        if old != text:
            stale.append(name)
            if "--check" not in sys.argv:
                open(p, "w", encoding="utf-8", newline="\n").write(text)
    if "--check" in sys.argv:
        print("STALE AI PACK: " + ", ".join(stale) if stale else "ai pack OK")
        sys.exit(1 if stale else 0)
    for name, text in files.items():
        print(f"{name}: {len(text) // 1024} KB")


if __name__ == "__main__":
    main()
