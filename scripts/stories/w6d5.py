"""Week 6 Day 5: one game-like story, "Which test?" (apply with: python -I scripts/stories/apply.py w6d5). Inserted by hand
at the top of Part B (the test-choice quiz) on both pages. Each step asks one question about the data — what is measured,
which groups, enough data for the formula — and the "choose" picture (docs/assets/story4.js) lights the path to the test.
Its cases are not the twelve graded scenarios: partner vs branch in May 2026 (Fisher, p 0.0485), app vs branch on the
whole book (two-proportion z, p 0.032; expected 2 411 × 75 ÷ 5 674 = 31.9), risk grade by channel (Mann–Whitney),
the same customers before and after a course (paired t)."""
from common import build as _b

TREE = [
    [("What is measured?", "Что измеряем?"), [("a rate (yes / no)", "доля (да / нет)"), ("a number (a mean)", "число (среднее)"), ("an order (ranks)", "порядок (ранги)")]],
    [("Which groups?", "Какие группы?"), [("1 vs a known value", "1 против числа"), ("2 independent", "2 независимые"), ("2 paired: same units", "2 парные: те же"), ("3 or more", "3 и больше")]],
    [("Enough data?", "Данных хватает?"), [("yes: the formula", "да: формула"), ("no: exact / ranks", "нет: точный / ранги")]],
]

STORIES = [
 {"id": "w06d5-s1", "min": 5, "title": ("Which test? A game", "Какой тест? Игра"), "steps": [
  {"show": {"kind": "choose", "labels": TREE, "pick": []},
   "say": ("Three questions pick almost every test: **what is measured**, **which groups**, and one **check** — is there enough data for the formula? Four quick cases. Answer, and the path lights up.",
           "Почти любой тест выбирают три вопроса: **что измеряем**, **какие группы** и одна **проверка** — хватает ли данных для формулы. Четыре быстрых случая. Отвечайте — и путь загорится.")},
  {"say": ("**Case 1.** The May 2026 vintage: 4 FPDs in 67 partner loans, 2 in 179 branch loans. Does the channel matter?",
           "**Случай 1.** Поколение мая 2026: 4 FPD на 67 кредитов партнёров, 2 на 179 филиальных. Влияет ли канал?"),
   "ask": {"q": ("What is measured?", "Что измеряем?"),
           "options": (["a rate: FPD yes / no for each loan", "a number: the mean of something", "an order: ranks"], ["долю: FPD да / нет у каждого кредита", "число: среднее чего-то", "порядок: ранги"]), "answer": 0,
           "why": ("Each loan either has an FPD or not: we compare shares.", "У каждого кредита FPD либо есть, либо нет: сравниваем доли.")}},
  {"show": {"pick": [0]},
   "say": ("A rate. Next: who is compared with whom?", "Доля. Дальше: кого с кем сравниваем?"),
   "ask": {"q": ("Which groups?", "Какие группы?"),
           "options": (["one group vs a known value", "two independent groups", "the same loans measured twice"], ["одна группа против известного числа", "две независимые группы", "одни и те же кредиты дважды"]), "answer": 1,
           "why": ("Partner loans and branch loans are different loans: two independent groups.", "Кредиты партнёров и филиальные — разные кредиты: две независимые группы.")}},
  {"show": {"pick": [0, 1, 1]},
   "f": ("expected FPDs in partner = 67 × 6 ÷ 246 = 1.63 < 5", "ожидаемых FPD у партнёров = 67 × 6 ÷ 246 = 1,63 < 5"),
   "say": ("The check: if the channel didn't matter, partner would expect only 1.63 FPDs — below 5. Too little for the formula.",
           "Проверка: если бы канал не влиял, у партнёров ожидалось бы всего 1,63 FPD — меньше 5. Для формулы мало."),
   "ask": {"q": ("Which test?", "Какой тест?"),
           "options": (["two-proportion z-test or χ²", "Fisher's exact test", "Welch's t-test"], ["z-тест для двух долей или χ²", "точный критерий Фишера", "t-критерий Уэлча"]), "answer": 1,
           "why": ("Two rates with an expected count below 5: deal the 6 FPDs again with the totals fixed and count exactly — Fisher, p = 0.0485.",
                   "Две доли и ожидаемое меньше 5: раздаём 6 FPD заново при тех же итогах и считаем точно — Фишер, p = 0,0485.")}},
  {"show": {"words": {"test": ("Fisher's exact test", "точный критерий Фишера")}},
   "say": ("Rate → two independent groups → too little data → **Fisher**. Now the same question with plenty of data.",
           "Доля → две независимые группы → данных мало → **Фишер**. А теперь тот же вопрос, но данных много.")},
  {"show": {"pick": [0, 1], "words": {}},
   "f": ("expected FPDs in app = 2 411 × 75 ÷ 5 674 = 31.9", "ожидаемых FPD в приложении = 2 411 × 75 ÷ 5 674 = 31,9"),
   "say": ("**Case 2.** The whole book, app vs branch: 41 FPDs in 2 411 app loans, 34 in 3 263 branch loans. Same shape — a rate, two groups. The check now expects 31.9 FPDs in the app row.",
           "**Случай 2.** Весь портфель, приложение против филиалов: 41 FPD на 2 411 кредитов приложения, 34 на 3 263 филиальных. Та же форма — доля, две группы. Проверка ждёт теперь 31,9 FPD в строке приложения."),
   "ask": {"q": ("Which test?", "Какой тест?"),
           "options": (["two-proportion z-test (or χ²)", "Mann–Whitney", "a paired t-test"], ["z-тест для двух долей (или χ²)", "Манн–Уитни", "парный t-критерий"]), "answer": 0,
           "why": ("Every expected count is far above 5, so the formula works: z = 2.15, p = 0.032. Fisher would agree (0.034).",
                   "Все ожидаемые намного больше 5, формула работает: z = 2,15, p = 0,032. Фишер бы согласился (0,034).")}},
  {"show": {"pick": [0, 1, 0], "words": {"test": ("two-proportion z-test", "z-тест для двух долей")}},
   "say": ("Rate → two independent groups → enough data → the **two-proportion z-test** (χ² on the 2 × 2 table gives the same p).",
           "Доля → две независимые группы → данных хватает → **z-тест для двух долей** (χ² на таблице 2 × 2 даёт то же p).")},
  {"show": {"pick": [], "words": {}},
   "say": ("**Case 3.** Risk grade (A, B, C, D) of app loans against branch loans. Are app borrowers in worse grades?",
           "**Случай 3.** Риск-грейд (A, B, C, D) кредитов приложения против филиальных. У заёмщиков приложения грейды хуже?"),
   "ask": {"q": ("What is measured?", "Что измеряем?"),
           "options": (["a rate", "a number: the average grade", "an order: A < B < C < D"], ["долю", "число: средний грейд", "порядок: A < B < C < D"]), "answer": 2,
           "why": ("“C minus A” has no size, so an average grade means nothing — but the order is real: compare ranks.", "У «C минус A» нет величины, поэтому средний грейд ничего не значит, — но порядок настоящий: сравниваем ранги.")}},
  {"show": {"pick": [2, 1]},
   "say": ("An order, two independent groups.", "Порядок, две независимые группы."),
   "ask": {"q": ("Which test?", "Какой тест?"),
           "options": (["Welch's t-test", "Mann–Whitney U", "Wilcoxon signed-rank"], ["t-критерий Уэлча", "U-критерий Манна–Уитни", "критерий Вилкоксона"]), "answer": 1,
           "why": ("Two independent groups compared by ranks: does a random app loan tend to have a worse grade than a random branch loan? Wilcoxon is the paired twin.",
                   "Две независимые группы сравниваем по рангам: склонен ли случайный кредит приложения иметь грейд хуже случайного филиального? Вилкоксон — парный близнец.")}},
  {"show": {"words": {"test": ("Mann–Whitney U test", "U-критерий Манна–Уитни")}},
   "say": ("Order → two independent groups → **Mann–Whitney**, whatever the size. With three or more channels: Kruskal–Wallis.",
           "Порядок → две независимые группы → **Манн–Уитни**, при любом объёме. Если каналов три и больше — Краскел–Уоллис.")},
  {"show": {"pick": [], "words": {}},
   "say": ("**Case 4.** The same 200 customers' credit scores, before and after a financial-literacy course. Did the course move them?",
           "**Случай 4.** Кредитные скоры одних и тех же 200 клиентов до и после курса финансовой грамотности. Сдвинул ли их курс?"),
   "ask": {"q": ("Which groups?", "Какие группы?"),
           "options": (["two independent groups of 200", "the same 200 customers twice", "one group vs a known value"], ["две независимые группы по 200", "одни и те же 200 клиентов дважды", "одна группа против известного числа"]), "answer": 1,
           "why": ("Each customer is compared with themselves: paired. A test for independent groups would throw that pairing away.", "Каждого клиента сравнивают с ним самим: это парные данные. Тест для независимых групп выбросил бы эту связь.")}},
  {"show": {"pick": [1, 2, 0], "words": {"test": ("paired t-test", "парный t-критерий")}},
   "f": ("measured? → which groups? → enough data? → the test", "что измеряем? → какие группы? → данных хватает? → тест"),
   "say": ("A number, the same customers twice, plenty of data → the **paired t-test** (with few or skewed differences: Wilcoxon signed-rank). The same three questions every time — use them on the twelve scenarios below.",
           "Число, одни и те же клиенты дважды, данных много → **парный t-критерий** (если разностей мало или они асимметричны — Вилкоксон). Каждый раз те же три вопроса — задайте их двенадцати сценариям ниже.")},
 ]},
]


def build(lang):
    return _b(STORIES, lang)


if __name__ == "__main__":
    import json
    for lang in ("en", "ru"):
        b2 = build(lang)
        print(lang, len(b2), sum(len(json.loads(v)["steps"]) for v in b2.values()), "steps")
