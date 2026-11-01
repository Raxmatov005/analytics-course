"""Week 6 Day 1 as seven ```story blocks (apply with: python -I scripts/stories/apply.py w6d1), English and Russian from one source (the founder, 2026-11-01).
Each step: show (the picture, shared), act, say / f / fs / ask in both languages. build(lang) -> {story id: json text}."""
import json

P = 91 / 7099
LOANS = [0.65, 1.89, 2.3, 3.1, 3.37, 3.5, 4.98, 6.58, 6.74, 7.21, 22.42]

def b(n, en, ru, rep=1):   # a "run the picture" button
    return {"n": n, "label": (en, ru), "rep": rep}

STORIES = [
 {"id": "w06d1-s1", "min": 4, "title": ("A jar of balls", "Банка с шарами"), "steps": [
  {"show": {"kind": "bag", "balls": [["o", 1], ["g", 9]], "words": {"hit": ("orange", "оранжевых")}},
   "act": [dict(b(1, "Draw 1 ball", "Достать 1 шар", 3), do="draw")],
   "say": ("Here is a jar with 10 balls: {o|1 orange} and {g|9 green}. Close your eyes, pull out one ball, look at it and put it back.",
           "Вот банка с 10 шарами: {o|1 оранжевый} и {g|9 зелёных}. Закройте глаза, достаньте один шар, посмотрите на него и положите обратно.")},
  {"show": {"line": True}, "act": [dict(b(10, "Draw 10", "Достать 10", 3), do="draw")],
   "say": ("Do it many times and keep count. Tap **Draw 10** a few times: the share of orange jumps around — 0 %, 20 %, 10 %…",
           "Повторим много раз и будем считать. Нажмите **Достать 10** несколько раз: доля оранжевых скачет — 0 %, 20 %, 10 %…")},
  {"act": [dict(b(1000, "Draw 1 000", "Достать 1 000"), do="draw")],
   "say": ("Now draw a thousand. The orange line calms down near {o|1 in 10}. **That settling number is the probability**: how often something happens when you repeat it many, many times.",
           "Теперь достанем тысячу. Оранжевая линия успокаивается около {o|1 из 10}. **Это число и есть вероятность**: как часто что-то случается, если повторять много-много раз.")},
  {"f": ("P(orange) = {o|1} ÷ {b|10} = {y|0.1} = {y|10 %}", "P(оранжевый) = {o|1} ÷ {b|10} = {y|0,1} = {y|10 %}"),
   "fs": ("P of orange is 1 divided by 10: 0.1, or 10 percent.", "P от оранжевого — это 1 разделить на 10: 0,1, или 10 процентов."),
   "say": ("With a jar you don't even need to draw: count the orange balls and divide by all the balls. We write it **P(orange)** — P for probability.",
           "С банкой можно и не тянуть: посчитайте оранжевые шары и разделите на все шары. Пишем **P(оранжевый)** — P от английского probability, вероятность.")},
  {"say": ("Your turn.", "Ваша очередь."),
   "ask": {"q": ("A jar has 20 balls, 5 of them orange. What is P(orange)?", "В банке 20 шаров, из них 5 оранжевых. Чему равна P(оранжевый)?"),
           "options": (["0.5", "0.25", "0.05", "5"], ["0,5", "0,25", "0,05", "5"]), "answer": 1,
           "why": ("5 ÷ 20 = 0.25: one ball in four.", "5 ÷ 20 = 0,25: один шар из четырёх.")}},
  {"show": {"kind": "dots", "groups": [[13, "o", "fpd"], [987, "g", "ok"]], "cols": 50, "scatter": 7,
            "legend": [["o", ("FPD", "FPD")], ["g", ("paid the first instalment", "первый платёж внесён")]]},
   "say": ("Nur's loans work the same way. The jar is all {b|7 099} loans; an orange ball is a loan with an [[FPD|first-payment default: the borrower did not pay the very first instalment]]. There were {o|91}. Here: 1 000 dots, each about 7 loans, {o|13} of them orange.",
           "С займами Nur всё так же. Банка — это все {b|7 099} займов; оранжевый шар — заём с [[FPD|дефолт по первому платежу: заёмщик не внёс самый первый платёж]]. Таких было {o|91}. На картинке 1 000 точек, каждая — примерно 7 займов, {o|13} из них оранжевые.")},
  {"f": ("P(FPD) = {o|91} ÷ {b|7 099} = {y|0.0128} = {y|1.28 %}", "P(FPD) = {o|91} ÷ {b|7 099} = {y|0,0128} = {y|1,28 %}"),
   "fs": ("P of FPD is 91 divided by 7099: 1.28 percent.", "P от FPD — это 91 разделить на 7099: 1,28 процента."),
   "say": ("So the chance that a loan has an FPD is {o|91} ÷ {b|7 099} = {y|1.28 %}: about {o|13 loans in 1 000}.",
           "Значит, вероятность FPD у займа — {o|91} ÷ {b|7 099} = {y|1,28 %}: примерно {o|13 займов из 1 000}.")},
  {"show": {"fade": ["fpd"]},
   "f": ("P(no FPD) = 1 − {y|0.0128} = {g|0.9872}", "P(нет FPD) = 1 − {y|0,0128} = {g|0,9872}"),
   "say": ("The chance it does **not** happen is all the rest: {g|1 − 0.0128 = 0.9872}. A loan either has an FPD or it doesn't, so the two chances always add up to 1 (100 %).",
           "Вероятность, что этого **не** случится, — всё остальное: {g|1 − 0,0128 = 0,9872}. У займа либо есть FPD, либо нет, поэтому две вероятности всегда дают в сумме 1 (100 %).")},
  {"show": {"fade": []}, "say": ("One more.", "Ещё одна."),
   "ask": {"q": ("For app loans P(FPD) = 0.017. What is P(no FPD) for app loans?", "Для займов через приложение P(FPD) = 0,017. Чему равна P(нет FPD) для них?"),
           "options": (["0.017", "0.983", "1.017", "0.83"], ["0,017", "0,983", "1,017", "0,83"]), "answer": 1,
           "why": ("1 − 0.017 = 0.983. The two always add up to 1.", "1 − 0,017 = 0,983. Две вероятности всегда дают 1.")}},
 ]},

 {"id": "w06d1-s2", "min": 5, "title": ("Cover half the bank", "Закройте половину банка"), "steps": [
  {"show": {"kind": "dots", "blocks": [8, 12], "labels": [("app", "приложение"), ("branch", "отделение")], "groups": [[8, "b", "app"], [12, "m", "br"]],
            "legend": [["b", ("app loan", "заём через приложение")], ["m", ("branch loan", "заём в отделении")]]},
   "say": ("A small bank with 20 loans: {b|8} came through the **app**, {m|12} through a **branch**.",
           "Маленький банк, 20 займов: {b|8} оформлены через **приложение**, {m|12} — в **отделении**.")},
  {"show": {"groups": [[2, "o", "appf", "b"], [6, "b", "app"], [1, "o", "brf", "m"], [11, "m", "br"]],
            "legend": [["b", ("app loan", "заём через приложение")], ["m", ("branch loan", "заём в отделении")], ["o", ("FPD", "FPD")]]},
   "say": ("{o|3 loans} had an FPD: {o|2} app loans and {o|1} branch loan. Orange inside, the channel's colour round the edge.",
           "У {o|3 займов} был FPD: {o|2} через приложение и {o|1} в отделении. Внутри оранжевый, по краю — цвет канала.")},
  {"f": ("P(FPD) = {o|3} ÷ 20 = 15 %", "P(FPD) = {o|3} ÷ 20 = 15 %"),
   "say": ("The chance of an FPD for any loan: {o|3} out of all 20 = 15 %.", "Вероятность FPD у любого займа: {o|3} из всех 20 = 15 %.")},
  {"show": {"fade": ["brf", "br"], "box": ["appf", "app"]},
   "say": ("A new question: **among the app loans only**, how many had an FPD? Cover the branch loans with your hand: we look only at the {b|8} app loans.",
           "Новый вопрос: **только среди займов через приложение** — у скольких был FPD? Закройте рукой займы отделения: смотрим только на {b|8} займов через приложение.")},
  {"f": ("P(FPD | app) = {o|2} ÷ {b|8} = 25 %", "P(FPD | приложение) = {o|2} ÷ {b|8} = 25 %"),
   "fs": ("P of FPD given app: 2 divided by 8, 25 percent.", "P от FPD при условии «приложение»: 2 разделить на 8, 25 процентов."),
   "say": ("{o|2} of the {b|8}: 2 ÷ 8 = 25 %. This is a [[conditional probability|a chance counted inside one group only: “among those who…”]] — the chance of an FPD **given** that the loan came through the app.",
           "{o|2} из {b|8}: 2 ÷ 8 = 25 %. Это [[условная вероятность|вероятность, посчитанная только внутри одной группы: «среди тех, кто…»]] — вероятность FPD **при условии**, что заём оформлен через приложение.")},
  {"say": ("The bar **|** reads “given” or “among”. It changes only the bottom of the fraction: from all 20 loans to the 8 app loans.",
           "Черта **|** читается «при условии» или «среди». Она меняет только знаменатель: вместо всех 20 займов — 8 займов через приложение.")},
  {"show": {"fade": ["appf", "app"], "box": ["brf", "br"]}, "say": ("Your turn — the picture already hides the app loans.", "Ваша очередь — картинка уже спрятала займы через приложение."),
   "ask": {"q": ("**Among the branch loans**, what is the chance of an FPD?", "**Среди займов в отделении** — какова вероятность FPD?"),
           "options": (["1 ÷ 20 = 5 %", "1 ÷ 12 ≈ 8 %", "1 ÷ 3 ≈ 33 %"], ["1 ÷ 20 = 5 %", "1 ÷ 12 ≈ 8 %", "1 ÷ 3 ≈ 33 %"]), "answer": 1,
           "why": ("Only the 12 branch loans count now, and 1 of them is orange: 1 ÷ 12 ≈ 8 %.", "Теперь считаются только 12 займов отделения, и 1 из них оранжевый: 1 ÷ 12 ≈ 8 %.")}},
  {"show": {"fade": ["app", "br"], "box": ["appf", "brf"]},
   "say": ("Now flip it: **among the loans with an FPD**, how many came through the app? We look only at the {o|3} orange loans.",
           "Теперь перевернём: **среди займов с FPD** — сколько оформлено через приложение? Смотрим только на {o|3} оранжевых займа.")},
  {"f": ("P(app | FPD) = {b|2} ÷ {o|3} ≈ 67 %", "P(приложение | FPD) = {b|2} ÷ {o|3} ≈ 67 %"),
   "say": ("{b|2} of the {o|3}: about 67 %. The same 2 loans on top, a **different bottom**. P(app | FPD) and P(FPD | app) answer different questions.",
           "{b|2} из {o|3}: около 67 %. Сверху те же 2 займа, а **знаменатель другой**. P(приложение | FPD) и P(FPD | приложение) отвечают на разные вопросы.")},
  {"show": {"fade": [], "box": []},
   "f": ("P(FPD | app) = 41 ÷ 2 411 = 1.70 %  ·  P(app | FPD) = 41 ÷ 91 = 45 %", "P(FPD | приложение) = 41 ÷ 2 411 = 1,70 %  ·  P(приложение | FPD) = 41 ÷ 91 = 45 %"),
   "say": ("Nur's real numbers: {o|41} FPDs among {b|2 411} app loans → 1.70 %. And 41 of all {o|91} FPDs came through the app → 45 %. Before you say a percentage, say **among whom**.",
           "Реальные числа Nur: {o|41} FPD среди {b|2 411} займов через приложение → 1,70 %. А из всех {o|91} FPD через приложение пришли 41 → 45 %. Прежде чем назвать процент, скажите, **среди кого** он посчитан.")},
  {"say": ("Last one.", "Последний вопрос."),
   "ask": {"q": ("A colleague says: “45 % of our FPDs come from the app, so app loans are very risky.” What's wrong?", "Коллега говорит: «45 % наших FPD — из приложения, значит, займы через приложение очень рискованные». Что не так?"),
           "options": (["Nothing — 45 % is high", "45 % is “among FPDs”, not the risk of an app loan (that is 1.70 %)", "They should divide by 7 099"],
                       ["Всё верно — 45 % это много", "45 % — это «среди FPD», а не риск займа через приложение (он 1,70 %)", "Надо делить на 7 099"]), "answer": 1,
           "why": ("45 % answers “where do FPDs come from?”. The risk of an app loan is P(FPD | app) = 1.70 % — only a little above the 1.28 % average.",
                   "45 % отвечает на вопрос «откуда берутся FPD?». Риск займа через приложение — P(FPD | приложение) = 1,70 %, лишь немного выше среднего 1,28 %.")}},
 ]},

 {"id": "w06d1-s3", "min": 5, "title": ("1 000 applicants and one rule", "1 000 заявителей и одно правило"), "steps": [
  {"show": {"kind": "dots", "groups": [[1000, "m", "all"]], "cols": 50, "scatter": 11},
   "say": ("Here are 1 000 people applying for a loan. Each dot is one person.", "Перед вами 1 000 человек, подавших заявку на заём. Каждая точка — один человек.")},
  {"show": {"groups": [[6, "o", "f"], [994, "m", "h"]], "legend": [["o", ("fraudster", "мошенник")], ["m", ("honest", "честный")]]},
   "say": ("Fraud is rare at Nur: about {o|6 in 1 000} applicants are fraudsters. Can you spot them?", "Мошенничество в Nur — редкость: примерно {o|6 из 1 000} заявителей — мошенники. Найдёте их?")},
  {"show": {"groups": [[5, "o", "tp"], [1, "o", "fn"], [994, "m", "h"]], "fade": ["fn"]},
   "say": ("A vendor sells Nur a fraud rule. It catches {o|9 fraudsters in 10}: here it flags {o|5} of the 6. One slips through (faded).",
           "Поставщик продаёт Nur правило против мошенников. Оно ловит {o|9 мошенников из 10}: здесь отмечено {o|5} из 6. Один проскочил (бледный).")},
  {"show": {"groups": [[5, "o", "tp"], [1, "o", "fn"], [50, "b", "fp"], [944, "m", "tn"]],
            "legend": [["o", ("fraudster, flagged", "мошенник с флагом")], ["b", ("honest, flagged", "честный с флагом")], ["m", ("no flag", "без флага")]]},
   "say": ("But it also makes mistakes: it flags {b|5 honest people in 100}. 5 % of the 994 honest people is about {b|50} — they light up blue.",
           "Но оно и ошибается: ставит флаг {b|5 честным людям из 100}. 5 % от 994 честных — это около {b|50} человек, они загорелись синим.")},
  {"say": ("Guess before we count.", "Угадайте, прежде чем считать."),
   "ask": {"q": ("Someone is flagged. How likely is it that they really are a fraudster?", "У человека флаг. Насколько вероятно, что он правда мошенник?"),
           "options": (["about 90 %", "about 50 %", "about 10 %"], ["около 90 %", "около 50 %", "около 10 %"]), "answer": 2,
           "why": ("Count the lit dots: 5 orange, 50 blue. Only 5 of the 55 flags are real.", "Посчитайте светящиеся точки: 5 оранжевых и 50 синих. Настоящих только 5 флагов из 55.")}},
  {"show": {"fade": ["fn", "tn"]},
   "say": ("Keep only the flagged people: {o|5} fraudsters and {b|50} honest people. 55 flags — and only 5 of them are real.",
           "Оставим только людей с флагом: {o|5} мошенников и {b|50} честных. 55 флагов — и только 5 настоящих.")},
  {"f": ("P(fraud | flag) = {o|5} ÷ ({o|5} + {b|50}) ≈ 9 %", "P(мошенник | флаг) = {o|5} ÷ ({o|5} + {b|50}) ≈ 9 %"),
   "fs": ("P of fraud given a flag: 5 divided by 5 plus 50, about 9 percent.", "P мошенника при флаге: 5 разделить на 5 плюс 50, около 9 процентов."),
   "say": ("A flag means fraud only about {o|1 time in 10}. This counting is **Bayes' rule**: real flags ÷ all flags.",
           "Флаг означает мошенника лишь примерно {o|в 1 случае из 10}. Этот подсчёт и есть **формула Байеса**: настоящие флаги ÷ все флаги.")},
  {"say": ("Why so low, when the rule is good? Honest people are so many that even 5 % of them outnumber the fraudsters 10 to 1. This is the **base-rate trap**: the [[base rate|how common something is before any test — here 6 in 1 000]] matters as much as the rule.",
           "Почему так мало, если правило хорошее? Честных людей так много, что даже 5 % из них в 10 раз больше, чем мошенников. Это **ловушка базовой частоты**: [[базовая частота|насколько часто что-то встречается до всякой проверки — здесь 6 из 1 000]] важна не меньше самого правила.")},
  {"f": ("P(fraud | flag) = {o|56} ÷ ({o|56} + {b|497}) = 10.1 %", "P(мошенник | флаг) = {o|56} ÷ ({o|56} + {b|497}) = 10,1 %"),
   "say": ("With Nur's exact numbers on 10 000 applicants: {o|56} fraudsters flagged, {b|497} honest people flagged. 56 ÷ 553 = 10.1 %.",
           "С точными числами Nur на 10 000 заявителей: флаг у {o|56} мошенников и у {b|497} честных. 56 ÷ 553 = 10,1 %.")},
  {"show": {"fade": []}, "say": ("Last one — think with the picture.", "Последний вопрос — думайте картинкой."),
   "ask": {"q": ("Fraud becomes 10 times more common: 60 in 1 000. Will a flag be right more often or less often?", "Мошенников стало в 10 раз больше: 60 из 1 000. Флаг будет прав чаще или реже?"),
           "options": (["more often", "less often", "the same — the rule didn't change"], ["чаще", "реже", "так же — правило ведь не изменилось"]), "answer": 0,
           "why": ("More fraudsters → more orange among the flags: about 54 real against 47 honest. Now more than half of the flags are right.",
                   "Больше мошенников → больше оранжевых среди флагов: около 54 настоящих против 47 честных. Теперь верна больше чем половина флагов.")}},
 ]},

 {"id": "w06d1-s4", "min": 5, "title": ("Eleven loans on a see-saw", "Одиннадцать займов на качелях"), "steps": [
  {"show": {"kind": "line", "vals": LOANS, "unit": ("m", "млн"), "max": 25, "tick": 5},
   "say": ("11 real loans from one branch, in **million soum**. Each blue dot is one loan.", "11 настоящих займов одного отделения, в **миллионах сумов**. Каждая синяя точка — один заём.")},
  {"show": {"mark": ["mean"]},
   "f": ("average = (0.65 + 1.89 + … + 22.42) ÷ 11 = {p|5.70}", "среднее = (0,65 + 1,89 + … + 22,42) ÷ 11 = {p|5,70}"),
   "fs": ("The average is the sum of the 11 loans divided by 11: 5.70.", "Среднее — сумма 11 займов, делённая на 11: 5,70."),
   "say": ("The **average** (the mean): add all 11 loans and divide by 11 → {p|5.70 m}. Picture the line as a see-saw: the average is the point where it balances.",
           "**Среднее** (mean): сложите все 11 займов и разделите на 11 → {p|5,70 млн}. Представьте линию как качели: среднее — та точка, где они в равновесии.")},
  {"show": {"mark": ["mean", "median"]},
   "say": ("The **median** is the middle loan: line them up and take the one in the middle — the 6th of 11 → {y|3.50 m}. Five loans are smaller, five are bigger.",
           "**Медиана** — средний по порядку заём: выстройте их в ряд и возьмите стоящий посередине, 6-й из 11 → {y|3,50 млн}. Пять займов меньше, пять больше.")},
  {"show": {"hot": 10}, "f": "",
   "say": ("Why is the average so much bigger than the middle? One big loan, {o|22.42 m}, sits far to the right and pulls the balance point towards it.",
           "Почему среднее настолько больше середины? Один крупный заём, {o|22,42 млн}, стоит далеко справа и тянет точку равновесия к себе.")},
  {"show": {"max": 60, "tick": 10, "drag": 10}, "act": [dict(b(0, "+10 m", "+10 млн", 3), do="nudge", i=10, by=10)],
   "say": ("Drag the orange loan to the right, or tap **+10 m**. The average runs after it. The middle loan does not move at all.",
           "Перетащите оранжевый заём вправо или нажмите **+10 млн**. Среднее бежит за ним. А середина не двигается вовсе.")},
  {"say": ("Which number tells the truth about a typical loan?", "Какое число честнее говорит о типичном займе?"),
   "ask": {"q": ("You tell a manager what a “typical loan” is. A few loans are huge, most are small. Which number do you use?", "Вы рассказываете руководителю, какой заём «типичный». Несколько займов огромные, большинство маленькие. Какое число взять?"),
           "options": (["the average", "the median"], ["среднее", "медиану"]), "answer": 1,
           "why": ("Huge loans pull the average up; the median stays with the typical loan.", "Огромные займы тянут среднее вверх, а медиана остаётся с типичным займом.")}},
  {"show": {"reset": True, "max": 25, "tick": 5, "drag": None, "hot": None, "mark": ["mean", "dist"]},
   "say": ("Now **spread**: how far the loans are from the average. Each purple line is one loan's distance from the average.",
           "Теперь **разброс**: насколько займы далеки от среднего. Каждая фиолетовая линия — расстояние одного займа до среднего.")},
  {"show": {"mark": ["mean", "dist", "spread"]},
   "f": ("sd = √( (d₁² + d₂² + … + d₁₁²) ÷ (11 − 1) ) ≈ {p|5.94}", "sd = √( (d₁² + d₂² + … + d₁₁²) ÷ (11 − 1) ) ≈ {p|5,94}"),
   "fs": ("The standard deviation is about 5.94.", "Стандартное отклонение — примерно 5,94."),
   "say": ("The [[standard deviation|the typical distance of the values from their average; “sd” for short]] is the typical length of those lines: {p|± 5.94 m}. Square each distance, add them up, divide by 10 (one less than the 11 loans — pandas does the same), take the square root.",
           "[[Стандартное отклонение|типичное расстояние значений от их среднего; коротко sd]] — это типичная длина этих линий: {p|± 5,94 млн}. Возведите каждое расстояние в квадрат, сложите, разделите на 10 (на один меньше, чем 11 займов, — так же делает pandas) и извлеките корень.")},
  {"say": ("Small sd: the loans sit close together. Big sd: they are all over the place. Two branches can have the same average and a very different sd.",
           "Маленький sd: займы стоят кучно. Большой sd: они разбросаны повсюду. У двух отделений может быть одинаковое среднее и совсем разный sd.")},
  {"show": {"mark": ["median"]}, "f": ("median = the 50th percentile", "медиана = 50-й перцентиль"),
   "say": ("[[Percentiles|the value with that share of all values below it]] say where a value stands in the line-up. The 90th percentile has 90 % of values below it. The median is simply the **50th percentile**.",
           "[[Перцентили|значение, ниже которого лежит такая доля всех значений]] показывают, где значение стоит в ряду. Ниже 90-го перцентиля — 90 % значений. Медиана — это просто **50-й перцентиль**.")},
  {"say": ("Last one.", "Последний вопрос."),
   "ask": {"q": ("Your loan is at the 75th percentile. What does that mean?", "Ваш заём на 75-м перцентиле. Что это значит?"),
           "options": (["75 % of loans are smaller than yours", "your loan is 75 % of the average", "75 loans are bigger than yours"], ["75 % займов меньше вашего", "ваш заём — 75 % от среднего", "75 займов больше вашего"]), "answer": 0,
           "why": ("A percentile is the share of values below yours.", "Перцентиль — это доля значений ниже вашего.")}},
 ]},

 {"id": "w06d1-s5", "min": 6, "title": ("When should Nilufar panic?", "Когда Нилуфар пора паниковать?"), "steps": [
  {"show": {"kind": "dots", "groups": [[400, "g", "all"]], "cols": 40, "legend": [["g", ("a loan", "заём")], ["o", ("FPD", "FPD")]],
            "rollSay": ("This month: {o|%k} of %n loans had an FPD.", "В этом месяце: FPD у {o|%k} из %n займов.")},
   "say": ("Next month Nur gives out about {b|400 loans}, one dot each. From our data, each one has a {o|1.28 %} chance of an FPD.",
           "В следующем месяце Nur выдаст около {b|400 займов}, по точке на каждый. По нашим данным, у каждого вероятность FPD — {o|1,28 %}.")},
  {"f": ("expected = {b|n} × {o|p} = {b|400} × {o|0.0128} = {p|5.1}", "ожидаем = {b|n} × {o|p} = {b|400} × {o|0,0128} = {p|5,1}"),
   "fs": ("Expected: n times p, 400 times 0.0128, about 5.1.", "Ожидаем: n умножить на p, 400 на 0,0128, примерно 5,1."),
   "say": ("How many FPDs should we expect? {b|400} × {o|0.0128} = {p|5.1}. That is the [[expected value|the average you would get over many, many months]]. We call the number of loans {b|n} and the chance {o|p}.",
           "Сколько FPD ожидать? {b|400} × {o|0,0128} = {p|5,1}. Это [[математическое ожидание|среднее, которое получится за много-много месяцев]]. Число займов назовём {b|n}, а вероятность — {o|p}.")},
  {"act": [dict(b(0, "Roll one month", "Разыграть месяц"), do="roll", p=P)],
   "say": ("But a real month is never exactly 5.1. Tap **Roll one month**: each of the 400 loans rolls its own dice.",
           "Но реальный месяц никогда не даёт ровно 5,1. Нажмите **Разыграть месяц**: каждый из 400 займов бросает свой кубик.")},
  {"act": [dict(b(0, "Roll one month", "Разыграть месяц", 3), do="roll", p=P)],
   "say": ("Roll a few more. Sometimes 3, sometimes 8. The count wobbles by luck alone, even when nothing has changed.",
           "Разыграйте ещё несколько. То 3, то 8. Число скачет просто от случая, хотя ничего не изменилось.")},
  {"show": {"kind": "months", "dist": "binom", "n": 400, "p": P, "mean": True,
            "words": {"unit": ("months", "месяцев"), "thing": ("FPDs", "FPD"), "axis": ("FPDs in a month", "FPD за месяц")}},
   "act": [dict(b(1, "1 month", "1 месяц", 3), do="run"), dict(b(10, "10 months", "10 месяцев"), do="run"), dict(b(100, "100 months", "100 месяцев"), do="run")],
   "say": ("Let's keep score. Each month drops into the bar of its count. Tap **1 month** a few times, then **100 months**.",
           "Будем вести счёт. Каждый месяц падает в столбик своего числа FPD. Нажмите **1 месяц** несколько раз, потом **100 месяцев**.")},
  {"act": [dict(b(100, "100 months", "100 месяцев"), do="run")],
   "say": ("The bars make a shape: most months have 2 to 8 FPDs, a few have more. The shape has a name: the [[binomial distribution|the counts you get from n tries, each with the same chance p]].",
           "Столбики складываются в форму: в большинстве месяцев 2–8 FPD, иногда больше. У формы есть имя: [[биномиальное распределение|сколько «успехов» получится из n попыток, у каждой одна и та же вероятность p]].")},
  {"show": {"alarm": 10}, "act": [dict(b(100, "100 months", "100 месяцев"), do="run")],
   "say": ("Nilufar's question: when is a month **too high**? Put the alarm at 10. Look at the orange bars: only about {o|4 months in 100} reach 10 or more by luck.",
           "Вопрос Нилуфар: когда месяц **слишком плохой**? Поставим тревогу на 10. Посмотрите на оранжевые столбики: случайно 10 и больше бывает лишь примерно {o|в 4 месяцах из 100}.")},
  {"show": {"exact": True},
   "f": ("P(10 or more) = {o|3.6 %}  ·  P(12 or more) = {o|0.6 %}", "P(10 и больше) = {o|3,6 %}  ·  P(12 и больше) = {o|0,6 %}"),
   "say": ("The binomial formula draws the exact bars: the {p|dashed outlines}. Your months land on them. It says: 10 or more happens in {o|3.6 %} of months, 12 or more in {o|0.6 %}.",
           "Биномиальная формула рисует точные столбики — {p|пунктирные контуры}. Ваши месяцы ложатся на них. Она говорит: 10 и больше — в {o|3,6 %} месяцев, 12 и больше — в {o|0,6 %}.")},
  {"say": ("Nilufar gets her wall number.", "У Нилуфар есть число для стены."),
   "ask": {"q": ("Next month has 9 FPDs. Panic?", "В следующем месяце 9 FPD. Паниковать?"),
           "options": (["Yes — phone Nilufar", "No — 9 happens in ordinary months"], ["Да — звонить Нилуфар", "Нет — 9 бывает и в обычные месяцы"]), "answer": 1,
           "why": ("9 is below the alarm. 10 or more (3.6 %) means “look at it”; 12 or more (0.6 %) means “phone me”.", "9 — ниже тревоги. 10 и больше (3,6 %) — «посмотреть внимательно»; 12 и больше (0,6 %) — «звонить»." )}},
  {"show": {"n": 800, "alarm": None, "exact": False}, "act": [dict(b(100, "100 months", "100 месяцев"), do="run")],
   "f": ("wobble (sd) = √( {b|n} × {o|p} × (1 − {o|p}) ):  400 → 2.25,  800 → 3.18", "разброс (sd) = √( {b|n} × {o|p} × (1 − {o|p}) ):  400 → 2,25,  800 → 3,18"),
   "fs": ("The wobble is the square root of n times p times one minus p: 2.25 for 400 loans, 3.18 for 800.", "Разброс — корень из n на p на один минус p: 2,25 для 400 займов, 3,18 для 800."),
   "say": ("Double the book to {b|800} loans: you expect twice as many FPDs (10.3), but the wobble grows only about **1.4 times**. That is √2: the wobble grows like the **square root** of n. Big books are calmer.",
           "Удвоим портфель до {b|800} займов: FPD ожидаем вдвое больше (10,3), а разброс растёт лишь примерно **в 1,4 раза**. Это √2: разброс растёт как **квадратный корень** из n. Большие портфели спокойнее.")},
  {"say": ("Every run gives different months. In Python you fix a [[seed|a starting number for the random generator: the same seed gives the same “random” draws every time]], so a colleague who re-runs your notebook sees exactly your numbers.",
           "Каждый запуск даёт другие месяцы. В Python задают [[seed|начальное число генератора случайных чисел: при том же seed «случайные» числа каждый раз одни и те же]], чтобы коллега, перезапустив ваш ноутбук, увидел ровно ваши числа.")},
  {"f": ("P(10 or more) = X.sf(9)", "P(10 и больше) = X.sf(9)"),
   "say": ("A Python tip for the homework: `X.sf(k)` gives P(**more than** k). So P(10 or more) is `X.sf(9)` — one less. This off-by-one catches everyone once.",
           "Совет по Python для домашки: `X.sf(k)` даёт P(**больше** k). Значит, P(10 и больше) — это `X.sf(9)`, на единицу меньше. На этой ошибке хоть раз попадается каждый.")},
 ]},

 {"id": "w06d1-s6", "min": 4, "title": ("Applications, hour by hour", "Заявки, час за часом"), "steps": [
  {"show": {"kind": "months", "dist": "pois", "lam": 1.4376, "mean": True, "xmax": 7,
            "words": {"unit": ("hours", "часов"), "thing": ("applications", "заявок"), "axis": ("applications in one hour", "заявок за час")}},
   "act": [dict(b(10, "10 hours", "10 часов"), do="run"), dict(b(100, "100 hours", "100 часов"), do="run")], "film": 1,
   "say": ("Applications reach Nur's app one by one, all day — on average {b|1.44 per hour}. Each bar counts hours.",
           "Заявки приходят в приложение Nur по одной, весь день — в среднем {b|1,44 в час}. Каждый столбик считает часы.")},
  {"act": [dict(b(100, "100 hours", "100 часов", 2), do="run")],
   "say": ("Some hours bring none, some bring 4 or 5. Tap **100 hours** and watch the shape.", "В какой-то час нет ни одной заявки, в какой-то — 4 или 5. Нажмите **100 часов** и смотрите на форму.")},
  {"f": ("λ = applications ÷ hours = {b|1.44}", "λ = заявки ÷ часы = {b|1,44}"),
   "fs": ("Lambda is applications divided by hours: 1.44.", "Лямбда — заявки, делённые на часы: 1,44."),
   "say": ("When things arrive one at a time, independently, at a steady average rate, the counts per hour follow the **Poisson distribution**. One number describes it: the average rate, called {b|λ} (lambda).",
           "Когда события приходят по одному, независимо друг от друга и с постоянной средней скоростью, число событий за час подчиняется **распределению Пуассона**. Его задаёт одно число — средняя скорость {b|λ} (лямбда).")},
  {"show": {"exact": True}, "f": ("P(0 in an hour) = e^(−λ) = e^(−1.44) ≈ {y|0.24}", "P(0 за час) = e^(−λ) = e^(−1,44) ≈ {y|0,24}"),
   "fs": ("The chance of an empty hour is e to the minus lambda: about 0.24.", "Вероятность пустого часа — e в степени минус лямбда: примерно 0,24."),
   "say": ("The formula draws the exact bars (dashed). For example, an **empty hour** happens {y|24 %} of the time — about one hour in four.",
           "Формула рисует точные столбики (пунктир). Например, **пустой час** бывает в {y|24 %} случаев — примерно каждый четвёртый час.")},
  {"f": ("average = variance = λ", "среднее = дисперсия = λ"),
   "say": ("Two facts to keep. For Poisson the **variance equals the average** — both are λ. And if counts per hour are Poisson, the **minutes between** applications follow the [[exponential distribution|the waiting time between Poisson arrivals: many short gaps, a few long ones]].",
           "Два факта на память. У Пуассона **дисперсия равна среднему** — обе равны λ. А если число заявок за час — Пуассон, то **минуты между** заявками подчиняются [[показательному распределению|время ожидания между пуассоновскими событиями: много коротких промежутков, мало длинных]].")},
  {"say": ("Your turn.", "Ваша очередь."),
   "ask": {"q": ("Which of these counts is most likely Poisson?", "Какое из этих чисел, скорее всего, подчиняется Пуассону?"),
           "options": (["calls to support per minute", "a customer's credit score", "whether one loan has an FPD"], ["звонки в поддержку за минуту", "кредитный скор клиента", "будет ли у одного займа FPD"]), "answer": 0,
           "why": ("Calls arrive one by one at a steady rate and are counted in a fixed window. A score is a measurement; one loan is a single yes / no.",
                   "Звонки приходят по одному с постоянной скоростью, и их считают за фиксированное окно. Скор — это измерение, а один заём — одно «да / нет».")}},
 ]},

 {"id": "w06d1-s7", "min": 5, "title": ("Drop people on a bell", "Люди падают на колокол"), "steps": [
  {"show": {"kind": "bell", "mu": 659.6, "sd": 59.5},
   "act": [dict(b(0, "Drop 100 people", "Добавить 100 человек", 3), do="drop", n=100), dict(b(0, "Drop 1 000", "Добавить 1 000"), do="drop", n=1000)],
   "say": ("Credit scores of Nur's applicants. Tap **Drop 100 people**: each dot is one person landing at their score (simulated with the real average and spread).",
           "Кредитные скоры заявителей Nur. Нажмите **Добавить 100 человек**: каждая точка — человек, упавший на свой скор (смоделировано с настоящими средним и разбросом).")},
  {"act": [dict(b(0, "Drop 1 000", "Добавить 1 000"), do="drop", n=1000)],
   "say": ("Most people land near the middle, fewer at the edges. The pile takes the shape of a **bell**: the [[normal distribution|values pile up around the average and thin out evenly on both sides]].",
           "Большинство падает около середины, к краям всё меньше. Куча принимает форму **колокола** — это [[нормальное распределение|значения скапливаются вокруг среднего и равномерно редеют в обе стороны]].")},
  {"show": {"sdTicks": True}, "f": ("N( μ = {p|659.6}, σ = {p|59.5} )", "N( μ = {p|659,6}, σ = {p|59,5} )"),
   "fs": ("A normal with mu 659.6 and sigma 59.5.", "Нормальное с мю 659,6 и сигмой 59,5."),
   "say": ("Two numbers set the bell: the middle, **μ** (mu) — the average, {p|659.6}; and the width, **σ** (sigma) — the sd, {p|59.5}.",
           "Колокол задают два числа: середина **μ** (мю) — среднее, {p|659,6}; и ширина **σ** (сигма) — sd, {p|59,5}.")},
  {"show": {"band": 1},
   "say": ("Between 600 and 719 — **one sd** either side of the average — sit about {y|68 %} of people.", "Между 600 и 719 — **одно sd** в каждую сторону от среднего — около {y|68 %} людей.")},
  {"show": {"band": 2}, "say": ("Two sds either side (541 to 779): about {y|95 %}.", "Два sd в каждую сторону (от 541 до 779): около {y|95 %}.")},
  {"show": {"band": 3}, "f": ("± 1 sd: 68 %  ·  ± 2 sd: 95 %  ·  ± 3 sd: 99.7 %", "± 1 sd: 68 %  ·  ± 2 sd: 95 %  ·  ± 3 sd: 99,7 %"),
   "say": ("Three sds (481 to 838): {y|99.7 %}. A score outside is very rare. This is the **68-95-99.7 rule**.", "Три sd (от 481 до 838): {y|99,7 %}. Скор за этими границами — большая редкость. Это **правило 68-95-99,7**.")},
  {"show": {"band": 2}, "say": ("Use the picture.", "Посмотрите на картинку."),
   "ask": {"q": ("What share of people are more than 2 sds **above** the average?", "Какая доля людей выше среднего **больше чем на 2 sd**?"),
           "options": (["about 5 %", "about 2.5 %", "about 32 %"], ["около 5 %", "около 2,5 %", "около 32 %"]), "answer": 1,
           "why": ("95 % are inside, so 5 % are outside — half on each side: 2.5 % above, 2.5 % below.", "95 % внутри, значит, 5 % снаружи — пополам с каждой стороны: 2,5 % выше и 2,5 % ниже.")}},
  {"show": {"band": 0, "cut": [600, 700]},
   "f": ("= NORM.DIST(700, 659.6, 59.5, TRUE) − NORM.DIST(600, 659.6, 59.5, TRUE) ≈ {y|59 %}", "= НОРМ.РАСП(700; 659,6; 59,5; ИСТИНА) − НОРМ.РАСП(600; 659,6; 59,5; ИСТИНА) ≈ {y|59 %}"),
   "fs": ("In Excel, two NORM.DIST lines: about 59 percent.", "В Excel — две функции НОРМ.РАСП: примерно 59 процентов."),
   "say": ("Any range works. The bell puts {y|59 %} of applicants between 600 and 700. In Excel it is the line in the strip — homework H2 asks exactly this.",
           "Подходит любой интервал. Колокол даёт {y|59 %} заявителей между 600 и 700. В Excel это строка в рамке — именно об этом спрашивает задание H2.")},
  {"say": ("One warning: fit the bell to **all applicants**. Approved loans are a selection — the low scores were turned away — so their left side is cut off and the bell will not match them.",
           "Одно предупреждение: подгоняйте колокол ко **всем заявителям**. Одобренные займы — это отбор: низкие скоры отсеяли, поэтому левая часть у них срезана и колокол с ними не совпадёт.")},
 ]},
]


def pick(v, i):
    if isinstance(v, tuple):
        return v[i]
    if isinstance(v, list):
        return [pick(x, i) for x in v]
    if isinstance(v, dict):
        return {k: pick(x, i) for k, x in v.items()}
    return v


def build(lang):
    i = 0 if lang == "en" else 1
    out = {}
    for s in STORIES:
        steps = []
        for st in s["steps"]:
            d = {}
            for k in ("say", "show", "f", "fs", "act", "ask", "film"):
                if k in st:
                    d[k] = pick(st[k], i)
            for a in d.get("act", []):
                a.setdefault("do", "run")
                if a.get("n") == 0:
                    a.pop("n")
            steps.append(d)
        out[s["id"]] = json.dumps({"id": s["id"], "title": pick(s["title"], i), "min": s["min"], "steps": steps}, ensure_ascii=False)
    return out


if __name__ == "__main__":
    for lang in ("en", "ru"):
        b2 = build(lang)
        print(lang, len(b2), sum(len(json.loads(v)["steps"]) for v in b2.values()), "steps")
