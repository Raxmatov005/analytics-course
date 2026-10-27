# Неделя 5 · День 2 — pandas I: DataFrame — таблица, с которой можно разговаривать

<span class="badge">Теория 60 мин</span> <span class="badge">Разбор примера 15 мин</span> <span class="badge">Практика 50 мин</span> <span class="badge company">Уголок компании</span>

> STORY **Вторник, 9:10.** Бекзод, портфельный менеджер, с открытым Excel прошлой недели и новой тревогой. *«Одностраничник сработал. Потом пришла октябрьская выгрузка, и я два часа перевставлял данные, а одна сводная таблица смотрела на старый диапазон. Жасур говорит, что вы можете дать мне **те же цифры портфеля, что на неделе 4, в ноутбуке, который я перезапускаю каждый месяц**: кладу новый `loans_status.csv`, нажимаю одну кнопку — и получаю шесть плиток и корзины. Те же цифры, что в SQL — 208.7 млрд, 3.12 %, 7 429 / 124 / 25 / 16 / 234 — иначе Тимур не подпишет.»*

## Сегодня в 3 строках :id=today-in-3-lines

- **pandas** (*библиотека pandas*) превращает CSV в **DataFrame** — таблицу с именованными столбцами и типизированными значениями, — и у каждого SQL-оператора, который вы знаете, есть однострочная запись в pandas: `WHERE` — это булева маска, `ORDER BY` — это `sort_values`, `SELECT` — это `[ ]` / `.loc`, `CASE` для корзин — это `pd.cut`.
- Вы учите набор для первого взгляда на данные (`head`, `shape`, `info`, `describe`, `dtypes`), фильтрацию (`&`, `|`, `~`, `isin`, `between`, `str.contains`), новые столбцы, `astype`, `to_datetime` и `.dt`, `value_counts`, `isna` / `fillna` / `dropna` и запись результатов обратно (`to_csv`, `to_excel`).
- Ноутбук Бекзода готов: `portfolio_summary(df)` возвращает шесть плиток, `pd.cut` возвращает корзины, и оба результата совпадают с неделей 3 до сума.

---

## 1. Теория — одна таблица, одна переменная :id=1-learn--one-table-one-variable

Запускайте блоки на этой странице сверху вниз (▶ Run): каждый использует фрейм `loans`, который читает первый блок. Те же ячейки есть в `data/python/day2_starter.ipynb`, если вы работаете в Jupyter.

### Чтение файла :id=reading-the-file

```python
import pandas as pd
import numpy as np
loans = pd.read_csv("../excel/loans_status.csv", parse_dates=["disbursed_at"])
```

`pd.read_csv` читает заголовок как имена столбцов и **угадывает тип каждого столбца**: целые числа → `int64`, десятичные → `float64`, всё остальное → `object` (текст). Даты — это текст, пока вы не скажете `parse_dates=[...]` — урок недели 4 «даты, хранящиеся как текст», теперь в виде параметра. Другие параметры, которые вам понадобятся: `sep=";"` для европейских CSV, `decimal=","`, `dtype={"phone": str}`, чтобы номер телефона не превратился в число, `usecols=[...]`, чтобы загрузить пять столбцов из пятидесяти, `nrows=1000`, чтобы заглянуть в огромный файл. Excel: `pd.read_excel("nur_week4_start.xlsx", sheet_name="Loans")`.

> ⚠️ **Осторожно.** У угадывания типов есть сюрпризы. Столбец целых чисел с единственным пропуском становится `float64` (NaN — это float), поэтому `monthly_income` приходит дробными числами вида `15245932.7…`; телефон или идентификатор с ведущим нулём теряет его, если не передать `dtype=str`; дата без `parse_dates` — это `object`, и `.dt` её не принимает. Запускайте `dtypes`, прежде чем доверять столбцу.

### Первый взгляд — пять команд, которые вы запускаете на каждой новой таблице :id=first-look--the-five-commands-you-run-on-every-new-table

```python
loans.shape            # (7828, 13)  — строки, столбцы; проверка зерна: одна строка на кредит?
loans.head()           # первые 5 строк (head(10) — десять); .tail() — последние 5
loans.dtypes           # тип каждого столбца: 5 int64, 1 datetime64, 7 object
loans.info()           # dtypes + число непустых + память — перепись NULL одним вызовом
loans.describe()       # count / mean / std / min / квартили / max для числовых столбцов
loans.describe(include="object")   # unique / top / freq для текста: customer — 747 различных значений, product — 5
```

`describe()` уже рассказывает историю: `principal` — среднее 51.7 млн, медиана (`50%`) 5.79 млн — портфель мелких кредитов и нескольких очень крупных (вывод S4 недели 3 о двух портфелях, в одной строке); у `dpd` 75-й перцентиль равен 0, а максимум — 919. `info()` показывает `7828 non-null` в каждом столбце — `loans_status.csv` это чистая выгрузка; завтрашние файлы не такие.

### Выбор столбцов, `loc` и `iloc` :id=selecting-columns-loc-and-iloc

```python
loans["product"]                          # один столбец → Series (список с индексом)
loans[["loan_id", "product", "dpd"]]       # несколько столбцов → DataFrame (обратите внимание на двойные скобки)
loans.loc[2, "product"]                    # по МЕТКЕ: строка с меткой индекса 2, столбец "product" → 'Micro loan'
loans.iloc[0:3, 0:4]                       # по ПОЗИЦИИ: первые три строки, первые четыре столбца
loans.loc[loans["dpd"] > 90, ["loan_id", "dpd"]]   # loc с условием и списком столбцов — SELECT … WHERE
```

`loc` работает по именам (метка строки, имя столбца), `iloc` — по целочисленной позиции. Индекс здесь по умолчанию 0…7827, поэтому они выглядят одинаково — пока вы не отфильтруете или не отсортируете: после `late = loans[loans["dpd"] > 0]` `late.iloc[0]` — это первый просроченный кредит, а `late.loc[0]` — кредит, чья *метка* равна 0 (которого в `late` может вообще не быть → `KeyError`). Правило: `loc` для условий и имён, `iloc` для «первых n строк»; `reset_index(drop=True)`, когда хотите, чтобы позиции и метки снова совпали.

### Фильтрация — булева маска :id=filtering--the-boolean-mask

```python
active = loans[loans["status"] == "active"]                              # WHERE status = 'active'          → 3352 строки
late_active = loans[(loans["dpd"] > 0) & (loans["status"] == "active")]  # AND — каждое условие в скобках     → 151
big = loans[loans["product"].isin(["Small business loan", "Auto loan"])] # IN (...)                          → 1172
mid = loans[loans["principal"].between(10_000_000, 50_000_000)]          # BETWEEN (включая оба конца)       → 2087
tash = loans[loans["branch"].str.contains("Tashkent")]                   # LIKE '%Tashkent%'                 → 3020
not_closed = loans[~(loans["status"] == "closed")]                       # NOT                               → 3586
either = loans[(loans["dpd"] > 90) | (loans["status"] == "written_off")] # OR                                → 234
```

`loans["dpd"] > 0` — это **Series из True/False**, по одному значению на строку — условие вчерашнего спискового включения, векторизованное. Положите его в `[ ]`, и останутся только строки с True. Три записи, о которые спотыкаются: `&` / `|` / `~`, а не `and` / `or` / `not` (те работают с одиночными значениями и вызывают `ValueError: The truth value of a Series is ambiguous`); **скобки вокруг каждого условия**, потому что `&` связывает сильнее, чем `>`; и `between` включает обе границы — для дат используйте два сравнения со знаком `<` справа (правило полуоткрытого интервала), `loans[(loans["disbursed_at"] >= "2026-09-01") & (loans["disbursed_at"] < "2026-10-01")]` → 361 сентябрьский кредит. `loans.query("dpd > 90 and product == 'Micro loan'")` — читаемая альтернатива для длинных условий (76 строк), внутри строки допускаются `and`/`or`.

> 💡 **Главное.** Фильтр — это два шага: построить столбец из True/False (маску), затем оставить строки с True через `[ ]`. Каждый `WHERE`, который вы писали на неделях 1–3, — это маска; `&`, `|`, `~` соединяют маски, по одной паре скобок на условие.

```game
{"type": "bug", "id": "w05d2-g1", "title": "Найдите сломанную строку", "q": "Построчно этот код должен посчитать просроченные кредиты, а затем просроченные, которые ещё активны. Одна строка вызывает ошибку.", "code": "late = loans[loans[\"dpd\"] > 0]\nactive_late = loans[loans[\"dpd\"] > 0 and loans[\"status\"] == \"active\"]\nprint(len(late), len(active_late))", "answer": [1], "why": "and работает с одиночными значениями, а не с целым столбцом: pandas вызывает ValueError: The truth value of a Series is ambiguous. Пишите (loans[\"dpd\"] > 0) & (loans[\"status\"] == \"active\") — & и скобки вокруг каждого условия."}
```

### Сортировка, новые столбцы, типы :id=sorting-new-columns-types

```python
loans.sort_values("outstanding", ascending=False).head(3)      # ORDER BY … DESC LIMIT 3 → кредиты 4597, 6478, 2936
loans.sort_values(["product", "dpd"], ascending=[True, False]) # два ключа
loans.nlargest(3, "principal")                                 # короткий путь: 2861, 4570, 4601 (599.06 / 598.45 / 597.54 млн)
loans["outstanding_bn"] = loans["outstanding"] / 1e9           # новый столбец, вычисленный сразу для каждой строки
loans["is_late"] = loans["dpd"] > 0                            # булев столбец — .sum() считает True: 399
loans["term"] = loans["term"].astype(str)                      # CAST: int → текст ('24')
loans["product"] = loans["product"].astype("category")         # текст с 5 значениями → category: 487 КБ → 8 КБ
```

Новый столбец — это `df["name"] = expression`; выражение выполняется над целыми столбцами — без цикла. `astype` — это `CAST`: `int`, `float`, `str`, `"category"` (для текста с малым числом уникальных значений: экономит память и задаёт порядок корзинам), `bool`. `pd.to_numeric(col, errors="coerce")` превращает текст в числа, а мусор — в `NaN`, вместо того чтобы падать; завтра — `to_datetime(errors="coerce")` для дат.

> ⚠️ **Осторожно.** Присваивайте через `.loc`, никогда через две пары скобок подряд. `loans[loans["dpd"] > 90]["flag"] = 1` (цепочная индексация) пишет во временную **копию** и ничего не меняет в `loans` — pandas лишь предупреждает `SettingWithCopyWarning`. Пишите `loans.loc[loans["dpd"] > 90, "flag"] = 1`. А когда отрезаете фрейм, чтобы дальше с ним работать, берите копию намеренно: `late = loans[loans["dpd"] > 0].copy()`.

### Даты: `to_datetime` и аксессор `.dt` :id=dates-to_datetime-and-the-dt-accessor

```python
loans["disbursed_at"] = pd.to_datetime(loans["disbursed_at"])   # если вы забыли parse_dates
loans["disbursed_at"].dt.year                                   # 2024 / 2025 / 2026 → value_counts: 1736 / 3041 / 3051
loans["disbursed_at"].dt.to_period("M")                          # 2026-09 — strftime('%Y-%m') с недели 3
loans["disbursed_at"].dt.quarter, loans["disbursed_at"].dt.day_name()
(pd.Timestamp("2026-10-01") - loans["disbursed_at"]).dt.days     # дней в портфеле — у активных кредитов в среднем 221
```

Когда столбец имеет тип `datetime64`, `.dt` открывает календарь: `.year`, `.month`, `.day`, `.quarter`, `.dayofweek`, `.to_period("M")`, `.strftime("%Y-%m")`. Арифметика дат даёт `Timedelta`; `.dt.days` превращает его в число. Сравнение столбца datetime со строкой `"2026-10-01"` работает — pandas разбирает строку.

### `value_counts` — GROUP BY … COUNT(*) для одного столбца :id=value_counts--the-group-by--count-of-one-column

```python
loans["status"].value_counts()                   # closed 4242 · active 3352 · written_off 190 · default 44
loans["product"].value_counts(normalize=True)    # доли: Micro 34.1 % · Consumer 30.9 · BNPL 20.0 · SME 10.0 · Auto 5.0
loans["bucket"].value_counts().sort_index()      # отсортировано по метке, а не по количеству
loans["region"].nunique()                        # 8 — COUNT(DISTINCT)
```

По умолчанию сортировка по количеству; `sort_index()` — естественный порядок; `normalize=True` — доли; `dropna=False`, чтобы увидеть NaN отдельной строкой — урок недели 2 про полосу NULL. Завтрашний `groupby` — это `value_counts` для нескольких столбцов и любого агрегата.

### Пропущенные значения: `isna`, `fillna`, `dropna` :id=missing-values-isna-fillna-dropna

```python
cust = pd.read_csv("../excel/customers_dirty.csv")
cust.isna().sum()                                     # по столбцам: monthly_income 356, остальные 0
cust["monthly_income"].mean()                         # 15 245 933 — NaN пропускается, как в SQL AVG
cust["monthly_income"].fillna(0).mean()               # 14 347 331 — неверное число, поданное уверенно
cust["monthly_income"].fillna(cust["monthly_income"].median())   # допустимая подстановка (7 895 896.5) — подпишите её
cust.dropna(subset=["monthly_income"])                # 5 684 строки: удалять только когда пропущен ИМЕННО этот столбец
```

`NaN` (*пропуск*) — это NULL в pandas: агрегаты его пропускают, сравнения с ним дают False, `==` его никогда не находит — используйте `isna()` / `notna()`. `dropna()` без аргументов удаляет строку, если пропущен *любой* столбец, — на широкой таблице это может быть большая часть файла; всегда передавайте `subset=`. `count()` даёт число непустых значений (5 684), а `len()` — число строк (6 040); разница *и есть* перепись NULL.

> 💡 **Главное.** `fillna(0)` — это решение, а не шаг очистки. Для *количества* (нет платежа → оплачено 0) оно верно; для *дохода* это ложь, которая выдумывает 356 людей с нулевым доходом и снижает среднее на 0.9 млн. Оставьте NaN и покажите полосу «неизвестно» — или заполните подписанной оценкой.

### `pd.cut` — корзины без CASE :id=pdcut--buckets-without-a-case

```python
edges  = [-1, 0, 30, 60, 90, np.inf]
labels = ["0", "1-30", "31-60", "61-90", "90+"]
loans["bucket_pd"] = pd.cut(loans["dpd"], bins=edges, labels=labels)
loans["bucket_pd"].value_counts().sort_index()        # 7429 / 124 / 25 / 16 / 234
```

`pd.cut` относит каждое значение к интервалу; интервалы по умолчанию **закрыты справа**: `(-1, 0]`, `(0, 30]`, `(30, 60]` … поэтому 30 попадает в `1-30`, а 31 — в `31-60`, в точности как `CASE WHEN dpd <= 30` на неделе 2. Первая граница должна быть *ниже* наименьшего значения (`-1`, потому что `(0, 0]` пуст); `np.inf` закрывает верх. `right=False` переключает на `[0, 5m)` — доходные диапазоны S10 недели 3, где правило — `< 5 000 000`. Результат — `category` с метками по порядку, поэтому `sort_index()` даёт 0 … 90+, а столбчатая диаграмма получается упорядоченной. `pd.qcut(x, 10)` режет на децили по количеству — `NTILE` с недели 3.

### Запись обратно :id=writing-back

```python
# (shape only — not meant to run) … только форма: summary и tiles строятся в задаче P10 и в разборе примера
summary.to_csv("portfolio_buckets.csv", index=False)                 # index=False, иначе в Excel появится безымянный первый столбец
summary.to_excel("portfolio.xlsx", sheet_name="buckets", index=False)
with pd.ExcelWriter("portfolio.xlsx") as xw:                           # несколько листов в одном файле
    tiles.to_excel(xw, sheet_name="tiles"); summary.to_excel(xw, sheet_name="buckets")
```

DataFrame возвращается в мир, в котором живёт Бекзод. `float_format="%.2f"` для десятичных, `date_format="%Y-%m-%d"` для дат в формате ISO, а сам файл — обычный CSV, который откроет кто угодно, — последнее звено перезапускаемой цепочки: CSV на входе, ноутбук, CSV на выходе. (`to_excel` нужен пакет `openpyxl`, который есть в Anaconda; на странице тренируйтесь с `to_csv`.)

### SQL ↔ Excel ↔ pandas, словарь сегодняшнего дня :id=sql--excel--pandas-todays-vocabulary

| Вы хотите | SQL (недели 1–3) | Excel (неделя 4) | pandas |
|---|---|---|---|
| таблицу | `SELECT * FROM loans` | лист / `tblLoans` | `loans = pd.read_csv(...)` |
| несколько столбцов | `SELECT loan_id, dpd` | скрыть столбцы | `loans[["loan_id", "dpd"]]` |
| фильтр | `WHERE dpd > 0 AND status = 'active'` | Фильтр / `COUNTIFS` | `loans[(loans.dpd > 0) & (loans.status == "active")]` |
| фильтр по списку | `IN ('SME', 'AUTO')` | Фильтр, отметить два | `.isin([...])` |
| поиск по тексту | `LIKE '%Tashkent%'` | `SEARCH` / Фильтр → содержит | `.str.contains("Tashkent")` |
| сортировку | `ORDER BY outstanding DESC` | Сортировка от Я до А | `.sort_values("outstanding", ascending=False)` |
| топ n | `LIMIT 3` / `TOP 3` | — | `.head(3)` / `.nlargest(3, "col")` |
| вычисляемый столбец | `principal / 1e9 AS bn` | столбец с формулой | `loans["bn"] = loans.principal / 1e9` |
| преобразовать тип | `CAST(x AS TEXT)` | `TEXT` / `VALUE` / `DATEVALUE` | `.astype(str)` / `pd.to_numeric` / `pd.to_datetime` |
| месяц даты | `strftime('%Y-%m', d)` | `TEXT(d, "yyyy-mm")` | `.dt.to_period("M")` |
| количество по значениям | `GROUP BY status` + `COUNT(*)` | `COUNTIFS` / сводная таблица | `.value_counts()` |
| число уникальных | `COUNT(DISTINCT region)` | `ROWS(UNIQUE(...))` | `.nunique()` |
| проверку на NULL | `IS NULL` | `ISBLANK` / `COUNTBLANK` | `.isna()` |
| замену NULL | `COALESCE(x, 0)` | `IF(ISBLANK(x), 0, x)` | `.fillna(0)` |
| корзины | `CASE WHEN dpd <= 30 …` | вложенный `IF` / `XLOOKUP` с приблизительным поиском | `pd.cut(dpd, edges, labels=...)` |
| сохранить | `CREATE TABLE AS` / экспорт | Сохранить как CSV | `.to_csv("f.csv", index=False)` |

Те же вопросы, те же ответы, третья запись — и единственная из трёх, которая является *файлом, который можно перезапустить на новых входных данных*.

```game
{"type": "match", "id": "w05d2-g2", "title": "SQL → pandas", "pairs": [["WHERE dpd > 0 AND status = 'active'", "loans[(loans.dpd > 0) & (loans.status == \"active\")]"], ["IN ('SME', 'AUTO')", ".isin([...])"], ["LIKE '%Tashkent%'", ".str.contains(\"Tashkent\")"], ["ORDER BY outstanding DESC", ".sort_values(\"outstanding\", ascending=False)"], ["COUNT(DISTINCT region)", ".nunique()"], ["COALESCE(x, 0)", ".fillna(0)"], ["GROUP BY status + COUNT(*)", ".value_counts()"], ["CASE WHEN dpd <= 30 …", "pd.cut(dpd, edges, labels=...)"]]}
```

### Глубже (по желанию) :id=depth-optional

**Видео (бесплатные, YouTube; каждая ссылка открывается на нужной минуте):**

- ▶ Чтение файла в DataFrame — [Complete Python Pandas Data Science Tutorial! (2025 Updated Edition) (Keith Galli), 08:25](https://youtu.be/2uvysYbKdjM?t=505&end=822)
- ▶ Выбор столбцов, loc / iloc — то же видео, [15:28](https://youtu.be/2uvysYbKdjM?t=928&end=1160)
- ▶ Сортировка — то же видео, [21:11](https://youtu.be/2uvysYbKdjM?t=1271&end=1381)
- ▶ Фильтрация (булева маска, несколько условий) — то же видео, [24:12](https://youtu.be/2uvysYbKdjM?t=1452&end=1678)
- ▶ Новые столбцы и даты (`pd.to_datetime`, `.dt`) — то же видео, [41:40](https://youtu.be/2uvysYbKdjM?t=2500&end=2798)
- ▶ Даты подробнее — [Python Pandas Tutorial (Part 10): Working with Dates and Time Series Data (Corey Schafer), 03:35](https://youtu.be/UFuo7EHI8zc?t=215)
- ▶ Пропущенные значения (isna, fillna, dropna) — Keith Galli, то же видео, [58:33](https://youtu.be/2uvysYbKdjM?t=3513&end=3845)
- ▶ Пропущенные значения (альтернатива, помедленнее) — [Python Pandas Tutorial 5: Handle Missing Data: fillna, dropna, interpolate (codebasics), 04:10](https://youtu.be/EaGbS7eWSs0?t=250&end=455)

- Русская презентация (TBC Data Analytics 2.0, если она у вас есть) `4.3_Python.pdf`: Series и DataFrame — стр. 10–15, dtypes и `astype` / `to_numeric` — стр. 14–22, чтение и запись — стр. 23–30, первый взгляд — стр. 31–37, `loc` / `iloc` / булева индексация — стр. 38–44, пропущенные значения — стр. 45–52, `.str` — стр. 55–67, категориальный тип — стр. 68–72, сортировка — стр. 104–108. (Стр. 82–103 — завтра.)
- *Английские термины:* DataFrame = датафрейм, Series = серия, index = индекс, boolean mask = булева маска, filtering = фильтрация, missing values = пропущенные значения / NaN, type casting = приведение типов, category dtype = категориальный тип, `pd.cut` = биннинг / разбиение на корзины.

```videoquiz
{"video": "2uvysYbKdjM", "stops": [
  {"at": 700, "q": "Что возвращает pd.read_csv?", "options": ["Список словарей", "DataFrame — именованные столбцы, у каждого свой тип", "Текстовую строку", "Книгу Excel"], "answer": 1, "explain": "read_csv читает заголовок как имена столбцов и угадывает тип каждого — запустите dtypes, чтобы увидеть догадки.", "back": 60},
  {"at": 1080, "q": "Чем отличаются loc и iloc?", "options": ["loc — по метке (значение индекса, имя столбца), iloc — по целочисленной позиции", "loc быстрее", "iloc работает только со столбцами", "Разницы нет"], "answer": 0, "explain": "На свежем индексе 0…n они совпадают и расходятся после фильтра или сортировки — loc для имён и условий, iloc для «первых n».", "back": 60},
  {"at": 1600, "q": "Как соединить два условия в фильтре pandas?", "options": ["cond1 and cond2", "(cond1) & (cond2)", "cond1 & cond2 без скобок", "cond1, cond2"], "answer": 1, "explain": "& | ~ и скобки вокруг каждого условия; and/or вызывают «truth value of a Series is ambiguous».", "back": 60},
  {"at": 3700, "q": "Что fillna(0) на столбце дохода делает со средним?", "options": ["Ничего — mean и так пропускает NaN", "Снижает его: каждый пропущенный доход становится нулевым", "Повышает его", "Вызывает ошибку"], "answer": 1, "explain": "mean() пропускает NaN; fillna(0) превращает их в нули, которые учитываются — 15.2 млн становятся 14.3 млн на customers_dirty.csv.", "back": 60}]}
```

```videoquiz
{"video": "UFuo7EHI8zc", "stops": [
  {"at": 400, "q": "Столбец дат прочитан как текст. Что превращает его в настоящие даты?", "options": ["astype(int)", "pd.to_datetime(col) — или parse_dates= в read_csv", "str.split('-')", "sort_values()"], "answer": 1, "explain": "Пока dtype не datetime64, .dt и арифметика дат не работают.", "back": 60},
  {"at": 650, "q": "Столбец уже datetime64. Как получить название дня недели?", "options": ["col.weekday", "col.dt.day_name()", "col.str.day()", "pd.weekday(col)"], "answer": 1, "explain": "Аксессор .dt открывает календарь: .dt.year, .dt.month, .dt.to_period(\"M\"), .dt.day_name().", "back": 60}]}
```

```videoquiz
{"video": "EaGbS7eWSs0", "stops": [
  {"at": 330, "q": "Какой вызов заменяет пропущенные значения в столбце?", "options": ["dropna()", "fillna(value)", "isna()", "notna()"], "answer": 1, "explain": "fillna вписывает значение в пропуски — решение, которое надо обосновать, а не шаг очистки.", "back": 45},
  {"at": 420, "q": "df.dropna() без аргументов удаляет…", "options": ["только строки, где пропущены все столбцы", "каждую строку, где пропущен любой столбец", "столбцы с пропусками", "ничего"], "answer": 1, "explain": "Любой пропуск в любом столбце удаляет строку — на широкой таблице это может быть большая её часть; передавайте subset= с нужным столбцом.", "back": 45}]}
```

---

## 2. Разбор примера — шесть плиток в одной функции (15 мин) :id=2-worked-example--the-six-tiles-in-one-function-15-min

Плитки Бекзода из Дня 1 недели 4, оформленные как функция от DataFrame, чтобы следующий месяц был просто `portfolio_summary(pd.read_csv("loans_status_2026-11.csv"))`:

```python
AS_OF = pd.Timestamp("2026-10-01")

def portfolio_summary(df):
    out = df["outstanding"].sum()
    in_2026 = (df["disbursed_at"] >= "2026-01-01") & (df["disbursed_at"] < AS_OF)
    return {
        "loans": len(df),
        "active": (df["status"] == "active").sum(),
        "outstanding": out,
        "disbursed_2026": in_2026.sum(),
        "par30_pct": round(100 * df.loc[df["dpd"] > 30, "outstanding"].sum() / out, 2),
        "npl90_pct": round(100 * df.loc[df["dpd"] > 90, "outstanding"].sum() / out, 2),
    }

portfolio_summary(loans)
# {'loans': 7828, 'active': 3352, 'outstanding': 208723504430, 'disbursed_2026': 3030, 'par30_pct': 3.12, 'npl90_pct': 2.55}
```

Каждая строка — это SQL-оператор, который вы уже писали: `len` — это `COUNT(*)`, `(cond).sum()` — это `SUM(CASE WHEN … THEN 1 END)`, `df.loc[mask, "col"].sum()` — это `SUM(col) WHERE mask`. Одно число отличается от плитки недели 4 намеренно: **3 030**, а не 3 051 — эта функция использует полуоткрытое `< AS_OF`, поэтому 21 кредит, выданный в сам день отчёта (852 760 000), не входит; `COUNTIFS` на неделе 4 использовал `<=`. Ни то ни другое не ошибка; докстринг функции должен сказать, какое из них выбрано.

> 💡 **Главное.** Ежемесячный ноутбук безопасен только с **assert**, фиксирующим известные значения: `assert portfolio_summary(loans)["outstanding"] == 208_723_504_430`. Если в ноябрьском файле появится новое написание статуса или дата в виде текста, assert упадёт раньше, чем Бекзод увидит неверную плитку, — `day2_starter.ipynb` фиксирует все шесть.

---

## 3. Практика (50 мин) :id=3-practice-50-min

Редактор каждой задачи уже загружает `loans_status.csv` с `parse_dates` (P9 загружает `customers_dirty.csv`). Пишите код под `# ваш код`, **▶ Run**, затем **✔ Check** — выведите число, о котором спрашивает задача. В Jupyter в `data/python/day2_starter.ipynb` есть пошаговые ячейки; добавляйте по ячейке на задачу.

**P1.** Прочитайте `loans_status.csv` *без* `parse_dates`. Какой dtype у `disbursed_at` и что делает `loans["disbursed_at"].dt.year`? Исправьте двумя способами.

```task
{"id": "w05d2-p1", "kind": "choice", "options": ["datetime64[ns] — pandas сам распознаёт даты ISO", "object (текст) — и .dt вызывает AttributeError, пока вы его не преобразуете", "int64 — даты хранятся как числа", "category — даты повторяются, и pandas их сжимает"], "answer": 1, "explain": "Без parse_dates столбец — текст: .dt вызывает AttributeError: Can only use .dt accessor with datetimelike values. Исправление: parse_dates=[\"disbursed_at\"] в read_csv или потом loans[\"disbursed_at\"] = pd.to_datetime(loans[\"disbursed_at\"]); после этого info() покажет datetime64[ns]."}
```

**P2.** Только по `describe()`: медиана principal, среднее principal, 75-й перцентиль `dpd`, максимум `dpd`. О чём говорит разрыв между средним и медианой? Введите медиану principal.

```task
{"id": "w05d2-p2", "kind": "number", "answer": 5790000, "dp": 0, "unit": "сум", "hint": "Медиана — это строка 50% в loans[\"principal\"].describe().", "model": "Медиана 5 790 000 · среднее 51 709 668 · 75-й перцентиль dpd 0 · максимум dpd 919. Среднее в девять раз больше медианы = длинный правый хвост: несколько кредитов SME/Auto несут основные деньги (вывод недели 3 о двух портфелях). У 75 % кредитов dpd = 0, так что 399 просроченных кредитов — это верхние 5 %."}
```

**P3.** Сколько кредитов просрочено (`dpd > 0`) в разрезе `status`? Какое сочетание не должно существовать, и существует ли оно?

```task
{"id": "w05d2-p3", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 14, "dp": 0, "hint": "Отфильтруйте просроченные кредиты, затем value_counts по статусу. Проверка ищет сочетание, которое выглядит невозможным.", "model": "print(loans[loans[\"dpd\"] > 0][\"status\"].value_counts())\n# written_off 190 · active 151 · default 44 · closed 14\n\n«Закрыт и просрочен» выглядит невозможным — 14 кредитов: закрыты, потому что срок последнего платежа по графику прошёл, но платёж недоплачен; неделя 2 нашла те же 14 (13 в 1–30, 1 в 31–60). Это не баг, который исправляют в pandas, — это вопрос к Севаре."}
```

**P4.** Три фильтра, три количества: SME или Auto (`isin`), principal от 10 млн до 50 млн (`between`), филиал, содержащий `Tashkent` (`str.contains`). Затем кредиты сентября 2026 по правилу полуоткрытого интервала — и покажите, что `between("2026-09-01", "2026-09-30")` здесь случайно даёт то же самое, и почему так не будет на `applied_at`.

```task
{"id": "w05d2-p4", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код — сентябрьское число выведите последним\n", "answer": 361, "dp": 0, "hint": "Проверка ищет число за сентябрь 2026: >= \"2026-09-01\" и < \"2026-10-01\", каждое в скобках, через &.", "model": "print(loans[\"product\"].isin([\"Small business loan\", \"Auto loan\"]).sum())     # 1172\nprint(loans[\"principal\"].between(10_000_000, 50_000_000).sum())                # 2087\nprint(loans[\"branch\"].str.contains(\"Tashkent\").sum())                          # 3020\nd = loans[\"disbursed_at\"]\nprint(((d >= \"2026-09-01\") & (d < \"2026-10-01\")).sum())                         # 361\nprint(d.between(\"2026-09-01\", \"2026-09-30\").sum())                             # 361\n\ndisbursed_at — чистая дата, поэтому 30-е в 00:00 включено; у applied_at есть время, и between(…, \"2026-09-30\") отбросит всё после полуночи 30-го (те самые 23 потерянные заявки с недели 1). Всегда полуоткрытый интервал."}
```

**P5.** Три кредита с наибольшим `outstanding`, только с `loan_id`, `product`, `outstanding` — один раз через `sort_values().head(3)`, один раз через `nlargest`. Затем три наибольших по `principal`.

```task
{"id": "w05d2-p5", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 4597, "dp": 0, "hint": "Проверка ищет loan_id с наибольшим остатком.", "model": "cols = [\"loan_id\", \"product\", \"outstanding\"]\nprint(loans.sort_values(\"outstanding\", ascending=False)[cols].head(3))\nprint(loans.nlargest(3, \"outstanding\")[cols])\nprint(loans.nlargest(3, \"principal\")[[\"loan_id\", \"product\", \"principal\"]])\n\nОстаток: 4597 (586 068 714) · 6478 (577 813 979) · 2936 (574 094 643), все SME. Основной долг: 2861 (599 060 000) · 4570 (598 450 000) · 4601 (597 540 000) — max_amount у SME равен 600 млн, и самые крупные кредиты упираются в него (S6 недели 3)."}
```

**P6.** Добавьте столбцы `year` и `month` из `disbursed_at`; посчитайте кредиты 2026 года по месяцам и по кварталам.

```task
{"id": "w05d2-p6", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 1086, "dp": 0, "hint": "Проверка ищет число за Q3 2026. .dt.year, .dt.month, .dt.quarter, затем value_counts().sort_index().", "model": "loans[\"year\"] = loans[\"disbursed_at\"].dt.year\nloans[\"month\"] = loans[\"disbursed_at\"].dt.month\ny26 = loans[loans[\"year\"] == 2026]\nprint(y26[\"month\"].value_counts().sort_index())\nprint(y26[\"disbursed_at\"].dt.quarter.value_counts().sort_index())\n\nМесяцы: 287 · 265 · 330 · 312 · 377 · 373 · 367 · 358 · 361 (+ 21 на 1 октября); кварталы: Q1 882 · Q2 1 062 · Q3 1 086 · Q4 21. loans[\"disbursed_at\"].dt.to_period(\"M\").value_counts().sort_index() — strftime('%Y-%m') + GROUP BY из S7 недели 3 в одной строке."}
```

**P7.** Доли через `value_counts(normalize=True)`: продукты, грейды, каналы *кредитов* (канала нет в файле — какой факт недели 3 позволяет вывести его из `product`?).

```task
{"id": "w05d2-p7", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 45.9, "dp": 1, "hint": "Проверка ищет долю канала branch в %, с одним знаком. Сопоставьте каждому продукту его канал словарём.", "model": "print(loans[\"product\"].value_counts(normalize=True).mul(100).round(1))\nprint(loans[\"grade\"].value_counts(normalize=True).mul(100).round(1))\nchannel = loans[\"product\"].map({\"Micro loan\": \"app\", \"Buy now pay later\": \"partner\",\n                                 \"Consumer loan\": \"branch\", \"Small business loan\": \"branch\", \"Auto loan\": \"branch\"})\nprint(channel.value_counts(normalize=True).mul(100).round(1))\n\nПродукты: 34.1 / 30.9 / 20.0 / 10.0 / 5.0 %; грейды: B 43.5 · C 28.9 · A 23.3 · D 4.3. Каждый канал продаёт одно семейство продуктов (S2 недели 3): app = Micro (34.1 %), partner = BNPL (20.0 %), branch = всё остальное (45.9 %) — поэтому map строит столбец канала без соединения."}
```

**P8.** `pd.cut` по `dpd` со стандартными границами; докажите, что он совпадает со столбцом `bucket` из файла для всех 7 828 строк. Затем среднее и медиана `dpd` просроченных кредитов — какая из них идёт в отчёт?

```task
{"id": "w05d2-p8", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 159, "dp": 0, "hint": "Проверка ищет медиану dpd просроченных кредитов.", "model": "edges, labels = [-1, 0, 30, 60, 90, np.inf], [\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"]\nloans[\"bucket_pd\"] = pd.cut(loans[\"dpd\"], bins=edges, labels=labels)\nprint((loans[\"bucket_pd\"].astype(str) == loans[\"bucket\"]).all())   # True\nlate = loans.loc[loans[\"dpd\"] > 0, \"dpd\"]\nprint(round(late.mean()), late.median())                              # 246 159.0\n\nastype(str) важен: сравнение category с текстом иначе даёт несовпадение типов. 234 списанных кредита с просрочкой 500–900 дней тянут среднее вверх; сообщайте медиану, а лучше — корзины."}
```

**P9.** `customers_dirty.csv`: сколько значений `monthly_income` пропущено, среднее с `fillna(0)` и без него, среднее после заполнения медианой и число строк после `dropna()` с `subset` и без.

```task
{"id": "w05d2-p9", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\ncust = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# ваш код\n", "answer": 14347331, "dp": 0, "hint": "Проверка ищет среднее после fillna(0), округлённое до сума.", "model": "inc = cust[\"monthly_income\"]\nprint(inc.isna().sum())                         # 356\nprint(round(inc.mean()))                        # 15245933\nprint(round(inc.fillna(0).mean()))              # 14347331\nprint(round(inc.fillna(inc.median()).mean()))   # 14812719\nprint(len(cust.dropna()), len(cust.dropna(subset=[\"monthly_income\"])))   # 5684 5684\n\nНули тянут среднее вниз на 0.9 млн. dropna() и dropna(subset=...) совпадают здесь только потому, что доход — единственный столбец с пропусками, — на завтрашних объединённых таблицах это везение закончится. Никогда не заполняйте доход нулём; заполняйте подписанной оценкой или оставляйте NaN и показывайте полосу «неизвестно» (S10 недели 3: 466 кредитов)."}
```

**P10.** Постройте фрейм `bucket · loans · outstanding · share_pct` (пять строк, доли от общего остатка) и запишите его в `portfolio_buckets.csv` (в Jupyter — ещё и на лист `buckets` файла `portfolio.xlsx`, затем откройте его и проверьте итог).

```task
{"id": "w05d2-p10", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 2.55, "dp": 2, "hint": "Проверка ищет долю 90+ в остатке, в % с двумя знаками.", "model": "summary = (loans.groupby(\"bucket\").agg(loans=(\"loan_id\", \"size\"), outstanding=(\"outstanding\", \"sum\"))\n                .reindex([\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"]).reset_index())\nsummary[\"share_pct\"] = (100 * summary[\"outstanding\"] / summary[\"outstanding\"].sum()).round(2)\nsummary.to_csv(\"portfolio_buckets.csv\", index=False)\nprint(summary)\n\n0 → 7 429 / 197 486 207 578 / 94.62 % · 1–30 124 / 4 729 769 899 / 2.27 · 31–60 25 / 748 610 049 / 0.36 · 61–90 16 / 439 441 377 / 0.21 · 90+ 234 / 5 319 475 527 / 2.55 — таблица S9 недели 3. value_counts даёт столбец loans; суммы — это завтрашний groupby (здесь он использован один раз). index=False, иначе на листе появится столбец 0…4, о котором Бекзод обязательно спросит. Σ остатка 208 723 504 430."}
```

> 🚀 **Со звёздочкой (по желанию, +5 XP).** **P11.** PAR30 по продуктам и по регионам, по одной строке на каждый (Σ остатка при `dpd > 30` ÷ Σ остатка, по группам — можно подсмотреть в завтрашний `groupby`). Какой регион вы бы отметили и что делает долю маленького региона хрупкой?

```task
{"id": "w05d2-p11", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 6.84, "dp": 2, "xp": 2, "hint": "Проверка ищет наибольший PAR30 по регионам, в % с двумя знаками. Сделайте столбец: остаток там, где dpd > 30, и 0 в остальных строках; затем просуммируйте оба по группам.", "model": "loans[\"out30\"] = loans[\"outstanding\"].where(loans[\"dpd\"] > 30, 0)\nfor key in [\"product\", \"region\"]:\n    g = loans.groupby(key)[[\"out30\", \"outstanding\"]].sum()\n    print((100 * g[\"out30\"] / g[\"outstanding\"]).round(2).sort_values(ascending=False))\n\nПродукт: Auto 4.44 % · Consumer 3.09 · SME 2.55 · BNPL 1.28 · Micro 0.72. Регион: Nukus 6.84 % · Bukhara 4.81 · Andijan 4.02 · Tashkent 3.38 · Samarkand 3.04 · Namangan 1.71 · Fergana 0.69 · Termez 0.68. В Nukus 492 кредита и 13.3 млрд остатка — один кредит SME на 500 млн, перешедший в 31+, двигает его PAR30 на 3.8 пункта; указывайте количество и сумму рядом с долей."}
```

### Ошибки, которые стоят балла на этой неделе :id=mistakes-that-cost-a-point-this-week

- `and` / `or` между масками или пропущенные скобки — `ValueError` или молча неверная маска.
- `loc` с позицией или `iloc` с меткой после фильтра — не та строка, без ошибки.
- Цепочная индексация (`df[mask]["col"] = …`) — присваивание попадает в копию.
- `between` по datetime с компонентом времени — потерян вечер последнего дня.
- `fillna(0)` на денежном столбце или столбце дохода — уверенно неверное среднее.
- `dropna()` без `subset` на широкой таблице — пропала половина строк.
- `pd.cut` с первой границей 0 — каждый кредит с `dpd = 0` становится `NaN`.
- `to_csv` без `index=False` — призрачный первый столбец.
- Ноутбук, в котором числа напечатаны вручную в Markdown, а не выведены кодом.

---

## 4. Самопроверка :id=4-self-check

```check
{"id": "w05d2-sc", "questions": [
  {"type": "single", "q": "loans[loans[\"dpd\"] > 0 & loans[\"status\"] == \"active\"] вызывает ошибку. Как исправить?", "options": ["Заменить & на and", "Взять каждое условие в скобки: (loans[\"dpd\"] > 0) & (loans[\"status\"] == \"active\")", "Преобразовать dpd в int", "Использовать iloc"], "answer": 1, "explain": "& связывает сильнее, чем > и ==, поэтому сначала вычисляется 0 & loans[\"status\"]; по паре скобок на условие (→ раздел 1, «Фильтрация»)."},
  {"type": "single", "q": "После late = loans[loans[\"dpd\"] > 0] почему late.loc[0] может упасть, а late.iloc[0] работает?", "options": ["loc работает только со столбцами", "loc ищет МЕТКУ индекса 0, а она принадлежала непросроченному кредиту; iloc берёт ПОЗИЦИЮ 0", "iloc быстрее", "Фильтр сбросил индекс"], "answer": 1, "explain": "Фильтр сохраняет исходные метки; reset_index(drop=True) снова совмещает позиции и метки (→ раздел 1, «loc и iloc»)."},
  {"type": "single", "q": "pd.cut(loans[\"dpd\"], [0, 30, 60, 90, np.inf]) даёт 7 429 NaN. Почему?", "options": ["np.inf нельзя использовать", "Интервалы закрыты справа: первый — (0, 30], он не содержит 0; начинайте границы с -1", "dpd — это текст", "pd.cut нужен labels="], "answer": 1, "explain": "Первая граница должна быть ниже наименьшего значения (→ раздел 1, «pd.cut»)."},
  {"type": "single", "q": "loans[loans[\"dpd\"] > 90][\"flag\"] = 1 выполняется лишь с предупреждением, но столбца flag в loans потом нет. Почему?", "options": ["flag — зарезервированное слово", "Цепочная индексация: первые [ ] возвращают копию, и присваивание попадает в неё — пишите loans.loc[loans[\"dpd\"] > 90, \"flag\"] = 1", "Маска пустая", "pandas нужен inplace=True"], "answer": 1, "explain": "Присваивайте через .loc — маска и столбец в одном вызове (→ раздел 1, «Сортировка, новые столбцы, типы»)."}
]}
```

---

## 5. Уголок компании <span class="badge company">Корзины и PAR в pandas</span> :id=5-company-corner-buckets-and-par-in-pandas

Три показателя риска портфеля из `loans_status.csv`, каждый — одна строка, когда словарь освоен:

```python
edges, labels = [-1, 0, 30, 60, 90, np.inf], ["0", "1-30", "31-60", "61-90", "90+"]
loans["bucket_pd"] = pd.cut(loans["dpd"], bins=edges, labels=labels)
buckets = loans["bucket_pd"].value_counts().sort_index()              # 7429 · 124 · 25 · 16 · 234

total = loans["outstanding"].sum()                                    # 208 723 504 430
par30 = loans.loc[loans["dpd"] > 30, "outstanding"].sum() / total     # 6 507 526 953 / total = 3.12 %
npl90 = loans.loc[loans["dpd"] > 90, "outstanding"].sum() / total     # 5 319 475 527 / total = 2.55 %
```

```game
{"type": "build", "id": "w05d2-g3", "title": "Соберите PAR30", "q": "Соберите PAR30: остаток по кредитам с просрочкой больше 30 дней ÷ общий остаток.", "tokens": ["loans.loc[", "loans[\"dpd\"] > 30", ",", "\"outstanding\"", "].sum()", "/", "loans[\"outstanding\"].sum()"], "distractors": ["loans[\"dpd\"] > 0", "len(loans)"]}
```

**Корзины DPD** (*DPD buckets*): пять стандартных меток, **закрытых справа**, так что 30-й день — ещё ранняя просрочка, а 31-й — первый день следующей корзины, — определение из глоссария и значение `pd.cut` по умолчанию; компания, использующая 1–7 / 8–30, меняет `edges`, и больше ничего. **PAR30** (*portfolio at risk*, портфель под риском) = остаток долга по кредитам с `dpd > 30` ÷ общий остаток: 3.12 % — 275 кредитов в 31+ держат 6.51 млрд из 208.7 млрд. **NPL90** = то же при `dpd > 90`: 2.55 %, 5.32 млрд на 234 кредитах (44 в дефолте, 190 списано).

> 💡 **Главное.** В числителе PAR30 стоит **весь остаток долга** кредита, а не просроченные платежи — кредит SME на 500 млн с просрочкой в один день сверх 30 вносит все 500 млн в PAR30. Поэтому PAR — это *портфельный* показатель и поэтому комитет Нилуфар следит за *количеством* кредитов в корзинах рядом с ним.

Функция `portfolio_summary(df)` (раздел 2) возвращает шесть плиток — кредитов 7 828 · активных 3 352 · остаток 208 723 504 430 · выдано в 2026 — 3 030 · PAR30 3.12 · NPL90 2.55 — а `buckets` — пять строк; `to_excel` кладёт оба на лист Бекзода. Три проверки перед выпуском, в виде assert-ов в ноутбуке: `len(df) == df["loan_id"].nunique()` (зерно: одна строка на кредит), `(df["bucket_pd"].astype(str) == df["bucket"]).all()` (наша нарезка совпадает с корзиной из выгрузки) и `abs(par30 - 0.0312) < 0.0001` против SQL. Когда ноябрьский файл нарушит одну из них, ноутбук остановится на красной ячейке вместо неверной плитки — именно то свойство, которое просил Бекзод.

Два определения, которые похожи на PAR30, но им не являются: **PAR30 по количеству** (275 / 7 828 = 3.5 % кредитов) — другое, меньшее число, которое иногда называют, когда число по портфелю выглядит плохо; и **просрочка ÷ остаток** (7.65 млрд просроченных платежей / 208.7 млрд = 3.7 %) — *коэффициент просрочки* (*arrears ratio*). Напишите в сноске плитки «PAR30 = остаток по кредитам > 30 DPD ÷ общий остаток», и эти три перестанут путать.

> 🎯 **Версия для собеседования.** *«Посчитайте PAR30 в pandas по таблице уровня кредитов.»* — `df.loc[df.dpd > 30, "outstanding"].sum() / df.outstanding.sum()`; корзины через `pd.cut`, закрытые справа, первая граница ниже нуля; скажите, что в числителе остаток всего кредита; проверьте зерно (одна строка на кредит) и итог против хранилища, прежде чем делить.

**Скажите это как на собеседовании.** Ответьте на вопрос выше своими словами, как сказали бы вслух, с цифрами Nur Finance.

```task
{"id": "w05d2-int", "kind": "free", "min": 30, "model": "Сначала я проверяю зерно: одна строка на кредит, то есть len(df) равен числу уникальных loan_id, а общий остаток совпадает с хранилищем — 208.7 млрд в Nur Finance. PAR30 — это остаток по кредитам с просрочкой больше 30 дней, делённый на общий остаток: df.loc[df.dpd > 30, \"outstanding\"].sum() / df.outstanding.sum(), здесь это 3.12 %. В числителе весь остаток кредита, а не просроченные платежи — это был бы коэффициент просрочки, 3.7 %, — а доля по количеству (3.5 % кредитов) — третье, другое число. Для корзин я использую pd.cut с границами, закрытыми справа и начинающимися с -1, чтобы 30 дней оставались в 1–30, а dpd = 0 не терялся.", "rubric": ["Даёт формулу: остаток при dpd > 30 ÷ общий остаток", "Говорит, что в числителе весь остаток кредита (не просроченная сумма и не количество)", "Проверяет зерно / сверяет итог перед делением", "Упоминает корзины pd.cut с правильными границами или называет 3.12 %"]}
```

Завтра: `groupby`, `merge` и два грязных файла Нилуфар, очищенные в pandas, — 40 дублей людей и 25 дублей платежей, в последний раз.

---

## Тест дня :id=day-quiz

Для завершения дня нужно набрать 80 %. Пересдавать можно сколько угодно.

```quiz
{"id": "w05d2", "pass": 0.8, "questions": [
  {"type": "single", "q": "У кредита с меткой индекса 0 dpd = 0. Что делает вторая строка?", "code": "late = loans[loans[\"dpd\"] > 0]\nlate.loc[0]", "options": ["Возвращает пустую Series", "Возвращает первый просроченный кредит", "Всё равно возвращает кредит 0", "Вызывает KeyError — метки 0 нет в late"], "answer": 3, "explain": "loc выбирает по метке, iloc — по позиции; после фильтра они расходятся — late.iloc[0] это «первый просроченный кредит» (→ раздел 1, «loc и iloc»)."},
  {"type": "single", "q": "Эта строка вызывает ошибку. Как её исправить?", "code": "loans[loans[\"dpd\"] > 0 & loans[\"status\"] == \"active\"]", "options": ["Написать and вместо &", "Взять каждое условие в скобки: (loans[\"dpd\"] > 0) & (loans[\"status\"] == \"active\")", "Сначала преобразовать dpd в int", "Использовать loans.iloc вместо этого"], "answer": 1, "explain": "& связывает сильнее, чем > и ==, поэтому каждому условию нужны свои скобки; and / or не работают на целой Series (→ раздел 1, «Фильтрация»)."},
  {"type": "single", "q": "Что происходит с 7 429 кредитами с dpd = 0?", "code": "pd.cut(loans[\"dpd\"], bins=[0, 30, 60, 90, np.inf])", "options": ["pd.cut вызывает ошибку", "Они становятся NaN — интервалы закрыты справа, и (0, 30] не содержит 0", "Они попадают в (0, 30]", "pd.cut создаёт для них корзину '0'"], "answer": 1, "explain": "Первая граница должна быть ниже наименьшего значения (-1 для DPD); np.inf закрывает верх (→ раздел 1, «pd.cut»)."},
  {"type": "number", "q": "Что даёт этот код на loans_status.csv, в % с двумя знаками после запятой?", "code": "100 * loans.loc[loans[\"dpd\"] > 30, \"outstanding\"].sum() / loans[\"outstanding\"].sum()", "answer": 3.12, "tol": 0.01, "explain": "Остаток по кредитам с dpd > 30 ÷ общий остаток = 6.51 млрд из 208.7 млрд = PAR30 (→ Уголок компании)."},
  {"type": "multi", "q": "Какие утверждения о пропущенных значениях в pandas верны?", "options": ["fillna(0) для monthly_income даёт заниженное, неверное среднее", "mean() пропускает NaN, как AVG в SQL", "dropna() без subset= удаляет строку, если пропущен любой столбец", "col == np.nan находит пропущенные строки", "count() считает все строки, включая NaN"], "answer": [0, 1, 2], "explain": "NaN — это NULL в pandas: агрегаты его пропускают, == его никогда не находит (используйте isna()), а fillna(0) для дохода — это решение, которое выдумывает нулевых заёмщиков (→ раздел 1, «Пропущенные значения»)."},
  {"type": "single", "q": "Вы считаете сентябрьские заявки по applied_at, где хранятся дата и время. Какой фильтр верный?", "options": ["applied_at <= \"2026-09-30\"", "applied_at.between(\"2026-09-01\", \"2026-09-30\")", "(applied_at >= \"2026-09-01\") & (applied_at < \"2026-10-01\")", "applied_at.dt.month == 9"], "answer": 2, "explain": "between включает границы, а \"2026-09-30\" означает полночь, поэтому вечер 30-го теряется; dt.month == 9 к тому же захватывает сентябрь 2025. Всегда полуоткрытый интервал (→ раздел 1, «Фильтрация», P4)."},
  {"type": "single", "q": "portfolio_summary насчитывает 3 030 кредитов, выданных в 2026 году; плитка недели 4 показывала 3 051. Почему?", "options": ["parse_dates сдвигает каждую дату на день", "Функция использует < AS_OF, поэтому 21 кредит, выданный в сам день 1 октября, не входит", "pandas отбрасывает строки с датами NaN", "На неделе 4 посчитали дубли кредитов"], "answer": 1, "explain": "Полуоткрытое < AS_OF исключает день отчёта; ни одна из конвенций не ошибочна, но в докстринге нужно указать, какая выбрана (→ раздел 2)."},
  {"type": "single", "q": "Уголок компании: что стоит в числителе PAR30?", "options": ["Весь остаток долга по кредитам с dpd > 30", "Количество кредитов с dpd > 30", "Остаток только по кредитам в корзине 31-60", "Просроченные платежи по кредитам с просрочкой более 30 дней"], "answer": 0, "explain": "Кредит на 500 млн с просрочкой в один день сверх 30 вносит все 500 млн в PAR30; просрочка ÷ остаток — это коэффициент просрочки, а доля по количеству — другое число (→ Уголок компании)."}
]}
```

<!-- challenge:start -->

---

## Задача дня :id=daily-challenge

Бонус для любознательных: один более сложный вопрос по теме сегодняшнего дня. Решите его за XP, которые растут вместе с серией задач, — полная неделя из пяти ещё и добавляет 10 % к пятничному ваучеру.

```challenge
{"id": "w05d2", "q": "Бекзод спрашивает, стареют ли кредиты прошлого года хуже, чем портфель в целом. По data/excel/loans_status.csv возьмите только кредиты, выданные в календарном 2025 году, и посчитайте их PAR30 (остаток по кредитам с dpd > 30 ÷ их общий остаток). Дайте процент с точностью до 3 знаков.", "type": "number", "dp": 3, "python": true, "h": ["b3243ebce8f6158f049b7eba"], "hint": "Сначала отрежьте фрейм до кредитов 2025 года по правилу полуоткрытых дат; затем это PAR30 в одну строку из уголка компании на этом меньшем фрейме — обе суммы из одного и того же фрейма.", "sol": "bG9hbnMgPSBwZC5yZWFkX2NzdigiLi4vZXhjZWwvbG9hbnNfc3RhdHVzLmNzdiIsIHBhcnNlX2RhdGVzPVsiZGlzYnVyc2VkX2F0Il0pCnYyNSA9IGxvYW5zWyhsb2Fuc1siZGlzYnVyc2VkX2F0Il0gPj0gIjIwMjUtMDEtMDEiKSAmIChsb2Fuc1siZGlzYnVyc2VkX2F0Il0gPCAiMjAyNi0wMS0wMSIpXQpsZW4odjI1KSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIDMwNDEKdG90YWwgPSB2MjVbIm91dHN0YW5kaW5nIl0uc3VtKCkgICAgICAgICAgICAgIyA2MyA5NjYgNTYyIDMyMgpwYXIzMCA9IHYyNS5sb2NbdjI1WyJkcGQiXSA+IDMwLCAib3V0c3RhbmRpbmciXS5zdW0oKSAvIHRvdGFsCnJvdW5kKDEwMCAqIHBhcjMwLCAzKSAgICAgICAgICAgICAgICAgICAgICAgICMgNC42MzgKCjQuNjM4ICU6IHRoZSAyMDI1IGxvYW5zIGhvbGQgNjQuMCBibiBvZiBvdXRzdGFuZGluZyBhbmQgNC42ICUgb2YgaXQgc2l0cyBpbiBsb2FucyBtb3JlIHRoYW4gMzAgZGF5cyBsYXRlIOKAlCB3ZWxsIGFib3ZlIHRoZSB3aG9sZSBib29rJ3MgMy4xMiAlLgpUaGUgdHJhcCBpcyB0aGUgZGVub21pbmF0b3I6IGRpdmlkaW5nIGJ5IHRoZSB3aG9sZSBib29rJ3MgMjA4LjcgYm4gZ2l2ZXMgMS40MiAlLCBhIHNoYXJlIG9mIHRoZSBwb3J0Zm9saW8sIG5vdCB0aGUgdmludGFnZSdzIG93biBQQVIzMC4KVGhlIDIwMjYgbG9hbnMgcnVuIGF0IDIuMzQgJSwgcGFydGx5IGJlY2F1c2UgdGhleSBhcmUgeW91bmcg4oCUIGEgbG9hbiBjYW5ub3QgYmUgMzEgZGF5cyBsYXRlIGJlZm9yZSBpdHMgZmlyc3QgZHVlIGRhdGUgaGFzIHBhc3NlZCwgc28gY29tcGFyZSB2aW50YWdlcyBhdCB0aGUgc2FtZSBhZ2UgKHRoZSB2aW50YWdlIGN1cnZlLCBEYXkgNCku"}
```

<!-- challenge:end -->
