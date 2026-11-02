"""Place stories that live in a shared source (e.g. extra_stories.py) on their pages, both languages, in place.

  python -I scripts/stories/place.py extra_stories            # every story of the source
  python -I scripts/stories/place.py extra_stories w08d1-s1   # one story

The source holds STORIES (as in common.py) and WHERE = {story id: (page, anchor)}: page "weeks/week-08/day-1.md"; anchor
either the start of an English "###" heading (the story goes at the top of that topic; the Russian page gets it under the
heading with the same position among its "###" headings) or {"after": "<id of a block>"} (right after that fenced block).
A story already on the page is rewritten from the source; nothing else on the page changes."""
import importlib, io, json, os, re, sys
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "docs")
S = importlib.import_module(sys.argv[1])
only = set(sys.argv[2:])
EN, RU = S.build("en"), S.build("ru")
for sid, (page, anchor) in S.WHERE.items():
    if only and sid not in only:
        continue
    paths = {"en": os.path.join(DOCS, page), "ru": os.path.join(DOCS, "ru", page)}
    en_heads = [l for l in io.open(paths["en"], encoding="utf-8").read().split("\n") if l.startswith("### ")]
    for lang in ("en", "ru"):
        p = paths[lang]
        raw = io.open(p, encoding="utf-8", newline="").read()
        nl = "\r\n" if "\r\n" in raw else "\n"
        t = raw.replace("\r\n", "\n")
        body = (EN if lang == "en" else RU)[sid]
        old = re.search(r"```story\n(\{\"id\": \"" + re.escape(sid) + r"\".*?)\n```", t, re.S)
        if old:
            t = t[: old.start(1)] + body + t[old.end(1):]
            what = "rewritten"
        else:
            if isinstance(anchor, dict):
                m = re.search(r"^```\w+\n\{\"(?:id|type)\"[^\n]*\"id\": \"" + re.escape(anchor["after"]) + r"\".*?\n```\n", t, re.S | re.M)
                if not m:
                    m = re.search(r"^```\w+\n\{\"id\": \"" + re.escape(anchor["after"]) + r"\".*?\n```\n", t, re.S | re.M)
                if not m:
                    sys.exit("%s %s: block not found: %s" % (lang, page, anchor["after"]))
                at = m.end()
            else:
                k = [i for i, l in enumerate(en_heads) if l.startswith("### " + anchor)]
                if len(k) != 1:
                    sys.exit("%s: heading not found once: %s" % (page, anchor))
                heads = [m2 for m2 in re.finditer(r"^### .*\n", t, re.M)]
                at = heads[k[0]].end()
            t = t[:at] + "\n```story\n" + body + "\n```\n" + t[at:]
            what = "inserted"
        io.open(p, "w", encoding="utf-8", newline="").write(t.replace("\n", nl))
        print(lang, sid, what, page)
