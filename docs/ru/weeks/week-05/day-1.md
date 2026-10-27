# Неделя 5 · День 1 — Python с нуля: ноутбук — ваша лаборатория

<span class="badge">Теория 60 мин</span> <span class="badge">Разбор примера 15 мин</span> <span class="badge">Практика 50 мин</span> <span class="badge hw">HW 5.1 (сдать ко Дню 3)</span> <span class="badge company">Уголок компании</span>

> STORY **Понедельник, 9:00.** За столом Мадины — новое лицо: Жасур, дата-сайентист (*data scientist*), который строит скоринговую карту. *«Добро пожаловать в ту половину здания, где не пользуются мышкой. Всё, что вы делали на неделях 1–4, я делаю на Python — те же соединения, те же корзины, — но оно запускается каждое утро в 6:00 без меня, а следующий шаг — модель. Прежде чем браться за pandas, докажите, что вы умеете **думать циклами**: посчитайте долю одобрений по каналам обычным Python из `applications.csv`. Никаких библиотек, которые сделают это за вас. Если вы можете сделать это через `for`, вы поймёте, что делает pandas, когда делает это за вас.»* Мадина: *«И сегодня же запустите инструменты; завтра придут данные.»*

## Сегодня в 3 строках :id=today-in-3-lines

- Зачем аналитикам Python: анализ — это **файл, который можно перезапустить** (повторяемость), он масштабируется с 7 828 строк до 70 миллионов без изменений (масштабируемость), он бесплатный и это язык следующих шагов (модели, автоматизация, Python-визуалы в Power BI).
- Вы запускаете Python **прямо на этой странице** (▶ Run под каждым блоком кода), знакомитесь с **Jupyter** — там живёт ноутбук домашнего задания — и учите грамматику языка: типы, списки, словари, `if`/`for`/`while`, функции, f-строки, модули, чтение CSV через `csv`, списковые включения, чтение трассировки ошибки.
- У вас есть доля одобрений по каналам от Жасура, посчитанная циклами (**58.2 / 63.7 / 61.9 %**, числа с недель 2 и 4), и начало HW 5.1 — восемь функций, которые должны пройти свои assert-проверки в `data/python/day1_starter.ipynb`.

---

## 1. Теория — язык, одна ячейка ноутбука за раз :id=1-learn--the-language-one-notebook-cell-at-a-time

### Где работает ваш код: эта страница или Jupyter :id=where-your-code-runs-this-page-or-jupyter

У каждого блока Python на этой странице есть кнопка **▶ Run**. Первый запуск загружает Python в ваш браузер — около 15 МБ, один раз, потом из кэша — вместе с pandas, NumPy и matplotlib; дальше блок выполняется примерно за секунду. Три правила страницы:

- **Блоки делят одну память в том порядке, в котором вы их запускаете.** Переменная, созданная в одном блоке, есть и в следующем — если вы его запустили. В первый раз запускайте страницу сверху вниз.
- **Файлы данных уже на месте.** `open("../excel/applications.csv")` читает файл курса — тот же путь, что и в ноутбуках.
- **У каждой задачи практики свой редактор** с ▶ Run и ✔ Check: проверка ищет правильное число среди того, что печатает ваш код, поэтому выводите результат через print.

> 💡 **Главное.** Страница — место, где вы учитесь и тренируетесь; **ноутбук** — файл, который вы сдаёте. Ноутбук — то же самое, что эта страница: блоки кода и текст, выполняемые сверху вниз, — только сохранённые в один файл `.ipynb`, который любой может перезапустить.

**Jupyter — для домашнего задания (настройте ко Дню 3).** HW 5.1 — это ноутбук, который сдаётся *выполненным*, поэтому на этой неделе Jupyter понадобится один раз. **Anaconda** (*distribution*, дистрибутив) — это Python плюс библиотеки аналитика (pandas, matplotlib, Jupyter) в одном установщике: https://www.anaconda.com/download → Windows → *Just me* → настройки по умолчанию. Затем откройте **Anaconda Prompt** из меню «Пуск» и введите:

```
cd "C:\path\to\Analytics Learning"
pip install -r requirements.txt
jupyter notebook data/python
```

Браузер откроет список файлов; нажмите на `day1_starter.ipynb`. **Запасной вариант:** если установщик заблокирован, https://colab.research.google.com запускает те же ноутбуки прямо в браузере — загрузите `.ipynb` и CSV-файлы, которые он читает (`data/python/README.md` объясняет, какую одну строку нужно изменить). Всё на этой странице работает и на странице, и в Jupyter, и в Colab.

### Jupyter: ячейки, Shift+Enter, ядро :id=jupyter-cells-shiftenter-the-kernel

**Ноутбук** (*notebook*) — это список **ячеек**. *Кодовая* ячейка выполняет Python; *Markdown*-ячейка содержит текст (ваши выводы — тот же Markdown, что и на этой странице). **Shift+Enter** выполняет ячейку и переходит вниз; **Ctrl+Enter** выполняет и остаётся на месте. **Ядро** (*kernel*) — это процесс Python за ноутбуком: оно помнит каждую определённую вами переменную в том порядке, в котором вы *запускали* ячейки, а не в том, в котором они расположены на странице. Это первая ловушка: если вы отредактировали ячейку 3 и перезапустили только ячейку 7, ячейка 7 всё ещё видит *старую* ячейку 3. Перед сдачей любой работы: **Kernel → Restart & Run All**; если всё выполняется сверху вниз без ошибок, ноутбук воспроизводим. `[*]` слева означает, что ячейка ещё выполняется; `[5]` — что она была пятой по счёту выполненной.

> ⚠️ **Осторожно.** У этой страницы та же ловушка. Отредактируйте блок и перезапустите только более поздний — и поздний увидит старую версию. Если число выглядит устаревшим, запустите страницу заново сверху — в Jupyter это Kernel → Restart & Run All.

### Переменные и четыре скалярных типа :id=variables-and-the-four-scalar-types

```python
principal = 31_150_000        # int   — целое число; подчёркивания игнорируются (31150000)
annual_rate = 0.30            # float — число с десятичной точкой
product = "Consumer loan"     # str   — текст, в одинарных или двойных кавычках
is_active = True              # bool  — True / False (с заглавной буквы)
type(principal), type(annual_rate), type(product), type(is_active)
```

`=` присваивает; `==` сравнивает. `/` всегда даёт float (`7 / 2` → `3.5`); `//` — целочисленное деление (`7 // 2` → `3`); `%` — остаток (`7 % 2` → `1`); `**` — степень (`(1 + r) ** -term`). `int("42")` и `float("3.12")` превращают текст в числа — всё, что приходит из CSV, остаётся текстом, пока вы не преобразуете, точно так же, как даты в виде текста на неделе 4. `round(x, 1)` округляет до одного знака после запятой; `round(x, -2)` — до ближайшей сотни (ежемесячный платёж Nur Finance округляется именно так).

### Списки, словари, кортежи :id=lists-dicts-tuples

```python
buckets = ["0", "1-30", "31-60", "61-90", "90+"]      # список: упорядочен, изменяем; buckets[0] — это "0", buckets[-1] — это "90+"
buckets.append("written off"); len(buckets)            # 6
counts = {"card": 17612, "payme": 8897}                # словарь: ключ → значение; counts["card"] → 17612
counts["cash"] = 8788                                  # добавить ключ
counts.get("crypto", 0)                                # 0 — .get никогда не падает на отсутствующем ключе
row = ("Tashkent Central", 1001)                       # кортеж: как список, но неизменяемый; используется для «пары значений»
buckets[1:3]                                           # срез: ['1-30', '31-60'] — от 1 до 3, не включая 3
```

**Список** (*list*) — это столбец; **словарь** (*dict*) — это таблица соответствий, `XLOOKUP` с недели 4 в одну строку: `rate = rates[product]`. **Кортеж** (*tuple*) — это строка. Половина pandas — это эти три структуры с более быстрым движком: `Series` — это список с индексом, `DataFrame` — это словарь столбцов.

```game
{"type": "flash", "id": "w05d1-g1", "title": "Слова дня на Python", "cards": [["int / float", "целое число / число с десятичной точкой"], ["str", "текст — всё, что даёт CSV, пока вы не преобразуете"], ["bool", "True или False, с заглавной буквы"], ["None", "NULL в Python — то, что возвращает функция без return"], ["list", "упорядоченный изменяемый столбец значений: buckets[0], buckets[-1]"], ["dict", "таблица соответствий ключ → значение: counts[\"card\"], counts.get(k, 0)"], ["tuple", "неизменяемая пара или строка: (\"Tashkent Central\", 1001)"], ["kernel (ядро)", "процесс Python, который помнит переменные в порядке запуска ячеек"], ["traceback (трассировка)", "отчёт об ошибке — читайте последнюю строку первой"], ["списковое включение", "[выражение for элемент in элементы if условие] — for, который строит список"]]}
```

### Управление потоком: if / for / while :id=control-flow-if--for--while

```python
def label(dpd):                           # CASE с недели 2, вложенный IF с недели 4
    if dpd <= 0:
        return "0"
    elif dpd <= 30:
        return "1-30"
    elif dpd <= 60:
        return "31-60"
    elif dpd <= 90:
        return "61-90"
    else:
        return "90+"

total = 0
for amount in [1_741_700, 2_791_000, 567_500]:     # for: по разу на каждый элемент
    total += amount                                 # += прибавляет к переменной
n = 0
while n < 3:                                        # while: пока условие выполняется — берегитесь цикла, который никогда не кончается
    n += 1
```

**Отступы — это синтаксис** (*indentation*): четыре пробела показывают, что относится к `if`, `for`, `def`. Никакого `END`, никаких скобок. Двоеточие в конце строки открывает блок. `break` досрочно выходит из цикла; `continue` переходит к следующему элементу. `for i, x in enumerate(items)` даёт ещё и позицию; `for key, value in counts.items()` обходит словарь.

### Функции: параметры, return, значения по умолчанию :id=functions-parameters-return-defaults

```python
def approval_rate(approved, total, decimals=1):
    """Approval rate in percent."""          # докстринг — что делает функция, для следующего читателя (вас через месяц)
    if total == 0:
        return None                          # никогда не делите на ноль; None — это NULL в Python
    return round(100 * approved / total, decimals)

approval_rate(2915, 5006)        # 58.2
approval_rate(2915, 5006, 2)     # 58.23
```

**Функция** (*function*) — это именованный, переиспользуемый шаг со входами (**параметрами**) и одним выходом (`return`). Без `return` она возвращает `None`. Значения по умолчанию (`decimals=1`) делают параметр необязательным. Привычка, которая делает анализ на Python надёжным: каждое число, которое вы сообщаете, получено из функции, которую можно протестировать. Именно это и есть assert-проверки HW 5.1: `assert approval_rate(2915, 5006) == 58.2` громко падает, если функция врёт, и молчит, если всё верно. Функция, которая `print`-ит вместо `return`, не даёт ничего для assert.

### f-строки и форматирование :id=f-strings-and-formatting

```python
outstanding = 208_723_504_430
f"{outstanding:,}"            # '208,723,504,430'  — разделители тысяч
f"{outstanding / 1e9:.1f} bn" # '208.7 bn'
f"{0.0312:.2%}"               # '3.12%'
f"{'app':<8}{58.2:>6.1f} %"   # 'app       58.2 %' — выравнивание: < влево, > вправо, ширина 8
```

`f"…{expression}…"` вычисляет всё, что стоит внутри фигурных скобок. Спецификация формата после двоеточия — это числовой формат Excel в другой записи: `,` — разделитель тысяч, `.1f` — один десятичный знак, `.2%` — проценты, `>6` — выравнивание вправо в шести символах.

### Модули: import :id=modules-import

```python
import csv                       # стандартная библиотека: чтение/запись CSV-файлов
from datetime import date        # одно имя из модуля
import math                      # math.ceil, math.log
from pathlib import Path         # пути к файлам, работающие в Windows и на Mac
date(2026, 10, 1) - date(2026, 9, 28)        # datetime.timedelta(days=3) → .days даёт 3
```

**Модуль** (*module*) — это чужие функции. Завтрашний `import pandas as pd` — тот же механизм; сегодня достаточно стандартной библиотеки.

### Чтение CSV через модуль csv :id=reading-a-csv-with-the-csv-module

```python
with open("../excel/applications.csv", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))          # список словарей, по одному на строку, ключи = заголовок
with open("../excel/loans_status.csv", newline="", encoding="utf-8") as f:
    loans = list(csv.DictReader(f))         # 7 828 кредитов, тем же способом
len(rows), len(loans)                       # (14000, 7828)
rows[0]["channel"], rows[0]["status"]       # ('branch', 'rejected')
```

`with open(...) as f:` открывает файл и закрывает его, когда блок заканчивается. `csv.DictReader` отдаёт каждую строку как словарь с ключами из строки заголовка — каждое значение это **строка**: `"322610000"`, а не `322610000`, и `""` для пропуска (388 пропущенных кредитных скорингов). Преобразуйте при использовании: `int(r["requested_amount"])`, и сначала проверьте на `""`.

> 💡 **Главное.** CSV не знает типов. Каждое значение приходит текстом — `"0"` это не `0`, а `""` — не пропущенное число, а пустая строка, — поэтому преобразуйте в момент вычисления и решайте, что значит пропуск, до того как делить.

```game
{"type": "bug", "id": "w05d1-g2", "title": "Найдите сломанную строку", "q": "Этот цикл должен суммировать requested_amount по каналам из строк выше. Одна строка его ломает.", "code": "total = {}\nfor r in rows:\n    ch = r[\"channel\"]\n    total[ch] = total.get(ch, 0) + r[\"requested_amount\"]\nprint(total)", "answer": [3], "why": "Каждое значение из csv.DictReader — текст: 0 + \"322610000\" вызывает TypeError. Преобразуйте при использовании — int(r[\"requested_amount\"])."}
```

### Списковые включения :id=list-comprehensions

```python
late = [r for r in loans if int(r["dpd"]) > 0]              # WHERE — 399 кредитов
amounts = [int(r["principal"]) for r in loans]              # SELECT одного столбца, с преобразованием
labels = [label(int(r["dpd"])) for r in loans]              # CASE на каждую строку
sum(1 for r in loans if r["status"] == "active")            # COUNT с условием — 3352
```

**Списковое включение** (*list comprehension*) — это `for`, который строит список в одну строку: `[expression for item in iterable if condition]`. Читайте справа налево: *для каждого кредита, если просрочен, оставить*. Именно так вы завтра будете думать о булевых масках pandas. Обратите внимание на `int(...)` в первой строке — `r["dpd"] > 0` на сыром тексте вызывает `TypeError`.

### Ошибки: как читать трассировку :id=errors-how-to-read-a-traceback

```
ZeroDivisionError: division by zero                       ← ПОСЛЕДНЯЯ строка — это ошибка; читайте её первой
  Cell In[7], line 3                                       ← затем стрелка: какая строка вашего кода
    return round(100 * approved / total, 1)
```

**Трассировка** (*traceback*) перечисляет вызовы, приведшие к ошибке; самый новый — внизу. Читайте последнюю строку (тип и сообщение), затем строку *вашего* кода, на которую она указывает. С чем вы столкнётесь на этой неделе: `NameError` (переменная не определена — или определена в ячейке, которую вы не запускали), `TypeError` (`"42" + 1`: текст плюс число — сначала преобразуйте), `KeyError` (ключ словаря или имя столбца не существует — проверьте написание и заголовок), `IndexError` (позиция за концом), `ValueError` (`int("n/a")`), `FileNotFoundError` (путь отсчитывается от места, где был запущен Jupyter), `SyntaxError` (пропущено двоеточие или скобка — стрелка указывает *после* проблемы), `IndentationError`. `try: … except ValueError: …` перехватывает ожидаемую ошибку (`parse_date` в HW 5.1 возвращает `None` вместо падения на `"n/a"`).

### Глубже (по желанию) :id=depth-optional

**Видео (бесплатные, YouTube; каждая ссылка открывается на нужной минуте):**

- ▶ Jupyter (установка, новый ноутбук, markdown, горячие клавиши) — [Jupyter Notebook Tutorial: Introduction, Setup, and Walkthrough (Corey Schafer), 04:08](https://youtu.be/HW29067qVWk?t=248&end=961)
- ▶ Установка Anaconda (путь через Jupyter) — [Python for Data Analytics - Full Course for Beginners (Luke Barousse), 5:50:56](https://youtu.be/wUSDVGivd-8?t=21056&end=21634)
- ▶ Переменные и типы — [Python for Data Analytics - Full Course for Beginners (Luke Barousse), 18:52](https://youtu.be/wUSDVGivd-8?t=1132&end=1465)
- ▶ Списки, словари, кортежи — [тот же курс, 1:34:24](https://youtu.be/wUSDVGivd-8?t=5664&end=6582)
- ▶ if / for / while — [тот же курс, 1:26:20](https://youtu.be/wUSDVGivd-8?t=5180&end=5664)
- ▶ Функции — [тот же курс, 2:52:12](https://youtu.be/wUSDVGivd-8?t=10332&end=10923)
- ▶ Модули (import) — [тот же курс, 3:12:46](https://youtu.be/wUSDVGivd-8?t=11566&end=12496)

- Русская презентация (TBC Data Analytics 2.0, если она у вас есть) `4.1 Python.pdf` (109 страниц): типы — стр. 26–48, управление потоком — стр. 49–61, списки / кортежи / словари / множества — стр. 62–71, функции — стр. 72–78, исключения — стр. 83–91, файлы — стр. 92–107 — запись `video1256130814.mp4` — это эта лекция. `En_4.2_Python.pdf` — это NumPy (массивы, срезы, broadcasting, стр. 12–66): pandas построен поверх него; прочитайте, когда вас озадачат `.values` или `np.where`.
- *Английские термины:* variable = переменная, int / float = целое / вещественное число, str = строка, list = список, dict = словарь, tuple = кортеж, loop = цикл, function = функция, parameter / argument = параметр / аргумент, module = модуль, exception = исключение, traceback = трассировка, kernel = ядро, cell = ячейка.

```videoquiz
{"video": "HW29067qVWk", "stops": [
  {"at": 420, "q": "Что делает Shift+Enter в Jupyter?", "options": ["Выполняет ячейку и переходит к следующей", "Сохраняет ноутбук", "Перезапускает ядро", "Удаляет ячейку"], "answer": 0, "explain": "Shift+Enter выполняет и переходит вниз; Ctrl+Enter выполняет и остаётся на ячейке.", "back": 60},
  {"at": 640, "q": "Для чего нужна Markdown-ячейка?", "options": ["Чтобы Python работал быстрее", "Для текста — заголовков, заметок и ваших выводов", "Для установки пакетов", "Для хранения файлов данных"], "answer": 1, "explain": "Кодовые ячейки выполняют Python; Markdown-ячейки держат слова вокруг чисел — туда идут ваши выводы.", "back": 60},
  {"at": 860, "q": "Число в [5] слева от кодовой ячейки означает…", "options": ["позицию ячейки на странице", "что она была пятой выполненной ячейкой в этом сеансе ядра", "число ошибок в ячейке", "число строк"], "answer": 1, "explain": "Счётчик показывает порядок запуска, а не порядок на странице — поэтому Restart & Run All и доказывает, что ноутбук работает сверху вниз.", "back": 60}]}
```

```videoquiz
{"video": "wUSDVGivd-8", "stops": [
  {"at": 1300, "q": "Какой тип у значения 0.30?", "options": ["int", "str", "float", "bool"], "answer": 2, "explain": "Число с десятичной точкой — float; 31_150_000 — int; всё в кавычках — str.", "back": 60},
  {"at": 5420, "q": "Что обозначает тело цикла for в Python?", "options": ["Фигурные скобки", "Ключевое слово END", "Отступ после строки, заканчивающейся двоеточием", "Круглые скобки"], "answer": 2, "explain": "Отступы — это синтаксис: двоеточие открывает блок, четыре пробела показывают, что к нему относится.", "back": 60},
  {"at": 6100, "q": "Как прочитать значение словаря, не упав, если ключа нет?", "options": ["d[key]", "d.get(key, default)", "d.find(key)", "d.index(key)"], "answer": 1, "explain": "d[key] вызывает KeyError на отсутствующем ключе; d.get(key, 0) возвращает значение по умолчанию — приём подсчёта из разобранного примера.", "back": 60},
  {"at": 10600, "q": "Функция без оператора return возвращает…", "options": ["0", "None", "то, что она напечатала", "ошибку"], "answer": 1, "explain": "Нет return — значит None; поэтому функция, которая только печатает, не даёт ничего для assert и переиспользования.", "back": 60}]}
```

---

## 2. Разбор примера — доля одобрений по каналам от Жасура, в циклах (15 мин) :id=_2-worked-example-jasur39s-approval-rate-by-channel-in-loops-15-min

Зерно `applications.csv`: одна строка = одна заявка; 14 000 строк. Доля = одобренные ÷ заявки, по каналам; одобренные = `status`, начинающийся с `approved` (шаблон `"approved*"` с недели 4). Два словаря, один проход по строкам:

```python
import csv
with open("../excel/applications.csv", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

total, approved = {}, {}
for r in rows:
    ch = r["channel"]
    total[ch] = total.get(ch, 0) + 1
    if r["status"].startswith("approved"):
        approved[ch] = approved.get(ch, 0) + 1

for ch in sorted(total):
    print(f"{ch:<8}{total[ch]:>6}{approved[ch]:>6}{100 * approved[ch] / total[ch]:>7.1f} %")
```

```
app       5006  2915   58.2 %
branch    6223  3965   63.7 %
partner   2771  1715   61.9 %
```

`GROUP BY channel` с недели 2, `COUNTIFS` с недели 4, теперь — `for`. Три вещи, которые стоит увидеть. Словари — это *группы*: `.get(ch, 0) + 1` означает «посчитать ещё один для этого ключа, начиная с нуля, если ключ новый». `startswith("approved")` — это шаблон. И ничего не суммировалось из текста: `total[ch]` считает строки, поэтому `int()` не понадобился — как только вы начнёте суммировать `requested_amount`, преобразование обязательно. Конвенция «только решённые»: третий словарь, считающий `r["status"] != "cancelled"` → 68.2 / 72.4 / 70.5 %.

> ⚠️ **Осторожно.** Один лишь `== "approved"` даёт для приложения 56.6 % — число Маркетинга, — потому что у статуса два написания и теряются 678 строк `approved_not_disbursed`. Посмотрите на уникальные значения столбца, прежде чем проверять его на одно из них.

> 💡 **Главное.** Итоговая строка суммирует количества: 8 595 / 14 000 = **61.4 %**. Усреднение трёх долей по каналам даёт 61.3 % — никогда не усредняйте доли для итога.

```game
{"type": "cloze", "id": "w05d1-g3", "title": "Заполните цикл одобрений", "text": "for r in rows:\n    ch = r[\"channel\"]\n    total[ch] = total.get(ch, {{0}}) + 1\n    if r[\"status\"].{{1}}(\"approved\"):\n        approved[ch] = approved.get(ch, 0) + 1\nrate = 100 * approved[ch] / {{2}}", "blanks": [["0"], ["startswith"], ["total[ch]"]], "distractors": ["1", "endswith", "len(rows)"]}
```

---

## 3. Практика (50 мин) :id=3-practice-50-min

У каждой задачи ниже свой редактор, который уже читает нужный файл. Пишите код под `# ваш код`, нажмите **▶ Run**, затем **✔ Check** — проверка ищет ответ среди чисел, которые печатает ваш код, поэтому выводите результат через print. Работаете в Jupyter? Решайте задачу в ноутбуке `week5_day1.ipynb` (File → New → Notebook), одна задача на ячейку, затем вставьте код в редактор, чтобы проверить.

**P1.** Типы: `principal = "31150000"`, как прочитано из CSV. Что даст `principal * 2`, что даст `int(principal) * 2` и какую ошибку вызовет `principal + 1`?

```task
{"id": "w05d1-p1", "kind": "python", "starter": "principal = \"31150000\"      # как прочитано из CSV\n\n# ваш код: выведите principal * 2, затем int(principal) * 2,\n# затем попробуйте principal + 1 и прочитайте последнюю строку ошибки\n", "answer": 62300000, "dp": 0, "hint": "int() превращает текст в число; только после этого * 2 удваивает его.", "model": "print(principal * 2)        # 3115000031150000 — повторённый текст\nprint(int(principal) * 2)   # 62300000\nprint(principal + 1)        # TypeError: can only concatenate str (not \"int\") to str\n\nУрок про CSV в одной строке: преобразуйте до арифметики."}
```

**P2.** Список из пяти меток корзин по порядку. Выведите последнюю, не считая, три средние срезом и позицию `"61-90"` через `.index()`.

```task
{"id": "w05d1-p2", "kind": "python", "starter": "buckets = [\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"]\n\n# ваш код: последняя метка, три средние (срез), позиция \"61-90\"\n", "answer": 3, "dp": 0, "hint": "Отрицательные позиции считаются с конца; срез останавливается перед своим вторым числом.", "model": "print(buckets[-1])             # 90+\nprint(buckets[1:4])            # ['1-30', '31-60', '61-90']\nprint(buckets.index(\"61-90\"))  # 3\n\nСрезы останавливаются перед вторым числом — полуоткрытый фильтр с недели 1, только для индексов."}
```

**P3.** Посчитайте заявки по `status` словарём и циклом; выведите словарь, отсортированный по количеству, от большего к меньшему.

```task
{"id": "w05d1-p3", "kind": "python", "starter": "import csv\nwith open(\"../excel/applications.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\n# ваш код\n", "answer": 7917, "dp": 0, "hint": "Проверка ищет количество простого \"approved\". sorted(d.items(), key=lambda kv: kv[1], reverse=True) сортирует по значению.", "model": "counts = {}\nfor r in rows:\n    counts[r[\"status\"]] = counts.get(r[\"status\"], 0) + 1\nprint(sorted(counts.items(), key=lambda kv: kv[1], reverse=True))\n# [('approved', 7917), ('rejected', 3588), ('cancelled', 1817), ('approved_not_disbursed', 678)]\n\nlambda kv: kv[1] означает «сортировать по значению». Четыре числа в сумме дают 14 000; approved* = 8 595."}
```

**P4.** Напишите `label(dpd)` из раздела 1 и примените её списковым включением к `[0, 7, 30, 31, 45, 90, 91, 919]`. Затем посчитайте словарём, сколько из 7 828 строк `loans_status.csv` попадает в каждую метку.

```task
{"id": "w05d1-p4", "kind": "python", "starter": "import csv\nwith open(\"../excel/loans_status.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    loans = list(csv.DictReader(f))\n\n# ваш код: label(dpd), списковое включение, затем количество по меткам\n", "answer": 234, "dp": 0, "hint": "Проверка ищет количество в 90+. Не забудьте int(r[\"dpd\"]) — файл даёт текст.", "model": "def label(dpd):\n    if dpd <= 0: return \"0\"\n    elif dpd <= 30: return \"1-30\"\n    elif dpd <= 60: return \"31-60\"\n    elif dpd <= 90: return \"61-90\"\n    else: return \"90+\"\nprint([label(d) for d in [0, 7, 30, 31, 45, 90, 91, 919]])\n# ['0', '1-30', '1-30', '31-60', '31-60', '61-90', '90+', '90+'] — 30 всё ещё 1-30, 91 — это 90+\nby_label = {}\nfor r in loans:\n    k = label(int(r[\"dpd\"]))\n    by_label[k] = by_label.get(k, 0) + 1\nprint(by_label)   # {'0': 7429, '1-30': 124, '31-60': 25, '61-90': 16, '90+': 234}\n\nКорзины недель 2/3/4 в четвёртый раз. Контрольная сумма: 7 429 + 399 = 7 828."}
```

**P5.** Просуммируйте `requested_amount` по каналам; выведите каждую сумму как `f"{x / 1e9:.1f} bn"`. Что пойдёт не так без `int()`?

```task
{"id": "w05d1-p5", "kind": "python", "starter": "import csv\nwith open(\"../excel/applications.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\n# ваш код\n", "answer": 681.2, "dp": 1, "hint": "Проверка ищет сумму филиального канала (branch) в млрд, с одним знаком.", "model": "req = {}\nfor r in rows:\n    req[r[\"channel\"]] = req.get(r[\"channel\"], 0) + int(r[\"requested_amount\"])\nfor ch, x in req.items():\n    print(ch, f\"{x / 1e9:.1f} bn\")\n# branch 681.2 bn · app 13.6 bn · partner 11.4 bn\n\nВсего запрошено 706.2 bn против 404.8 bn выданных — филиал запрашивает деньги на SME и Auto. Без int() выражение 0 + \"322610000\" вызывает TypeError: unsupported operand type(s) for +: 'int' and 'str'. Хуже, если начать сумму с \"\" вместо 0: += склеит тексты в одну огромную строку — без ошибки, с неверным ответом; запускайте type() на сумме, которая выглядит странно."}
```

**P6.** Пропущенные значения: у скольких строк `credit_score == ""`? Посчитайте средний кредитный скоринг по остальным — и объясните, почему `sum / len(rows)` было бы неверно.

```task
{"id": "w05d1-p6", "kind": "python", "starter": "import csv\nwith open(\"../excel/applications.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\n# ваш код\n", "answer": 659.6, "dp": 1, "hint": "Проверка ищет среднее по непустым скорингам, с одним знаком. Отфильтруйте \"\" до int().", "model": "scores = [int(r[\"credit_score\"]) for r in rows if r[\"credit_score\"] != \"\"]\nprint(len(rows) - len(scores))              # 388 пропусков (2.8 %)\nprint(round(sum(scores) / len(scores), 1))  # 659.6\n\nДеление на 14 000 молча считает пропуск нулём и тянет среднее вниз до 641.3 — правило NULL с недели 2 (AVG игнорирует NULL; ваш цикл тоже должен), написанное вручную."}
```

**P7.** Даты: `from datetime import date, datetime`; разберите `applied_at` (`"2025-06-02 10:35:00"`) через `datetime.strptime(s, "%Y-%m-%d %H:%M:%S")`, затем посчитайте заявки за сентябрь 2026 по правилу полуоткрытого интервала. Сверьте с `<= 2026-09-30`.

```task
{"id": "w05d1-p7", "kind": "python", "starter": "import csv\nfrom datetime import date, datetime\nwith open(\"../excel/applications.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\n# ваш код\n", "answer": 621, "dp": 0, "hint": "Проверка ищет число по полуоткрытому интервалу. Сравнивайте .date() с date(2026, 9, 1) и date(2026, 10, 1).", "model": "ds = [datetime.strptime(r[\"applied_at\"], \"%Y-%m-%d %H:%M:%S\") for r in rows]\nprint(sum(1 for d in ds if date(2026, 9, 1) <= d.date() < date(2026, 10, 1)))      # 621\nprint(sum(1 for d in ds if datetime(2026, 9, 1) <= d <= datetime(2026, 9, 30)))    # 598\n\nУсловие <= теряет 23 заявки после полуночи 30-го — ловушка недели 1 на третьем языке. Если сначала преобразовать в .date(), обе формы совпадут."}
```

**P8.** Напишите `top_n(d, n)`, возвращающую n наибольших пар `(key, value)` словаря, и примените её к количеству заявок по `product`. Затем цикл `while`, который увеличивает 1 000 000 на 30 % в год, пока не перейдёт 10 000 000 — за сколько лет?

```task
{"id": "w05d1-p8", "kind": "python", "starter": "import csv\nwith open(\"../excel/applications.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\n# ваш код: top_n, затем цикл while — число лет выведите последним\n", "answer": 9, "dp": 0, "hint": "Проверка ищет число лет. while без years += 1 никогда не закончится.", "model": "def top_n(d, n):\n    return sorted(d.items(), key=lambda kv: kv[1], reverse=True)[:n]\nby_product = {}\nfor r in rows:\n    by_product[r[\"product\"]] = by_product.get(r[\"product\"], 0) + 1\nprint(top_n(by_product, 3))   # [('Micro loan', 5006), ('Consumer loan', 4204), ('Buy now pay later', 2771)]\nx, years = 1_000_000, 0\nwhile x <= 10_000_000:\n    x *= 1.3\n    years += 1\nprint(years)                  # 9 (1.3^9 = 10.6)\n\nwhile без += 1 работает вечно — в Jupyter это Kernel → Interrupt; на странице перезагрузите её."}
```

**P9.** Напишите `approval_rate(rows, channel, convention="all")`, как в разобранном примере, со второй конвенцией `"decided"`, и `try/except` вокруг вызова с несуществующим каналом, чтобы вместо падения возвращалось `None`.

```task
{"id": "w05d1-p9", "kind": "python", "starter": "import csv\nwith open(\"../excel/applications.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\n# ваш код\n", "answer": 68.2, "dp": 1, "hint": "Проверка ищет долю канала app по конвенции decided (отменённые заявки исключены).", "model": "def approval_rate(rows, channel, convention=\"all\"):\n    sub = [r for r in rows if r[\"channel\"] == channel\n           and (convention == \"all\" or r[\"status\"] != \"cancelled\")]\n    try:\n        return round(100 * sum(r[\"status\"].startswith(\"approved\") for r in sub) / len(sub), 1)\n    except ZeroDivisionError:\n        return None\nfor ch in [\"app\", \"branch\", \"partner\"]:\n    print(ch, approval_rate(rows, ch), approval_rate(rows, ch, \"decided\"))\nprint(approval_rate(rows, \"crypto\"))   # None\n\nall: 58.2 / 63.7 / 61.9; decided: 68.2 / 72.4 / 70.5 — таблица COUNTIFS с недели 4. Для неизвестного канала список пуст, и / 0 вызывает ZeroDivisionError; if not sub: return None перед делением — более понятный вариант."}
```

> 🚀 **Со звёздочкой (по желанию, +5 XP).** **P10.** Прочитайте `loans_status.csv` и посчитайте Σ `outstanding` по `product` словарём, затем долю каждого через f-строку `:.1%`. Затем запишите тот же результат в новый CSV через `csv.DictWriter` (`fieldnames=["product", "outstanding", "share"]`) и прочитайте его обратно (в Jupyter — откройте в Excel).

```task
{"id": "w05d1-p10", "kind": "python", "starter": "import csv\nwith open(\"../excel/loans_status.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    loans = list(csv.DictReader(f))\n\n# ваш код\n", "answer": 60.3, "dp": 1, "xp": 2, "hint": "Проверка ищет долю SME в %, с одним знаком (выведите 100 * доля или прочитайте её из текста :.1%).", "model": "out = {}\nfor r in loans:\n    out[r[\"product\"]] = out.get(r[\"product\"], 0) + int(r[\"outstanding\"])\ntotal = sum(out.values())                      # 208 723 504 430\nwith open(\"outstanding_by_product.csv\", \"w\", newline=\"\", encoding=\"utf-8\") as f:\n    w = csv.DictWriter(f, fieldnames=[\"product\", \"outstanding\", \"share\"])\n    w.writeheader()\n    for p, v in out.items():\n        w.writerow({\"product\": p, \"outstanding\": v, \"share\": f\"{v / total:.1%}\"})\nprint(open(\"outstanding_by_product.csv\").read())\nprint(round(100 * out[\"Small business loan\"] / total, 1))   # 60.3\n\nSME 125 892 942 411 (60.3 %) · Auto 57 684 271 333 (27.6) · Consumer 23 054 933 316 (11.0) · BNPL 1 135 251 000 (0.5) · Micro 956 106 370 (0.5). newline=\"\" в open, иначе Excel покажет пустые строки между строками. Завтра это четыре строки pandas."}
```

### Ошибки, которые стоят балла на этой неделе :id=mistakes-that-cost-a-point-this-week

- Ячейки выполнены не по порядку, и ноутбук падает на *Restart & Run All*.
- Суммирование текста из CSV без `int()`/`float()` — `TypeError` или, хуже, склеенный текст.
- `== "approved"` там, где у статуса два написания — потеряно 678 одобрений.
- `for`, который трижды пересчитывает один и тот же поиск в словаре вместо того, чтобы сохранить его в переменную.
- Деление на `len(rows)`, когда часть строк пуста — NULL посчитаны как нули.
- Функция, которая `print`-ит результат вместо того, чтобы `return`-ить его — нечего проверять assert-ом, нечего переиспользовать.
- Чтение первой строки трассировки вместо последней.

---

## 4. Домашнее задание <span class="badge hw">HW 5.1 — срок: День 3</span> :id=4-homework-hw-51--due-day-3

**Восемь функций Жасура.** Откройте `data/python/day1_starter.ipynb` в Jupyter или Colab (раздел 1, «Где работает ваш код»). Восемь функций — это заглушки, вызывающие `NotImplementedError`; под каждой стоит **assert-ячейка** с ожидаемыми ответами. Заменяйте тело каждой заглушки, пока её assert-ячейка не выполнится молча, затем **Kernel → Restart & Run All** и сдайте выполненный ноутбук (`day1_starter.ipynb`) через блок 📎 ниже.

1. `dpd_bucket(dpd)` — пять меток (отрицательное → `"0"`).
2. `annuity(principal, annual_rate, term)` — ежемесячный платёж, округлённый до ближайших 100 (Уголок компании).
3. `schedule(principal, annual_rate, term)` — список `(n, payment, interest, principal_part, balance_after)`.
4. `parse_date(s)` — ISO-текст (с временем или без) в `date`; пустое значение или мусор → `None`.
5. `is_valid_birth_date(d, as_of)` — правило недели 4: между 1920-01-01 и датой отчёта.
6. `normalise_method(s)` — `"CASH "` → `"cash"`, `"bank transfer"` → `"transfer"`.
7. `approval_rate(rows, channel, convention)` — P9.
8. `top_n(d, n)` — P8.

Раздел 9 ноутбука использует функции 6 и 8 вместе на `payments_dirty.csv` (пять чистых способов оплаты, card первым).

**Проверьте ключевые числа перед сдачей.** Вставьте свои функции из ноутбука в эти два редактора; проверка сравнит то, что они печатают, с хранилищем.

```task
{"id": "w05d1-hw1", "kind": "python", "starter": "# вставьте сюда свою annuity() из ноутбука\n\n\nprint(annuity(31_150_000, 0.30, 24))   # кредит 1\nprint(annuity(1_590_000, 0.42, 3))     # кредит 3\n", "answer": 1741700, "dp": 0, "hint": "r = annual_rate / 12; округление до ближайших 100 — round(x, -2); при нулевой ставке principal / term.", "model": "1 741 700 — monthly_payment кредита 1 в nur.db (кредит 3: 567 500). С правилом округления до 100 формула совпадает на всех 7 828 кредитах."}
```

```task
{"id": "w05d1-hw2", "kind": "python", "starter": "# вставьте сюда свои annuity() и schedule() из ноутбука\n\n\nrows = schedule(31_150_000, 0.30, 24)\nprint(rows[0])                    # месяц 1\nprint(sum(r[2] for r in rows))    # всего процентов за 24 месяца\n", "answer": 10650293, "dp": 0, "hint": "Каждый месяц interest = round(balance × r) и principal_part = payment − interest; последний месяц гасит остаток, а не переплачивает.", "model": "10 650 293 — процентные части 24 платежей кредита 1 в installments. Месяц 1 — (1, 1741700, 778750, 962950, 30187050); месяц 24 платит 1 741 193."}
```

### 📎 Сдайте здесь :id=hand-in-here

```sqltask
{"check": "handin-W5D1", "lesson": "W5D1", "title": "HW 5.1", "why": "Эти восемь функций — кирпичики, которые переиспользуют плановые скрипты Жасура: метки корзин, аннуитет, даты, способы оплаты, — а assert — это способ доказать, что функция говорит правду, прежде чем на неё кто-то положится.", "graded": ["Все восемь assert-ячеек проходят после Kernel → Restart & Run All — 8 баллов, по одному на функцию", "Ни одна функция не печатает; каждая возвращает — 1 балл", "Докстринг у каждой, своими словами: что делает и что возвращает — 1 балл"], "tasks": [{"id": "day1_starter.ipynb", "file": "day1_starter.ipynb", "names": ["day1_starter.ipynb"], "upload": true, "accept": ".ipynb", "q": "Прикрепите `day1_starter.ipynb` — то, что требует страница выше."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Всё остальное, что перечислено на странице (ещё один файл или .zip из нескольких)."}]}
```

---

## 5. Самопроверка :id=5-self-check

```check
{"id": "w05d1-sc", "questions": [
  {"type": "single", "q": "Вы изменили функцию в ячейке 4 и перезапустили только ячейку 9; assert всё равно падает со старым поведением. Что делать?", "options": ["Запустить ячейку 9 ещё раз", "Сначала перезапустить ячейку 4 — а лучше Kernel → Restart & Run All: ядро всё ещё держит старую функцию", "Удалить assert", "Скопировать функцию в ячейку 9"], "answer": 1, "explain": "Ядро помнит то, что запускалось последним, а не то, что на экране (→ раздел 1, «Jupyter»)."},
  {"type": "single", "q": "r[\"dpd\"] > 30 вызывает TypeError для строки из csv.DictReader. Почему?", "options": ["dpd — это float", "Каждое значение из DictReader — строка, а текст нельзя сравнить с числом — пишите int(r[\"dpd\"]) > 30", "Столбец называется DPD", "30 нужно писать как 30.0"], "answer": 1, "explain": "CSV не знает типов; преобразуйте при использовании (→ раздел 1, «Чтение CSV», P1)."},
  {"type": "single", "q": "Какое списковое включение соответствует WHERE status LIKE 'approved%' AND channel = 'app' с недели 2?", "options": ["[r for r in rows if r[\"status\"] == \"approved\" and r[\"channel\"] == \"app\"]", "[r for r in rows if r[\"status\"].startswith(\"approved\") and r[\"channel\"] == \"app\"]", "[r for r in rows if r[\"status\"].startswith(\"approved\") or r[\"channel\"] == \"app\"]", "[r[\"status\"] for r in rows if r[\"channel\"] == \"app\"]"], "answer": 1, "explain": "startswith — это шаблон LIKE 'approved%'; and соединяет два условия (→ раздел 1, «Списковые включения», раздел 2)."},
  {"type": "number", "q": "Сколько заявок в applications.csv имеют пустой credit_score?", "answer": 388, "tol": 0, "explain": "388 из 14 000 (2.8 %) — они приходят как \"\", поэтому проверяйте пустую строку до int() (→ P6)."}
]}
```

---

## 6. Уголок компании <span class="badge company">Формула аннуитета</span> :id=6-company-corner-the-annuity-formula

Каждый платёж в `installments` (92 193 строки) был получен по одной формуле. **Аннуитетный** (*annuity*) кредит платится одной и той же суммой каждый месяц; внутри этой суммы доля **процентов** уменьшается, а доля **основного долга** растёт по мере снижения остатка:

```
payment = P × r / (1 − (1 + r)^−n)        P = основной долг, r = annual_rate / 12, n = срок в месяцах
```

Nur Finance округляет платёж до ближайших **100 сум** (`round(x, -2)`), а BNPL с нулевой ставкой просто делит `P / n`. На Python:

```python
def annuity(principal, annual_rate, term):
    r = annual_rate / 12
    pay = principal / term if r == 0 else principal * r / (1 - (1 + r) ** -term)
    return int(round(pay, -2))

annuity(31_150_000, 0.30, 24)     # 1741700 — кредит 1
```

```game
{"type": "build", "id": "w05d1-g4", "title": "Соберите аннуитетный платёж", "q": "Соберите ежемесячный платёж Nur Finance; r = annual_rate / 12 уже посчитан.", "tokens": ["pay =", "principal", "*", "r", "/", "(1 - (1 + r) ** -term)"], "distractors": ["(1 + r) ** term", "+ interest"]}
```

**Проверка на трёх реальных кредитах** (`loans.principal`, `annual_rate`, `term_months`, `monthly_payment` из `nur.db`; те же три открывают `loans_status.csv`):

| кредит | основной долг | ставка | срок | формула | `monthly_payment` |
|---|---|---|---|---|---|
| 1 (Consumer) | 31 150 000 | 30 % | 24 | 1 741 684.35 → **1 741 700** | 1 741 700 |
| 2 (Consumer) | 40 060 000 | 30 % | 18 | 2 790 983.43 → **2 791 000** | 2 791 000 |
| 3 (Micro) | 1 590 000 | 42 % | 3 | 567 525.35 → **567 500** | 567 500 |

На всех 7 828 кредитах `annuity()` совпадает с `monthly_payment` для **7 828** — правило округления и есть вся разница между «примерно верно» (590 совпадений с `int()`, 579 с `round()`) и точно верно. Когда число компании не совпадает с вашей формулой, разница почти всегда в округлении или в конвенции подсчёта дней; найдите её, запишите, и тогда ваша функция *и есть* определение.

**Основной долг и проценты по графику** — кредит 1, первые шесть из 24 строк, каждый месяц `interest = round(balance × r)`, `principal_part = payment − interest`:

```
n  payment    interest  principal  balance after
1  1 741 700   778 750    962 950   30 187 050
2  1 741 700   754 676    987 024   29 200 026
3  1 741 700   730 001  1 011 699   28 188 327
4  1 741 700   704 708  1 036 992   27 151 335
5  1 741 700   678 783  1 062 917   26 088 418
6  1 741 700   652 210  1 089 490   24 998 928
```

Это в точности строки 1–6 таблицы `installments` для `loan_id = 1` (`interest_due` 778 750, `principal_due` 962 950 …). 24-я строка платит 1 741 193 — чуть меньше, потому что остаток гасится, а не переплачивается; части основного долга в сумме дают 31 150 000, а части процентов — 10 650 293 (34 % сверх основного долга за два года).

> 💡 **Главное.** **Остаток долга** (*outstanding*) — это сумма частей *основного долга*, срок которых ещё не наступил; проценты — это выручка, а не риск. Поскольку проценты сдвинуты в начало графика, у кредита 1 через год после начала 24-месячного срока остаток всё ещё 17 865 571 — 57 % основного долга, а не 50 %. По той же причине досрочное погашение экономит заёмщику меньше, чем он ожидает, а остаток 48-месячного кредита Auto в первый год почти не двигается.

> 🎯 **Версия для собеседования.** *«Как вычисляется аннуитетный платёж и как со временем меняется его структура?»* — P·r/(1−(1+r)^−n) с месячной ставкой; равные платежи; проценты = остаток × r, поэтому они падают каждый месяц, а часть основного долга растёт на ту же величину; остаток после месяца k — это то, что график ещё должен, то есть остаток долга; проверьте функцию на трёх реальных кредитах и назовите правило округления.

**Скажите это как на собеседовании.** Ответьте на вопрос выше своими словами, как сказали бы вслух, с одним числом Nur Finance.

```task
{"id": "w05d1-int", "kind": "free", "min": 30, "model": "Аннуитет платится одной и той же суммой каждый месяц: P × r / (1 − (1 + r)^−n), где r — месячная ставка (годовая / 12), а n — срок в месяцах. Внутри каждого платежа проценты равны остаток × r, поэтому они максимальны в первый месяц и падают каждый месяц, а часть основного долга растёт на ту же величину. Остаток после месяца k — основной долг, срок которого ещё не наступил, — это и есть остаток долга: у кредита 1 Nur Finance (31.15 млн под 30 % на 24 месяца) через год остаётся 57 %, а не 50 %. Я бы проверила функцию на трёх реальных кредитах и назвала правило округления: Nur Finance округляет до ближайших 100 сум, и с этим правилом формула совпадает на всех 7 828 кредитах.", "rubric": ["Даёт формулу с месячной ставкой (годовая / 12)", "Говорит, что проценты = остаток × r, поэтому проценты падают, а часть основного долга растёт", "Связывает оставшийся основной долг с остатком долга", "Проверяет на реальных кредитах и называет правило округления"]}
```

Завтра: pandas — список `rows` становится DataFrame, а циклы превращаются в одну строку каждый. Ежемесячный ноутбук Бекзода.

---

## Тест дня :id=day-quiz

Для завершения дня нужно набрать 80 %. Пересдавать можно сколько угодно.

```quiz
{"id": "w05d1", "pass": 0.8, "questions": [
  {"type": "single", "q": "Вы меняете функцию в ячейке 3, затем перезапускаете только ячейку 7, которая её вызывает. Какую версию использует ячейка 7?", "options": ["Ту, что выше на странице", "Никакую — будет NameError", "Новую — Jupyter перечитывает все ячейки выше", "Старую — ядро помнит то, что запускалось последним, а не то, что на экране"], "answer": 3, "explain": "Ядро хранит переменные в том порядке, в котором ячейки были запущены; Kernel → Restart & Run All — единственное доказательство, что ноутбук работает сверху вниз (→ раздел 1, «Jupyter»)."},
  {"type": "single", "q": "Что выведет этот код?", "code": "principal = \"31150000\"      # как прочитано через csv.DictReader\nprint(principal * 2)", "options": ["3115000031150000", "62300000", "TypeError", "62300000.0"], "answer": 0, "explain": "Каждое значение из CSV — текст, а строка, умноженная на 2, — это повторённая строка; преобразуйте через int() перед любой арифметикой (→ P1)."},
  {"type": "single", "q": "С функцией label() из раздела 1: что выведет последняя строка?", "code": "def label(dpd):\n    if dpd <= 0: return \"0\"\n    elif dpd <= 30: return \"1-30\"\n    elif dpd <= 60: return \"31-60\"\n    elif dpd <= 90: return \"61-90\"\n    else: return \"90+\"\n\nprint(label(30), label(91))", "options": ["1-30 61-90", "31-60 61-90", "1-30 90+", "31-60 90+"], "answer": 2, "explain": "dpd <= 30 — это всё ещё 1-30, а 91 уже больше 90 — корзины с закрытой правой границей с недели 2 (→ P4)."},
  {"type": "single", "q": "Этот цикл даёт доли одобрений на несколько пунктов ниже, чем 58.2 / 63.7 / 61.9 % с недели 4. Почему?", "code": "for r in rows:\n    ch = r[\"channel\"]\n    total[ch] = total.get(ch, 0) + 1\n    if r[\"status\"] == \"approved\":\n        approved[ch] = approved.get(ch, 0) + 1", "options": ["total.get(ch, 0) сбрасывает счётчик на каждой строке", "Строки не были преобразованы через int()", "Словари не отсортированы", "== \"approved\" пропускает строки approved_not_disbursed"], "answer": 3, "explain": "У статуса два написания «approved»; startswith(\"approved\") — это шаблон \"approved*\" с недели 4 — один лишь == теряет 678 одобрений (→ раздел 2)."},
  {"type": "number", "q": "Одобрено / заявок: app 2 915 / 5 006, branch 3 965 / 6 223, partner 1 715 / 2 771. Какова общая доля одобрений, в %, с одним знаком после запятой?", "answer": 61.4, "tol": 0.05, "explain": "Суммируйте количества: 8 595 / 14 000 = 61.4 %. Усреднение трёх долей по каналам даёт 61.3 % — никогда не усредняйте доли для итоговой строки (→ раздел 2)."},
  {"type": "multi", "q": "Какие утверждения о строках, прочитанных через csv.DictReader, верны?", "options": ["Числовые столбцы автоматически преобразуются в int", "Каждое значение — строка", "Пустая ячейка приходит как пустая строка \"\"", "Каждая строка — словарь с ключами из строки заголовка", "sum() сама пропускает пустые кредитные скоринги"], "answer": [1, 2, 3], "explain": "DictReader отдаёт текст с ключами из заголовка; преобразуйте при использовании и сначала проверяйте на \"\" — 388 кредитных скорингов пусты (→ раздел 1, «Чтение CSV»)."},
  {"type": "single", "q": "Ячейка падает с длинной трассировкой. Что вы читаете первым?", "options": ["Первую строку", "Ничего — перезапускать ячейку, пока не заработает", "Кадры внутри библиотеки", "Последнюю строку (тип и сообщение ошибки), затем стрелку на вашем собственном коде"], "answer": 3, "explain": "Самый новый вызов — внизу: последняя строка называет ошибку, стрелка показывает строку вашего кода (→ раздел 1, «Ошибки»)."},
  {"type": "single", "q": "Уголок компании: кредит 1 (24-месячный аннуитет) прошёл год срока. Его остаток долга…", "options": ["равен сумме 12 оставшихся платежей, включая проценты", "больше 50 %, потому что ранние платежи — в основном проценты", "ровно 50 % основного долга", "меньше 50 %, потому что проценты выплачиваются первыми"], "answer": 1, "explain": "Проценты = остаток × r сдвинуты в начало, поэтому части основного долга сначала малы; остаток долга = основной долг, срок которого ещё не наступил — 57 % для кредита 1 (→ Уголок компании)."}
]}
```

<!-- challenge:start -->

---

## Задача дня :id=daily-challenge

Бонус для любознательных: один более сложный вопрос по теме сегодняшнего дня. Решите его за XP, которые растут вместе с серией задач, — полная неделя из пяти ещё и добавляет 10 % к пятничному ваучеру.

```challenge
{"id": "w05d1", "q": "Жасур хочет знать, как часто слабый скоринг всё же проходит. В data/excel/applications.csv среди заявок с кредитным скорингом ниже 600 (пропущенные скоринги пропустите) — какая доля была одобрена (status начинается с \"approved\")? Используйте только csv и циклы. Дайте процент с точностью до 2 знаков.", "type": "number", "dp": 2, "python": true, "h": ["a3e242d4afa891d50a2ef80b"], "hint": "Два счётчика, один проход. Пропущенный скоринг — это текст \"\" — проверьте его до вызова int() и нигде не учитывайте эту строку.", "sol": "aW1wb3J0IGNzdgp3aXRoIG9wZW4oIi4uL2V4Y2VsL2FwcGxpY2F0aW9ucy5jc3YiLCBuZXdsaW5lPSIiLCBlbmNvZGluZz0idXRmLTgiKSBhcyBmOgogICAgcm93cyA9IGxpc3QoY3N2LkRpY3RSZWFkZXIoZikpCmxvdyA9IGFwcHJvdmVkID0gMApmb3IgciBpbiByb3dzOgogICAgaWYgclsiY3JlZGl0X3Njb3JlIl0gPT0gIiI6CiAgICAgICAgY29udGludWUKICAgIGlmIGludChyWyJjcmVkaXRfc2NvcmUiXSkgPCA2MDA6CiAgICAgICAgbG93ICs9IDEKICAgICAgICBpZiByWyJzdGF0dXMiXS5zdGFydHN3aXRoKCJhcHByb3ZlZCIpOgogICAgICAgICAgICBhcHByb3ZlZCArPSAxCnByaW50KGxvdywgYXBwcm92ZWQsIHJvdW5kKDEwMCAqIGFwcHJvdmVkIC8gbG93LCAyKSkgICAjIDIxNTUgMzYzIDE2Ljg0CgoxNi44NCAlOiAzNjMgb2YgdGhlIDIgMTU1IHNjb3JlZCBhcHBsaWNhdGlvbnMgdW5kZXIgNjAwIHdlcmUgYXBwcm92ZWQg4oCUIGFnYWluc3QgNjEuNCAlIGZvciBhbGwgYXBwbGljYXRpb25zLgpUaGUgdHdvIHRyYXBzIGFyZSB0aGUgYmxhbmsgc2NvcmVzIChpbnQoIiIpIHJhaXNlcyBWYWx1ZUVycm9yKSBhbmQgdGhlIHR3byBzcGVsbGluZ3Mgb2YgYXBwcm92YWwgKD09ICJhcHByb3ZlZCIgYWxvbmUgbG9zZXMgdGhlIGFwcHJvdmVkX25vdF9kaXNidXJzZWQgcm93cykuCkJ5IGNoYW5uZWwgdGhlIGFwcCBpcyB0aGUgc3RyaWN0ZXN0IHdpdGggd2VhayBzY29yZXMgKDExLjYgJSksIGJyYW5jaCBhbmQgcGFydG5lciBib3RoIGFib3V0IDE5LjYgJSDigJQgYSBxdWVzdGlvbiBmb3IgdGhlIHNjb3JlY2FyZCdzIGN1dC1vZmYu"}
```

<!-- challenge:end -->
