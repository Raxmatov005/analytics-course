"""Write the ```story blocks of a day page from its source in this folder (both languages, in place).

  python -I scripts/stories/apply.py w6d1      # docs/weeks/week-06/day-1.md and its Russian copy

The source (w6d1.py) holds every step once: the picture (shared) and the words in English and Russian, so the two pages
always have the same steps, pictures and answers (validate_pages.py checks it). Run validate_pages.py after."""
import importlib, io, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "docs")
day = sys.argv[1]
S = importlib.import_module(day)
page = "weeks/week-%02d/day-%s.md" % (int(day[1]), day[3:])
for lang in ("en", "ru"):
    p = os.path.join(DOCS, "ru" if lang == "ru" else "", page)
    raw = io.open(p, encoding="utf-8", newline="").read()
    nl = "\r\n" if "\r\n" in raw else "\n"
    t = raw.replace("\r\n", "\n")
    B = S.build(lang)
    t, n = re.subn(r"```story\n(.*?)\n```", lambda m: "```story\n" + B[json.loads(m.group(1))["id"]] + "\n```", t, flags=re.S)
    io.open(p, "w", encoding="utf-8", newline="").write(t.replace("\n", nl))
    print(lang, n, "stories written")
