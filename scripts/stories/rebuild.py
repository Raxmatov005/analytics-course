"""Turn a day's "## 1. Learn" into stories, once (the founder, 2026-11-01: "change for all the places where it is needed").

  python -I scripts/stories/rebuild.py w6d2

From the day's source (scripts/stories/w6d2.py) it writes, in the English page and its Russian copy:
  - a new "## 1. Learn": the intro, then per topic a "###" heading, its ```story, its clips, and the playgrounds or games
    named in "after" (moved, unchanged, out of the old text with the "Before you read" line above them);
  - the old Learn, unchanged, as "## Going further — the full version, with Python (optional, N min)" just before the
    Day quiz (sections.js keeps it out of the day's count);
  - the old Learn's first Python box (the setup) at the start of "## 3. Practice", when it had one.
It refuses a page that already has a ```story (then use apply.py to rewrite the stories only).

The source defines, besides STORIES and build(lang):
  TOPICS   = [(story id, English heading, Russian heading, [ids of explore / game blocks to put after it]), …]
  CLIPS_EN = {story id: ["> 🎬 **Didn't get …?** [… explains it · N min](https://youtu.be/…?t=…&end=…)", …]}
  CLIPS_RU = {story id: ["words found in a 🎬 line of the Russian page", …]}   (the Russian page keeps its own clips)
  GF       = {"min": 60, "en": "what the full version holds", "ru": "…"}
"""
import importlib, io, json, os, re, sys
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
DOCS = os.environ.get("AL_DOCS") or os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "docs")   # AL_DOCS: a copy, for a dry run
FENCE = re.compile(r"^```(\w+)[^\n]*\n(.*?)^```[ \t]*\n", re.S | re.M)
WORDS = {
    "en": {
        "intro": "{n} short stories. Each one tells **one idea in small steps**: read a sentence, watch the picture change, press **Next**. "
                 "A dotted word shows its meaning when you tap it. Tired of reading? Press **▶ Play as a video**: the page reads every step aloud and moves the picture for you.\n\n"
                 "The Python for each idea, and the extra topics, are in **Going further — the full version** near the end of the page (optional).",
        "play": "**Now play.** The same idea with sliders — try the challenges.",
        "game": "**Now check yourself.**",
        "gf": "## Going further — the full version, with Python (optional, {m} min)",
        "quiz": "## Day quiz",
        "practice": "**First, press ▶ Run on this box once.** It loads the tools and the data that every Practice box uses.",
    },
    "ru": {
        "intro": "{n} коротких историй. Каждая рассказывает **одну идею маленькими шагами**: прочитайте фразу, посмотрите, как меняется картинка, нажмите **Далее**. "
                 "Слово с пунктиром показывает своё значение, если на него нажать. Устали читать? Нажмите **▶ Смотреть как видео**: страница прочитает каждый шаг вслух и сама подвинет картинку.\n\n"
                 "Код на Python к каждой идее и дополнительные темы — в разделе **«Дальше по теме — полная версия»** ближе к концу страницы (по желанию).",
        "play": "**Теперь поиграйте.** Та же идея с ползунками — попробуйте задания.",
        "game": "**Теперь проверьте себя.**",
        "gf": "## Дальше по теме — полная версия, с Python (по желанию, {m} мин) :id=going-further--the-full-version-with-python-optional-{m}-min",
        "quiz": "## Тест дня",
        "practice": "**Сначала один раз нажмите ▶ Run в этом блоке.** Он загружает инструменты и данные для всех задач практики.",
    },
}
RU_NUM = {3: "Три", 4: "Четыре", 5: "Пять", 6: "Шесть", 7: "Семь", 8: "Восемь", 9: "Девять", 10: "Десять"}
EN_NUM = {3: "Three", 4: "Four", 5: "Five", 6: "Six", 7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten"}


def slug(s):
    return re.sub(r"\s", "-", re.sub(r"[ -⁯⸀-⹿\\'!\"#$%&()*+,./:;<=>?@\[\]^`{|}~]", "", s.lower()))


def rebuild(D, day, lang):
    page = "weeks/week-%02d/day-%s.md" % (int(day[1]), day[3:])
    path = os.path.join(DOCS, "ru" if lang == "ru" else "", page)
    raw = io.open(path, encoding="utf-8", newline="").read()
    nl = "\r\n" if "\r\n" in raw else "\n"
    t = raw.replace("\r\n", "\n")
    if "```story" in t:
        print(lang, "already has stories: use apply.py"); return
    W = WORDS[lang]
    a = re.search(r"^## 1\. .*\n", t, re.M); z = re.search(r"^## 2\. ", t, re.M)
    head, learn, rest = t[: a.end()], t[a.end(): z.start()], t[z.start():]
    want = {i for _, _, _, after in D.TOPICS for i in after}
    moved = {}
    for m in list(FENCE.finditer(learn))[::-1]:
        if m.group(1) not in ("explore", "game"):
            continue
        try:
            bid = json.loads(m.group(2)).get("id")
        except ValueError:
            continue
        if bid not in want:
            continue
        s0 = m.start()
        pm = re.search(r"\n\n(\*\*(Before you read|Прежде чем читать)[^\n]*\n)\n$", learn[: s0])
        if pm:
            s0 -= len(pm.group(1)) + 1
        moved[bid] = (m.group(1), m.group(0))
        learn = learn[: s0] + learn[m.end():]
    missing = want - set(moved)
    if missing:
        sys.exit("%s: blocks not found in the old Learn: %s" % (lang, sorted(missing)))
    first = re.search(r"^### ", learn, re.M)
    sm = re.search(r"^```python\n.*?^```\n", learn[: first.start()] if first else "", re.S | re.M)
    stories = D.build(lang)
    clips = {}
    if lang == "ru":
        lines = t.split("\n")
        for sid, keys in getattr(D, "CLIPS_RU", {}).items():
            clips[sid] = [next(l for l in lines if l.startswith("> 🎬") and k in l) for k in keys]
    else:
        clips = getattr(D, "CLIPS_EN", {})
    n = len(D.TOPICS)
    out = ["", W["intro"].replace("{n}", (EN_NUM if lang == "en" else RU_NUM).get(n, str(n))), ""]
    for sid, en, ru, after in D.TOPICS:
        out += ["### " + (en if lang == "en" else ru + " :id=" + slug(en)), "", "```story", stories[sid], "```", ""]
        for c in clips.get(sid, []):
            out += [c, ""]
        for bid in after:
            kind, body = moved[bid]
            out += [W["play"] if kind == "explore" else W["game"], "", body.rstrip("\n"), ""]
    gf = W["gf"].replace("{m}", str(D.GF["min"])) + "\n\n" + D.GF[lang] + "\n\n" + learn.lstrip("\n")
    if sm:
        pr = re.search(r"^## 3\. .*\n\n(?:[^\n]+\n)+\n", rest, re.M)
        if pr and "```python" in rest[pr.end():]:
            rest = rest[: pr.end()] + W["practice"] + "\n\n" + sm.group(0) + "\n" + rest[pr.end():]
    q = re.search(r"^" + re.escape(W["quiz"]) + r"\b.*$", rest, re.M)
    at = q.start() if q else len(rest)
    rest = rest[:at] + gf.rstrip("\n") + "\n\n" + rest[at:]
    new = head + "\n".join(out) + "\n" + rest
    io.open(path, "w", encoding="utf-8", newline="").write(new.replace("\n", nl))
    print(lang, page, "rebuilt; moved:", sorted(moved))


if __name__ == "__main__":
    day = sys.argv[1]
    D = importlib.import_module(day)
    for lang in ("en", "ru"):
        rebuild(D, day, lang)
