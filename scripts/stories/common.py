"""Shared helpers for a day's story source (scripts/stories/wXdY.py).

A source defines STORIES (a list of stories: {"id", "min", "title": (en, ru), "steps": [...]}) where any value can be an
(english, russian) pair, and a day module exposes build(lang) = common.build(STORIES, lang). See w6d1.py for the model."""
import json


def btn(n, en, ru, rep=1, **kw):
    """A button under the picture: n = how many (draws, months, samples…), rep = how many times the film presses it."""
    d = {"label": (en, ru), "rep": rep}
    if n:
        d["n"] = n
    d.update(kw)
    return d


def pick(v, i):
    if isinstance(v, tuple):
        return v[i]
    if isinstance(v, list):
        return [pick(x, i) for x in v]
    if isinstance(v, dict):
        return {k: pick(x, i) for k, x in v.items()}
    return v


def build(stories, lang):
    i = 0 if lang == "en" else 1
    out = {}
    for s in stories:
        steps = []
        for st in s["steps"]:
            d = {k: pick(st[k], i) for k in ("say", "show", "f", "fs", "act", "ask", "film") if k in st}
            for a in d.get("act", []):
                a.setdefault("do", "run")
            steps.append(d)
        out[s["id"]] = json.dumps({"id": s["id"], "title": pick(s["title"], i), "min": s["min"], "steps": steps}, ensure_ascii=False)
    return out
