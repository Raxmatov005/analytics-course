"""Insert a day's stories once, each at the top of a named topic (for days that keep their text and only gain a story).

  python -I scripts/stories/insert.py w1d2

The source's INSERT = [(story id, start of the English "###" heading, start of the Russian one), ...]."""
import importlib, io, os, re, sys
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "docs")
day = sys.argv[1]
D = importlib.import_module(day)
page = "weeks/week-%02d/day-%s.md" % (int(day[1]), day[3:])
for lang, col in (("en", 1), ("ru", 2)):
    p = os.path.join(DOCS, "ru" if lang == "ru" else "", page)
    raw = io.open(p, encoding="utf-8", newline="").read(); nl = "\r\n" if "\r\n" in raw else "\n"; t = raw.replace("\r\n", "\n")
    B = D.build(lang)
    for row in D.INSERT:
        sid, head = row[0], row[col]
        if '"id": "%s"' % sid in t:
            print(lang, sid, "already there"); continue
        m = re.search(r"^### " + re.escape(head) + r".*\n", t, re.M)
        if not m:
            sys.exit("%s: heading not found: %s" % (lang, head))
        t = t[: m.end()] + "\n```story\n" + B[sid] + "\n```\n" + t[m.end():]
        print(lang, sid, "inserted under", head)
    io.open(p, "w", encoding="utf-8", newline="").write(t.replace("\n", nl))
