"""Give a rebuilt day one setup box that loads, before the day's own Python, everything that Python needs from the old
Learn (which now lives in "Going further — the full version"). Both languages, safe to run again.

  python -I scripts/stories/practice_setup.py w6d3

How: every name the Python after section 1 uses (its boxes, and the starter / check code of its tasks) is looked up
in the full version's Python boxes; the top-level statements that define it (imports, functions, assignments, loops),
and what those use in turn, are copied in their order. Prints and other bare expressions are left out. The box goes
right under a "First, press ▶ Run on this box once" line at the start of the first section (2 or 3) that has Python;
if that line is already there, its box is replaced."""
import ast, io, json, os, re, sys
sys.stdout.reconfigure(encoding="utf-8")
DOCS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "docs")
LEAD = {"en": "**First, press ▶ Run on this box once.** It loads the tools and the data that every Python box below uses.",
        "ru": "**Сначала один раз нажмите ▶ Run в этом блоке.** Он загружает инструменты и данные для всех блоков Python ниже."}
OLD_LEAD = re.compile(r"^\*\*(First, press ▶ Run on this box once|Сначала один раз нажмите ▶ Run в этом блоке)\.\*\*[^\n]*\n\n```python\n.*?^```\n\n?", re.S | re.M)   # with the blank line after it, so a rerun adds none
HEAD = {"en": "# the tools and the data from the full version of section 1 — run once", "ru": "# инструменты и данные из полной версии раздела 1 — запустите один раз"}
WORD = re.compile(r"[A-Za-z_][A-Za-z0-9_]*")


def stores(node):
    out = set()
    for n in ast.walk(node):
        if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store):
            out.add(n.id)
        elif isinstance(n, (ast.FunctionDef, ast.ClassDef)):
            out.add(n.name)
        elif isinstance(n, (ast.Import, ast.ImportFrom)):
            out |= {(a.asname or a.name).split(".")[0] for a in n.names}
    return out


def uses(node):
    return {n.id for n in ast.walk(node) if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Load)}


def run(day, lang):
    page = "weeks/week-%02d/day-%s.md" % (int(day[1]), day[3:])
    p = os.path.join(DOCS, "ru" if lang == "ru" else "", page)
    raw = io.open(p, encoding="utf-8", newline="").read(); nl = "\r\n" if "\r\n" in raw else "\n"; t = raw.replace("\r\n", "\n")
    gf = re.search(r"^## (Going further — the full version|Дальше по теме — полная версия).*$", t, re.M)
    if not gf:
        sys.exit("%s: no full-version section" % lang)
    end = re.search(r"^## ", t[gf.end():], re.M)
    full = t[gf.end(): gf.end() + end.start()] if end else t[gf.end():]
    s2 = re.search(r"^## 2\. ", t, re.M)
    t = t[: s2.start()] + OLD_LEAD.sub("", t[s2.start(): gf.start()]) + t[gf.start():]
    gf = re.search(r"^## (Going further — the full version|Дальше по теме — полная версия).*$", t, re.M)
    after = t[s2.start(): gf.start()]
    code = re.findall(r"^```python\n(.*?)^```", after, re.S | re.M)
    for m in re.finditer(r"^```task\n(.*?)^```", after, re.S | re.M):
        d = json.loads(m.group(1))
        if d.get("kind") == "python":
            code += [str(v) for k, v in d.items() if isinstance(v, str)]
    if not code:
        print(lang, "no Python after section 1"); return
    need = set(WORD.findall("\n".join(code)))
    stmts = []
    for box in re.findall(r"^```python\n(.*?)^```", full, re.S | re.M):
        try:
            tree = ast.parse(box)
        except SyntaxError:
            continue
        stmts += [(s, ast.get_source_segment(box, s)) for s in tree.body if not isinstance(s, ast.Expr)]
    keep = [False] * len(stmts)
    for _ in range(3):   # what a kept statement uses is needed too, back to the first box
        for i in range(len(stmts) - 1, -1, -1):
            s = stmts[i][0]
            if not keep[i] and stores(s) & need:
                keep[i] = True
                need |= uses(s)
    body = [src for (s, src), k in zip(stmts, keep) if k]
    if not body:
        print(lang, "nothing needed from the full version"); return
    box = "```python\n" + HEAD[lang] + "\n" + "\n".join(body) + "\nprint('ready')\n```\n"
    py = re.search(r"^```python\n", after, re.M) or re.search(r"^```task\n", after, re.M)   # a day whose Python is all in tasks (w7d1)
    sec =list(re.finditer(r"^## .*\n\n(?:[^\n]+\n)+\n", after[: py.start()], re.M))[-1]
    at = s2.start() + sec.end()
    t = t[:at] + LEAD[lang] + "\n\n" + box + "\n" + t[at:]
    io.open(p, "w", encoding="utf-8", newline="").write(t.replace("\n", nl))
    print(lang, page, "setup box: %d statements" % len(body))


if __name__ == "__main__":
    for lang in ("en", "ru"):
        run(sys.argv[1], lang)
