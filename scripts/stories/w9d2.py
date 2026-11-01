"""Week 9 Day 2 (logistic regression and the scorecard) as eight ```story blocks, English and Russian from one source (the founder, 2026-11-01).
Build once: python -I scripts/stories/rebuild.py w9d2 · after that: python -I scripts/stories/apply.py w9d2.
Pictures: logit (docs/assets/story6.js) and dots (story.js). Numbers: the page, or computed with Python on data/raw/."""
import math
from common import build as _b, btn

# the 7 615 scored loans by score band: [band, loans, bads, mean score, the model's average PD %] (the page's tables and the explorer)
BANDS = [["<560", 100, 12, 534.4, 14.24], ["560–599", 231, 25, 582.2, 8.04], ["600–639", 1356, 57, 621.2, 5.03],
         ["640–679", 2095, 73, 661.4, 3.06], ["680–719", 2059, 40, 698.1, 1.93], ["720+", 1774, 16, 750.1, 1.03]]
CURVE = [5.0677, -0.012903]          # log-odds of bad = 5.0677 − 0.012903 × score: 600 → 6.45 %, 700 → 1.86 %, PDO 53.7
LPM = [0.2809, -0.0003696]           # the straight line: 424 → 12.4 %, 850 → −3.3 %, 0 at 760
# Nur's grades as score bands, with the bad rate of all loans in the grade (the page)
GRADES = [[424, 600, 0.1091, "D"], [600, 660, 0.0512, "C"], [660, 720, 0.0188, "B"], [720, 850, 0.0093, "A"]]
# 16 toy loans: score and bad (1) or good (0). The straight line: 103 % at 400, −17 % at 800; the best S-curve: log-loss 0.436, flat 0.685
TOY = [[430, 1], [460, 1], [480, 1], [500, 0], [520, 1], [540, 1], [560, 0], [580, 1], [600, 0], [620, 0], [640, 1], [660, 0], [690, 0], [720, 0], [760, 0], [800, 0]]
FLAT_TOY = [round(math.log(7 / 9), 5), 0]                      # every toy loan at 7 of 16 = 43.75 %
BOOK = round(234 / 7828, 6)                                     # 2.99 %: odds 0.0308, 1 bad per 32.5 good, log-odds −3.48

KEYS = ["view", "p", "row", "omax", "pins", "zmax", "xr", "yr", "xt", "yt", "pts", "lpm", "out", "curve", "xc", "xu", "flat", "surp", "bands", "bandLab",
        "pred", "hotBand", "grades", "mark", "mark2", "cut", "zpanel", "zr", "card", "fo", "read", "words", "dragMark"]


def lg(**kw):   # a fresh logit picture: every option not given is switched off
    d = {k: None for k in KEYS}
    d["kind"] = "logit"
    d.update(kw)
    return d


WC = {"x": ("credit score", "кредитный балл"), "y": ("chance of going bad", "вероятность стать плохим")}
WTOY = {"x": ("credit score (toy loans)", "кредитный балл (игрушечные кредиты)"), "y": ("bad? 1 = yes, 0 = no", "плохой? 1 = да, 0 = нет")}
WZ = {"x": ("z — any number", "z — любое число"), "y": ("chance", "вероятность"), "at": ("z =", "z ="), "z": ("z itself", "сам z")}
WCARD = {"pts": ("score, points", "балл"), "lo": ("ln(good : bad odds)", "ln(шансы хороших к плохим)")}
REAL = dict(xr=[420, 860], yr=[0, 0.16], xt=100, yt=0.04, bands=BANDS, words=WC)


def roll(en, ru, p):
    return btn(0, en, ru, do="set", p=p)


STORIES = [
 {"id": "w09d2-s1", "min": 5, "title": ("Three ways to say one chance", "Одна вероятность, три записи"), "steps": [
  {"show": lg(view="rulers", p=0.25, row=[1, 3]),
   "f": ("probability = bad ÷ all = 1 ÷ 4 = {y|25 %}", "вероятность = плохие ÷ все = 1 ÷ 4 = {y|25 %}"),
   "say": ("Four loans: {o|1} went bad, {g|3} did not. The **probability** of bad is the share: 1 of 4 = {y|25 %}. We call it {y|p}.",
           "Четыре кредита: {o|1} стал плохим, {g|3} — нет. **Вероятность** плохого — это доля: 1 из 4 = {y|25 %}. Обозначим её {y|p}.")},
  {"f": ("odds = bad ÷ good = p ÷ (1 − p) = 1 ÷ 3 = {b|0.33}", "шансы = плохие ÷ хорошие = p ÷ (1 − p) = 1 ÷ 3 = {b|0,33}"),
   "fs": ("Odds are bad divided by good: p over one minus p, one third.", "Шансы — плохие, делённые на хорошие: p на один минус p, одна треть."),
   "say": ("The **odds** compare the two outcomes instead: bad ÷ good = 1 ÷ 3 = {b|0.33} — “1 bad for every 3 good”. The second ruler shows them.",
           "**Шансы** сравнивают два исхода между собой: плохие ÷ хорошие = 1 ÷ 3 = {b|0,33} — «1 плохой на каждые 3 хороших». Их показывает вторая линейка.")},
  {"show": {"p": 0.5, "row": [2, 2]},
   "say": ("A fair coin: 2 bad, 2 good. Probability {y|50 %}, odds {b|1} — one to one.", "Честная монета: 2 плохих, 2 хороших. Вероятность {y|50 %}, шансы {b|1} — один к одному.")},
  {"say": ("Your turn.", "Ваша очередь."),
   "ask": {"q": ("One loan in 3 goes bad. What are the odds of bad?", "Плохим становится один кредит из 3. Каковы шансы плохого?"),
           "options": (["0.33", "0.5", "2"], ["0,33", "0,5", "2"]), "answer": 1,
           "why": ("1 bad for 2 good: 1 ÷ 2 = 0.5. Odds divide by the good loans, not by all of them.", "1 плохой на 2 хороших: 1 ÷ 2 = 0,5. Шансы делят на хорошие кредиты, а не на все.")}},
  {"show": {"p": 0.75, "row": [3, 1]},
   "say": ("Odds have no ceiling: 3 bad and 1 good give odds of {b|3}; 99 bad and 1 good, 99. Probability stops at 100 %, odds run on to infinity.",
           "У шансов нет потолка: 3 плохих и 1 хороший — шансы {b|3}; 99 плохих и 1 хороший — 99. Вероятность упирается в 100 %, шансы уходят в бесконечность.")},
  {"show": {"p": 0.25, "row": None},
   "f": ("log-odds = ln(odds): odds 1 → {p|0} · below 1 → minus · above 1 → plus", "логарифм шансов = ln(шансы): шансы 1 → {p|0} · меньше 1 → минус · больше 1 → плюс"),
   "say": ("The third ruler takes the [[natural logarithm|ln: it turns “times e (2.718…)” into “plus 1”; ln 1 = 0]] of the odds: the **log-odds**. Odds of 1 sit at {p|0}; odds of 1 to 3 at {p|−1.10}.",
           "Третья линейка берёт от шансов [[натуральный логарифм|ln: превращает «умножить на e (2,718…)» в «прибавить 1»; ln 1 = 0]] — это **логарифм шансов**. Шансы 1 стоят на {p|0}; шансы 1 к 3 — на {p|−1,10}.")},
  {"act": [roll("1 %", "1 %", 0.01), roll("50 %", "50 %", 0.5), roll("99 %", "99 %", 0.99)],
   "say": ("Drag the yellow marker, or tap the buttons. Probability lives between 0 and 1, odds between 0 and ∞, log-odds anywhere from −∞ to +∞ — the only ruler a straight line can run along forever.",
           "Перетащите жёлтый маркер или нажмите кнопки. Вероятность живёт между 0 и 1, шансы — между 0 и ∞, логарифм шансов — где угодно от −∞ до +∞: только по этой линейке прямая может идти бесконечно.")},
  {"show": {"p": BOOK, "pins": [BOOK]},
   "say": ("Nur's book: 234 bad of 7 828 loans. Probability {y|2.99 %}, odds {b|0.0308} — 1 bad per 32.5 good — log-odds {p|−3.48}.",
           "Портфель Nur: 234 плохих из 7 828 кредитов. Вероятность {y|2,99 %}, шансы {b|0,0308} — 1 плохой на 32,5 хороших, — логарифм шансов {p|−3,48}.")},
  {"say": ("Last one: from odds back to a probability.", "Последний вопрос: от шансов обратно к вероятности."),
   "ask": {"q": ("The odds of bad are 0.25. What is the probability?", "Шансы плохого — 0,25. Какова вероятность?"),
           "options": (["25 %", "20 %", "75 %"], ["25 %", "20 %", "75 %"]), "answer": 1,
           "why": ("0.25 = 1 bad per 4 good = 1 bad in 5 loans = 20 %. Odds and probability are close only for rare events (2.99 % against 3.08 %).",
                   "0,25 = 1 плохой на 4 хороших = 1 плохой из 5 кредитов = 20 %. Шансы и вероятность близки только для редких событий (2,99 % против 3,08 %).")}},
 ]},

 {"id": "w09d2-s2", "min": 4, "title": ("A ruler through yes and no", "Линейка через «да» и «нет»"), "steps": [
  {"show": lg(pts=TOY, xr=[400, 850], yr=[-0.3, 1.3], xt=100, yt=0.25, words=WTOY),
   "say": ("16 toy loans by credit score. A loan that went bad sits at {o|1}, at the top; a good one at {g|0}, at the bottom. Low scores go bad more often.",
           "16 игрушечных кредитов по кредитному баллу. Плохой кредит стоит на {o|1}, наверху; хороший — на {g|0}, внизу. Низкие баллы чаще становятся плохими.")},
  {"show": {"lpm": "fit", "out": True, "mark": 800, "read": ["lpm"]},
   "say": ("Yesterday's tool: the least-squares line through the 0s and 1s — the [[linear probability model|a straight line fitted to a 0/1 outcome, its height read as a probability]]. Read its height as a chance… and it leaves the band at both ends.",
           "Вчерашний инструмент: прямая наименьших квадратов через нули и единицы — [[линейная вероятностная модель|прямая, подогнанная к исходу 0/1; её высоту читают как вероятность]]. Читаем высоту как шанс… и она выходит из полосы с обоих концов.")},
  {"say": ("Read the marker.", "Посмотрите на маркер."),
   "ask": {"q": ("What chance of going bad does the line give a score of 800?", "Какую вероятность стать плохим прямая даёт баллу 800?"),
           "options": (["about −17 % — an impossible chance", "0 % — fine", "it cannot be read at 800"], ["около −17 % — невозможная вероятность", "0 % — всё в порядке", "при 800 её не прочесть"]), "answer": 0,
           "why": ("Below the floor. A probability below 0 is not a rounding problem: the shape is wrong.", "Ниже пола. Вероятность меньше 0 — не ошибка округления: неверна сама форма.")}},
  {"show": lg(lpm=LPM, out=True, mark=850, read=["lpm"], bandLab=True, xr=[420, 860], yr=[-0.05, 0.16], xt=100, yt=0.05, bands=BANDS, words=WC),
   "say": ("Nur's 7 615 scored loans; each {o|bubble} is a score band's bad rate. The straight line says {o|−3.3 %} at 850 and reaches 0 at 760: above it, 6.7 % of the loans get a **negative** chance.",
           "7 615 кредитов Nur со скорингом; каждый {o|пузырь} — доля плохих в диапазоне баллов. Прямая даёт {o|−3,3 %} при 850 и доходит до 0 при 760: выше — у 6,7 % кредитов **отрицательная** вероятность.")},
  {"f": ("a “probability” must stay between 0 and 1 — by construction", "«вероятность» обязана оставаться между 0 и 1 — по построению"),
   "say": ("And a line drops by the same 0.04 points per point of score everywhere. The bubbles fall fast at low scores and slowly at high ones. We need a curve that stays between 0 and 1.",
           "И прямая падает на одни и те же 0,04 пункта на каждый балл везде. А пузыри падают быстро при низких баллах и медленно при высоких. Нужна кривая, которая остаётся между 0 и 1.")},
 ]},

 {"id": "w09d2-s3", "min": 5, "title": ("A machine that bends a line", "Машина, которая сгибает прямую"), "steps": [
  {"show": lg(curve=[0, 1], xc=0, xu=1, xr=[-6, 6], yr=[0, 1], xt=2, yt=0.25, mark=0, read=["pd"], words=WZ),
   "say": ("A machine: put in any number z, from −∞ to +∞; out comes a chance between 0 and 1. At z = 0 it gives {y|50 %}. It is the [[sigmoid|the S-shaped curve 1 ÷ (1 + e^(−z)), also called the logistic function]].",
           "Машина: подаём любое число z от −∞ до +∞ — на выходе вероятность между 0 и 1. При z = 0 она даёт {y|50 %}. Это [[сигмоида|S-образная кривая 1 ÷ (1 + e^(−z)), её ещё называют логистической функцией]].")},
  {"act": [btn(0, "z + 2", "z + 2", do="move", by=2), btn(0, "z − 2", "z − 2", do="move", by=-2)],
   "f": ("p = 1 ÷ (1 + e^(−z))", "p = 1 ÷ (1 + e^(−z))"), "fs": ("p is one over one plus e to the minus z.", "p — это единица, делённая на один плюс e в степени минус z."),
   "say": ("Move the marker: z = 2 gives {y|88 %}, z = −2 gives {y|12 %}, z = −4 only {y|1.8 %}. However far you go, the curve never leaves 0 to 1.",
           "Двигайте маркер: z = 2 даёт {y|88 %}, z = −2 — {y|12 %}, z = −4 — всего {y|1,8 %}. Как далеко ни уходи, кривая не выходит за 0–1.")},
  {"show": {"zpanel": True, "zr": [-6, 6]},
   "f": ("z = ln( p ÷ (1 − p) )  ⇄  p = 1 ÷ (1 + e^(−z))", "z = ln( p ÷ (1 − p) )  ⇄  p = 1 ÷ (1 + e^(−z))"),
   "say": ("Read it backwards: z is the **log-odds** of the chance — the third ruler of the first story. Below, z on its own ruler is a straight line; the machine bends it into the S.",
           "Прочитайте наоборот: z — это **логарифм шансов** вероятности, третья линейка первой истории. Внизу z на собственной линейке — прямая; машина сгибает её в букву S.")},
  {"show": lg(pts=TOY, curve="fit", zpanel=True, zr=[-5, 5], xr=[400, 850], yr=[0, 1], xt=100, yt=0.25, words=WTOY),
   "f": ("z = {p|β₀} + {p|β₁} × score  →  p = 1 ÷ (1 + e^(−z))", "z = {p|β₀} + {p|β₁} × балл  →  p = 1 ÷ (1 + e^(−z))"),
   "say": ("So draw a **straight line** for z — z = β₀ + β₁ × score, with β₀, β₁ (“beta”) playing yesterday's a and b — and let the machine bend it. That is [[logistic regression|a straight line for the log-odds, turned into a probability by the S-curve]].",
           "Значит, рисуем **прямую** для z — z = β₀ + β₁ × балл, где β₀ и β₁ («бета») играют роль вчерашних a и b, — и машина её сгибает. Это и есть [[логистическая регрессия|прямая для логарифма шансов, превращённая в вероятность S-образной кривой]].")},
  {"show": lg(curve=CURVE, zpanel=True, zr=[-6, 0], read=["fit"], **REAL),
   "say": ("Nur's fitted curve. Above: the curve through the bands' bubbles. Below: the same thing in log-odds — a straight line, the bubbles close to it.",
           "Подогнанная кривая Nur. Сверху — кривая через пузыри диапазонов. Снизу — то же в логарифме шансов: прямая, пузыри рядом с ней.")},
  {"show": {"mark": 600, "mark2": 700, "read": ["pd"]},
   "say": ("A score of 600 → {o|6.45 %}; a 700 → {o|1.86 %}. Our loans live far down the S: the whole book sits near log-odds −3.5.",
           "Балл 600 → {o|6,45 %}; балл 700 → {o|1,86 %}. Наши кредиты живут далеко внизу буквы S: весь портфель — около логарифма шансов −3,5.")},
  {"say": ("Look at the two panels.", "Посмотрите на две панели."),
   "ask": {"q": ("In logistic regression, which one is a straight line in the score?", "Что в логистической регрессии — прямая по баллу?"),
           "options": (["the probability", "the log-odds", "the odds"], ["вероятность", "логарифм шансов", "шансы"]), "answer": 1,
           "why": ("The bottom panel: the log-odds line is straight; the sigmoid bends it into the S above.", "Нижняя панель: прямая — логарифм шансов; сигмоида сгибает её в S наверху.")}},
 ]},

 {"id": "w09d2-s4", "min": 6, "title": ("The least surprised curve", "Кривая, которая меньше всех удивляется"), "steps": [
  {"show": lg(pts=TOY, curve=FLAT_TOY, surp=True, xr=[400, 850], yr=[0, 1], xt=100, yt=0.25, words=WTOY),
   "say": ("How do we find the best curve? Think of a weather app. It says 90 % rain and it rains: you are hardly surprised. It says 10 % and it rains: you are very surprised.",
           "Как найти лучшую кривую? Вспомните прогноз погоды. Обещали 90 % дождя — и он идёт: вы почти не удивлены. Обещали 10 % — и он идёт: вы очень удивлены.")},
  {"f": ("surprise = −ln(the chance given to what happened): 90 % → {g|0.11} · 10 % → {o|2.30}", "удивление = −ln(вероятность того, что случилось): 90 % → {g|0,11} · 10 % → {o|2,30}"),
   "say": ("We score a curve the same way: each loan's **surprise** is −ln of the chance the curve gave to what really happened. The bars under the picture show it, one per loan.",
           "Кривую оценивают так же: **удивление** каждого кредита — это −ln вероятности, которую кривая дала тому, что случилось на самом деле. Столбики под картинкой — по одному на кредит.")},
  {"show": {"read": ["loss"]},
   "f": ("log-loss = average of: −ln(p) for each bad loan, −ln(1 − p) for each good one", "log-loss = среднее из: −ln(p) для каждого плохого, −ln(1 − p) для каждого хорошего"),
   "say": ("Start flat: every loan gets the toy book's rate, {p|44 %}. The average surprise is {p|0.685}. That average is the [[log-loss|the average surprise over all loans: −ln p for a bad loan, −ln(1 − p) for a good one]].",
           "Начнём с плоской линии: каждому кредиту — доля игрушечного портфеля, {p|44 %}. Среднее удивление — {p|0,685}. Это среднее и есть [[log-loss|среднее удивление по всем кредитам: −ln p для плохого, −ln(1 − p) для хорошего]].")},
  {"act": [btn(0, "Tilt: low scores riskier", "Наклонить: низкие баллы рискованнее", 4, do="bend", by=-0.5), btn(0, "Lower the curve", "Опустить кривую", do="shift", by=-0.5)],
   "say": ("Bend the curve with the buttons. When it gives low scores a high chance and high scores a low one, most bars shrink — and the average surprise falls.",
           "Сгибайте кривую кнопками. Когда она даёт низким баллам высокую вероятность, а высоким — низкую, большинство столбиков укорачивается, и среднее удивление падает.")},
  {"act": [btn(0, "Best fit", "Лучшая кривая", do="fit")],
   "say": ("Tap **Best fit**: the curve with the smallest average surprise, {g|0.436}. Choosing the curve under which what happened is least surprising is [[maximum likelihood|picking the curve that makes the outcomes we saw most likely — the same as the smallest log-loss]].",
           "Нажмите **Лучшая кривая**: у неё самое маленькое среднее удивление, {g|0,436}. Выбирать кривую, при которой случившееся удивляет меньше всего, — это [[метод максимального правдоподобия|выбор кривой, при которой увиденные исходы наиболее вероятны; то же, что наименьший log-loss]].")},
  {"show": {"curve": "fit"},
   "say": ("A confident wrong answer costs the most: the two tall bars are the good loan at 500 and the bad loan at 640 — both against the curve's bet.",
           "Дороже всего обходится уверенный неверный ответ: два высоких столбика — хороший кредит при 500 и плохой при 640, оба против ставки кривой.")},
  {"say": ("How does the computer find it? It starts flat and steps downhill on the average surprise, a few times — Newton's method, the loop of the homework's `fit_logit`.",
           "Как компьютер её находит? Начинает с плоской линии и несколько раз шагает вниз по среднему удивлению — это метод Ньютона, цикл в `fit_logit` из домашки.")},
  {"show": lg(curve=CURVE, flat=True, **REAL),
   "f": ("Nur: log-loss {p|0.1256} with the score · {m|0.1322} flat at 2.93 %", "Nur: log-loss {p|0,1256} со скорингом · {m|0,1322} у плоской линии 2,93 %"),
   "say": ("On Nur's 7 615 scored loans the curve's average surprise is {p|0.1256}, the flat line's {m|0.1322}. Log-loss has no “good” value on its own: compare it with the flat line.",
           "На 7 615 кредитах Nur со скорингом среднее удивление кривой — {p|0,1256}, плоской линии — {m|0,1322}. У log-loss нет «хорошего» значения самого по себе: сравнивайте с плоской линией.")},
  {"say": ("Your turn.", "Ваша очередь."),
   "ask": {"q": ("What does maximum likelihood make as small as possible?", "Что метод максимального правдоподобия делает как можно меньше?"),
           "options": (["the squared gaps, like yesterday's line", "the log-loss: the average surprise", "the number of wrong calls at a 50 % cut-off"],
                       ["квадраты расстояний, как у вчерашней прямой", "log-loss: среднее удивление", "число ошибок при пороге 50 %"]), "answer": 1,
           "why": ("Most likely = least surprised. Counting mistakes at 50 % would be useless here: no loan gets a chance above 40 %.",
                   "Наиболее вероятно = наименее удивительно. Считать ошибки при 50 % здесь бесполезно: ни у одного кредита вероятность не выше 40 %.")}},
 ]},

 {"id": "w09d2-s5", "min": 5, "title": ("Every 54 points, half the odds", "Каждые 54 балла — вдвое меньше шансов"), "steps": [
  {"show": lg(curve=CURVE, zpanel=True, zr=[-6, 0], mark=600, mark2=700, read=["pd"], **REAL),
   "say": ("Two applicants: 600 and 700. Their chances of going bad: {o|6.45 %} and {o|1.86 %}. Their odds: {b|0.0690} and {b|0.0190}.",
           "Два заявителя: 600 и 700. Вероятность стать плохим: {o|6,45 %} и {o|1,86 %}. Шансы: {b|0,0690} и {b|0,0190}.")},
  {"show": {"read": ["ratio"]},
   "f": ("odds ratio for 100 points = e^(100 × {p|β₁}) = e^(−1.29) = {y|0.275}", "отношение шансов за 100 баллов = e^(100 × {p|β₁}) = e^(−1,29) = {y|0,275}"),
   "fs": ("The odds ratio for 100 points is e to the 100 times beta one: 0.275.", "Отношение шансов за 100 баллов — e в степени 100 на бета один: 0,275."),
   "say": ("Divide the odds: 0.0190 ÷ 0.0690 = {y|0.275}. 100 more points multiply the odds of going bad by 0.275 — about a quarter. That factor is an [[odds ratio|how many times one set of odds is another]].",
           "Разделим шансы: 0,0190 ÷ 0,0690 = {y|0,275}. 100 баллов сверху умножают шансы стать плохим на 0,275 — примерно на четверть. Такой множитель — [[отношение шансов|во сколько раз одни шансы больше или меньше других]].")},
  {"say": ("On the bottom panel the same 100 points are a fixed drop of the straight line: {p|−1.29} in log-odds, anywhere along it. A fixed step in log-odds is a fixed **factor** on the odds.",
           "На нижней панели те же 100 баллов — постоянный спуск прямой: {p|−1,29} в логарифме шансов, в любом её месте. Постоянный шаг в логарифме шансов — это постоянный **множитель** для шансов.")},
  {"show": {"mark2": 650},
   "say": ("50 points: the odds × {y|0.525}, a little over half. One point: × 0.987.", "50 баллов: шансы × {y|0,525}, чуть больше половины. Один балл: × 0,987.")},
  {"show": {"mark2": 653.7},
   "f": ("PDO = ln 2 ÷ 0.012903 = {y|53.7} points", "PDO = ln 2 ÷ 0,012903 = {y|53,7} балла"),
   "say": ("At 53.7 points the odds are exactly halved. Our scorecard's [[PDO|points to double the odds: every PDO points, the odds double (or halve)]] is {y|53.7}.",
           "Через 53,7 балла шансы ровно вдвое меньше. [[PDO|баллы удвоения шансов: каждые PDO баллов шансы удваиваются (или делятся пополам)]] нашей скоринговой карты — {y|53,7}.")},
  {"say": ("Think in factors.", "Думайте множителями."),
   "ask": {"q": ("50 points multiply the odds by 0.525. What do 100 points do?", "50 баллов умножают шансы на 0,525. А 100 баллов?"),
           "options": (["× 0.525 again: × 0.275 in all", "× 1.05", "the odds drop to 0"], ["ещё раз × 0,525: всего × 0,275", "× 1,05", "шансы падают до 0"]), "answer": 0,
           "why": ("0.525 × 0.525 = 0.275: each 50 points multiplies again. That is what “a straight line in log-odds” means.",
                   "0,525 × 0,525 = 0,275: каждые 50 баллов умножают заново. Это и значит «прямая в логарифме шансов».")}},
  {"show": lg(grades=GRADES, curve=CURVE, **REAL),
   "f": ("D against A: odds ratio {y|13.0} · ratio of the chances 10.91 % ÷ 0.93 % = {m|11.7}", "D против A: отношение шансов {y|13,0} · отношение вероятностей 10,91 % ÷ 0,93 % = {m|11,7}"),
   "say": ("Groups work the same way. Grade D's odds of going bad are {y|13.0} times grade A's; the ratio of their chances is {m|11.7}. Close for rare events, never the same: say which one you mean.",
           "С группами то же самое. Шансы стать плохим у класса D в {y|13,0} раза больше, чем у A; отношение вероятностей — {m|11,7}. Для редких событий они близки, но не равны: говорите, что имеете в виду.")},
 ]},

 {"id": "w09d2-s6", "min": 5, "title": ("Bubbles by band, grades by letter", "Пузыри по диапазонам, классы по буквам"), "steps": [
  {"show": lg(bandLab="n", read=["total"], **REAL),
   "say": ("No model at all: cut the scores into bands of 40 points and count. Each bubble is one band at its bad rate; its size is its number of loans (above it).",
           "Совсем без модели: разрежьте баллы на диапазоны по 40 и посчитайте. Каждый пузырь — один диапазон на высоте своей доли плохих; его размер — число кредитов (над ним).")},
  {"show": {"bandLab": True},
   "say": ("The bad rate falls in every band: {o|12.0 %} below 560 down to {o|0.9 %} at 720 and above. A rate that only ever falls is [[monotonic|always falling (or always rising) from band to band]] — the first check of any scorecard review.",
           "Доля плохих падает в каждом диапазоне: от {o|12,0 %} ниже 560 до {o|0,9 %} от 720. Доля, которая только падает, — [[монотонная|всё время падает (или всё время растёт) от диапазона к диапазону]]: первая проверка любой скоринговой карты.")},
  {"show": {"hotBand": 0, "read": ["band"]},
   "say": ("Always write the count next to a rate. The lowest band is {o|12 of 100}: one more bad loan moves it a whole point. In the biggest band (2 095 loans), 0.05 points.",
           "Всегда пишите рядом с долей число кредитов. Нижний диапазон — {o|12 из 100}: ещё один плохой кредит сдвигает долю на целый пункт. В самом большом (2 095 кредитов) — на 0,05 пункта.")},
  {"say": ("Your turn.", "Ваша очередь."),
   "ask": {"q": ("Which rate is shakier: 12 of 100 (12.0 %) or 57 of 1 356 (4.2 %)?", "Какая доля менее надёжна: 12 из 100 (12,0 %) или 57 из 1 356 (4,2 %)?"),
           "options": (["12 of 100", "57 of 1 356", "both equally sure"], ["12 из 100", "57 из 1 356", "обе одинаково надёжны"]), "answer": 0,
           "why": ("Fewer loans, more luck: one loan is 1 point of 100, but only 0.07 points of 1 356.", "Меньше кредитов — больше случайности: один кредит — это 1 пункт из 100, но лишь 0,07 пункта из 1 356.")}},
  {"show": {"hotBand": None, "read": None, "curve": CURVE},
   "say": ("The logistic curve should pass close to every bubble: the bands are the model-free picture of it. Here it does.",
           "Логистическая кривая должна проходить рядом с каждым пузырём: диапазоны — это картина без всякой модели. Здесь так и есть.")},
  {"show": lg(grades=GRADES, curve=CURVE, xr=[420, 860], yr=[0, 0.16], xt=100, yt=0.04, words=WC),
   "f": ("A: 720+ · B: 660–719 · C: 600–659 · D: below 600", "A: 720+ · B: 660–719 · C: 600–659 · D: ниже 600"),
   "say": ("Nur's grades are score bands too: D below 600, C 600–659, B 660–719, A from 720. Their bad rates (the purple steps): {o|10.91, 5.12, 1.88 and 0.93 %}.",
           "Классы риска Nur — тоже диапазоны баллов: D ниже 600, C 600–659, B 660–719, A от 720. Их доли плохих (фиолетовые ступеньки): {o|10,91, 5,12, 1,88 и 0,93 %}.")},
  {"show": {"mark": 601, "mark2": 659, "read": ["pd"]},
   "say": ("A grade throws detail away: 601 and 659 are both C, but the curve gives them {o|6.4 %} and {o|3.1 %}. Use the score near a boundary, the grade for reports.",
           "Класс теряет детали: 601 и 659 — оба C, но кривая даёт им {o|6,4 %} и {o|3,1 %}. Возле границы смотрите на балл, класс — для отчётов.")},
  {"say": ("Find it on the picture.", "Найдите это на картинке."),
   "ask": {"q": ("An applicant scores 719. Which grade does Nur print?", "У заявителя 719 баллов. Какой класс напечатает Nur?"),
           "options": (["A", "B", "C"], ["A", "B", "C"]), "answer": 1,
           "why": ("B is 660–719; one point more and it would be A. Every grade boundary is a cut-off in disguise.",
                   "B — это 660–719; на балл больше — и был бы A. Каждая граница класса — замаскированный порог отсечения.")}},
 ]},

 {"id": "w09d2-s7", "min": 5, "title": ("Points that double the odds", "Баллы, которые удваивают шансы"), "steps": [
  {"show": lg(view="card", card=[600, 50, 20], xr=[540, 680], mark=600, words=WCARD),
   "say": ("A [[scorecard|a table that turns a model's log-odds into points that are easy to read and add]] speaks in points. Pick a **base**: 600 points means good : bad odds of {b|50 to 1} — 50 good loans for every bad one.",
           "[[Скоринговая карта|таблица, которая превращает логарифм шансов модели в баллы, удобные для чтения и сложения]] говорит баллами. Выберем **базу**: 600 баллов — шансы хороших к плохим {b|50 к 1}, 50 хороших кредитов на один плохой.")},
  {"show": {"mark": 620},
   "say": ("Pick the [[PDO|points to double the odds: every PDO points more, the good : bad odds double]]: here 20. So 620 means {b|100 to 1}, 640 means 200 to 1 — each 20 points, × 2.",
           "Выберем [[PDO|баллы удвоения шансов: каждые PDO баллов сверху шансы хороших к плохим удваиваются]]: здесь 20. Значит, 620 — это {b|100 к 1}, 640 — 200 к 1: каждые 20 баллов — × 2.")},
  {"say": ("Your turn — use the ruler.", "Ваша очередь — по линейке."),
   "ask": {"q": ("On this card, what odds does a 580 have?", "Какие шансы на этой карте у 580?"),
           "options": (["25 to 1", "48 to 1", "30 to 1"], ["25 к 1", "48 к 1", "30 к 1"]), "answer": 0,
           "why": ("20 points down halves the odds: 50 ÷ 2 = 25.", "20 баллов вниз — шансы вдвое меньше: 50 ÷ 2 = 25.")}},
  {"show": {"mark": 600, "fo": True},
   "f": ("score = offset + factor × ln(odds) · factor = PDO ÷ ln 2 = 28.85 · offset = 600 − 28.85 × ln 50 = 487.12",
         "балл = offset + factor × ln(шансы) · factor = PDO ÷ ln 2 = 28,85 · offset = 600 − 28,85 × ln 50 = 487,12"),
   "fs": ("The score is the offset plus the factor times the log of the odds.", "Балл — это сдвиг плюс множитель, умноженный на логарифм шансов."),
   "say": ("The bottom ruler is ln(odds): every 20 points add the same {p|0.69} (that is ln 2). Points are just log-odds on a friendlier scale — stretched by a **factor**, shifted by an **offset**.",
           "Нижняя линейка — ln(шансы): каждые 20 баллов прибавляют одни и те же {p|0,69} (это ln 2). Баллы — тот же логарифм шансов в удобной шкале: растянутый **множителем** (factor) и сдвинутый **сдвигом** (offset).")},
  {"say": ("That is why points **add up**: a scorecard gives each answer (an age band, an income band) its own points, and the sum is the score. Adding points is adding log-odds.",
           "Поэтому баллы **складываются**: карта даёт каждому ответу (возрастной группе, группе дохода) свои баллы, а сумма — это итоговый балл. Складывать баллы — значит складывать логарифмы шансов.")},
  {"show": {"card": [600, 14.5, 53.7], "xr": [500, 760], "mark": 700, "fo": None},
   "say": ("Our score has its own scale, read off the fitted curve: 600 means {b|14.5 to 1}, 700 means {b|52.7 to 1}, and the odds double every {p|53.7} points.",
           "У нашего скоринга своя шкала, считанная с подогнанной кривой: 600 — это {b|14,5 к 1}, 700 — {b|52,7 к 1}, а шансы удваиваются каждые {p|53,7} балла.")},
  {"say": ("Last one.", "Последний вопрос."),
   "ask": {"q": ("On a PDO-20 card, what do 20 more points mean?", "Что значат 20 баллов сверху на карте с PDO 20?"),
           "options": (["20 % safer", "the good : bad odds doubled", "the chance of bad fell by 20 points"], ["на 20 % надёжнее", "шансы хороших к плохим удвоились", "вероятность плохого упала на 20 пунктов"]), "answer": 1,
           "why": ("Points are not percentages. On ours it takes 53.7 points to double the odds: always ask a scorecard for its PDO before comparing scores.",
                   "Баллы — не проценты. На нашей карте для удвоения шансов нужно 53,7 балла: прежде чем сравнивать баллы, спросите у карты её PDO.")}},
 ]},

 {"id": "w09d2-s8", "min": 6, "title": ("Do the chances come true?", "Сбываются ли вероятности?"), "steps": [
  {"show": lg(curve=CURVE, pred=True, **REAL),
   "say": ("A model is [[calibrated|its chances come true: among loans given 5 %, about 5 % go bad]] when its chances come true. Check band by band: the {o|bubble} is what happened, the {p|purple bar} what the model predicted.",
           "Модель [[откалибрована|её вероятности сбываются: среди кредитов, которым она дала 5 %, плохими становятся около 5 %]], если её вероятности сбываются. Проверяйте по диапазонам: {o|пузырь} — что случилось, {p|фиолетовая черта} — что предсказала модель.")},
  {"show": {"hotBand": 4, "read": ["band"]},
   "say": ("680–719: predicted {p|1.93 %}, happened {o|1.94 %}, on 2 059 loans — spot on. The big bands are close.",
           "680–719: прогноз {p|1,93 %}, на деле {o|1,94 %}, на 2 059 кредитах — в точку. Большие диапазоны близки.")},
  {"show": {"hotBand": 1},
   "say": ("560–599 runs hot: {o|10.8 %} happened against {p|8.0 %} predicted — on only 231 loans. Flag it and watch it.",
           "Диапазон 560–599 «горячее» прогноза: на деле {o|10,8 %} против {p|8,0 %} — всего на 231 кредите. Отметьте его и следите.")},
  {"show": {"hotBand": None, "read": ["total"]},
   "say": ("In total, the average prediction equals the bad rate exactly: {o|2.93 %}. A logistic regression always does that on the loans it was fitted on — so it proves nothing. Check by band, on **new** loans.",
           "В целом средний прогноз в точности равен доле плохих: {o|2,93 %}. Логистическая регрессия всегда так делает на кредитах, на которых её подгоняли, — значит, это ничего не доказывает. Проверяйте по диапазонам, на **новых** кредитах.")},
  {"say": ("Your turn.", "Ваша очередь."),
   "ask": {"q": ("Where must calibration be checked to mean something?", "Где нужно проверять калибровку, чтобы она что-то значила?"),
           "options": (["in total, on the loans the model was fitted on", "band by band, on new loans, with the count next to each band", "only in the biggest band"],
                       ["в целом, на кредитах, на которых подгоняли модель", "по диапазонам, на новых кредитах, с числом кредитов у каждого", "только в самом большом диапазоне"]), "answer": 1,
           "why": ("The total is right by construction. The bands, on loans the model never saw, are the real test.", "Итог верен по построению. Настоящая проверка — диапазоны на кредитах, которых модель не видела.")}},
  {"show": {"kind": "dots", "groups": [[3, "o", "bad"], [97, "g", "good"]], "cols": 20,
            "legend": [["o", ("went bad", "стал плохим")], ["g", ("stayed good", "остался хорошим")]]},
   "say": ("Now the 3 % problem. In 100 of our loans, about {o|3} go bad. A “model” that says **everyone is good** is right 97 times in 100.",
           "Теперь проблема 3 %. Из 100 наших кредитов плохими становятся около {o|3}. «Модель», которая говорит **все хорошие**, права 97 раз из 100.")},
  {"show": {"box": ["good"]},
   "say": ("Its [[accuracy|the share of right yes/no calls]] on our scored loans: {g|97.07 %} — and it catches no bad loan at all. With a rare outcome, accuracy rewards doing nothing.",
           "Её [[доля верных ответов|доля правильных ответов «да / нет»]] на наших кредитах со скорингом: {g|97,07 %} — и ни одного пойманного плохого кредита. При редком исходе эта метрика награждает бездействие.")},
  {"show": lg(curve=CURVE, cut=0.5, read=["max"], xr=[424, 850], yr=[0, 0.6], xt=100, yt=0.1, words={"x": WC["x"], "y": WC["y"], "cut": ("a 50 % cut-off:", "порог 50 %:")}),
   "say": ("And a 50 % cut-off flags nobody: the riskiest scored applicant (424 points) has a chance of only {o|40 %}. Where to cut is a business decision about cost (Day 4), not 50 %.",
           "А порог 50 % не отметит никого: у самого рискованного заявителя (424 балла) вероятность всего {o|40 %}. Где резать — решение бизнеса о стоимости ошибок (день 4), а не 50 %.")},
  {"f": ("judge a PD model by: log-loss · calibration by band · ranking (Day 3) — not accuracy", "судите о модели PD по: log-loss · калибровке по диапазонам · ранжированию (день 3) — не по доле верных ответов"),
   "say": ("A vendor brings a model.", "Поставщик приносит модель."),
   "ask": {"q": ("It is “97 % accurate” on our loans. What do you ask?", "Она «точна на 97 %» на наших кредитах. Что вы спросите?"),
           "options": (["Nothing — 97 % is excellent", "How it ranks and how well its chances come true: “everyone good” already scores 97.07 %", "Whether it is written in Python"],
                       ["Ничего — 97 % отлично", "Как она ранжирует и сбываются ли её вероятности: «все хорошие» уже дают 97,07 %", "Написана ли она на Python"]), "answer": 1,
           "why": ("With 2.93 % bad, accuracy rewards doing nothing. Ask for log-loss against the flat line, calibration by band, and the ranking (Day 3).",
                   "При 2,93 % плохих доля верных ответов награждает бездействие. Спросите log-loss против плоской линии, калибровку по диапазонам и ранжирование (день 3).")}},
 ]},
]

TOPICS = [
    ("w09d2-s1", "One chance, three rulers — probability, odds and log-odds", "Три линейки для одного риска — вероятность, шансы и логарифм шансов", []),
    ("w09d2-s2", "Yes or no on a ruler — why the straight line breaks", "«Да» или «нет» на линейке — почему прямая ломается", []),
    ("w09d2-s3", "The S-curve — a straight line, bent into a probability", "S-образная кривая — прямая, согнутая в вероятность", []),
    ("w09d2-s4", "The least surprised curve — maximum likelihood and log-loss", "Кривая, которая меньше всех удивляется, — максимальное правдоподобие и log-loss", []),
    ("w09d2-s5", "Every 54 points — odds ratios and the PDO", "Каждые 54 балла — отношение шансов и PDO", ["w09d2-x1"]),
    ("w09d2-s6", "Bands and grades — the bad rate you can count", "Диапазоны и классы — доля плохих, которую можно посчитать", []),
    ("w09d2-s7", "From log-odds to points — the scorecard's scale", "От логарифма шансов к баллам — шкала скоринговой карты", []),
    ("w09d2-s8", "Do the chances come true? — calibration and the 3 % problem", "Сбываются ли вероятности? — калибровка и проблема 3 %", ["w09d2-g1", "w09d2-g2"]),
]

CLIPS_EN = {}
CLIPS_RU = {}
GF = {"min": 60,
      "en": "The same ideas as the stories, written out in full with Python and SQL: the fits with statsmodels and with numpy (Newton's method), the log-loss by hand, the grade dummies, the band query, the scorecard's scaling, the calibration table, and the Depth notes (weight of evidence, information value, reject inference). Optional: nothing here counts toward the day.",
      "ru": "Те же идеи, что в историях, но полностью, с Python и SQL: подгонка в statsmodels и в numpy (метод Ньютона), log-loss вручную, фиктивные переменные классов, запрос по диапазонам, шкалирование скоринговой карты, таблица калибровки и углублённые заметки (WoE, информационная ценность, восстановление по отказам). По желанию: здесь ничего не входит в зачёт дня."}


def build(lang):
    return _b(STORIES, lang)


if __name__ == "__main__":
    import json
    for lang in ("en", "ru"):
        b2 = build(lang)
        print(lang, len(b2), sum(len(json.loads(v)["steps"]) for v in b2.values()), "steps")
