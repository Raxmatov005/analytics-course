"""New stories for days that keep their text (the visuals pass of 2026-11-02): tables, shares and windows shown step by
step. Placed (and later rewritten) with: python -I scripts/stories/place.py extra_stories
Pictures: story8.js (grid, xtab, merge, frame, bands, mix) and story7.js (rows). Every number is the page's own or
computed from nur.db / the course files (see each story's comment)."""
from common import build as _b, btn

WHERE = {
    "w02d1-s1": ("weeks/week-02/day-1.md", "Many-to-one and one-to-many"),
    "w02d2-s1": ("weeks/week-02/day-2.md", "WHERE vs HAVING"),
    "w03d1-s1": ("weeks/week-03/day-1.md", "The frame — ROWS BETWEEN"),
    "w03d2-s1": ("weeks/week-03/day-2.md", "RANK and DENSE_RANK"),
    "w04d2-s1": ("weeks/week-04/day-2.md", "XLOOKUP for bands"),
    "w04d4-s1": ("weeks/week-04/day-4.md", "Show Values As — % of Grand Total"),
    "w04d4-s2": ("weeks/week-04/day-4.md", "A calculated field — a ratio of sums"),
    "w05d2-s1": ("weeks/week-05/day-2.md", "pd.cut — buckets without a CASE"),
    "w05d3-s1": ("weeks/week-05/day-3.md", "merge — the join, and its four how="),
    "w05d3-s2": ("weeks/week-05/day-3.md", "validate= and indicator="),
    "w07d2-s9": ("weeks/week-07/day-2.md", {"after": "w07d2-s7"}),
    "w07d4-s1": ("weeks/week-07/day-4.md", "ALL and its relatives"),
    "w08d1-s1": ("weeks/week-08/day-1.md", "The retention table and the retention curve"),
    "w08d1-s2": ("weeks/week-08/day-1.md", "The lending funnel"),
}

# ---------- W2D1: one-to-many (loans 3 and 6 have 3 instalments and 3 payments each, nur.db) ----------
LN = {"name": "loans", "cols": ["loan_id", "principal"], "rows": [[3, "1 590 000"], [6, "4 720 000"]]}
IN = {"name": "installments", "cols": ["loan_id", "installment_no"], "rows": [[3, 1], [3, 2], [3, 3], [6, 1], [6, 2], [6, 3]]}
PY3 = {"name": "payments", "cols": ["loan_id", "payment_id"], "rows": [[3, 28], [3, 29], [3, 30]]}
IN3 = {"name": "installments", "cols": ["loan_id", "installment_no"], "rows": [[3, 1], [3, 2], [3, 3]]}
SQLW = {"nan": "NULL", "rows": ("rows", "строк"), "keys": ("loans found on both sides", "кредитов есть в обеих таблицах")}
JOIN = "JOIN installments ON loan_id"

W2D1 = {"id": "w02d1-s1", "min": 3, "title": ("One to many: why the total grew", "Один ко многим: почему выросла сумма"), "steps": [
    {"show": {"kind": "merge", "L": LN, "R": IN, "on": "loan_id", "how": None, "words": SQLW, "code": JOIN},
     "say": ("Two loans and their instalments. Loans 3 and 6 are 3-month loans: three instalment rows each, one colour per loan.",
             "Два кредита и их платежи по графику. Кредиты 3 и 6 — на 3 месяца: по три строки графика, у каждого кредита свой цвет.")},
    {"show": {"how": "inner"},
     "say": ("Join them on `loan_id`: each loan meets **each** of its instalments. 2 loan rows become {o|6 rows}, and every `principal` is copied three times.",
             "Соединим по `loan_id`: каждый кредит встречает **каждый** свой платёж. 2 строки кредитов превращаются в {o|6 строк}, и каждый `principal` повторяется трижды.")},
    {"ask": {"q": ("`SUM(principal)` over the joined rows: what comes out?", "`SUM(principal)` по соединённым строкам — что получится?"),
             "options": [("1 590 000 + 4 720 000 = 6 310 000", "1 590 000 + 4 720 000 = 6 310 000"), ("Three times that: 18 930 000", "Втрое больше: 18 930 000")],
             "answer": 1, "why": ("Each principal sits on three rows, so the sum counts each loan three times — and no error appears.",
                                  "Каждая сумма стоит в трёх строках, поэтому SUM считает каждый кредит трижды — и без всякой ошибки.")},
     "say": ("Now add up the loans' money on the joined rows.", "Теперь сложим деньги кредитов по соединённым строкам.")},
    {"say": ("One row is now an **instalment**, not a loan: the [[grain|what one row of a table stands for]] changed. Sum loan columns **before** the join, or count loans with `COUNT(DISTINCT loan_id)`.",
             "Одна строка теперь — **платёж по графику**, а не кредит: изменилось [[зерно|что означает одна строка таблицы]]. Складывайте столбцы кредитов **до** соединения или считайте кредиты через `COUNT(DISTINCT loan_id)`.")},
    {"show": {"kind": "merge", "L": PY3, "R": IN3, "on": "loan_id", "how": None, "words": SQLW, "code": JOIN},
     "say": ("Worse: two **many** tables. Loan 3 has 3 payments and 3 instalments — the key `loan_id` repeats on both sides.",
             "Хуже — две таблицы «многие». У кредита 3 три платежа и три строки графика: ключ `loan_id` повторяется с обеих сторон.")},
    {"show": {"how": "inner"},
     "say": ("Every payment meets every instalment: {o|3 × 3 = 9 rows} for one loan. Payment 28 now sits next to instalments 2 and 3, which it never paid.",
             "Каждый платёж встречает каждую строку графика: {o|3 × 3 = 9 строк} на один кредит. Платёж 28 теперь стоит рядом со 2-м и 3-м платежами по графику, которые он не оплачивал.")},
    {"ask": {"q": ("Before a join, which question saves you?", "Какой вопрос спасает перед соединением?"),
             "options": [("Is the key one row or many on each side?", "Ключ — одна строка или много с каждой стороны?"), ("Is the key a number or text?", "Ключ — число или текст?")],
             "answer": 0, "why": ("one × many = many rows (the grain changes); many × many = every pair (a mess). Know both sides' grain first.",
                                  "один × много = много строк (меняется зерно); много × много = все пары (каша). Сначала узнайте зерно обеих сторон.")},
     "say": ("The rule of thumb for every join you write.", "Правило для каждого соединения, которое вы пишете.")},
]}

# ---------- W3D1: the frame (the page's 3-row tie table; monthly disbursement 2026, bn, nur.db; the loan A/B toy) ----------
TIE = {"kind": "frame", "vals": [10, 20, 5], "keys": ["2026-09-28", "2026-09-28", "2026-09-29"], "win": "run", "cur": 0, "fill": "upto",
       "labels": {"keys": [("28 Sep", "28 сен"), ("28 Sep", "28 сен"), ("29 Sep", "29 сен")], "cols": [("day", "день"), "x", "SUM"]},
       "words": {"row": ("row", "строка"), "frame": ("frame", "рамка")}}
MA = {"kind": "frame", "vals": [11.9, 19.7, 17.9, 18.5, 16.1, 20.7, 22.3, 17.0], "keys": ["2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"],
      "win": [-2, 0], "agg": "avg", "cur": 2, "from": 2, "fill": "upto", "dp": 1,
      "labels": {"cols": [("month", "месяц"), ("bn", "млрд"), ("avg of 3", "ср. за 3")]}}
NEXT = btn(0, "Next row ›", "Следующая строка ›", do="next")

W3D1 = {"id": "w03d1-s1", "min": 4, "title": ("What the window reads: the frame", "Что читает окно: рамка"), "steps": [
    {"show": TIE, "f": "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
     "say": ("Three rows in day order. A running total adds up a [[frame|the rows the aggregate reads, counted from the current row]]: from the first row to the current one. Row 1: {y|10}.",
             "Три строки по порядку дней. Нарастающий итог складывает [[рамку|строки, которые читает агрегат, считая от текущей]]: от первой строки до текущей. Строка 1: {y|10}.")},
    {"show": {"cur": 1}, "say": ("Row 2: the frame grows to rows 1–2. 10 + 20 = {y|30}.", "Строка 2: рамка растёт до строк 1–2. 10 + 20 = {y|30}.")},
    {"show": {"cur": 2}, "say": ("Row 3: 10 + 20 + 5 = {y|35}. `ROWS` counts row by row, whatever the day.",
                                 "Строка 3: 10 + 20 + 5 = {y|35}. `ROWS` считает строку за строкой, какой бы ни был день.")},
    {"show": {"win": "range", "cur": 0, "fill": "none"}, "f": "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
     "say": ("Write only `ORDER BY` and you get the **default** frame, `RANGE`: it also takes every row with the **same** `ORDER BY` value as the current one.",
             "Напишите только `ORDER BY` — и получите рамку **по умолчанию**, `RANGE`: она берёт ещё и все строки с **тем же** значением `ORDER BY`, что у текущей.")},
    {"ask": {"q": ("Row 1 is 28 Sep. Under `RANGE`, which rows are in its frame?", "Строка 1 — 28 сен. Какие строки в её рамке при `RANGE`?"),
             "options": [("Row 1 only", "Только строка 1"), ("Rows 1 and 2", "Строки 1 и 2"), ("All three", "Все три")], "answer": 1,
             "why": ("Rows 1 and 2 share 28 Sep, so RANGE takes the whole day: row 1 shows 30, not 10.", "У строк 1 и 2 один день, 28 сен, поэтому RANGE берёт весь день: строка 1 показывает 30, а не 10.")},
     "say": ("Look at the days in the picture.", "Посмотрите на дни на картинке.")},
    {"show": {"cur": 2, "fill": "upto"},
     "say": ("Under `RANGE`: 30, 30, 35. The total jumps a whole day at a time. On Nur's last week of September the two frames agree on only 7 of 77 loans — the last loan of each day.",
             "При `RANGE`: 30, 30, 35 — итог прыгает сразу на целый день. На последней неделе сентября у Nur две рамки совпадают лишь на 7 кредитах из 77 — на последнем кредите каждого дня.")},
    {"show": {"win": "run"}, "f": "ORDER BY disbursed_at, loan_id ROWS UNBOUNDED PRECEDING",
     "say": ("The fix: a tiebreaker (`, loan_id`) and `ROWS`. Row by row again: {y|10, 30, 35}.", "Исправление: добавить «разбиватель ничьих» (`, loan_id`) и написать `ROWS`. Снова строка за строкой: {y|10, 30, 35}.")},
    {"show": MA, "f": "AVG(…) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)",
     "say": ("A frame can have a fixed length: `2 PRECEDING AND CURRENT ROW` is three rows. April: (11.9 + 19.7 + 17.9) ÷ 3 = {y|16.5} bn.",
             "У рамки может быть постоянная длина: `2 PRECEDING AND CURRENT ROW` — это три строки. Апрель: (11,9 + 19,7 + 17,9) ÷ 3 = {y|16,5} млрд.")},
    {"act": [NEXT], "film": 0,
     "say": ("Press **Next row**: the frame slides down one month at a time, and each [[moving average|the average of a value and a fixed number of its neighbours]] is filled in.",
             "Нажимайте **Следующая строка**: рамка сползает на месяц за раз, и заполняется каждое [[скользящее среднее|среднее значения и постоянного числа его соседей]].")},
    {"ask": {"q": ("Which months make August's average?", "Из каких месяцев складывается среднее августа?"),
             "options": [("June, July, August", "Июнь, июль, август"), ("July, August, September", "Июль, август, сентябрь"), ("August alone", "Только август")], "answer": 0,
             "why": ("Two rows before it and itself: (16.1 + 20.7 + 22.3) ÷ 3 = 19.7. It never looks ahead, so it turns a month late.",
                     "Две строки до него и он сам: (16,1 + 20,7 + 22,3) ÷ 3 = 19,7. Вперёд оно не смотрит, поэтому разворот видит на месяц позже.")},
     "show": {"cur": 6, "fill": "none"},
     "say": ("August is ringed. Before you press on, picture its frame.", "Август обведён. Прежде чем идти дальше, представьте его рамку.")},
    {"show": {"kind": "frame", "vals": [100, 200, 300, 50, 50], "part": ["A", "A", "A", "B", "B"], "keys": [1, 2, 3, 1, 2], "win": "run", "cur": 3, "fill": "upto", "agg": "sum", "from": 0, "dp": 0,
              "labels": {"cols": [("loan", "кредит"), ("month", "месяц"), ("amount", "сумма"), "SUM"]}},
     "f": "SUM(amount) OVER (PARTITION BY loan ORDER BY month)",
     "say": ("With `PARTITION BY loan` a frame never crosses into another loan: at loan B's first row it starts again — {y|50}, not 650.",
             "С `PARTITION BY loan` рамка не переходит в другой кредит: на первой строке кредита B она начинается заново — {y|50}, а не 650.")},
]}

# ---------- W3D2: ties (the page's five loans 101–105) ----------
RK = {"kind": "frame", "rank": True, "vals": [900, 700, 700, 500, 400], "keys": [101, 102, 103, 104, 105], "cur": 0, "fill": "upto",
      "labels": {"cols": [("loan", "кредит"), "principal"]}, "words": {"row": ("row", "строка")}}
W3D2 = {"id": "w03d2-s1", "min": 3, "title": ("A tie: three ways to number rows", "Ничья: три способа нумеровать строки"), "steps": [
    {"show": RK, "f": "ORDER BY principal DESC",
     "say": ("Five loans, biggest first. Number them one row at a time with three functions. Row 1: all three say {y|1}.",
             "Пять кредитов, крупные первыми. Пронумеруем их строка за строкой тремя функциями. Строка 1: все три дают {y|1}.")},
    {"show": {"cur": 1}, "say": ("Row 2, 700: second place everywhere — {y|2 · 2 · 2}.", "Строка 2, 700: второе место везде — {y|2 · 2 · 2}.")},
    {"ask": {"q": ("Row 3 is **also** 700 — a tie. What does `RANK` give it?", "Строка 3 — **тоже** 700, ничья. Что даст ей `RANK`?"),
             "options": ["2", "3"], "answer": 0, "why": ("Equal values share a rank: both 700s are 2.", "Равные значения делят место: обе строки по 700 получают 2.")},
     "say": ("The next row has the same principal.", "У следующей строки та же сумма.")},
    {"show": {"cur": 2}, "say": ("`ROW_NUMBER` never ties: it goes on to {y|3}. `RANK` and `DENSE_RANK` both give the tie {y|2}.",
                                 "`ROW_NUMBER` ничьих не знает: идёт дальше, {y|3}. `RANK` и `DENSE_RANK` дают ничьей {y|2}.")},
    {"show": {"cur": 3}, "say": ("Row 4, 500 — the difference. `RANK` jumps to {y|4}: three rows are ahead of it. `DENSE_RANK` says {y|3}: two **values** are ahead.",
                                 "Строка 4, 500 — вот разница. `RANK` прыгает на {y|4}: впереди три строки. `DENSE_RANK` даёт {y|3}: впереди два **значения**.")},
    {"show": {"cur": 4}, "say": ("Row 5: 5 · 5 · 4. `ROW_NUMBER`: always 1, 2, 3 … `RANK`: like a race, a gap after a tie. `DENSE_RANK`: no gaps.",
                                 "Строка 5: 5 · 5 · 4. `ROW_NUMBER`: всегда 1, 2, 3 … `RANK`: как в забеге, после ничьей пропуск. `DENSE_RANK`: без пропусков.")},
    {"ask": {"q": ("Nilufar wants 'the loans with the three biggest **amounts**', ties included. Which filter?", "Нилуфар нужны «кредиты с тремя самыми крупными **суммами**», с ничьими. Какой фильтр?"),
             "options": ["ROW_NUMBER() <= 3", "RANK() <= 3", "DENSE_RANK() <= 3"], "answer": 2,
             "why": ("Three amounts — 900, 700, 500 — are four loans. DENSE_RANK counts values; RANK() <= 3 would stop at the two 700s.",
                     "Три суммы — 900, 700, 500 — это четыре кредита. DENSE_RANK считает значения; RANK() <= 3 остановится на двух по 700.")},
     "say": ("Pick the numbering that matches the question.", "Выберите нумерацию под вопрос.")},
    {"say": ("When you need exactly **one** row per group — the latest loan of each customer — use `ROW_NUMBER` with a tiebreaker: `ORDER BY disbursed_at DESC, loan_id DESC`.",
             "Когда нужна ровно **одна** строка на группу — последний кредит каждого клиента, — берите `ROW_NUMBER` с разбивкой ничьих: `ORDER BY disbursed_at DESC, loan_id DESC`.")},
]}

# ---------- W4D2: XLOOKUP for bands (the page's band table on Lookup) ----------
LOW = {"kind": "bands", "edges": [0, 1, 31, 61, 91, None], "labels": ["0", "1-30", "31-60", "61-90", "90+"], "closed": "left", "vals": [], "ints": True,
       "words": {"val": "dpd"}}
W4D2 = {"id": "w04d2-s1", "min": 3, "title": ("Which band? The largest edge not above", "Какой диапазон? Наибольший край не выше значения"), "steps": [
    {"show": LOW,
     "say": ("The band table on `Lookup` holds five **lower edges**: 0, 1, 31, 61, 91. Each band starts at its edge (● = in) and stops just before the next one (○ = out).",
             "Таблица диапазонов на листе `Lookup` хранит пять **нижних краёв**: 0, 1, 31, 61, 91. Каждый диапазон начинается со своего края (● — внутри) и кончается перед следующим (○ — снаружи).")},
    {"show": {"vals": [45]}, "f": "=XLOOKUP([@dpd], edges, buckets, , -1)",
     "say": ("match_mode {p|-1}: the exact value, or else the **next smaller** edge. dpd {p|45}: no edge is 45; the next smaller is 31 → **31-60**.",
             "match_mode {p|-1}: точное значение, а если его нет — **ближайший меньший** край. dpd {p|45}: края 45 нет; ближайший меньший — 31 → **31-60**.")},
    {"show": {"vals": [45, 0]}, "say": ("dpd {p|0} is exactly an edge: an exact match → **0**.", "dpd {p|0} — ровно край: точное совпадение → **0**.")},
    {"ask": {"q": ("Which band does dpd **30** get?", "В какой диапазон попадёт dpd **30**?"), "options": ["1-30", "31-60"], "answer": 0,
             "why": ("The next smaller edge is 1; 31 is above 30. So 30 → 1-30.", "Ближайший меньший край — 1; 31 больше 30. Значит, 30 → 1-30.")},
     "say": ("30 is not an edge.", "30 — не край.")},
    {"show": {"vals": [45, 0, 30, 919]},
     "say": ("30 → 1-30, and 919 → **90+**: the last band has no end. Five rows of edges cover all 258 dpd values from 0 to 919.",
             "30 → 1-30, а 919 → **90+**: у последнего диапазона нет конца. Пять строк краёв покрывают все 258 значений dpd от 0 до 919.")},
    {"show": {"kind": "bands", "edges": [0, 30, 60, 90, 9999, None], "labels": ["0", "1-30", "31-60", "61-90", "90+"], "closed": "left", "vals": [31], "ints": True, "words": {"val": "dpd"}},
     "say": ("The trap: a table of **upper** edges (0, 30, 60, 90, 9999) with -1. dpd {o|31} finds 30 and comes back as **1-30** — wrong, and no error.",
             "Ловушка: таблица **верхних** краёв (0, 30, 60, 90, 9999) с -1. dpd {o|31} находит 30 и возвращается как **1-30** — неверно, и без ошибки.")},
    {"ask": {"q": ("With upper edges, which match_mode is right?", "Какой match_mode нужен для верхних краёв?"),
             "options": [("-1: exact or next smaller", "-1: точное или ближайшее меньшее"), ("1: exact or next larger", "1: точное или ближайшее большее"), ("0: exact only", "0: только точное")],
             "answer": 1, "why": ("Upper edges: 31 must find 60, the next larger edge → 31-60.", "Верхние края: 31 должно найти 60, ближайший больший край → 31-60.")},
     "say": ("Each kind of edge has its own match_mode.", "У каждого вида краёв свой match_mode.")},
    {"show": LOW, "act": [btn(0, "dpd 1", "dpd 1", do="drop", v=1), btn(0, "dpd 31", "dpd 31", do="drop", v=31), btn(0, "dpd 60", "dpd 60", do="drop", v=60),
                          btn(0, "dpd 90", "dpd 90", do="drop", v=90), btn(0, "dpd 91", "dpd 91", do="drop", v=91)],
     "say": ("Back to lower edges and -1. Drop a few dpd values and watch each one land in the band of its largest edge not above it.",
             "Снова нижние края и -1. Бросайте значения dpd и смотрите, как каждое попадает в диапазон своего наибольшего края, не превышающего его.")},
]}

# ---------- W4D4: % of row / column / total (the page's small table; tblLoans product × bucket counts) ----------
SMALL = [[None, 40], [5, 5], [150, 300]]
XW = {"total": ("Total", "Итого"), "n": ("Sum of outstanding", "Сумма outstanding"), "row": ("% of Row Total", "% от суммы по строке"),
      "col": ("% of Column Total", "% от суммы по столбцу"), "all": ("% of Grand Total", "% от общего итога")}
XL = {"rows": ["Consumer", "Micro", "SME"], "cols": ["Fergana", "Tashkent"]}
MODES = [btn(0, "% of row", "% от строки", do="mode", m="row"), btn(0, "% of column", "% от столбца", do="mode", m="col"), btn(0, "% of total", "% от итога", do="mode", m="all")]
# loans_status.csv: Count of loan_id by product × bucket; 1-30, 31-60 and 61-90 merged into one column to fit a phone
BIG = [[362, 19, 10], [1505, 22, 42], [2280, 61, 77], [2548, 45, 76], [734, 18, 29]]
XW2 = dict(XW, n=("Count of loan_id", "Количество loan_id"))
XL2 = {"rows": ["Auto", "BNPL", "Consumer", "Micro", "SME"], "cols": ["0", "1-90", "90+"]}

W4D4A = {"id": "w04d4-s1", "min": 4, "title": ("Of the row, of the column, of the whole", "От строки, от столбца, от целого"), "steps": [
    {"show": {"kind": "xtab", "vals": SMALL, "mode": "n", "labels": XL, "words": XW},
     "say": ("The small pivot: Sum of outstanding, products down, regions across. Each row has its total on the right, each column at the bottom; the corner, {y|500}, is the **Grand Total**.",
             "Маленькая сводная: сумма outstanding, продукты по строкам, регионы по столбцам. Итог строки — справа, итог столбца — внизу; в углу {y|500} — **общий итог**.")},
    {"show": {"mode": "all", "hot": [2, 1]}, "f": ("% of Grand Total = cell ÷ grand total", "% от общего итога = ячейка ÷ общий итог"),
     "say": ("**% of Grand Total** divides every cell by {y|500}. SME in Tashkent: {o|300} ÷ {y|500} = 60.0 %. All the cells together make 100 %.",
             "**% от общего итога** делит каждую ячейку на {y|500}. SME в Ташкенте: {o|300} ÷ {y|500} = 60,0 %. Все ячейки вместе дают 100 %.")},
    {"show": {"mode": "col"}, "f": ("% of Column Total = cell ÷ its column's total", "% от суммы по столбцу = ячейка ÷ итог её столбца"),
     "say": ("**% of Column Total** divides by the cell's column. Within Tashkent's {y|345}: SME = {o|300} ÷ {y|345} = 87.0 %. Each **column** adds up to 100 %.",
             "**% от суммы по столбцу** делит на итог столбца ячейки. Внутри ташкентских {y|345}: SME = {o|300} ÷ {y|345} = 87,0 %. Каждый **столбец** даёт в сумме 100 %.")},
    {"show": {"mode": "row"}, "f": ("% of Row Total = cell ÷ its row's total", "% от суммы по строке = ячейка ÷ итог её строки"),
     "say": ("**% of Row Total** divides by the cell's row. Within SME's {y|450}: Tashkent = {o|300} ÷ {y|450} = 66.7 %. Each **row** adds up to 100 %.",
             "**% от суммы по строке** делит на итог строки ячейки. Внутри {y|450} у SME: Ташкент = {o|300} ÷ {y|450} = 66,7 %. Каждая **строка** даёт в сумме 100 %.")},
    {"act": MODES, "film": 1,
     "ask": {"q": ("One cell, three numbers: 60.0 %, 87.0 %, 66.7 %. What changed?", "Одна ячейка, три числа: 60,0 %, 87,0 %, 66,7 %. Что изменилось?"),
             "options": [("The cell's value", "Значение ячейки"), ("The bottom of the fraction — what you divide by", "Знаменатель — то, на что делят"), ("The rounding", "Округление")],
             "answer": 1, "why": ("The top stays 300; only the bottom changes: 500, 345 or 450.", "Числитель остаётся 300; меняется только знаменатель: 500, 345 или 450.")},
     "say": ("Press the three buttons and watch the amber ring move: it marks what the cell is divided by.",
             "Нажимайте три кнопки и следите за жёлтой рамкой: она отмечает, на что делят ячейку.")},
    {"show": {"kind": "xtab", "vals": BIG, "mode": "col", "hot": [2, 2], "big": True, "labels": XL2, "words": XW2},
     "f": ("% of Column Total = cell ÷ its column's total", "% от суммы по столбцу = ячейка ÷ итог её столбца"),
     "say": ("`tblLoans`, Count of loans, product × bucket (the late buckets under 90 days in one column). % of Column Total: Consumer is {o|77} ÷ {y|234} = 32.9 % of the 90+ loans.",
             "`tblLoans`, количество кредитов, продукт × корзина (просрочка до 90 дней — в одном столбце). % от суммы по столбцу: Consumer — это {o|77} ÷ {y|234} = 32,9 % кредитов 90+.")},
    {"show": {"mode": "row", "hot": [4, 2]}, "f": ("% of Row Total = cell ÷ its row's total", "% от суммы по строке = ячейка ÷ итог её строки"),
     "say": ("Switch to % of Row Total: of SME's {y|781} loans, {o|29} — 3.7 % — are 90+. Same table, a different question.",
             "Переключим на % от суммы по строке: из {y|781} кредитов SME {o|29} — 3,7 % — в 90+. Та же таблица, другой вопрос.")},
    {"ask": {"q": ("Bekzod asks: 'Of all the 90+ loans, what share is Micro's?' Which setting?", "Бекзод спрашивает: «Какая доля всех кредитов 90+ приходится на Micro?» Какая настройка?"),
             "options": [("% of Row Total", "% от суммы по строке"), ("% of Column Total", "% от суммы по столбцу"), ("% of Grand Total", "% от общего итога")], "answer": 1,
             "why": ("'Of all the 90+ loans' names the column: divide by the 90+ column's total, 234.", "«Из всех кредитов 90+» — это столбец: делим на итог столбца 90+, 234.")},
     "act": MODES, "film": 1,
     "say": ("Find the words that name the denominator: 'of all the …'.", "Ищите слова, которые называют знаменатель: «из всех …».")},
    {"show": {"mode": "col", "hot": None},
     "say": ("Watch out: under % of Column Total every column ends in 100 %. Never add those up — and turn the Grand Total off if it confuses the reader.",
             "Осторожно: в % от суммы по столбцу каждый столбец кончается на 100 %. Не складывайте их — и уберите общий итог, если он сбивает читателя.")},
]}

# ---------- W4D4: a ratio of sums (the page's Micro loans 2, 4, 6) ----------
MX = {"kind": "mix", "items": [[5, 10, "b"], [5, 8, "b"], [0, 6, "m"]], "labels": [("loan 2", "кредит 2"), ("loan 4", "кредит 4"), ("loan 6", "кредит 6")],
      "lines": [], "max": 100, "words": {"pool": ("ratio of sums", "отношение сумм"), "avg": ("average of the rates", "среднее долей")}}
W4D4B = {"id": "w04d4-s2", "min": 3, "title": ("A rate for a group: add first, then divide", "Доля группы: сначала сложить, потом делить"), "steps": [
    {"show": MX, "say": ("Micro's three loans on the small table. Each bar is one loan's share left, outstanding ÷ principal: 50 %, 62.5 %, 0 %.",
                         "Три кредита Micro из маленькой таблицы. Каждый столбик — доля остатка одного кредита, outstanding ÷ principal: 50 %, 62,5 %, 0 %.")},
    {"show": {"lines": ["avg"]}, "f": ("(50 + 62.5 + 0) ÷ 3 = 37.5 %", "(50 + 62,5 + 0) ÷ 3 = 37,5 %"),
     "say": ("Average the three bars: {p|37.5 %}. That is what *Average* of a rate column gives — every loan gets one vote.",
             "Среднее трёх столбиков: {p|37,5 %}. Это даёт *Среднее* по столбцу долей — у каждого кредита один голос.")},
    {"show": {"wide": True}, "say": ("But the loans differ in size: principal 10, 8 and 6. Draw each bar as **wide** as its principal.",
                                     "Но кредиты разного размера: principal 10, 8 и 6. Нарисуем каждый столбик **шириной** с его principal.")},
    {"show": {"lines": ["avg", "pool"]}, "f": ("Σ outstanding ÷ Σ principal = 10 ÷ 24 = 41.7 %", "Σ outstanding ÷ Σ principal = 10 ÷ 24 = 41,7 %"),
     "say": ("Now level the bars like water: {y|10 ÷ 24 = 41.7 %}, the [[ratio of sums|add up the tops, add up the bottoms, then divide once]]. Each loan counts by its size.",
             "Теперь выровняем столбики, как воду: {y|10 ÷ 24 = 41,7 %} — [[отношение сумм|сложить числители, сложить знаменатели и разделить один раз]]. Каждый кредит весит по своему размеру.")},
    {"ask": {"q": ("Loan 6 (0 % left) grows from 6 to 30 m. Which line moves?", "Кредит 6 (остаток 0 %) вырастает с 6 до 30 млн. Какая линия сдвинется?"),
             "options": [("Only the ratio of sums", "Только отношение сумм"), ("Only the average of the rates", "Только среднее долей"), ("Both", "Обе")], "answer": 0,
             "why": ("The plain average still sees three bars: 37.5 %. The ratio of sums weighs loan 6 by its size and falls.",
                     "Простое среднее по-прежнему видит три столбика: 37,5 %. Отношение сумм взвешивает кредит 6 по размеру — и падает.")},
     "say": ("Guess first, then press the button on the next step.", "Сначала угадайте, кнопка — на следующем шаге.")},
    {"act": [btn(0, "Loan 6: principal 30", "Кредит 6: principal 30", do="set", i=2, bottom=30)], "film": 0, "f": ("10 ÷ 48 = 20.8 %", "10 ÷ 48 = 20,8 %"),
     "say": ("Press it: the wide grey bar pulls the {y|ratio of sums} down to 10 ÷ 48 = 20.8 %; the {p|average} stays at 37.5 %.",
             "Нажмите: широкий серый столбик тянет {y|отношение сумм} вниз, до 10 ÷ 48 = 20,8 %; {p|среднее} остаётся 37,5 %.")},
    {"show": {"reset": True},
     "say": ("A rate for a group — collected ÷ due, outstanding ÷ principal — is a ratio of sums. In a pivot that is a **calculated field**; *Average* of a rate column answers another question.",
             "Доля для группы — собрано ÷ к оплате, outstanding ÷ principal — это отношение сумм. В сводной это **вычисляемое поле**; *Среднее* по столбцу долей отвечает на другой вопрос.")},
]}

# ---------- W5D2: pd.cut (the page's edges; income bands with right=False) ----------
CUT = {"kind": "bands", "edges": [-1, 0, 30, 60, 90, None], "labels": ["0", "1-30", "31-60", "61-90", "90+"], "closed": "right", "vals": [], "words": {"val": "dpd"}}
INC = {"kind": "bands", "edges": [0, 5, 10, 20, None], "labels": ["<5m", "5-10m", "10-20m", "20m+"], "closed": "left", "vals": [5],
       "words": {"val": ("income, m", "доход, млн")}}
W5D2 = {"id": "w05d2-s1", "min": 3, "title": ("pd.cut: which side owns the edge?", "pd.cut: кому принадлежит край?"), "steps": [
    {"show": CUT, "f": "pd.cut(loans[\"dpd\"], bins=[-1, 0, 30, 60, 90, np.inf], labels=…)",
     "say": ("`pd.cut` with the edges −1, 0, 30, 60, 90, ∞. Every interval is [[right-closed|it contains its right edge but not its left one: (30, 60] holds 60, not 30]]: ● marks the end that is in.",
             "`pd.cut` с краями −1, 0, 30, 60, 90, ∞. Каждый интервал [[закрыт справа|содержит правый край, но не левый: (30, 60] содержит 60, но не 30]]: ● отмечает край, который внутри.")},
    {"show": {"vals": [60]}, "say": ("dpd {p|60} sits on an edge. The right end is closed, so 60 belongs to (30, 60] → **31-60**.",
                                     "dpd {p|60} стоит на краю. Правый конец закрыт, поэтому 60 входит в (30, 60] → **31-60**.")},
    {"ask": {"q": ("And dpd 61?", "А dpd 61?"), "options": ["31-60", "61-90"], "answer": 1,
             "why": ("61 is above 60, so the next interval, (60, 90], holds it.", "61 больше 60, его содержит следующий интервал, (60, 90].")},
     "say": ("One day more.", "На один день больше.")},
    {"show": {"vals": [60, 61, 0]}, "say": ("61 → 61-90. And {p|0} → (−1, 0] → **0**: that is why the first edge is −1, not 0.",
                                            "61 → 61-90. А {p|0} → (−1, 0] → **0**: вот почему первый край −1, а не 0.")},
    {"show": {"kind": "bands", "edges": [0, 30, 60, 90, None], "labels": ["1-30", "31-60", "61-90", "90+"], "closed": "right", "vals": [0], "words": {"val": "dpd"}},
     "say": ("The trap: start the edges at 0. The first interval is (0, 30], which does **not** hold 0 → {o|NaN}. All 7 429 current loans lose their bucket, with no error.",
             "Ловушка: начать края с 0. Первый интервал — (0, 30], и 0 в него **не** входит → {o|NaN}. Все 7 429 текущих кредитов теряют корзину — без ошибки.")},
    {"show": INC, "f": "pd.cut(income, bins=[0, 5, 10, 20, np.inf], right=False)",
     "say": ("`right=False` closes the **left** end instead: [5, 10) holds 5. Rules written with `<` — 'under 5 m' — need it: an income of exactly {p|5 m} is **5-10m**.",
             "`right=False` закрывает **левый** конец: [5, 10) содержит 5. Правилам со знаком `<` — «меньше 5 млн» — нужен именно он: доход ровно {p|5 млн} — это **5-10m**.")},
    {"act": [btn(0, "Flip the closed side", "Перевернуть закрытый край", do="flip")], "film": 0,
     "say": ("Press **Flip the closed side** and watch 5 m jump to <5m: the same edges, a different rule. Press it again to flip back.",
             "Нажмите **Перевернуть закрытый край** — и 5 млн перепрыгнет в <5m: те же края, другое правило. Нажмите ещё раз, чтобы вернуть.")},
    {"show": CUT, "act": [btn(0, "dpd 0", "dpd 0", do="drop", v=0), btn(0, "dpd 30", "dpd 30", do="drop", v=30), btn(0, "dpd 31", "dpd 31", do="drop", v=31),
                          btn(0, "dpd 90", "dpd 90", do="drop", v=90), btn(0, "dpd 91", "dpd 91", do="drop", v=91)],
     "say": ("Back to the dpd edges. Drop the edge values yourself: each lands in the interval whose **right** end it reaches.",
             "Снова края dpd. Бросайте краевые значения сами: каждое попадает в интервал, чьего **правого** конца оно достигает.")},
]}

# ---------- W5D3: merge (the page's sched / got toy; inst × paid counts from the page; pay × inst on loan_id from the course files) ----------
SCH = {"name": "sched", "cols": ["installment_id", "total_due"], "rows": [[1, 100], [2, 100], [3, 100]]}
GOT = {"name": "got", "cols": ["installment_id", "paid"], "rows": [[2, 100], [3, 60], [4, 50]]}
MW = {"rows": ("rows", "строк"), "keys": ("keys found on both sides", "ключей есть в обеих таблицах")}
M0 = {"kind": "merge", "L": SCH, "R": GOT, "on": "installment_id", "how": None, "words": MW}
HOWS = [btn(0, "inner", "inner", do="how", how="inner"), btn(0, "left", "left", do="how", how="left"), btn(0, "right", "right", do="how", how="right"), btn(0, "outer", "outer", do="how", how="outer")]
W5D3A = {"id": "w05d3-s1", "min": 4, "title": ("One key, two frames: the four how=", "Один ключ, две таблицы: четыре how="), "steps": [
    {"show": M0, "say": ("Two small frames: `sched`, what each instalment owes, and `got`, what was paid. The **key**, `installment_id`, is in both.",
                         "Две маленькие таблицы: `sched` — сколько должен каждый платёж по графику, и `got` — сколько заплатили. **Ключ** `installment_id` есть в обеих.")},
    {"say": ("Keys {y|2} and {p|3} are in both frames (same colour). Key 1 is only in `sched`, key 4 only in `got` (dashed): rows with no partner.",
             "Ключи {y|2} и {p|3} есть в обеих таблицах (один цвет). Ключ 1 есть только в `sched`, ключ 4 — только в `got` (пунктир): строки без пары.")},
    {"show": {"how": "inner"}, "f": "sched.merge(got, on=\"installment_id\", how=\"inner\")",
     "say": ("`how=\"inner\"` — the **default** — keeps only the matches: 3 + 3 rows in, {y|2} out. Instalment 1 vanishes.",
             "`how=\"inner\"` — **по умолчанию** — оставляет только совпадения: на входе 3 + 3 строки, на выходе {y|2}. Платёж 1 исчезает.")},
    {"show": {"how": "left"}, "f": "sched.merge(got, on=\"installment_id\", how=\"left\")",
     "say": ("`how=\"left\"` keeps **every** row of the left frame. Instalment 1 has no payment, so its `paid` is {m|NaN}. Payment 4 is struck out.",
             "`how=\"left\"` сохраняет **все** строки левой таблицы. У платежа 1 оплаты нет, поэтому `paid` у него {m|NaN}. Платёж 4 зачёркнут.")},
    {"show": {"how": "right"}, "f": "sched.merge(got, on=\"installment_id\", how=\"right\")",
     "say": ("`how=\"right\"` keeps every row of the **right** frame: the stray payment 4 stays, with {m|NaN} for `total_due`.",
             "`how=\"right\"` сохраняет все строки **правой** таблицы: лишний платёж 4 остаётся, с {m|NaN} в `total_due`.")},
    {"show": {"how": "outer"}, "f": "sched.merge(got, on=\"installment_id\", how=\"outer\")",
     "say": ("`how=\"outer\"` keeps everything: 4 rows, NaN wherever one side is missing.", "`how=\"outer\"` сохраняет всё: 4 строки, NaN там, где нет одной из сторон.")},
    {"act": HOWS, "film": 1,
     "ask": {"q": ("Nilufar needs **every instalment**, paid or not, to find the unpaid ones. Which how=?", "Нилуфар нужны **все платежи по графику**, оплаченные или нет, чтобы найти неоплаченные. Какой how=?"),
             "options": ["inner", "left", "right", "outer"], "answer": 1,
             "why": ("`sched` is the list that must stay complete — the left frame. inner would silently drop instalment 1, the unpaid one.",
                     "`sched` — список, который должен остаться полным, левая таблица. inner молча выбросит платёж 1 — как раз неоплаченный.")},
     "say": ("Try the four buttons, then answer.", "Попробуйте четыре кнопки, потом ответьте.")},
    {"show": {"how": "left"},
     "say": ("On the real data `inst.merge(paid, how=\"left\")` keeps all 92 193 instalments; the unpaid ones get NaN — exactly the ones DPD is about. inner would drop them without a word.",
             "На настоящих данных `inst.merge(paid, how=\"left\")` сохраняет все 92 193 платежа по графику; у неоплаченных будет NaN — как раз у тех, о которых DPD. inner выбросил бы их молча.")},
]}

PAY = {"name": "pay", "cols": ["loan_id", "payment_id"], "rows": [[7, "p1"], [7, "p2"], [8, "p3"]]}
INS = {"name": "inst", "cols": ["loan_id", "installment_no"], "rows": [[7, 1], [7, 2], [7, 3], [8, 1]]}
W5D3B = {"id": "w05d3-s2", "min": 4, "title": ("Where each row came from — and rows that multiply", "Откуда строка — и строки, которые множатся"), "steps": [
    {"show": dict(M0, how="left", ind=True), "f": "sched.merge(got, on=\"installment_id\", how=\"left\", indicator=True)",
     "say": ("`indicator=True` adds a column, `_merge`: {g|both} = found a partner, {b|left_only} = only in the left frame, {y|right_only} = only in the right one.",
             "`indicator=True` добавляет столбец `_merge`: {g|both} — пара нашлась, {b|left_only} — только в левой таблице, {y|right_only} — только в правой.")},
    {"show": {"how": "outer"}, "f": "sched.merge(got, on=\"installment_id\", how=\"outer\", indicator=True)",
     "say": ("With `how=\"outer\"` all three appear: instalment 1 is {b|left_only}, payment 4 is {y|right_only}.",
             "При `how=\"outer\"` видны все три: платёж по графику 1 — {b|left_only}, оплата 4 — {y|right_only}.")},
    {"ask": {"q": ("Which filter gives the instalments with **no** payment (the anti-join)?", "Какой фильтр даёт платежи по графику **без** оплаты (анти-соединение)?"),
             "options": ["m[m[\"_merge\"] == \"both\"]", "m[m[\"_merge\"] == \"left_only\"]", "m[m[\"_merge\"] == \"right_only\"]"], "answer": 1,
             "why": ("left_only = in `sched`, no partner in `got` — week 2's LEFT JOIN … WHERE right IS NULL.", "left_only — есть в `sched`, нет пары в `got`: LEFT JOIN … WHERE right IS NULL из второй недели.")},
     "say": ("One filter on `_merge` replaces a hand-written anti-join.", "Один фильтр по `_merge` заменяет анти-соединение, написанное вручную.")},
    {"say": ("On Nur's data (the table below) {y|right_only} is 0: no payment points at an instalment that does not exist. `value_counts()` of `_merge` is a free check after every merge.",
             "На данных Nur (таблица ниже) {y|right_only} — 0: ни одна оплата не указывает на несуществующий платёж по графику. `value_counts()` по `_merge` — бесплатная проверка после каждого merge.")},
    {"show": {"kind": "merge", "L": PAY, "R": INS, "on": "loan_id", "how": None, "ind": False, "words": MW},
     "say": ("Now a trap. Two frames keyed by `loan_id`, and the key **repeats on both sides**: loan {b|7} has 2 payments and 3 instalments.",
             "Теперь ловушка. Две таблицы с ключом `loan_id`, и ключ **повторяется с обеих сторон**: у кредита {b|7} две оплаты и три платежа по графику.")},
    {"show": {"how": "inner"}, "f": "pay.merge(inst, on=\"loan_id\")",
     "say": ("Merge them: every payment of loan 7 meets every instalment of loan 7 — {o|2 × 3 = 6 rows}. Loan 8: 1 × 1. 3 + 4 rows in, 7 out.",
             "Соединим: каждая оплата кредита 7 встречает каждый его платёж по графику — {o|2 × 3 = 6 строк}. Кредит 8: 1 × 1. На входе 3 + 4 строки, на выходе 7.")},
    {"ask": {"q": ("Loan 1 has 18 payments and 24 instalments. How many rows does it get in `pay.merge(inst, on=\"loan_id\")`?",
                   "У кредита 1 18 оплат и 24 платежа по графику. Сколько строк он получит в `pay.merge(inst, on=\"loan_id\")`?"),
             "options": ["24", "42", "432"], "answer": 2, "why": ("18 × 24 = 432: every payment meets every instalment.", "18 × 24 = 432: каждая оплата встречает каждый платёж по графику.")},
     "say": ("Count the pairs.", "Посчитайте пары.")},
    {"f": "pay.merge(inst, on=\"loan_id\", validate=\"m:1\")  →  MergeError",
     "say": ("On the whole book, 52 850 payments and 92 193 instalments become {o|858 612 rows} — and every sum after that is wrong, with no error. `validate=\"m:1\"` would have stopped it.",
             "На всём портфеле 52 850 оплат и 92 193 платежа по графику превращаются в {o|858 612 строк} — и каждая сумма после этого неверна, без ошибки. `validate=\"m:1\"` остановил бы это.")},
]}

# ---------- W7D2: Simpson's paradox (the page's ramp-up table: w07d2-pic3) ----------
SIM = {"kind": "mix", "items": [[90, 900, "b"], [50, 1000, "b"], [11, 100, "y"], [55, 1000, "y"]], "panels": [[0, 1], [2, 3]], "wide": True, "lines": [], "max": 14, "dp": 2, "bdp": 1,
       "labels": [("week 1", "нед. 1"), ("weeks 2–4", "нед. 2–4"), ("week 1", "нед. 1"), ("weeks 2–4", "нед. 2–4")],
       "words": {"panels": ["A", "B"], "pool": ("total", "итог"), "avg": ("average of the rates", "среднее долей")}}
W7D2 = {"id": "w07d2-s9", "min": 4, "title": ("Better in every part, worse in total", "Лучше в каждой части — хуже в итоге"), "steps": [
    {"show": SIM, "say": ("A test with a ramp-up: in week 1, 90 % of the users went to {b|A}. Each bar is a conversion rate; its **width** is the number of users.",
                          "Тест с разгоном: в первую неделю 90 % пользователей ушли в {b|A}. Каждый столбик — конверсия; его **ширина** — число пользователей.")},
    {"say": ("Inside each period {y|B} is ahead: week 1 {y|11.0 %} against {b|10.0 %}, weeks 2–4 {y|5.5 %} against {b|5.0 %}.",
             "Внутри каждого периода {y|B} впереди: неделя 1 — {y|11,0 %} против {b|10,0 %}, недели 2–4 — {y|5,5 %} против {b|5,0 %}.")},
    {"ask": {"q": ("So B wins the total too?", "Значит, B выигрывает и в итоге?"),
             "options": [("Yes: it wins both parts", "Да: он выигрывает обе части"), ("Not necessarily: it depends on how many users each part has", "Не обязательно: зависит от того, сколько пользователей в каждой части")],
             "answer": 1, "why": ("A total is a weighted average: the parts count by their size.", "Итог — взвешенное среднее: части весят по своему размеру.")},
     "say": ("Look at the widths before you answer.", "Посмотрите на ширину, прежде чем ответить.")},
    {"show": {"lines": ["pool"]}, "f": ("A: 140 ÷ 1 900 = 7.37 %   B: 66 ÷ 1 100 = 6.00 %", "A: 140 ÷ 1 900 = 7,37 %   B: 66 ÷ 1 100 = 6,00 %"),
     "say": ("Add each arm up: {b|A 7.37 %}, {y|B 6.00 %} — B **loses** the total. 47 % of A's users sit in the strong week 1, only 9 % of B's: B's week 1 is the thin bar.",
             "Сложим каждую группу: {b|A — 7,37 %}, {y|B — 6,00 %}, B **проигрывает** итог. 47 % пользователей A — в сильной первой неделе, у B лишь 9 %: первая неделя B — тонкий столбик.")},
    {"act": [btn(0, "B's week 1: 900 users", "Неделя 1 у B: 900 человек", do="set", i=2, bottom=900)], "film": 0,
     "say": ("Give B as many week-1 users as A, at the same rates. Press the button: B's total jumps to 154 ÷ 1 900 = 8.11 %, above A.",
             "Дадим B столько же пользователей первой недели, сколько у A, с теми же конверсиями. Нажмите: итог B прыгает до 154 ÷ 1 900 = 8,11 % — выше A.")},
    {"show": {"reset": True},
     "say": ("That is [[Simpson's paradox|a comparison that flips when the parts are added up, because the parts have different sizes in each group]]: the total mixes the effect with the **mix** of users.",
             "Это [[парадокс Симпсона|сравнение переворачивается при сложении частей, потому что размеры частей в группах разные]]: итог смешивает эффект с **составом** пользователей.")},
    {"ask": {"q": ("What is the honest read of this test?", "Как честно прочитать этот тест?"),
             "options": [("A wins: 7.37 % > 6.00 %", "Побеждает A: 7,37 % > 6,00 %"), ("B is ahead inside each period; the uneven split distorts the total", "B впереди в каждом периоде; неравное деление искажает итог"),
                         ("Nothing can be said", "Ничего сказать нельзя")], "answer": 1,
             "why": ("Compare within the periods (or fix the split before the test starts); the total answers 'who got more of week 1'.",
                     "Сравнивайте внутри периодов (или зафиксируйте деление до старта); итог отвечает на вопрос «кому досталось больше первой недели».")},
     "say": ("One last look at the bars.", "Последний взгляд на столбики.")},
]}

# ---------- W8D1: the cohort triangle (a toy of 10 first-time borrowers a month, then the page's quarterly table) ----------
TOY = [[10, 30, 40, 50], [20, 30, 50, 60], [20, 40, 50, 60], [30, 40, 60, 70], [30, 50, 60, 70]]
GL = {"rows": [("Jan", "янв"), ("Feb", "фев"), ("Mar", "мар"), ("Apr", "апр"), ("May", "май")], "cols": [("1 m", "1 мес"), ("2 m", "2 мес"), ("3 m", "3 мес"), ("4 m", "4 мес")],
      "asof": [None, None, None, None, ("Today: 1 June", "Сегодня: 1 июня"), ("Today: 1 July", "Сегодня: 1 июля"), ("Today: 1 August", "Сегодня: 1 августа"),
               ("Today: 1 September", "Сегодня: 1 сентября"), ("Today: 1 October", "Сегодня: 1 октября")]}
GW = {"corner": ("cohort", "когорта"), "size": ("people", "людей"), "blank": ("? = not measured yet", "? = ещё не измерено")}
G0 = {"kind": "grid", "vals": TOY, "size": [10, 10, 10, 10, 10], "ages": [1, 2, 3, 4], "asof": 4, "dp": 0, "labels": GL, "words": GW}
REAL = [[18.4, 28.8, 44.5], [23.7, 32.4, 44.7], [22.4, 32.4, 45.6], [25.1, 36.1, None], [30.8, 38.3, None], [33.0, None, None]]
RL = {"rows": ["2025Q1", "2025Q2", "2025Q3", "2025Q4", "2026Q1", "2026Q2"], "cols": [("3 m", "3 мес"), ("6 m", "6 мес"), ("12 m", "12 мес")]}
MONTH = btn(0, "A month passes", "Проходит месяц", do="month")
W8D1A = {"id": "w08d1-s1", "min": 5, "title": ("The cohort triangle, one month at a time", "Когортный треугольник — месяц за месяцем"), "steps": [
    {"show": G0, "say": ("A small product, 10 first-time borrowers a month. Each **row** is a [[cohort|the customers whose first loan came in the same month]]: Jan, Feb … May.",
                         "Небольшой продукт, 10 новых заёмщиков в месяц. Каждая **строка** — [[когорта|клиенты, чей первый кредит пришёлся на один месяц]]: янв, фев … май.")},
    {"show": {"hot": [0, 1]}, "say": ("Each **column** is an age: 1 to 4 months after the first loan. A cell = the share with a **second** loan by then. Jan at 2 months: 3 of 10 = {o|30 %}.",
                                      "Каждый **столбец** — возраст: от 1 до 4 месяцев после первого кредита. Ячейка — доля тех, кто взял **второй** кредит к этому сроку. Янв, 2 месяца: 3 из 10 = {o|30 %}.")},
    {"show": {"hot": None, "row": 4},
     "say": ("Today is 1 June. May's people borrowed during May; most have not had a full month yet, so May's row is all {m|?} — not measured yet, **not** zero.",
             "Сегодня 1 июня. Майские клиенты брали кредит в течение мая, у большинства ещё не прошёл полный месяц, поэтому строка мая — сплошные {m|?}: ещё не измерено, **не** ноль.")},
    {"show": {"row": None}, "act": [MONTH], "film": 0,
     "say": ("Press **A month passes**. Every cohort gets one month older, so one new cell appears in each row that still has room.",
             "Нажмите **Проходит месяц**. Каждая когорта стареет на месяц, поэтому в каждой строке, где есть место, появляется одна новая ячейка.")},
    {"show": {"asof": 5, "diag": 5},
     "say": ("The new cells lie on one slanted line — a **diagonal**: they were all measured in the same calendar month. That is why the empty corner is a triangle.",
             "Новые ячейки лежат на одной косой линии — **диагонали**: все они измерены в один календарный месяц. Вот почему пустой угол — треугольник.")},
    {"ask": {"q": ("On 1 August, which of these cells fills in?", "Какая из этих ячеек заполнится 1 августа?"),
             "options": [("Apr · 3 months", "апр · 3 мес"), ("Apr · 4 months", "апр · 4 мес"), ("May · 3 months", "май · 3 мес")], "answer": 0,
             "why": ("On 1 August April's people have had 3 full months, May's only 2. One month = one new diagonal.", "К 1 августа у апрельских клиентов прошло 3 полных месяца, у майских — только 2. Один месяц — одна новая диагональ.")},
     "say": ("Think one month ahead.", "Подумайте на месяц вперёд.")},
    {"show": {"diag": None, "col": 0},
     "say": ("Read **down** a column: the same age, newer cohorts. At 1 month: 10, 20, 20, 30, {p|30 %} — newer customers come back sooner.",
             "Читайте **вниз** по столбцу: тот же возраст, всё более новые когорты. В 1 месяц: 10, 20, 20, 30, {p|30 %} — новые клиенты возвращаются быстрее.")},
    {"show": {"col": None, "row": 0},
     "say": ("Read **across** a row: one cohort growing older. Jan: 10 → 30 → 40 → {p|50 %}. Across only goes up: a second loan, once taken, stays taken.",
             "Читайте **поперёк** строки: одна когорта взрослеет. Янв: 10 → 30 → 40 → {p|50 %}. Поперёк значения только растут: взятый второй кредит остаётся взятым.")},
    {"show": {"kind": "grid", "vals": REAL, "size": [375, 414, 450, 443, 399, 463], "dp": 1, "labels": RL, "words": GW, "ages": None, "asof": None, "row": None, "col": None, "diag": None, "hot": None, "zero": False},
     "say": ("Now Nur's real table from below: quarter cohorts of 2025–2026 at 3, 6 and 12 months. The same triangle of {m|?} in the corner.",
             "Теперь настоящая таблица Nur из текста ниже: квартальные когорты 2025–2026 в 3, 6 и 12 месяцев. Тот же треугольник {m|?} в углу.")},
    {"show": {"col": 1}, "say": ("Down the 6-month column: {p|28.8 % → 38.3 %}. Later cohorts take a second loan sooner.",
                                 "Вниз по столбцу 6 месяцев: {p|28,8 % → 38,3 %}. Более поздние когорты берут второй кредит быстрее.")},
    {"show": {"col": None, "zero": True},
     "say": ("The trap: fill the blanks with {o|0}. The newest cohorts suddenly look the **worst** — 2026Q2 at 0 % for 6 and 12 months. A blank is 'not yet', never 0.",
             "Ловушка: заполнить пустые клетки {o|нулями}. Самые новые когорты вдруг выглядят **худшими** — у 2026Q2 0 % в 6 и 12 месяцев. Пустая клетка — «ещё нет», а не 0.")},
    {"show": {"zero": False},
     "ask": {"q": ("Why is the 12-month cell of 2025Q4 empty?", "Почему пуста 12-месячная ячейка 2025Q4?"),
             "options": [("Nobody came back within 12 months", "Никто не вернулся за 12 месяцев"), ("Not every 2025Q4 customer has had 12 months by 1 October 2026", "Не у всех клиентов 2025Q4 прошло 12 месяцев к 1 октября 2026"),
                         ("The query lost those rows", "Запрос потерял эти строки")], "answer": 1,
             "why": ("Its last customers borrowed in December 2025: their 12 months end in December 2026, after the data.",
                     "Последние её клиенты взяли кредит в декабре 2025: их 12 месяцев закончатся в декабре 2026, позже данных.")},
     "say": ("A cell exists only when **every** customer of the row has had that many months.", "Ячейка есть, только если у **каждого** клиента строки прошло столько месяцев.")},
]}

# ---------- W8D1: step conversion vs from the top (the page's funnel table) ----------
FL = [("visit", "визит"), ("application", "заявка"), ("approval", "одобрение"), ("disbursement", "выдача"), ("repaid on time", "оплата вовремя")]
W8D1B = {"id": "w08d1-s2", "min": 3, "title": ("Step by step, or from the top?", "По шагам или от верха?"), "steps": [
    {"show": {"kind": "rows", "rows": [[1252, None, None, "b"], [854, None, None, "b"], [719, None, None, "b"], [659, None, None, "b"], [549, None, None, "b"]], "labels": FL, "big": True, "lo": 0, "hi": 1300},
     "say": ("Nur's app funnel, January–June 2026: the sessions that reached each step. Every bar is shorter than the one above — a unit can only drop out.",
             "Воронка приложения Nur, январь–июнь 2026: сессии, дошедшие до каждого шага. Каждый столбик короче верхнего — выбыть можно, вернуться нельзя.")},
    {"show": {"hot": 1}, "f": ("step conversion = this step ÷ the step above", "конверсия шага = этот шаг ÷ шаг выше"),
     "say": ("**Step conversion**: this step ÷ the step above. 854 ÷ 1 252 = {b|68.2 %} of the visits send an application.",
             "**Конверсия шага**: этот шаг ÷ шаг выше. 854 ÷ 1 252 = {b|68,2 %} визитов заканчиваются заявкой.")},
    {"show": {"kind": "rows", "rows": [[0.682, None, None, "b"], [0.842, None, None, "b"], [0.833, None, None, "b"]], "pct": True, "big": False, "hot": None, "dp": 1, "lo": 0, "hi": 1,
              "labels": [("visit → application", "визит → заявка"), ("application → approval", "заявка → одобрение"), ("disbursement → on time", "выдача → вовремя")]},
     "say": ("Three of the four step conversions: 68.2, 84.2 and 83.3 %. The fourth, approval → disbursement, is yours to work out in the box below. The weakest step is the first one.", "Три конверсии шагов из четырёх: 68,2, 84,2 и 83,3 %. Четвёртую, одобрение → выдача, посчитайте сами в задании ниже. Самый слабый шаг — первый.")},
    {"show": {"kind": "rows", "rows": [[1, None, None, "m"], [0.682, None, None, "o"], [0.574, None, None, "o"], [0.526, None, None, "o"], [0.438, None, None, "o"]], "pct": True, "big": False, "dp": 1, "lo": 0, "hi": 1, "labels": FL, "hot": 4},
     "f": ("from the top = the four step conversions multiplied = 549 ÷ 1 252 = 43.8 %", "от верха = произведение четырёх конверсий шагов = 549 ÷ 1 252 = 43,8 %"),
     "say": ("**From the top**: this step ÷ the first. It is the step rates multiplied: {o|43.8 %} of the visits end in a first instalment paid on time.",
             "**От верха**: этот шаг ÷ первый. Это произведение конверсий шагов: {o|43,8 %} визитов доходят до первого платежа вовремя.")},
    {"ask": {"q": ("Which step loses the most sessions in **count**?", "Какой шаг теряет больше всего сессий **в штуках**?"),
             "options": [("visit → application", "визит → заявка"), ("application → approval", "заявка → одобрение"), ("disbursement → on time", "выдача → вовремя")], "answer": 0,
             "why": ("1 252 − 854 = 398 sessions; the next two lose 135 and 110.", "1 252 − 854 = 398 сессий; следующие два теряют 135 и 110.")},
     "say": ("Subtract the bars of the first picture.", "Вычтите столбики первой картинки.")},
    {"say": ("Step rates say **where** it leaks; from the top says **what is left**. If only the first step rose from 68.2 % to 75 %, the end would rise from 43.8 % to about 48.2 %.",
             "Конверсии шагов говорят, **где** течёт; «от верха» — **сколько осталось**. Если бы вырос только первый шаг, с 68,2 % до 75 %, конец вырос бы с 43,8 % примерно до 48,2 %.")},
]}

# ---------- W2D2: WHERE asks rows, HAVING asks groups (a toy of 18 loans in 3 branches) ----------
GW2 = [[4, "b", "Aa"], [2, "m", "Ac"], [2, "b", "Ba"], [4, "m", "Bc"], [5, "b", "Ca"], [1, "m", "Cc"]]
W2D2 = {"id": "w02d2-s1", "min": 3, "title": ("WHERE asks each row, HAVING asks each group", "WHERE спрашивает строку, HAVING — группу"), "steps": [
    {"show": {"kind": "dots", "blocks": [6, 6, 6], "labels": ["Andijan", "Bukhara", "Fergana"], "groups": GW2,
              "legend": [["b", ("active", "active — действующий")], ["m", ("closed", "closed — закрыт")]]},
     "say": ("Eighteen loans in three branches, one dot each. {b|Blue} = active, {m|grey} = closed.", "Восемнадцать кредитов в трёх филиалах, по точке на кредит. {b|Синие} — действующие, {m|серые} — закрытые.")},
    {"show": {"fade": ["Ac", "Bc", "Cc"]}, "f": "WHERE status = 'active'",
     "say": ("`WHERE` asks **each row** one question: is it active? The grey loans are out before any counting starts.",
             "`WHERE` задаёт **каждой строке** один вопрос: она действующая? Серые кредиты выбывают ещё до всякого подсчёта.")},
    {"show": {"box": ["Aa", "Ba", "Ca"]}, "f": "GROUP BY branch → COUNT(*): 4 · 2 · 5",
     "say": ("`GROUP BY branch` folds what is left into one row per branch, and `COUNT(*)` counts each: Andijan {b|4}, Bukhara {b|2}, Fergana {b|5}.",
             "`GROUP BY branch` сворачивает оставшееся в одну строку на филиал, а `COUNT(*)` считает каждую: Andijan {b|4}, Bukhara {b|2}, Fergana {b|5}.")},
    {"ask": {"q": ("Keep only the branches with more than 3 active loans. Which line?", "Оставить только филиалы, где больше 3 действующих кредитов. Какая строка?"),
             "options": ["WHERE COUNT(*) > 3", "HAVING COUNT(*) > 3"], "answer": 1,
             "why": ("A count belongs to a group, and WHERE runs before the groups exist. HAVING runs after GROUP BY.", "Подсчёт принадлежит группе, а WHERE работает до того, как группы появились. HAVING работает после GROUP BY.")},
     "say": ("The question is now about whole branches.", "Теперь вопрос — о целых филиалах.")},
    {"show": {"fade": ["Ac", "Bc", "Cc", "Ba"], "box": ["Aa", "Ca"]}, "f": "HAVING COUNT(*) > 3 → Andijan 4 · Fergana 5",
     "say": ("`HAVING` asks **each group**: Bukhara's 2 is not more than 3, so the whole group goes. The framed groups, Andijan and Fergana, stay.",
             "`HAVING` спрашивает **каждую группу**: у Bukhara 2 — не больше 3, и уходит вся группа. Andijan и Fergana остаются.")},
    {"ask": {"q": ("A fourth branch has 3 active and 10 closed loans. Does it pass this query?", "У четвёртого филиала 3 действующих и 10 закрытых кредитов. Пройдёт ли он этот запрос?"),
             "options": [("Yes: 13 loans is more than 3", "Да: 13 кредитов больше 3"), ("No: WHERE left 3 rows, and 3 is not more than 3", "Нет: WHERE оставил 3 строки, а 3 не больше 3")], "answer": 1,
             "why": ("WHERE removed the 10 closed loans first; HAVING only ever sees the 3 rows that are left.", "WHERE сначала убрал 10 закрытых; HAVING видит только 3 оставшиеся строки.")},
     "say": ("Follow the rows in order: first the rows, then the groups.", "Идите по порядку: сначала строки, потом группы.")},
]}

# ---------- W7D4: ALL — the denominator that forgets the row (outstanding by product, bn, loans_status / v_loan_status) ----------
OUT = [[125.893], [57.684], [23.055], [1.135], [0.956]]
XD = {"total": ("Total", "Итого"), "n": ("[Outstanding], bn", "[Outstanding], млрд"), "row": ("DIVIDE ( [Outstanding], [Outstanding] )", "DIVIDE ( [Outstanding], [Outstanding] )"),
      "col": ("… CALCULATE ( [Outstanding], ALL ( products ) )", "… CALCULATE ( [Outstanding], ALL ( products ) )")}
W7D4 = {"id": "w07d4-s1", "min": 3, "title": ("ALL: a denominator that forgets the row", "ALL: знаменатель, который забывает строку"), "steps": [
    {"show": {"kind": "xtab", "vals": OUT, "mode": "n", "ndp": 1, "dp": 2, "rtot": False, "labels": {"rows": ["SME", "AUTO", "CONS", "BNPL", "MICRO"], "cols": ["Outstanding"]}, "words": XD},
     "say": ("A matrix: Rows `products[code]`, Values `[Outstanding]`, in bn. Each row is the same measure under one more filter — its product. The Total row has none: 208.7 bn.",
             "Матрица: строки `products[code]`, значения `[Outstanding]`, в млрд. Каждая строка — та же мера с ещё одним фильтром, своим продуктом. В строке итогов его нет: 208,7 млрд.")},
    {"show": {"mode": "row", "hot": [0, 0]}, "f": "Share = DIVIDE ( [Outstanding], [Outstanding] )",
     "say": ("A first try at a share: divide the measure by itself. In the SME row **both** see product = SME: {o|125.9} ÷ {y|125.9} = 100 %. Every row says 100 %.",
             "Первая попытка доли: разделить меру на саму себя. В строке SME **обе** видят product = SME: {o|125,9} ÷ {y|125,9} = 100 %. Каждая строка показывает 100 %.")},
    {"show": {"mode": "col"}, "f": "Share = DIVIDE ( [Outstanding], CALCULATE ( [Outstanding], ALL ( products ) ) )",
     "say": ("`CALCULATE ( …, ALL ( products ) )` removes the product filter from the **bottom** only: {o|125.9} ÷ {y|208.7} = 60.32 %. Now the rows add up to 100 %.",
             "`CALCULATE ( …, ALL ( products ) )` убирает фильтр продукта только из **знаменателя**: {o|125,9} ÷ {y|208,7} = 60,32 %. Теперь строки в сумме дают 100 %.")},
    {"ask": {"q": ("In the Total row, what does the first try, without ALL, show?", "Что показывает в строке итогов первая попытка, без ALL?"),
             "options": ["100 %", "60.32 %", ("nothing", "ничего")], "answer": 0,
             "why": ("The Total row has no product filter: 208.7 ÷ 208.7. The first try is 100 % everywhere — a share that says nothing.", "В строке итогов фильтра продукта нет: 208,7 ÷ 208,7. Первая попытка везде даёт 100 % — доля, которая ничего не говорит.")},
     "act": [btn(0, "without ALL", "без ALL", do="mode", m="row"), btn(0, "with ALL ( products )", "с ALL ( products )", do="mode", m="col")], "film": 1,
     "say": ("Switch between the two measures.", "Переключайтесь между двумя мерами.")},
    {"show": {"mode": "col", "hot": [3, 0]},
     "say": ("The rule: a share needs a denominator with **fewer** filters than its cell. ALL ( products ) takes away exactly one — the product — so BNPL is {o|1.1} ÷ {y|208.7} = 0.54 %.",
             "Правило: доле нужен знаменатель с **меньшим** числом фильтров, чем у её ячейки. ALL ( products ) убирает ровно один — продукт, — поэтому BNPL — это {o|1,1} ÷ {y|208,7} = 0,54 %.")},
]}

STORIES = [W2D1, W2D2, W3D1, W3D2, W4D2, W4D4A, W4D4B, W5D2, W5D3A, W5D3B, W7D2, W7D4, W8D1A, W8D1B]


def build(lang):
    return _b(STORIES, lang)
