"""Week 9 Day 4 as eight ```story blocks (rebuild once with rebuild.py w9d4, then apply.py w9d4), English and Russian from one source.
Money: W8D2's average Consumer loan (the page's numbers): a good loan leaves 1 454 907 soum, a bad one costs 17 219 143, break-even 7.79 %.
Every other number is on the page or computed from data/raw/nur.db (7 615 scored loans, 223 bads; applications for the PSI)."""
from common import build as _b, btn
from w9data import FROM, N, B

ECON = {"i": 5695580, "cof": 3417348, "opex": 823325, "ead": 21630783, "lgd": 0.6}
TG = [560, 600, 620, 630, 650, 660, 670, 680, 710, 720, 730, 740, 750, 770, 790]   # Day 3's toy: 15 goods
TB = [540, 580, 610, 640, 700]                                                   # and 5 bads
TOY = {"kind": "roc", "goods": TG, "bads": TB, "lo": 520, "hi": 800, "left": "dist", "appr": True, "cut": 540}
# every cutoff picture names all its options, so a step that switches view starts clean (shows merge within a kind)
CUT = {"kind": "cutoff", "n": N, "b": B, "from": FROM, "econ": ECON, "fund": 0.18, "lo": 540, "hi": 760, "tick": 40, "lines": ["appr", "br"],
       "cut": None, "drag": False, "best": False, "target": None, "avoid": False, "view": None, "edges": None, "be": False, "decide": False, "pick": None}
EDGES = [540, 560, 580, 600, 620, 640, 660, 680, 700, 720, 740]
E24 = [0.0470785, 0.1051753, 0.2003339, 0.2584307, 0.2270451, 0.1619366]        # 2024's applicants over the six bands
A26 = [0.0464466, 0.112479, 0.2173102, 0.259653, 0.2081701, 0.1559411]          # 2026's: PSI 0.0037
A26_10 = [0.063421, 0.1402723, 0.2344712, 0.2562955, 0.1848536, 0.1206864]      # 2026's scores lowered by 10: PSI 0.041
A26_20 = [0.0869241, 0.1719828, 0.2465958, 0.2465958, 0.1596717, 0.0882298]     # by 20: PSI 0.136
BANDS6 = ["<560", "560", "600", "640", "680", "720+"]
MONTHS = [[0.0179, 505], [0.0131, 475], [0.0079, 593], [0.0131, 552], [0.004, 618], [0.0045, 621], [0.0174, 634], [0.0078, 625], [0.0115, 609], [0.0617, 129]]


def cut(**kw):
    d = dict(CUT); d.update(kw); return d


def nudge(by, rep=1):
    lab = ("+%d" % by) if by > 0 else ("−%d" % -by)
    return btn(0, lab, lab, rep, do="nudge", by=by)


KEEP = (["Keep", "Decline"], ["Одобрять", "Отказать"])

STORIES = [
 {"id": "w09d4-s1", "min": 5, "title": ("One line, two numbers", "Одна линия — два числа"), "steps": [
  {"show": TOY,
   "say": ("Back to Day 3's 20 toy loans. Approve everyone: 20 approved, {o|5} of them bad — a bad rate of {o|25 %}. The share approved is the [[approval rate|the share of applicants (here, loans) that are approved]].",
           "Вернёмся к 20 игрушечным кредитам из Дня 3. Одобряем всех: 20 одобрено, {o|5} из них плохие — доля плохих {o|25 %}. Доля одобренных — это [[уровень одобрения|доля заявителей (здесь — кредитов), которых одобряют]].")},
  {"show": {"cut": 620},
   "say": ("Approve from 620: {b|15 approved} (75 %), and only {o|2} of them bad — {o|13 %}.", "Одобряем от 620: {b|15 одобрено} (75 %), и плохих среди них только {o|2} — {o|13 %}.")},
  {"show": {"cut": 650},
   "say": ("From 650: {b|12 approved} (60 %), {o|1} of them bad — {o|8 %}. Raise the line and **both** numbers fall: fewer approvals, and fewer bads among them.",
           "От 650: {b|12 одобрено} (60 %), плохой среди них {o|1} — {o|8 %}. Поднимаем линию — и **оба** числа падают: одобрений меньше, и плохих среди них меньше.")},
  {"say": ("Your turn.", "Ваша очередь."),
   "ask": {"q": ("Sales wants more approvals, Risk wants fewer bads. What does raising the line do?", "Продажи хотят больше одобрений, риски — меньше плохих. Что делает подъём линии?"),
           "options": (["Fewer approvals and a lower bad rate", "More approvals and a lower bad rate", "Fewer approvals and a higher bad rate"],
                       ["Меньше одобрений и ниже доля плохих", "Больше одобрений и ниже доля плохих", "Меньше одобрений и выше доля плохих"]), "answer": 0,
           "why": ("The two numbers move together. Choosing a cut-off means choosing one point on that trade-off.", "Два числа движутся вместе. Выбрать порог — значит выбрать одну точку этого компромисса.")}},
  {"show": cut(cut=600),
   "f": ("600: approved {b|95.7 %} · bad rate {o|2.55 %}", "600: одобрено {b|95,7 %} · доля плохих {o|2,55 %}"),
   "say": ("Nur's real loans, every line from 540 to 760: {b|blue} = the share approved, {o|orange} = their bad rate. Approve from 600: {b|95.7 %} approved at {o|2.55 %} bad.",
           "Настоящие кредиты Nur, все линии от 540 до 760: {b|синяя} — доля одобренных, {o|оранжевая} — доля плохих среди них. От 600: одобрено {b|95,7 %}, плохих {o|2,55 %}.")},
  {"show": {"cut": 660},
   "f": ("660: approved {b|66.7 %} · bad rate {o|1.50 %}", "660: одобрено {b|66,7 %} · доля плохих {o|1,50 %}"),
   "say": ("From 660: {b|66.7 %} approved at {o|1.50 %}. 29 points of volume for about one point of bad rate — whether that pays is a question of money.",
           "От 660: одобрено {b|66,7 %}, плохих {o|1,50 %}. 29 пунктов объёма за примерно один пункт доли плохих — окупается ли это, решают деньги.")},
  {"show": {"drag": True}, "act": [nudge(-20), nudge(20, 2)], "film": 1,
   "say": ("Drag the line, or tap **−20** / **+20**, and watch the two curves fall together.", "Двигайте линию или нажимайте **−20** / **+20** — и смотрите, как обе кривые падают вместе.")},
  {"show": {"cut": 600, "drag": False, "avoid": True},
   "f": ("600: {o|37} bads avoided · {g|294} goods turned away → 7.9 goods per bad", "600: избежали {o|37} плохих · отказали {g|294} хорошим → 7,9 хорошего на одного плохого"),
   "say": ("Moving up from “approve everyone” declines two kinds of people: [[bads avoided|loans that would have gone bad]] and [[goods turned away|good customers lost, with their interest]]. At 600: {o|37} and {g|294}.",
           "Подъём от «одобрять всех» отсекает людей двух видов: [[избежали плохих|кредиты, которые стали бы плохими]] и [[отказали хорошим|потерянные хорошие клиенты вместе с их процентами]]. На 600: {o|37} и {g|294}.")},
  {"show": {"cut": 640},
   "f": ("640: {o|94} bads avoided · {g|1 593} goods turned away → 16.9 goods per bad", "640: избежали {o|94} плохих · отказали {g|1 593} хорошим → 16,9 хорошего на одного плохого"),
   "say": ("At 640: {o|94} bads avoided, {g|1 593} goods lost — 16.9 good customers for each bad. Between 600 and 640 the price doubles.",
           "На 640: избежали {o|94} плохих, потеряли {g|1 593} хороших — 16,9 хорошего клиента за каждого плохого. Между 600 и 640 цена удваивается.")},
  {"say": ("These are loans Nur already made. A line **below** today's practice would approve people Nur never lent to, whose bad rate is unknown (swap-ins, later today).",
           "Это кредиты, которые Nur уже выдала. Линия **ниже** нынешней практики одобрила бы людей, которым Nur никогда не давала денег, — их доля плохих неизвестна (swap-in, сегодня ниже).")},
 ]},

 {"id": "w09d4-s2", "min": 4, "title": ("What one approved loan is expected to lose", "Сколько ожидаем потерять на одобренном кредите"), "steps": [
  {"show": cut(lines=["el"], lo=424, cut=424),
   "say": ("From Week 8: a loan's [[expected loss|the loss you expect on average: PD × LGD × EAD]] is PD × LGD × EAD. For an average Consumer loan: {p|21 630 783} soum still owed at default (EAD), 60 % of it lost (LGD).",
           "Из Недели 8: [[ожидаемые потери|убыток, который ожидают в среднем: PD × LGD × EAD]] кредита — это PD × LGD × EAD. Для среднего потребительского кредита: при дефолте ещё должны {p|21 630 783} сума (EAD), 60 % из них теряется (LGD).")},
  {"f": ("approve everyone: 0.0293 × 0.60 × 21 630 783 = {p|380 065}", "одобрять всех: 0,0293 × 0,60 × 21 630 783 = {p|380 065}"),
   "fs": ("0.0293 times 0.60 times 21 630 783: about 380 thousand soum.", "0,0293 на 0,60 на 21 630 783: около 380 тысяч сумов."),
   "say": ("At a cut-off, the PD of an approved loan is the bad rate of the approved group. Approve everyone: 2.93 % → {p|380 065} soum per loan.",
           "При пороге PD одобренного кредита — это доля плохих среди одобренных. Одобряем всех: 2,93 % → {p|380 065} сумов на кредит.")},
  {"show": {"cut": 600},
   "f": ("600: 0.02554 × 0.60 × 21 630 783 = {p|331 411}", "600: 0,02554 × 0,60 × 21 630 783 = {p|331 411}"),
   "say": ("Approve from 600: the bad rate falls to 2.55 %, and the expected loss per loan to {p|331 411} soum.", "Одобряем от 600: доля плохих падает до 2,55 %, а ожидаемые потери на кредит — до {p|331 411} сумов.")},
  {"show": {"cut": 660},
   "say": ("From 660: {p|194 319} per loan — half the risk of “everyone”, for two thirds of the volume.", "От 660: {p|194 319} на кредит — половина риска «всех», при двух третях объёма.")},
  {"say": ("Think in money.", "Подумайте в деньгах."),
   "ask": {"q": ("The expected loss per loan halves at 660. Does 660 earn more?", "При 660 ожидаемые потери на кредит падают вдвое. Значит, 660 заработает больше?"),
           "options": (["Yes: less loss per loan means more profit", "Not necessarily: the book shrinks too, and the goods turned away take their interest with them", "No: the expected loss rises"],
                       ["Да: меньше потерь на кредит — больше прибыли", "Не обязательно: портфель тоже сжимается, а отвергнутые хорошие уносят свои проценты", "Нет: ожидаемые потери растут"]), "answer": 1,
           "why": ("Per-loan risk is only one side. The next story puts a price on both sides.", "Риск на кредит — лишь одна сторона. Следующая история оценивает обе стороны.")}},
  {"say": ("The total expected loss falls from 2.89 bn to 0.99 bn soum between “everyone” and 660 — but 2 392 good loans and their interest are gone too. Only money on both sides decides.",
           "Суммарные ожидаемые потери падают с 2,89 до 0,99 млрд сумов между «всеми» и 660 — но ушли и 2 392 хороших кредита с их процентами. Решают только деньги с обеих сторон.")},
 ]},

 {"id": "w09d4-s3", "min": 5, "title": ("A good loan, a bad loan — the profit of a line", "Хороший кредит, плохой кредит — прибыль линии"), "steps": [
  {"show": {"kind": "fall", "items": [[5695580, "g"], [-3417348, "o"], [-823325, "o"]], "total": True, "fmt": "m", "upto": 1, "totalTone": "g",
            "labels": (["interest", "funding\nat 18 %", "selling and\nservicing", "a good loan\nleaves"], ["проценты", "фондирование\n18 %", "продажа и\nобслуживание", "хороший\nоставляет"])},
   "say": ("Put a price on each loan with Week 8's average Consumer loan. A {g|good} loan pays its interest: {g|5 695 580} soum.",
           "Оценим каждый кредит по среднему потребительскому кредиту из Недели 8. {g|Хороший} кредит платит проценты: {g|5 695 580} сумов.")},
  {"show": {"upto": 3},
   "say": ("It costs its funding ({o|3 417 348}) and its selling and servicing ({o|823 325}). It leaves {g|1 454 907} soum.",
           "Он стоит фондирования ({o|3 417 348}) и продажи с обслуживанием ({o|823 325}). Остаётся {g|1 454 907} сумов.")},
  {"show": {"items": [[0, "g"], [-3417348, "o"], [-823325, "o"], [-12978470, "o"]], "upto": 4, "totalTone": "o",
            "labels": (["interest", "funding", "selling and\nservicing", "60 % of\n21.6 m lost", "a bad loan\ncosts"], ["проценты", "фондирование", "продажа и\nобслуживание", "60 % от\n21,6 млн", "плохой\nстоит"])},
   "say": ("A {o|bad} loan pays no interest (Week 8's simplification), still costs the funding and the operating cost, and loses 60 % of the 21 630 783 it owes: it costs {o|17 219 143} soum.",
           "{o|Плохой} кредит процентов не платит (упрощение Недели 8), но фондирование и операционные затраты остаются, а 60 % от долга 21 630 783 теряются: он стоит {o|17 219 143} сумов.")},
  {"say": ("Guess first.", "Сначала прикиньте."),
   "ask": {"q": ("How many good loans does it take to pay for one bad one?", "Сколько хороших кредитов нужно, чтобы покрыть один плохой?"),
           "options": (["About 2", "About 12", "About 50"], ["Около 2", "Около 12", "Около 50"]), "answer": 1,
           "why": ("17 219 143 ÷ 1 454 907 ≈ 11.8: one bad wipes out what about 12 goods leave.", "17 219 143 ÷ 1 454 907 ≈ 11,8: один плохой съедает то, что оставляют около 12 хороших.")}},
  {"show": cut(lines=["profit"], lo=424, cut=424),
   "f": ("profit = {g|goods approved} × 1 454 907 − {o|bads approved} × 17 219 143", "прибыль = {g|одобренные хорошие} × 1 454 907 − {o|одобренные плохие} × 17 219 143"),
   "fs": ("Profit: the goods approved times 1 454 907, minus the bads approved times 17 219 143.", "Прибыль: одобренные хорошие на 1 454 907 минус одобренные плохие на 17 219 143."),
   "say": ("The profit of a line: the goods it approves times what each leaves, minus the bads it approves times what each costs. Approve everyone: {y|6.91 bn} soum.",
           "Прибыль линии: одобренные хорошие, умноженные на то, что оставляет каждый, минус одобренные плохие, умноженные на то, во что обходится каждый. Одобряем всех: {y|6,91 млрд} сумов.")},
  {"show": {"cut": 600},
   "say": ("Approve from 600: {y|7.12 bn} — declining the 331 loans below 600 adds 0.21 bn.", "Одобряем от 600: {y|7,12 млрд} — отказ 331 кредиту ниже 600 добавляет 0,21 млрд.")},
  {"show": {"cut": 660},
   "say": ("From 660: {y|5.97 bn}. Tightening from 600 to 660 throws away 1.16 bn: those goods earned more than their bads cost.",
           "От 660: {y|5,97 млрд}. Ужесточение с 600 до 660 выбрасывает 1,16 млрд: хорошие там зарабатывали больше, чем стоили их плохие.")},
  {"show": {"drag": True}, "act": [nudge(-10, 2), nudge(10)],
   "say": ("Drag the line and find the top of the curve yourself.", "Двигайте линию и найдите вершину кривой сами.")},
  {"show": {"drag": False},
   "say": ("This is Week 8's contribution per loan, added up over the book. One caveat: every loan here is priced like an average Consumer loan; a real policy prices each product with its own numbers.",
           "Это маржинальный доход на кредит из Недели 8, сложенный по портфелю. Одна оговорка: здесь каждый кредит оценён как средний потребительский; настоящая политика считает каждый продукт по его собственным числам.")},
 ]},

 {"id": "w09d4-s4", "min": 6, "title": ("Where would you put the line?", "Где бы вы провели линию?"), "steps": [
  {"show": cut(view="bands", edges=EDGES, be=True),
   "f": ("break-even = 1 454 907 ÷ (1 454 907 + 17 219 143) = {p|7.79 %}", "безубыточность = 1 454 907 ÷ (1 454 907 + 17 219 143) = {p|7,79 %}"),
   "fs": ("Good divided by good plus bad: 7.79 percent.", "Хороший, делённый на хороший плюс плохой: 7,79 процента."),
   "say": ("A group of loans is worth declining only if it loses money: if more of it goes bad than the [[break-even bad rate|good ÷ (good + bad): above it, a group of loans loses money]], {p|7.79 %} — Week 8's break-even PD.",
           "Группе кредитов стоит отказывать, только если она теряет деньги — если плохих в ней больше [[безубыточной доли плохих|хороший ÷ (хороший + плохой): выше неё группа кредитов теряет деньги]], {p|7,79 %}. Это безубыточный PD из Недели 8.")},
  {"say": ("Each bar is a 20-point band of scores with its bad rate; the dashed line is 7.79 %. Four rounds: keep the band, or decline it?",
           "Каждый столбик — полоса скоров шириной 20 пунктов и её доля плохих; пунктир — 7,79 %. Четыре раунда: одобрять полосу или отказывать?")},
  {"show": {"pick": 3}, "say": ("Round 1.", "Раунд 1."),
   "ask": {"q": ("Scores 580–599: 17 bads in 142 loans, 12.0 %. Keep or decline?", "Скоры 580–599: 17 плохих на 142 кредита, 12,0 %. Одобрять или отказать?"),
           "options": KEEP, "answer": 1,
           "why": ("12.0 % is above the 7.79 % break-even: lending to this band loses money.", "12,0 % выше безубыточных 7,79 %: кредиты этой полосе приносят убыток.")}},
  {"show": {"pick": 6}, "say": ("Round 2.", "Раунд 2."),
   "ask": {"q": ("Scores 640–659 go bad 6.2 % of the time — twice the book's 2.93 %. Keep or decline?", "Скоры 640–659 портятся в 6,2 % случаев — вдвое чаще, чем портфель в среднем (2,93 %). Одобрять или отказать?"),
           "options": KEEP, "answer": 0,
           "why": ("6.2 % is below the 7.79 % break-even: these loans still leave money. Compare with the break-even, not with the average.",
                   "6,2 % ниже безубыточных 7,79 %: эти кредиты всё ещё приносят деньги. Сравнивайте с безубыточностью, а не со средним.")}},
  {"show": {"pick": 1}, "say": ("Round 3.", "Раунд 3."),
   "ask": {"q": ("Scores 540–559: 4 bads in 49 loans, 8.2 %. Keep or decline?", "Скоры 540–559: 4 плохих на 49 кредитов, 8,2 %. Одобрять или отказать?"),
           "options": KEEP, "answer": 1,
           "why": ("8.2 % is just above 7.79 %: decline — though with only 49 loans it is a close call.", "8,2 % чуть выше 7,79 %: отказ — хотя при 49 кредитах это решение на грани.")}},
  {"show": {"pick": None, "decide": True, "cut": 600},
   "say": ("Colour every band: {o|orange} above the line (decline), {g|green} below (keep). Everything below 600 is orange, everything from 600 up is green.",
           "Раскрасим все полосы: {o|оранжевые} выше линии (отказ), {g|зелёные} ниже (одобрять). Всё ниже 600 — оранжевое, всё от 600 и выше — зелёное.")},
  {"show": cut(lines=["profit"], best=True, cut=594),
   "f": ("best line {y|594}: 7.14 bn  ·  approve everyone: 6.91 bn", "лучшая линия {y|594}: 7,14 млрд  ·  одобрять всех: 6,91 млрд"),
   "say": ("Now try every line in money: the profit peaks at {y|594} — 7.14 bn soum, 0.23 bn more than approving everyone. Every line from 593 to 600 is within 0.3 % of it.",
           "Теперь проверим каждую линию в деньгах: прибыль достигает пика на {y|594} — 7,14 млрд сумов, на 0,23 млрд больше, чем «одобрять всех». Любая линия от 593 до 600 отстаёт от неё меньше чем на 0,3 %.")},
  {"show": {"cut": 600},
   "say": ("The top is flat and a little jagged, so 594 is partly noise. Recommend a round line you can explain — {y|600}, the edge of grade D — and give the range.",
           "Вершина плоская и чуть зубчатая, так что 594 — отчасти шум. Рекомендуйте круглую линию, которую можно объяснить, — {y|600}, границу грейда D, — и назовите диапазон.")},
  {"show": cut(view="bands", edges=EDGES, be=True, fund=0.22, pick=4),
   "f": ("22 %: a good loan leaves 695 496 · a bad one costs 17 978 554 → break-even {p|3.72 %}", "22 %: хороший оставляет 695 496 · плохой стоит 17 978 554 → безубыточность {p|3,72 %}"),
   "say": ("Round 4. Funding rises to 22 %: a good loan now leaves only 695 496 soum, and the break-even falls to {p|3.72 %}.",
           "Раунд 4. Фондирование дорожает до 22 %: хороший кредит теперь оставляет лишь 695 496 сумов, а безубыточность падает до {p|3,72 %}.")},
  {"say": ("Decide.", "Решите."),
   "ask": {"q": ("At 22 % funding, scores 600–619 (4.2 % bad): keep or decline?", "При фондировании 22 % скоры 600–619 (4,2 % плохих): одобрять или отказать?"),
           "options": KEEP, "answer": 1,
           "why": ("4.2 % is now above the 3.72 % break-even: the same loans that paid at 18 % lose money at 22 %.", "4,2 % теперь выше безубыточных 3,72 %: те же кредиты, что окупались при 18 %, при 22 % убыточны.")}},
  {"show": cut(lines=["profit"], best=True, fund=0.22, cut=659),
   "say": ("In money: at 22 % everything from 600 to 659 stops paying, and the best line jumps from 594 to {y|659}, the C/B edge.",
           "В деньгах: при 22 % всё от 600 до 659 перестаёт окупаться, и лучшая линия прыгает с 594 на {y|659} — границу грейдов C и B.")},
  {"say": ("Last round, in your head.", "Последний раунд — в уме."),
   "ask": {"q": ("Funding gets cheaper instead: 14 %. Where does the best line go?", "А если фондирование подешевеет до 14 %? Куда сдвинется лучшая линия?"),
           "options": (["Up", "Down", "It stays at 594"], ["Вверх", "Вниз", "Останется на 594"]), "answer": 1,
           "why": ("A good loan leaves more, the break-even rises and more bands pay: at 14 % the best line drops to 537.", "Хороший кредит оставляет больше, безубыточность растёт, и окупается больше полос: при 14 % лучшая линия опускается до 537.")}},
 ]},

 {"id": "w09d4-s5", "min": 4, "title": ("A 2 % target — and its price", "Цель 2 % — и её цена"), "steps": [
  {"show": cut(lines=["profit", "br"], target=0.02, best=True),
   "say": ("Risk appetite is often written as a [[bad-rate target|a ceiling on the approved loans' bad rate, set by risk appetite]]: “the loans we approve must stay under 2 % bad”.",
           "Риск-аппетит часто записывают как [[целевую долю плохих|потолок доли плохих среди одобренных кредитов, заданный риск-аппетитом]]: «среди одобренных должно быть меньше 2 % плохих».")},
  {"show": {"cut": 647},
   "f": ("647: approved 74.3 % · bad rate 1.997 % · profit {y|6.12 bn}", "647: одобрено 74,3 % · доля плохих 1,997 % · прибыль {y|6,12 млрд}"),
   "say": ("The loosest line that meets it is {p|647}: 74.3 % approved at a 1.997 % bad rate, earning {y|6.12 bn} soum.",
           "Самая мягкая линия, которая её выполняет, — {p|647}: одобрено 74,3 % при доле плохих 1,997 %, прибыль {y|6,12 млрд} сумов.")},
  {"f": ("price of the target = 7.14 − 6.12 = {o|1.02 bn}", "цена цели = 7,14 − 6,12 = {o|1,02 млрд}"),
   "fs": ("The target costs about 1.02 billion soum.", "Цель стоит около 1,02 миллиарда сумов."),
   "say": ("The best line earns 7.14 bn, so the target costs {o|1.02 bn} of profit on this book — and 0.79 bn below even approving everyone.",
           "Лучшая линия даёт 7,14 млрд, значит, цель стоит {o|1,02 млрд} прибыли на этом портфеле — и на 0,79 млрд меньше даже «одобрять всех».")},
  {"say": ("Why?", "Почему?"),
   "ask": {"q": ("Why does the 2 % line earn less than approving everyone?", "Почему линия под 2 % зарабатывает меньше, чем «одобрять всех»?"),
           "options": (["The target is computed wrongly", "Between 600 and 647 it declines loans that go bad less often than 7.79 %, and each of them would have earned money", "Bad loans earn more than good ones"],
                       ["Цель посчитана неверно", "Между 600 и 647 она отказывает кредитам, которые портятся реже 7,79 %, а каждый из них принёс бы деньги", "Плохие кредиты зарабатывают больше хороших"]), "answer": 1,
           "why": ("A group is worth declining only above the break-even. The 2 % line declines grade C loans that still pay.", "Отказывать группе стоит только выше безубыточности. Линия под 2 % отказывает кредитам грейда C, которые ещё окупаются.")}},
  {"show": {"cut": 720},
   "say": ("The lowest bad rate is not a goal: approve only 720 and above and the bad rate is 0.90 % — and the profit {y|2.28 bn}, a third of the best.",
           "Самая низкая доля плохих — не цель: одобряйте только от 720 — доля плохих 0,90 %, а прибыль {y|2,28 млрд}, треть от лучшей.")},
  {"say": ("So when a committee proposes a target, show it two numbers before it votes: the line the target implies, and the money it costs.",
           "Поэтому, когда комитет предлагает цель, покажите ему до голосования два числа: линию, которую задаёт цель, и деньги, которые она стоит.")},
 ]},

 {"id": "w09d4-s6", "min": 5, "title": ("Who changes sides", "Кто переходит на другую сторону"), "steps": [
  {"show": {"kind": "dots", "groups": [[80, "m", "same"], [3, "o", "out"], [17, "y", "in"]], "cols": 20, "scatter": 3,
            "legend": [["m", ("same decision", "решение то же")], ["o", ("swap-out", "swap-out")], ["y", ("swap-in", "swap-in")]]},
   "say": ("A rule, “approve 600 and above”, against today's decisions on {b|13 612} scored applications (one dot ≈ 136). Most decisions stay the same; two groups change sides.",
           "Правило «одобрять от 600» против нынешних решений по {b|13 612} заявкам со скором (одна точка ≈ 136). Большинство решений не меняется; две группы переходят на другую сторону.")},
  {"show": {"fade": ["same", "in"], "box": ["out"]},
   "say": ("[[Swap-outs|approved today, declined by the new rule]]: {o|363} applications. 331 became loans and 37 of those went bad — Nur **knows**, because it lent to them.",
           "[[Swap-out|одобрены сейчас, получат отказ по новому правилу]]: {o|363} заявки. 331 стала кредитом, и 37 из них испортились — Nur это **знает**, ведь она им дала деньги.")},
  {"show": {"fade": ["same", "out"], "box": ["in"]},
   "say": ("[[Swap-ins|rejected today, approved by the new rule]]: {y|2 295} applicants. Nobody knows how they would have paid.",
           "[[Swap-in|отклонены сейчас, будут одобрены по новому правилу]]: {y|2 295} заявителей. Никто не знает, как бы они платили.")},
  {"say": ("Your turn.", "Ваша очередь."),
   "ask": {"q": ("What do you know about the 2 295 swap-ins' bad rate?", "Что известно о доле плохих среди 2 295 swap-in?"),
           "options": (["The same as approved loans with the same score", "Nothing from Nur's data: they never got a loan, so there is no outcome", "It is zero"],
                       ["Та же, что у одобренных с тем же скором", "Из данных Nur — ничего: кредита не было, значит, нет и исхода", "Она нулевая"]), "answer": 1,
           "why": ("No loan, no outcome. The past policy hides how the people it rejected would have paid.", "Нет кредита — нет исхода. Прошлая политика скрывает, как платили бы те, кому она отказала.")}},
  {"say": ("Guessing it is [[reject inference|estimating how rejected applicants would have behaved]]. Beware: swap-ins were often rejected by a rule, not the score, so treating them like approved people usually underestimates their risk.",
           "Угадывать её — это [[оценка отклонённых заявок|попытка оценить, как вели бы себя те, кому отказали (reject inference)]]. Осторожно: swap-in часто отклоняли по правилу, а не по скору, и считать их такими же, как одобренных, обычно значит занизить риск.")},
  {"show": {"kind": "rows", "rows": [[0.55, None, None, "o"], [0.316, None, None, "o"], [0.152, None, None, "o"], [0.059, None, None, "o"]], "pct": True, "dp": 1, "lo": 0, "hi": 0.6,
            "labels": (["below 600 · 2 155 applicants", "600–659 · 4 605", "660–719 · 4 702", "720+ · 2 150"], ["ниже 600 · 2 155 заявителей", "600–659 · 4 605", "660–719 · 4 702", "720+ · 2 150"])},
   "say": ("The share rejected by score band. It falls with the score but never reaches zero — 5.9 % even at 720+. [[Policy rules|hard rules that decline whatever the score says: income, bureau delinquencies, fraud flags]] and [[overrides|a credit officer's decision against the score]] decide too.",
           "Доля отказов по полосам скора. Она падает с ростом скора, но не до нуля — даже от 720 отказывают 5,9 %. Решают и [[стоп-факторы|жёсткие правила, отказывающие при любом скоре: доход, просрочки в бюро, признаки мошенничества]], и [[ручные решения|решение кредитного специалиста вопреки скору (override)]].")},
  {"say": ("So a cut-off study keeps the policy rules fixed — otherwise it promises swap-ins the rules would reject anyway. The [[override rate|the share of decisions that went against the score]] shows whether people trust the scorecard.",
           "Поэтому анализ порога оставляет стоп-факторы на месте — иначе он обещает swap-in, которых правила всё равно отклонят. А [[доля ручных решений|доля решений, принятых вопреки скору]] показывает, доверяют ли люди скоринговой карте.")},
  {"f": ("2.93 % → 2.55 %: about {b|28 936} loans per arm  ·  Nur's whole history: 7 828", "2,93 % → 2,55 %: около {b|28 936} кредитов на группу  ·  вся история Nur: 7 828"),
   "fs": ("About 28 936 loans per arm — Nur has made 7 828 in its life.", "Около 28 936 кредитов на группу — а Nur за всю жизнь выдала 7 828."),
   "say": ("To test a policy for real: [[champion / challenger|the current policy decides most applications; a random share goes through the new one]] — Week 7's A/B test. But bads are rare: seeing 2.93 % → 2.55 % needs about 28 936 loans per arm.",
           "Чтобы проверить политику по-настоящему: [[чемпион / претендент|нынешняя политика решает по большинству заявок, а случайная доля идёт через новую]] — A/B-тест из Недели 7. Но плохие редки: чтобы увидеть 2,93 % → 2,55 %, нужно около 28 936 кредитов на группу.")},
  {"say": ("Last one.", "Последний вопрос."),
   "ask": {"q": ("Why is a test a poor way to choose between the lines 594 and 600?", "Почему тест — плохой способ выбрать между линиями 594 и 600?"),
           "options": (["They disagree on only 38 loans in Nur's history — no test could see a difference", "A/B tests are not allowed in lending", "600 is always better"],
                       ["Они расходятся всего на 38 кредитах за всю историю Nur — никакой тест не увидит разницы", "A/B-тесты в кредитовании запрещены", "600 всегда лучше"]), "answer": 0,
           "why": ("Small moves are judged on the swap sets and the profit curve. Tests are for big changes, read early with FPD.",
                   "Маленькие сдвиги оценивают по swap-группам и кривой прибыли. Тесты — для больших изменений, с ранним сигналом по FPD.")}},
 ]},

 {"id": "w09d4-s7", "min": 6, "title": ("Has the crowd moved? — PSI", "Сменилась ли публика? — PSI"), "steps": [
  {"show": {"kind": "psi", "e": [0.25, 0.75], "a": [0.35, 0.65], "parts": False, "sum": False,
            "labels": (["low scores", "high scores"], ["низкие скоры", "высокие скоры"]), "words": {"e": ("last year", "прошлый год"), "a": ("this month", "этот месяц")}},
   "say": ("The scorecard was built on one crowd of applicants. Is today's crowd the same? A toy with two bands: last year {p|25 % low, 75 % high}; this month {b|35 % and 65 %}.",
           "Скоринговую карту строили на одной публике заявителей. Та же ли она сегодня? Игрушка с двумя полосами: в прошлом году {p|25 % низких и 75 % высоких}, в этом месяце {b|35 % и 65 %}.")},
  {"show": {"parts": True},
   "f": ("(35 % − 25 %) × ln(35 ÷ 25) = 0.10 × 0.336 = {p|0.0336}", "(35 % − 25 %) × ln(35 ÷ 25) = 0,10 × 0,336 = {p|0,0336}"),
   "fs": ("0.10 times the log of 1.4: 0.0336.", "0,10 на логарифм от 1,4: 0,0336."),
   "say": ("For each band: (today's share − last year's) × ln(today ÷ last year). The low band: 0.10 × ln 1.4 = {p|0.0336}.",
           "Для каждой полосы: (доля сейчас − доля тогда) × ln(сейчас ÷ тогда). Низкая полоса: 0,10 × ln 1,4 = {p|0,0336}.")},
  {"show": {"sum": True}, "f": ("+ (65 % − 75 %) × ln(65 ÷ 75) = {p|0.0143}  →  PSI = 0.0336 + 0.0143 = {y|0.048}", "+ (65 % − 75 %) × ln(65 ÷ 75) = {p|0,0143}  →  PSI = 0,0336 + 0,0143 = {y|0,048}"),
   "fs": ("Plus 0.0143 from the high band: the PSI is 0.048.", "Плюс 0,0143 от высокой полосы: PSI равен 0,048."),
   "say": ("The high band: −0.10 × ln 0.867 = {p|0.0143}, positive too — a fall and its log share the sign. Add the bands: the [[PSI|population stability index: how far the applicants' shares across score bands moved from the reference]] = {y|0.048}.",
           "Высокая полоса: −0,10 × ln 0,867 = {p|0,0143} — тоже плюс: у падения и его логарифма один знак. Складываем полосы: [[PSI|индекс стабильности популяции: насколько доли заявителей по полосам скора ушли от эталона]] = {y|0,048}.")},
  {"say": ("Read it with a traffic light: {g|under 0.1 stable}, {y|0.1–0.25 watch}, {o|over 0.25 act}. 0.048 is stable.",
           "Читаем по светофору: {g|до 0,1 — стабильно}, {y|0,1–0,25 — наблюдать}, {o|больше 0,25 — действовать}. 0,048 — стабильно.")},
  {"show": {"e": [0.5, 0.5], "a": [0.5, 0.5]}, "say": ("Check the formula.", "Проверьте формулу."),
   "ask": {"q": ("Two years with identical shares, 50 % and 50 %. What is the PSI?", "Два года с одинаковыми долями, 50 % и 50 %. Чему равен PSI?"),
           "options": (["0", "0.5", "1"], ["0", "0,5", "1"]), "answer": 0,
           "why": ("Each band adds 0 × ln 1 = 0. No movement, no PSI.", "Каждая полоса добавляет 0 × ln 1 = 0. Нет сдвига — нет PSI.")}},
  {"show": {"e": E24, "a": A26, "parts": False, "labels": (BANDS6, ["<560", "560", "600", "640", "680", "720+"]),
            "words": {"e": ("2024 (the build year)", "2024 (год построения)"), "a": ("2026", "2026")}},
   "say": ("Nur: 2024's applicants, the scorecard's first year, against 2026's, on six score bands. The bars almost match: PSI = {g|0.0037}, stable.",
           "Nur: заявители 2024 года — первого года карты — против заявителей 2026-го, по шести полосам скора. Столбики почти совпадают: PSI = {g|0,0037}, стабильно.")},
  {"show": {"parts": True},
   "say": ("Each band's part is tiny; the biggest, 680–719 (22.70 % → 20.82 %), adds only {p|0.0016}.", "Вклад каждой полосы крошечный; самый большой, у 680–719 (22,70 % → 20,82 %), — всего {p|0,0016}.")},
  {"show": {"a": A26_10, "words": {"e": ("2024", "2024"), "a": ("2026, every score −10", "2026, каждый скор −10")}},
   "say": ("A slow slide hides, though: lower every 2026 score by 10 points and the PSI is only {g|0.041} — still green. That is why the monthly page also shows the average score.",
           "Но медленное сползание прячется: снизьте каждый скор 2026 года на 10 пунктов — PSI всего {g|0,041}, всё ещё зелёный. Поэтому в месячном отчёте показывают и средний скор.")},
  {"show": {"a": A26_20, "words": {"e": ("2024", "2024"), "a": ("2026, every score −20", "2026, каждый скор −20")}},
   "say": ("Lower them by 20 and the PSI reaches {y|0.136}: watch. By 30 it would be 0.28: act.", "Снизьте на 20 — PSI достигает {y|0,136}: наблюдать. На 30 было бы 0,28: действовать.")},
  {"say": ("A detail for the homework: a score exactly on an edge belongs to the band **above** it — 600 goes into 600–639, not into 560–599.",
           "Деталь для домашки: скор ровно на границе относится к полосе **выше** — 600 попадает в 600–639, а не в 560–599.")},
  {"say": ("Two practical rules. An empty band makes ln(0) blow up: floor every share at a tiny value (0.01 %) or merge the band with its neighbour. More bands give the same verdict — the homework uses ten, cut at 2024's deciles.",
           "Два практических правила. Пустая полоса ломает ln(0): ставьте каждой доле нижнюю границу (0,01 %) или сливайте полосу с соседней. Больше полос — тот же вердикт: в домашке их десять, по децилям 2024 года.")},
  {"say": ("And a stable PSI says only that the **applicants** have not moved — not that the score still ranks. That is the Gini's job.",
           "И стабильный PSI говорит лишь, что не сдвинулись **заявители**, — а не что скор всё ещё ранжирует. Это работа Джини.")},
 ]},

 {"id": "w09d4-s8", "min": 5, "title": ("Watching every month", "Наблюдение каждый месяц"), "steps": [
  {"show": {"kind": "psi", "view": "months", "vals": MONTHS,
            "labels": (["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"], ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт"])},
   "say": ("The same PSI for each month of 2026 against 2024. Every month is green, from 0.004 to 0.018…", "Тот же PSI для каждого месяца 2026 года против 2024-го. Все месяцы зелёные, от 0,004 до 0,018…")},
  {"say": ("…and October: {y|0.062}, 17 times 2026's PSI. But October has only 129 applicants so far, and in a small month each band's share jumps by chance.",
           "…и октябрь: {y|0,062}, в 17 раз больше PSI всего 2026-го. Но в октябре пока лишь 129 заявителей, а в маленьком месяце доля каждой полосы случайно скачет.")},
  {"say": ("Your turn.", "Ваша очередь."),
   "ask": {"q": ("October shows 0.062 on 129 applicants. What do you write?", "В октябре 0,062 на 129 заявителях. Что вы напишете?"),
           "options": (["The population has shifted: rebuild", "A partial month, noisy and still green — look again when it is complete", "PSI can't be computed for one month"],
                       ["Популяция сдвинулась: перестраивать", "Неполный месяц, шумный и всё ещё зелёный — посмотреть снова, когда он закончится", "PSI нельзя посчитать за один месяц"]), "answer": 1,
           "why": ("Fewer applicants, bigger random swings. Act on a trend, not on one partial month.", "Меньше заявителей — больше случайных колебаний. Действуйте по тренду, а не по одному неполному месяцу.")}},
  {"show": {"kind": "rows", "rows": [[0.0001, None, None, "b"], [0.0005, None, None, "b"], [0.0033, None, None, "b"], [0.0033, None, None, "b"]], "dp": 4, "lo": 0, "hi": 0.005,
            "labels": (["channel", "product", "term in months", "requested amount"], ["канал", "продукт", "срок в месяцах", "запрошенная сумма"])},
   "say": ("When the PSI rises, find **which input** moved: the [[CSI|characteristic stability index: the PSI formula applied to one input, such as the channel]] — the same formula on one input instead of the score. Nur's are all tiny.",
           "Когда PSI растёт, ищите, **какой вход** сдвинулся: [[CSI|индекс стабильности характеристики: формула PSI для одного входа, например канала]] — та же формула для одного входа вместо скора. У Nur все крошечные.")},
  {"say": ("Find the cause.", "Найдите причину."),
   "ask": {"q": ("The PSI is 0.18; the channel's CSI is 0.15; every other CSI is under 0.01. Where do you look first?", "PSI 0,18; CSI канала 0,15; все остальные CSI меньше 0,01. Куда смотрите в первую очередь?"),
           "options": (["Rebuild the scorecard today", "The channel mix: a new partner or a campaign changed who applies — check the bad rate by band there", "Nowhere: 0.18 is under 0.25"],
                       ["Перестроить карту сегодня же", "Состав каналов: новый партнёр или кампания изменили, кто подаёт заявки, — проверьте долю плохих по полосам в этом канале", "Никуда: 0,18 меньше 0,25"]), "answer": 1,
           "why": ("0.1–0.25 means “watch”: find the cause before acting. The CSI points at the input that moved.", "0,1–0,25 — это «наблюдать»: сначала найдите причину. CSI указывает на сдвинувшийся вход.")}},
  {"f": ("PSI < 0.1 → note it  ·  0.1–0.25 → find the cause (CSI)  ·  > 0.25 → restrict, recalibrate or rebuild", "PSI < 0,1 → отметить  ·  0,1–0,25 → найти причину (CSI)  ·  > 0,25 → ограничить, перекалибровать или перестроить"),
   "say": ("Each signal has its usual action. Under 0.1: note it. 0.1–0.25: find the moved input and adjust its cut-off. Over 0.25: a new population — restrict the score, recalibrate or rebuild.",
           "У каждого сигнала своё обычное действие. До 0,1 — отметить. 0,1–0,25 — найти сдвинувшийся вход и поправить его порог. Больше 0,25 — новая популяция: ограничить скор, перекалибровать или перестроить.")},
  {"say": ("The bad rate rises while the Gini and the PSI stay put? The **order** is right, the **level** is not: [[recalibrate|shift the predicted PD levels to match the actual bad rates]] the PD, move the cut-off, reprice.",
           "Доля плохих растёт, а Джини и PSI стоят на месте? **Порядок** верный, **уровень** — нет: [[перекалибруйте|сдвиньте предсказанные уровни PD к фактическим долям плохих]] PD, сдвиньте порог, пересмотрите цены.")},
  {"say": ("The Gini falls beyond its interval? The score ranks worse: review it and rebuild with recent loans.", "Джини падает за пределы своего интервала? Скор ранжирует хуже: пересмотрите его и перестройте на свежих кредитах.")},
  {"say": ("The monthly page, always in the same order: **population** (PSI, average score), **ranking** (Gini on mature vintages), **outcome** (bad rate by vintage at the same age), **policy** (approval rate, overrides). It ends with one line: signal → action → owner → date.",
           "Месячный отчёт всегда в одном порядке: **популяция** (PSI, средний скор), **ранжирование** (Джини на созревших поколениях), **исход** (доля плохих по поколениям в одном возрасте), **политика** (уровень одобрения, ручные решения). В конце одна строка: сигнал → действие → ответственный → срок.")},
 ]},
]

TOPICS = [
    ("w09d4-s1", "One line, two numbers — approval, bad rate, bads avoided", "Одна линия, два числа — одобрение, доля плохих, избежавшие плохие", []),
    ("w09d4-s2", "What one approved loan is expected to lose", "Сколько ожидаем потерять на одобренном кредите", []),
    ("w09d4-s3", "A good loan, a bad loan — the profit of a line", "Хороший кредит, плохой кредит — прибыль линии", []),
    ("w09d4-s4", "Where would you put the line? — the break-even and the best cut-off", "Где бы вы провели линию? — безубыточность и лучший порог", ["w09d4-x1"]),
    ("w09d4-s5", "A 2 % target — and its price", "Цель 2 % — и её цена", []),
    ("w09d4-s6", "Who changes sides — swap-ins, swap-outs, rules and tests", "Кто меняет сторону — swap-in, swap-out, правила и тесты", []),
    ("w09d4-s7", "Has the crowd moved? — PSI", "Сменилась ли публика? — PSI", ["w09d4-x2"]),
    ("w09d4-s8", "Watching every month — CSI and what to do", "Наблюдение каждый месяц — CSI и что делать", ["w09d4-g1", "w09d4-g2"]),
]
CLIPS_EN = {}
CLIPS_RU = {}
GF = {"min": 60,
      "en": "The same ideas as the stories, written out in full with Python and SQL: the trade-off table, bads avoided and goods lost, the expected loss per loan, the profit curve and its best point, the price of a bad-rate target, the swap query, policy rules, the champion / challenger power calculation, PSI and CSI, the monthly view and the decision table. Optional: nothing here counts toward the day.",
      "ru": "Те же идеи, что в историях, но полностью, с Python и SQL: таблица компромисса, избежавшие плохие и потерянные хорошие, ожидаемые потери на кредит, кривая прибыли и её лучшая точка, цена целевой доли плохих, запрос swap-групп, стоп-факторы, расчёт мощности для чемпиона / претендента, PSI и CSI, месячный отчёт и таблица решений. По желанию: здесь ничего не входит в зачёт дня."}


def build(lang):
    return _b(STORIES, lang)


if __name__ == "__main__":
    import json
    for lang in ("en", "ru"):
        b2 = build(lang)
        print(lang, len(b2), sum(len(json.loads(v)["steps"]) for v in b2.values()), "steps")
