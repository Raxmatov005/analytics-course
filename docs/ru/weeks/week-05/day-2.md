# Неделя 5 · День 2 — pandas I: DataFrame — таблица, с которой можно разговаривать

<span class="badge">Теория 60 мин</span> <span class="badge">Разбор примера 15 мин</span> <span class="badge">Практика 50 мин</span> <span class="badge company">Уголок компании</span>

> STORY **Вторник, 9:10.** Бекзод, портфельный менеджер, с открытым Excel прошлой недели и новой тревогой. *«Одностраничник сработал. Потом пришла октябрьская выгрузка, и я два часа перевставлял данные, а одна сводная таблица смотрела на старый диапазон. Жасур говорит, что вы можете дать мне **те же цифры портфеля, что на неделе 4, в ноутбуке, который я перезапускаю каждый месяц**: кладу новый `loans_status.csv`, нажимаю одну кнопку — и получаю шесть плиток и корзины. Те же цифры, что в SQL — 208.7 млрд, 3.12 %, 7 429 / 124 / 25 / 16 / 234 — иначе Тимур не подпишет.»*

## Сегодня в 3 строках :id=today-in-3-lines

- **pandas** (*библиотека pandas*) превращает CSV в **DataFrame** — таблицу с именованными столбцами и типизированными значениями, — и у каждого SQL-оператора, который вы знаете, есть однострочная запись в pandas: `WHERE` — это булева маска, `ORDER BY` — это `sort_values`, `SELECT` — это `[ ]` / `.loc`, `CASE` для корзин — это `pd.cut`.
- Вы учите набор для первого взгляда на данные (`head`, `shape`, `info`, `describe`, `dtypes`), фильтрацию (`&`, `|`, `~`, `isin`, `between`, `str.contains`), новые столбцы, `astype`, `to_datetime` и `.dt`, `value_counts`, `isna` / `fillna` / `dropna` и запись результатов обратно (`to_csv`, `to_excel`).
- Ноутбук Бекзода готов: `portfolio_summary(df)` возвращает шесть плиток, `pd.cut` возвращает корзины, и оба результата совпадают с неделей 3 до сума.

---

## 1. Теория — одна таблица, одна переменная :id=1-learn--one-table-one-variable

У каждого понятия ниже одни и те же пять частей: что это, как пишется (блок, который можно запустить), когда применять, ловушка и маленькое задание. Запускайте блоки сверху вниз: первый блок читает таблицу `loans`, и все следующие её используют. Те же ячейки есть в `data/python/day2_starter.ipynb`, если вы работаете в Jupyter.

### Series и DataFrame — два объекта pandas :id=series-and-dataframe--the-two-objects-of-pandas

**Что это.** **pandas** (*pandas library*) хранит таблицу в **DataFrame** (*DataFrame*, датафрейм): именованные столбцы, один тип на столбец и **индекс** (*index*) — метка для каждой строки. Один столбец сам по себе — это **Series** (*Series*, серия): список значений с тем же индексом.

**Как пишется.** Первый блок загружает библиотеки и таблицу кредитов; затем — DataFrame из трёх строк, собранный вручную из словаря столбцов:

```python
import pandas as pd
import numpy as np
loans = pd.read_csv("../excel/loans_status.csv", parse_dates=["disbursed_at"])   # таблица, которую используют все блоки ниже

small = pd.DataFrame({"loan_id": [1, 2, 3],
                      "product": ["Consumer loan", "Consumer loan", "Micro loan"],
                      "principal": [31_150_000, 40_060_000, 1_590_000]})
small
```

| (индекс) | loan_id | product | principal |
|---|---|---|---|
| 0 | 1 | Consumer loan | 31150000 |
| 1 | 2 | Consumer loan | 40060000 |
| 2 | 3 | Micro loan | 1590000 |

Три строки, три столбца. Первый столбец 0 · 1 · 2, который выглядит жирным, — это индекс: метки строк, а не данные.

```python
col = small["principal"]                       # один столбец → Series
print(type(small).__name__, type(col).__name__)
print(col.sum(), col.max(), small.columns.tolist(), small.index.tolist())
```

```text
DataFrame Series
72800000 40060000 ['loan_id', 'product', 'principal'] [0, 1, 2]
```

Столбец — это Series: в сумме он даёт 72 800 000, а его наибольшее значение — 40 060 000 кредита 2. По одному вызову метода, без цикла.

| День 1 (обычный Python) | pandas |
|---|---|
| список значений | **Series** — список с индексом |
| словарь списков | **DataFrame** — словарь Series с одним общим индексом |
| `for` + `total += x` | `col.sum()` — цикл работает внутри pandas |

**Когда применять.**
- DataFrame — для любой таблицы: файла, результата запроса, сводки, которую вы строите.
- Series — для одного столбца, одной строки или результата подсчёта.

> ⚠️ **Осторожно.** Индекс — не столбец. Это метка, которая остаётся со строкой при фильтрации и сортировке, — поэтому после фильтра метки 0 может уже не быть. Раздел *loc и iloc* ниже показывает, где это кусается.

**Ваша очередь.** Соберите DataFrame из пяти корзин DPD и количества кредитов в них и выведите общее число кредитов.

```task
{"id": "w05d2-l1", "kind": "python", "starter": "import pandas as pd\n\n# ваш код: DataFrame со столбцом bucket (\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\")\n# и столбцом loans (7429, 124, 25, 16, 234); затем выведите сумму loans\n", "answer": 7828, "dp": 0, "hint": "pd.DataFrame({\"bucket\": [...], \"loans\": [...]}), затем b[\"loans\"].sum().", "model": "b = pd.DataFrame({\"bucket\": [\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"],\n                  \"loans\": [7429, 124, 25, 16, 234]})\nprint(b[\"loans\"].sum())     # 7828\n\nКаждый кредит лежит ровно в одной корзине, поэтому количества складываются в 7 828 кредитов портфеля."}
```

### read_csv — файл в DataFrame (parse_dates, dtype) :id=read_csv--a-file-into-a-dataframe-parse_dates-dtype

**Что это.** `pd.read_csv(path)` читает CSV в DataFrame. Строку заголовка он берёт как имена столбцов и **угадывает тип** (*dtype*) каждого столбца: целые числа → `int64`, дробные → `float64`, всё остальное → `object` (текст). Два параметра исправляют догадку: `parse_dates=[…]` делает столбцы дат настоящими датами, `dtype={…}` задаёт тип принудительно.

**Как пишется.**

```python
raw = pd.read_csv("../excel/loans_status.csv")                       # без parse_dates
print(raw["disbursed_at"].dtype, loans["disbursed_at"].dtype)
cust = pd.read_csv("../excel/customers_dirty.csv")
print(cust["phone"].dtype, cust["phone"][0], cust["monthly_income"].dtype)
cust_txt = pd.read_csv("../excel/customers_dirty.csv", dtype={"phone": str})
print(cust_txt["phone"].dtype, cust_txt["phone"][0])
```

| столбец | догадка по умолчанию | с параметром |
|---|---|---|
| `disbursed_at` | `object` — текст | `datetime64[ns]` с `parse_dates=["disbursed_at"]` |
| `phone` | `int64` — `998902031105`, `+` потерян | `object` — `"+998902031105"` с `dtype={"phone": str}` |
| `monthly_income` | `float64` — целые числа, но 356 пропусков | (пропуск — это `NaN`, а `NaN` — число float) |

Дата приходит текстом, пока вы не попросите даты; телефон становится числом 998 902 031 105 и теряет `+`, пока вы не попросите текст.

Другие параметры, которые понадобятся:

| параметр | что делает | пример |
|---|---|---|
| `sep=";"` | другой разделитель | европейские CSV |
| `decimal=","` | запятая как десятичный знак | `"3,12"` → 3.12 |
| `usecols=[…]` | загрузить только эти столбцы | 5 столбцов из 50 |
| `nrows=1000` | загрузить только первые строки | взглянуть на огромный файл |
| `pd.read_excel(path, sheet_name="Loans")` | то же для Excel | книга недели 4 |

**Когда применять.**
- В начале каждого ноутбука: по одному `read_csv` на входной файл, со своим `parse_dates`.
- Всегда, когда id, телефон или код должен сохранить ведущий `+` или `0`: `dtype=str`.

> ⚠️ **Осторожно.** Столбец целых чисел с единственным пропуском становится `float64`, потому что `NaN` — это float: `monthly_income` печатается как `3894708.0`. Запускайте `dtypes`, прежде чем доверять столбцу.

**Ваша очередь.** Прочитайте только три столбца `customers_dirty.csv` и сохраните телефон текстом.

```task
{"id": "w05d2-l2", "kind": "python", "starter": "import pandas as pd\n\n# ваш код: прочитайте ../excel/customers_dirty.csv с usecols=[\"customer_id\", \"phone\", \"monthly_income\"]\n# и dtype={\"phone\": str}; выведите shape и dtypes\n", "answer": 6040, "dp": 0, "hint": "pd.read_csv(path, usecols=[...], dtype={\"phone\": str}); затем .shape и .dtypes.", "model": "c3 = pd.read_csv(\"../excel/customers_dirty.csv\", usecols=[\"customer_id\", \"phone\", \"monthly_income\"], dtype={\"phone\": str})\nprint(c3.shape)      # (6040, 3)\nprint(c3.dtypes)     # customer_id int64 · phone object · monthly_income float64\n\n6 040 строк, 3 столбца; телефон сохраняет свой +."}
```

### Первый взгляд — shape, head, info, describe :id=first-look--shape-head-info-describe

**Что это.** Пять вызовов, которые вы запускаете на каждой новой таблице до любого анализа: `shape` (строки, столбцы), `head()` (первые строки), `dtypes` и `info()` (тип и число непустых значений по каждому столбцу — перепись NULL), `describe()` (количество, среднее, разброс и квартили каждого числового столбца).

**Как пишется.**

```python
print(loans.shape)       # (строки, столбцы)
loans.head()             # первые 5 строк; head(10) — десять, tail() — последние 5
```

`(7828, 13)`, затем (7 из 13 столбцов):

| (индекс) | loan_id | product | disbursed_at | principal | status | outstanding | dpd |
|---|---|---|---|---|---|---|---|
| 0 | 1 | Consumer loan | 2025-03-28 | 31150000 | active | 9593064 | 0 |
| 1 | 2 | Consumer loan | 2025-12-05 | 40060000 | active | 22246389 | 0 |
| 2 | 3 | Micro loan | 2026-03-28 | 1590000 | closed | 0 | 0 |
| 3 | 4 | Micro loan | 2026-08-23 | 2520000 | active | 1708700 | 0 |
| 4 | 5 | Small business loan | 2024-05-22 | 25590000 | active | 7498297 | 0 |

7 828 строк и 13 столбцов — одна строка на кредит, это зерно выгрузки.

```python
loans.info()             # dtype и число непустых значений по каждому столбцу
```

```text
RangeIndex: 7828 entries, 0 to 7827
 #   Column        Non-Null Count  Dtype
 0   loan_id       7828 non-null   int64
 1   customer      7828 non-null   object
 6   disbursed_at  7828 non-null   datetime64[ns]
 7   principal     7828 non-null   int64
 12  bucket        7828 non-null   object
dtypes: datetime64[ns](1), int64(5), object(7)
```

(показаны пять из 13 строк.) В каждом столбце 7 828 непустых значений: в этой выгрузке пропусков нет. Пять столбцов — целые числа, один — дата, семь — текст.

```python
loans.describe()         # числовые столбцы: count, mean, std, min, квартили, max
```

| | principal | outstanding | dpd |
|---|---|---|---|
| count | 7 828 | 7 828 | 7 828 |
| mean | 51 709 668 | 26 663 708 | 12.6 |
| 25% | 2 880 000 | 0 | 0 |
| 50% (медиана) | 5 790 000 | 0 | 0 |
| 75% | 34 712 500 | 7 552 471 | 0 |
| max | 599 060 000 | 586 068 714 | 919 |

(три столбца, `std` и `min` опущены.) Средний principal — 51.7 млн, а медиана — 5.79 млн: большинство кредитов маленькие, а несколько — очень большие; два портфеля недели 3 в одной строке. У трёх кредитов из четырёх `dpd = 0`; худший просрочен на 919 дней.

`describe(include="object")` делает то же для текста: число разных значений, самое частое и сколько раз оно встречается. `loans["product"].nunique()` — это `COUNT(DISTINCT product)`, 5.

**Когда применять.**
- На каждом новом файле, до любого фильтра: верно ли зерно, верны ли типы, где пропуски?
- `describe()` — чтобы увидеть форму числа: перекос, выбросы, невозможные значения.

> ⚠️ **Осторожно.** `head()` показывает только начало файла, а оно часто самое чистое. Пропуски ищите через `info()`, крайние значения — через `describe()`: проблемы живут в середине и на краях.

**Ваша очередь.** Выведите число строк и столбцов и наибольший `dpd`.

```task
{"id": "w05d2-l3", "kind": "python", "starter": "import pandas as pd\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код: shape, затем максимальный dpd\n", "answer": 919, "dp": 0, "hint": "lo.shape, затем lo[\"dpd\"].max() — или прочитайте строку max в lo.describe().", "model": "print(lo.shape)            # (7828, 13)\nprint(lo[\"dpd\"].max())     # 919\n\n919 дней — списанный Micro-кредит, просроченный больше чем на два с половиной года."}
```

### Выбор столбцов — одни скобки или двойные :id=selecting-columns--one-bracket-or-two

**Что это.** `df["name"]` с **одной** парой скобок возвращает один столбец как **Series**. `df[["a", "b"]]` с **двумя** парами — список имён внутри скобок — возвращает **DataFrame** с этими столбцами в этом порядке. Это `SELECT loan_id, product, dpd`.

**Как пишется.**

```python
print(type(loans["product"]).__name__)             # один столбец → Series
loans[["loan_id", "product", "dpd"]].head(3)        # список столбцов → DataFrame
```

| (индекс) | loan_id | product | dpd |
|---|---|---|---|
| 0 | 1 | Consumer loan | 0 |
| 1 | 2 | Consumer loan | 0 |
| 2 | 3 | Micro loan | 0 |

Первая строка печатает `Series`; вторая возвращает таблицу из трёх столбцов — те же 7 828 строк, только названные столбцы.

Ещё способы: `loans.columns.tolist()` — список имён; `loans.drop(columns=["customer"])` — без одного столбца; `loans.rename(columns={"dpd": "days_past_due"})` — переименовать. `loans.product` (через точку) тоже работает для простых имён, но не для имён с пробелами или совпадающих с методом — скобки работают всегда.

| вы пишете | вы получаете |
|---|---|
| `loans["dpd"]` | Series — один столбец |
| `loans[["dpd"]]` | DataFrame с одним столбцом |
| `loans[["loan_id", "dpd"]]` | DataFrame с двумя столбцами |

**Когда применять.**
- Перед тем как показать или сохранить таблицу: оставьте только столбцы, нужные читателю.
- Один столбец как Series для расчёта: `loans["outstanding"].sum()`.

> ⚠️ **Осторожно.** `loans["loan_id", "dpd"]` — два имени в *одной* паре скобок — вызывает `KeyError: ('loan_id', 'dpd')`: pandas ищет один столбец с таким составным именем. Списку столбцов нужны свои скобки: `loans[["loan_id", "dpd"]]`.

**Ваша очередь.** Какая строка возвращает DataFrame со столбцами `customer` и `outstanding`?

```task
{"id": "w05d2-l4", "kind": "choice", "options": ["loans[\"customer\", \"outstanding\"]", "loans[[\"customer\", \"outstanding\"]]", "loans(\"customer\", \"outstanding\")", "loans[\"customer\"][\"outstanding\"]"], "answer": 1, "explain": "Список имён — [\"customer\", \"outstanding\"] — внутри скобок выбора. Одна пара скобок с двумя именами вызывает KeyError; круглые скобки вызывают фрейм как функцию."}
```

### Выбор строк — булева маска (&, |, ~, isin, between, str.contains) :id=selecting-rows--the-boolean-mask----isin-between-strcontains

**Что это.** Сравнение по столбцу, `loans["dpd"] > 0`, возвращает **булеву маску** (*boolean mask*): Series из `True` / `False`, по одному на строку. `loans[mask]` оставляет строки, где маска `True`. Каждый `WHERE`, который вы писали на неделях 1–3, — это маска. Маски соединяются через `&` (и), `|` (или) и `~` (не).

```pic
{"id": "w05d2-pic1", "title": "Маска — столбец True/False; [ ] оставляет строки с True", "caption": "`mask = loans[\"dpd\"] > 0` даёт по одному True или False на строку. `loans[mask]` оставляет строки с True (зелёные) и отбрасывает остальные; оставшиеся строки сохраняют метки индекса 277, 280, 281. Проходят 399 из 7 828 кредитов.", "tables": [{"id": "src", "name": "loans", "cols": ["(index)", "loan_id", "dpd", "mask"], "rows": [[277, 282, 79, "True"], [278, 283, 0, "False"], [279, 284, 0, "False"], [280, 285, 11, "True"], [281, 286, 379, "True"], [282, 287, 0, "False"]], "new": ["mask"], "keep": [0, 3, 4], "drop": [1, 2, 5], "more": "… всего 7 828 строк"}, {"id": "res", "name": "loans[mask]", "cols": ["(index)", "loan_id", "dpd"], "rows": [[277, 282, 79], [280, 285, 11], [281, 286, 379]], "via": "loans[mask]", "more": "… всего 399 строк"}]}
```

**Как пишется.**

```python
mask = loans["dpd"] > 90                       # по одному True/False на строку
print(mask.sum())                              # True считается как 1: сколько строк проходит
loans[mask][["loan_id", "product", "dpd", "status"]].head(3)
```

| (индекс) | loan_id | product | dpd | status |
|---|---|---|---|---|
| 20 | 22 | Micro loan | 627 | written_off |
| 85 | 88 | Buy now pay later | 422 | written_off |
| 125 | 128 | Consumer loan | 405 | written_off |

234 кредита просрочены больше чем на 90 дней; первые три в файле все списаны, а их метки индекса (20, 85, 125) — те, что были у них в `loans`.

Остальные фильтры, каждый с числом строк на `loans_status.csv`:

```python
active      = loans[loans["status"] == "active"]                                # WHERE status = 'active'
late_active = loans[(loans["dpd"] > 0) & (loans["status"] == "active")]         # AND — скобки вокруг каждого условия
big         = loans[loans["product"].isin(["Small business loan", "Auto loan"])] # IN (…)
mid         = loans[loans["principal"].between(10_000_000, 50_000_000)]          # BETWEEN, оба конца включены
tash        = loans[loans["branch"].str.contains("Tashkent")]                    # LIKE '%Tashkent%'
not_closed  = loans[~(loans["status"] == "closed")]                              # NOT
either      = loans[(loans["dpd"] > 90) | (loans["status"] == "written_off")]   # OR
sept        = loans[(loans["disbursed_at"] >= "2026-09-01") & (loans["disbursed_at"] < "2026-10-01")]   # полуоткрытый период
[len(x) for x in [active, late_active, big, mid, tash, not_closed, either, sept]]
```

| SQL | pandas | строк |
|---|---|---|
| `WHERE status = 'active'` | `loans["status"] == "active"` | 3 352 |
| `… AND …` | `(loans["dpd"] > 0) & (loans["status"] == "active")` | 151 |
| `IN ('SME', 'AUTO')` | `loans["product"].isin([…])` | 1 172 |
| `BETWEEN 10 млн AND 50 млн` | `loans["principal"].between(10_000_000, 50_000_000)` | 2 087 |
| `LIKE '%Tashkent%'` | `loans["branch"].str.contains("Tashkent")` | 3 020 |
| `NOT (status = 'closed')` | `~(loans["status"] == "closed")` | 3 586 |
| `… OR …` | `(loans["dpd"] > 90) \| (loans["status"] == "written_off")` | 234 |
| сентябрь 2026 | `(d >= "2026-09-01") & (d < "2026-10-01")` | 361 |

151 активный кредит просрочен; 361 кредит выдан в сентябре 2026. `loans.query("dpd > 90 and product == 'Micro loan'")` — читаемая альтернатива для длинных условий (76 строк), внутри строки разрешены `and` / `or`.

> 💡 **Главное.** Фильтр — это два шага: построить столбец True/False (маску), затем оставить строки True через `[ ]`. `&`, `|`, `~` соединяют маски, по скобкам на каждое условие.

**Когда применять.**
- Каждый `WHERE`: статус, период, список продуктов, поиск по тексту.
- Просто `mask.sum()`, когда вопрос — «сколько?»: `True` считается как 1.

> ⚠️ **Осторожно.** Пишите `&`, `|`, `~` — никогда `and`, `or`, `not`: они вызывают `ValueError: The truth value of a Series is ambiguous`. Ставьте **скобки вокруг каждого условия**: `&` связывает сильнее, чем `>`, поэтому `loans["dpd"] > 0 & loans["status"] == "active"` читается неверно. А `between` включает оба конца — на столбце со временем используйте `>=` и `<` (правило полуоткрытого интервала).

**Ваша очередь.**

```game
{"type": "bug", "id": "w05d2-g1", "title": "Найдите сломанную строку", "q": "Строка за строкой здесь должны считаться просроченные кредиты, а затем просроченные кредиты, которые всё ещё активны. Одна строка вызывает ошибку.", "code": "late = loans[loans[\"dpd\"] > 0]\nactive_late = loans[loans[\"dpd\"] > 0 and loans[\"status\"] == \"active\"]\nprint(len(late), len(active_late))", "answer": [1], "why": "and работает с отдельными значениями, а не с целым столбцом: pandas вызывает ValueError: The truth value of a Series is ambiguous. Пишите (loans[\"dpd\"] > 0) & (loans[\"status\"] == \"active\") — & и скобки вокруг каждого условия."}
```

### loc и iloc — строки по метке и по позиции :id=loc-and-iloc--rows-by-label-rows-by-position

**Что это.** `.loc[строки, столбцы]` выбирает по **метке**: метке индекса строки, имени столбца или маске. `.iloc[строки, столбцы]` выбирает по **позиции**: 0 — первая строка, какой бы ни была её метка. На свежем фрейме метки — 0, 1, 2 …, и оба способа совпадают; после фильтра или сортировки — нет.

**Как пишется.**

```python
late = loans[loans["dpd"] > 0]                   # фильтр сохраняет исходные метки
print(late.index[:3].tolist())                   # метки первых трёх просроченных кредитов
print(late.iloc[0]["loan_id"], late.loc[20, "loan_id"])   # позиция 0 и метка 20: одна и та же строка
late.loc[late["dpd"] > 400, ["loan_id", "product", "dpd"]].head(3)   # loc = маска + список столбцов
```

```text
[20, 54, 85]
22 22
```

```pic
{"id": "w05d2-pic2", "title": "Одна строка, два адреса: позиция для iloc, метка для loc", "caption": "После фильтра кредит 22 стоит на **позиции** 0 в `late`, но сохраняет **метку** 20 из `loans`. `late.iloc[0]` и `late.loc[20]` указывают на одну строку; `late.loc[0]` вызывает `KeyError`.", "tables": [{"id": "late", "name": "late", "cols": ["позиция", "метка", "loan_id", "dpd"], "rows": [[0, 20, 22, 627], [1, 54, 57, 46], [2, 85, 88, 422]], "tags": {"позиция": "iloc", "метка": "loc"}, "cells": [[0, "позиция"], [0, "метка"]], "more": "… всего 399 строк"}]}
```

Первый просроченный кредит стоит на **позиции** 0 в `late`, но сохраняет **метку** 20 из `loans`; обе указывают на кредит 22. Последняя строка возвращает кредиты 22, 88 и 128 — первые три с просрочкой больше 400 дней.

| | `.loc` | `.iloc` |
|---|---|---|
| выбирает по | метке, имени столбца, маске | целочисленной позиции |
| `x.loc[0]` / `x.iloc[0]` | строку с меткой 0 (`KeyError`, если её отфильтровали) | первую строку, всегда |
| срез `[0:3]` | метки от 0 **до 3 включительно** | позиции 0, 1, 2 (3 не входит) |
| типичное применение | `loans.loc[loans["dpd"] > 90, ["loan_id", "dpd"]]` | `loans.iloc[:5]`, `loans.iloc[-1]` |

**Когда применять.**
- `loc` — для условий и имён: `SELECT … WHERE` одним вызовом, а также для записи значений (`loans.loc[mask, "flag"] = 1`).
- `iloc` — для «первых n строк» или «последней строки».
- `reset_index(drop=True)` — когда нужно, чтобы позиции и метки снова совпали.

> ⚠️ **Осторожно.** `late.loc[0]` вызывает `KeyError: 0`: метка 0 — это кредит 1, а он не просрочен. Позиции — это `iloc`, метки — `loc`. После фильтра смешивание даёт не ту строку или ошибку.

**Ваша очередь.** `loan_id` десятого просроченного кредита в файле (позиция 9 среди просроченных).

```task
{"id": "w05d2-l5", "kind": "python", "starter": "import pandas as pd\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код: оставьте просроченные кредиты (dpd > 0), возьмите позицию 9 через iloc и выведите её loan_id\n", "answer": 243, "dp": 0, "hint": "lt = lo[lo[\"dpd\"] > 0]; затем lt.iloc[9][\"loan_id\"].", "model": "lt = lo[lo[\"dpd\"] > 0]\nprint(lt.iloc[9][\"loan_id\"])     # 243\nprint(lt.index[9])                # 239 — её метка, а не позиция\n\nПозиция 9 — десятая просроченная строка; её метка 239, а loan_id 243. Три разных числа для одной строки — вот почему loc и iloc — два разных метода."}
```

### Сортировка — sort_values и nlargest :id=sorting--sort_values-and-nlargest

**Что это.** `df.sort_values("col")` возвращает строки в порядке столбца — `ORDER BY`. `ascending=False` ставит наибольшие первыми; список столбцов сортирует по нескольким ключам. `df.nlargest(n, "col")` — короткий путь к «топ n».

**Как пишется.**

```python
top = loans.sort_values("outstanding", ascending=False)        # ORDER BY outstanding DESC
top[["loan_id", "product", "outstanding", "dpd"]].head(3)       # … LIMIT 3
```

| (индекс) | loan_id | product | outstanding | dpd |
|---|---|---|---|---|
| 4549 | 4597 | Small business loan | 586068714 | 0 |
| 6405 | 6478 | Small business loan | 577813979 | 0 |
| 2905 | 2936 | Small business loan | 574094643 | 0 |

Три наибольших остатка — SME-кредиты на 574–586 млн, все без просрочки. Метки индекса теперь перемешаны: сортировка переставляет строки вместе с метками.

```python
print(loans.nlargest(3, "principal")["loan_id"].tolist())                          # короткий путь
loans.sort_values(["product", "dpd"], ascending=[True, False])[["product", "dpd"]].head(3)   # два ключа
```

`[2861, 4570, 4601]` — три наибольших principal: 599.06 / 598.45 / 597.54 млн. Сортировка по двум ключам ставит продукты от A до Я, а внутри продукта — самый просроченный кредит первым: Auto-кредиты с 771, затем 739 днями.

**Когда применять.**
- Рейтинги и топ-n: наибольшие остатки, самые просроченные кредиты.
- Естественный порядок перед печатью: месяцы, корзины (`sort_index()` сортирует по индексу).

> ⚠️ **Осторожно.** `sort_values` возвращает **новый** фрейм. `loans.sort_values("dpd")` отдельной строкой ничего не меняет в `loans` — сохраните результат: `top = loans.sort_values(…)`.

**Ваша очередь.** `loan_id` Auto-кредита с наибольшим остатком.

```task
{"id": "w05d2-l6", "kind": "python", "starter": "import pandas as pd\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код: оставьте Auto-кредиты, отсортируйте по outstanding от большего, выведите первый loan_id\n", "answer": 2283, "dp": 0, "hint": "auto = lo[lo[\"product\"] == \"Auto loan\"]; затем auto.sort_values(\"outstanding\", ascending=False) или auto.nlargest(1, \"outstanding\").", "model": "auto = lo[lo[\"product\"] == \"Auto loan\"]\nprint(auto.nlargest(3, \"outstanding\")[[\"loan_id\", \"branch\", \"outstanding\"]])\n# 2283 Andijan Central 377 609 094 · 4696 Tashkent South 376 857 800 · 3209 Tashkent South 375 525 938\n\nФильтр, затем сортировка: WHERE product = 'Auto loan' ORDER BY outstanding DESC LIMIT 3."}
```

### Новые столбцы — векторная арифметика и astype :id=new-columns--vectorised-arithmetic-and-astype

**Что это.** `df["new"] = выражение` добавляет столбец. Выражение работает **сразу с целыми столбцами** (*vectorised*, векторизация): `loans["outstanding"] / 1e9` делит все 7 828 значений за один шаг, без цикла. `astype` меняет тип столбца — это `CAST` из SQL.

**Как пишется.**

```python
loans["outstanding_bn"] = loans["outstanding"] / 1e9                     # все строки сразу
loans["repaid_share"] = 1 - loans["outstanding"] / loans["principal"]   # два столбца, строка к строке
loans["is_late"] = loans["dpd"] > 0                                      # булев столбец
print(round(loans["outstanding_bn"].sum(), 1), loans["is_late"].sum())
loans[["loan_id", "principal", "outstanding", "repaid_share", "is_late"]].head()
```

| (индекс) | loan_id | principal | outstanding | repaid_share | is_late |
|---|---|---|---|---|---|
| 0 | 1 | 31150000 | 9593064 | 0.692036 | False |
| 1 | 2 | 40060000 | 22246389 | 0.444673 | False |
| 2 | 3 | 1590000 | 0 | 1.000000 | False |
| 3 | 4 | 2520000 | 1708700 | 0.321944 | False |
| 4 | 5 | 25590000 | 7498297 | 0.706983 | False |

`208.7 399`: портфель — 208.7 млрд, и 399 кредитов просрочены. Кредит 1 вернул 69 % основного долга; кредит 3, закрытый, — 100 %.

Типы: `astype(int)`, `astype(float)`, `astype(str)`, `astype("category")` (текст с немногими значениями: меньше памяти и порядок), `astype(bool)`. Для текста, в котором может быть мусор, `pd.to_numeric(col, errors="coerce")` превращает то, что не может прочитать, в `NaN`, а не падает:

```python
print(loans["term"].astype(str).head(3).tolist())                          # int → текст
pd.to_numeric(pd.Series(["658", "", "n/a"]), errors="coerce")             # 658.0, NaN, NaN
```

Срок становится текстом `['24', '18', '3']`; баллы `"658"`, `""`, `"n/a"` становятся 658.0, NaN, NaN.

**Когда применять.**
- Каждое производное число: доля, отношение, флаг, сумма в млрд.
- `astype` после чтения, если догадка была неверной; `to_numeric(errors="coerce")` — на грязном тексте.

> ⚠️ **Осторожно.** Присваивайте через `.loc`, никогда через две пары скобок подряд. `loans[loans["dpd"] > 90]["flag"] = 1` (цепочная индексация) пишет во временную **копию** и ничего не меняет в `loans` — pandas лишь предупреждает `SettingWithCopyWarning`. Пишите `loans.loc[loans["dpd"] > 90, "flag"] = 1`. А когда вырезаете фрейм, чтобы работать с ним дальше, сознательно берите копию: `late = loans[loans["dpd"] > 0].copy()`.

**Ваша очередь.** Добавьте столбец `paid` = principal − outstanding и выведите его сумму в млрд с одним знаком после запятой.

```task
{"id": "w05d2-l7", "kind": "python", "starter": "import pandas as pd\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код: lo[\"paid\"] = …, затем сумма в млрд с одним знаком\n", "answer": 196.1, "dp": 1, "hint": "lo[\"paid\"] = lo[\"principal\"] - lo[\"outstanding\"]; round(lo[\"paid\"].sum() / 1e9, 1).", "model": "lo[\"paid\"] = lo[\"principal\"] - lo[\"outstanding\"]\nprint(round(lo[\"paid\"].sum() / 1e9, 1))     # 196.1\n\n404.8 млрд выдано − 208.7 млрд ещё в остатке = 196.1 млрд основного долга уже возвращено (проценты не считаются)."}
```

### Даты — аксессор .dt :id=dates--the-dt-accessor

**Что это.** Когда столбец уже `datetime64`, **`.dt`** (*.dt accessor*) открывает календарь сразу для всех значений: `.dt.year`, `.dt.month`, `.dt.quarter`, `.dt.day_name()`, `.dt.to_period("M")` (месяц). Разность двух дат — это длительность; `.dt.days` превращает её в число.

**Как пишется.**

```python
AS_OF = pd.Timestamp("2026-10-01")
loans["year"] = loans["disbursed_at"].dt.year
loans["month"] = loans["disbursed_at"].dt.to_period("M")                 # strftime('%Y-%m') недели 3
loans["days_on_book"] = (AS_OF - loans["disbursed_at"]).dt.days
print(loans["year"].value_counts().to_dict())
loans[["loan_id", "disbursed_at", "year", "month", "days_on_book"]].head()
```

| (индекс) | loan_id | disbursed_at | year | month | days_on_book |
|---|---|---|---|---|---|
| 0 | 1 | 2025-03-28 | 2025 | 2025-03 | 552 |
| 1 | 2 | 2025-12-05 | 2025 | 2025-12 | 300 |
| 2 | 3 | 2026-03-28 | 2026 | 2026-03 | 187 |
| 3 | 4 | 2026-08-23 | 2026 | 2026-08 | 39 |
| 4 | 5 | 2024-05-22 | 2024 | 2024-05 | 862 |

`{2026: 3051, 2025: 3041, 2024: 1736}`: за девять месяцев 2026 года выдано столько же кредитов, сколько за весь 2025. Кредит 1 на дату отчёта находится в портфеле 552 дня.

| вам нужно | `.dt` | SQL (неделя 3) |
|---|---|---|
| год | `.dt.year` | `strftime('%Y', d)` |
| месяц как период | `.dt.to_period("M")` | `strftime('%Y-%m', d)` |
| квартал | `.dt.quarter` | `(month + 2) / 3` |
| день недели | `.dt.day_name()` | `strftime('%w', d)` |
| дней между датами | `(a - b).dt.days` | `julianday(a) - julianday(b)` |

Столбец datetime сравнивается с датой-текстом напрямую: `loans["disbursed_at"] >= "2026-09-01"` работает — pandas читает строку как дату.

**Когда применять.**
- Группировка по периоду: по месяцам, кварталам, годам.
- Возрасты и длительности: дни в портфеле, дни просрочки, возраст на дату заявки.

> ⚠️ **Осторожно.** `.dt` работает только с `datetime64`. На столбце, прочитанном без `parse_dates`, он вызывает `AttributeError: Can only use .dt accessor with datetimelike values`. Исправьте один раз, наверху: `parse_dates=[…]` или `pd.to_datetime(col)`.

**Ваша очередь.** Среднее число дней в портфеле у **активных** кредитов, округлённое до целого дня.

```task
{"id": "w05d2-l8", "kind": "python", "starter": "import pandas as pd\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\nAS_OF = pd.Timestamp(\"2026-10-01\")\n\n# ваш код: дни в портфеле = AS_OF − disbursed_at в днях; среднее по активным кредитам\n", "answer": 221, "dp": 0, "hint": "(AS_OF - lo[\"disbursed_at\"]).dt.days, затем маска status == \"active\" и .mean().", "model": "lo[\"days_on_book\"] = (AS_OF - lo[\"disbursed_at\"]).dt.days\nprint(round(lo.loc[lo[\"status\"] == \"active\", \"days_on_book\"].mean()))     # 221\n\nАктивный портфель молодой: в среднем около семи месяцев, потому что 2026 год выдал столько же, сколько весь 2025."}
```

### value_counts — количество по значениям :id=value_counts--count-per-value

**Что это.** `col.value_counts()` считает строки для каждого разного значения — `GROUP BY col` с `COUNT(*)` для одного столбца. `normalize=True` даёт доли вместо количеств; `nunique()` считает число разных значений.

**Как пишется.**

```python
print(loans["product"].nunique())                              # COUNT(DISTINCT product)
loans["status"].value_counts()                                 # от большего к меньшему
```

| status | count |
|---|---|
| closed | 4242 |
| active | 3352 |
| written_off | 190 |
| default | 44 |

5 продуктов; 4 242 кредита закрыты, 3 352 активны, 190 списаны и 44 в дефолте.

```python
loans["product"].value_counts(normalize=True).mul(100).round(1)    # доли в %
```

Micro 34.1 % · Consumer 30.9 · BNPL 20.0 · SME 10.0 · Auto 5.0 — доли от числа кредитов, в сумме 100.

| параметр | что делает |
|---|---|
| `normalize=True` | доли вместо количеств |
| `.sort_index()` после него | естественный порядок меток (корзины 0 … 90+), а не по количеству |
| `dropna=False` | показывает `NaN` отдельной строкой |

**Когда применять.**
- Первый вопрос к любому текстовому столбцу: какие значения и сколько каждого?
- Доли целого: структура продуктов, структура статусов.

> ⚠️ **Осторожно.** По умолчанию `value_counts` молча отбрасывает `NaN`: пропусков нет в списке, а доли — это доли непустых строк. Передайте `dropna=False`, чтобы их увидеть.

**Ваша очередь.** Доля списанных кредитов в % с двумя знаками.

```task
{"id": "w05d2-l9", "kind": "python", "starter": "import pandas as pd\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код: value_counts по status с normalize=True; выведите долю written_off в %\n", "answer": 2.43, "dp": 2, "hint": "lo[\"status\"].value_counts(normalize=True)[\"written_off\"] * 100.", "model": "shares = lo[\"status\"].value_counts(normalize=True)\nprint(round(100 * shares[\"written_off\"], 2))     # 2.43\n\n190 из 7 828 кредитов. Результат value_counts — это Series с индексом из значений, поэтому [\"written_off\"] выбирает одно из них."}
```

### Пропущенные значения — isna, fillna, dropna :id=missing-values--isna-fillna-dropna

**Что это.** **`NaN`** (*missing value*, пропуск) — это NULL в pandas: ячейка без значения (`NaT` для даты). Агрегаты пропускают его, как `AVG` в SQL. `isna()` находит его, `fillna(x)` вписывает значение в пропуски, `dropna()` удаляет строки с ним.

**Как пишется.**

```python
cust = pd.read_csv("../excel/customers_dirty.csv")
inc = cust["monthly_income"]
print(cust.isna().sum()[lambda s: s > 0])           # столбцы с пропусками и сколько их
print(len(inc), inc.count())                        # строки против непустых значений
print(round(inc.mean()), round(inc.fillna(0).mean()), round(inc.fillna(inc.median()).mean()))
print(len(cust.dropna(subset=["monthly_income"])))
```

| | значение |
|---|---|
| пропущен `monthly_income` | 356 (единственный столбец с пропусками) |
| строк / непустых доходов | 6 040 / 5 684 |
| `mean()` — пропуски не учитываются | 15 245 933 |
| `fillna(0).mean()` | 14 347 331 |
| `fillna(median).mean()` | 14 812 719 |
| строк после `dropna(subset=["monthly_income"])` | 5 684 |

У 356 клиентов нет дохода. Обычное среднее по 5 684 известным доходам — 15.2 млн; заполнение пропусков нулём опускает его до 14.3 млн, потому что придумывает 356 человек, которые ничего не зарабатывают.

| вызов | что делает |
|---|---|
| `col.isna()` / `col.notna()` | маска пропусков / непустых значений |
| `col.count()` против `len(col)` | непустые значения против строк — разница и есть перепись NULL |
| `col.fillna(0)` | 0 в пропуски — `COALESCE(x, 0)` |
| `df.dropna(subset=["col"])` | удалить строки, где пуст *именно этот* столбец |
| `df.dropna()` | удалить строку, если пуст **любой** столбец |

**Когда применять.**
- `isna().sum()` на каждой новой таблице, рядом с `info()`.
- `fillna(0)` — только там, где пропуск действительно означает ноль: нет платежа → оплачено 0.

> 💡 **Главное.** `fillna(0)` — это решение, а не шаг очистки. Для *количества* (нет платежа → оплачено 0) он верен; для *дохода* это ложь, которая опускает среднее на 0.9 млн. Оставьте NaN и покажите группу «неизвестно» или заполните помеченной оценкой.

> ⚠️ **Осторожно.** `col == np.nan` никогда не находит пропуск — `NaN` не равен ничему, даже самому себе. Используйте `col.isna()`. А `dropna()` без `subset=` удаляет строку, когда пуст *любой* столбец, — на широкой таблице это может быть большая часть файла.

**Ваша очередь.** У скольких клиентов доход известен?

```task
{"id": "w05d2-l10", "kind": "python", "starter": "import pandas as pd\ncu = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# ваш код: число непустых значений monthly_income (двумя способами: count() и notna().sum())\n", "answer": 5684, "dp": 0, "hint": "cu[\"monthly_income\"].count() или cu[\"monthly_income\"].notna().sum().", "model": "print(cu[\"monthly_income\"].count(), cu[\"monthly_income\"].notna().sum())     # 5684 5684\n\n6 040 клиентов − 356 пропусков = 5 684."}
```

### pd.cut — корзины без CASE :id=pdcut--buckets-without-a-case

**Что это.** `pd.cut(col, bins=edges, labels=…)` относит каждое число к интервалу и возвращает его метку — `CASE WHEN dpd <= 30 THEN …` недели 2 в одну строку. Интервалы по умолчанию **закрыты справа**: `(30, 60]` содержит 60, но не 30.

```pic
{"id": "w05d2-pic3", "title": "Закрыто справа: 60 входит в (30, 60], а 61 — нет", "caption": "Шесть настоящих кредитов у границ. Кредит 1997 просрочен ровно на 60 дней и попадает в **31-60**; кредит 7286, на день больше, открывает **61-90** (оба обведены). Один цвет — одна корзина.", "tables": [{"id": "l", "name": "loans", "cols": ["loan_id", "dpd", "interval", "bucket_pd"], "rows": [[1, 0, "(−1, 0]", "0"], [6227, 29, "(0, 30]", "1-30"], [5613, 31, "(30, 60]", "31-60"], [1997, 60, "(30, 60]", "31-60"], [7286, 61, "(60, 90]", "61-90"], [22, 627, "(90, ∞]", "90+"]], "new": ["bucket_pd"], "tone": ["a", "b", "c", "c", "d", "e"], "cells": [[3, "dpd"], [4, "dpd"]]}]}
```

**Как пишется.**

```python
edges  = [-1, 0, 30, 60, 90, np.inf]
labels = ["0", "1-30", "31-60", "61-90", "90+"]
loans["bucket_pd"] = pd.cut(loans["dpd"], bins=edges, labels=labels)
loans["bucket_pd"].value_counts().sort_index()
```

| bucket_pd | count |
|---|---|
| 0 | 7429 |
| 1-30 | 124 |
| 31-60 | 25 |
| 61-90 | 16 |
| 90+ | 234 |

7 429 кредитов без просрочки и 234 с просрочкой больше 90 дней — те же пять чисел, что у SQL-`CASE` недели 2 и у собственного столбца `bucket` в файле.

| `dpd` | интервал | метка |
|---|---|---|
| 0 | (−1, 0] | 0 |
| 30 | (0, 30] | 1-30 |
| 31 | (30, 60] | 31-60 |
| 91 | (90, ∞] | 90+ |

`right=False` переключает на интервалы, закрытые слева, `[0, 5 млн)` — для правил, записанных через `<`, как группы дохода. `pd.qcut(col, 10)` режет на десять групп равного размера — `NTILE(10)` недели 3. Результат — `category` с метками по порядку, поэтому `sort_index()` даёт 0 … 90+.

**Когда применять.**
- Числовые диапазоны, которые являются определением: корзины DPD, группы дохода, размеры кредита.

> ⚠️ **Осторожно.** Первая граница должна быть **меньше** наименьшего значения. С границами `[0, 30, …]` первый интервал — `(0, 30]`, и он не содержит 0: все 7 429 кредитов с `dpd = 0` становятся `NaN`. Начинайте с −1.

**Ваша очередь.** Разбейте `monthly_income` на группы `<5m`, `5-10m`, `10-20m`, `20m+` с `right=False`. Сколько клиентов в `<5m`?

```task
{"id": "w05d2-l11", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\ncu = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# ваш код: pd.cut с границами [0, 5e6, 10e6, 20e6, np.inf], четырьмя метками, right=False; затем value_counts\n", "answer": 1281, "dp": 0, "hint": "pd.cut(cu[\"monthly_income\"], [0, 5e6, 10e6, 20e6, np.inf], labels=[\"<5m\", \"5-10m\", \"10-20m\", \"20m+\"], right=False).", "model": "band = pd.cut(cu[\"monthly_income\"], [0, 5e6, 10e6, 20e6, np.inf],\n              labels=[\"<5m\", \"5-10m\", \"10-20m\", \"20m+\"], right=False)\nprint(band.value_counts(dropna=False).sort_index())\n# <5m 1281 · 5-10m 2198 · 10-20m 576 · 20m+ 1629 · NaN 356\n\nright=False даёт [5 млн, 10 млн): ровно 5 000 000 попадает в 5-10m, как в SQL monthly_income < 5000000. 356 пустых доходов остаются NaN — dropna=False их показывает."}
```

### SQL ↔ pandas — таблица перевода :id=sql--pandas--the-translation-table

**Что это.** У каждого оператора SQL, который вы знаете, есть запись в pandas. Эта таблица — словарь сегодняшнего дня в одном месте, с Excel недели 4 посередине.

**Как пишется.**

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

Шестнадцать строк, у каждой одно значение. Столбец pandas — единственный из трёх, который является *файлом, который можно перезапустить на новых входных данных*.

**Когда применять.**
- Когда вы знаете SQL и нужна запись в pandas: найдите строку, скопируйте запись.
- Когда читаете чужой ноутбук: переведите обратно в SQL, который можете проверить.

**Ваша очередь.**

```game
{"type": "match", "id": "w05d2-g2", "title": "SQL → pandas", "pairs": [["WHERE dpd > 0 AND status = 'active'", "loans[(loans.dpd > 0) & (loans.status == \"active\")]"], ["IN ('SME', 'AUTO')", ".isin([...])"], ["LIKE '%Tashkent%'", ".str.contains(\"Tashkent\")"], ["ORDER BY outstanding DESC", ".sort_values(\"outstanding\", ascending=False)"], ["COUNT(DISTINCT region)", ".nunique()"], ["COALESCE(x, 0)", ".fillna(0)"], ["GROUP BY status + COUNT(*)", ".value_counts()"], ["CASE WHEN dpd <= 30 …", "pd.cut(dpd, edges, labels=...)"]]}
```

### Собираем вместе :id=putting-it-together

Один запрос, все инструменты дня: *просроченные активные кредиты ташкентских филиалов — от большего остатка к меньшему, с днями в портфеле и корзиной — сохранить в CSV для команды взыскания.* **Маска** из трёх условий, **`loc`** со списком столбцов, **новый столбец** из **дат**, **`pd.cut`**, **сортировка**, затем **`to_csv`**, чтобы записать результат обратно.

```python
AS_OF = pd.Timestamp("2026-10-01")
cond = (loans["status"] == "active") & (loans["dpd"] > 0) & loans["branch"].str.contains("Tashkent")
watch = loans.loc[cond, ["loan_id", "branch", "product", "disbursed_at", "outstanding", "dpd"]].copy()
watch["days_on_book"] = (AS_OF - watch["disbursed_at"]).dt.days
watch["bucket"] = pd.cut(watch["dpd"], [-1, 0, 30, 60, 90, np.inf], labels=["0", "1-30", "31-60", "61-90", "90+"])
watch = watch.sort_values("outstanding", ascending=False)
watch.to_csv("tashkent_watchlist.csv", index=False)       # index=False, иначе в Excel появится безымянный первый столбец
print(len(watch), watch["outstanding"].sum())
watch.head()
```

| (индекс) | loan_id | branch | product | outstanding | dpd | days_on_book | bucket |
|---|---|---|---|---|---|---|---|
| 4519 | 4567 | Tashkent Central | Auto loan | 301482053 | 84 | 206 | 61-90 |
| 280 | 285 | Tashkent North | Small business loan | 296861300 | 11 | 134 | 1-30 |
| 429 | 434 | Tashkent Central | Small business loan | 264936631 | 21 | 205 | 1-30 |
| 5356 | 5418 | Tashkent South | Auto loan | 254851103 | 26 | 238 | 1-30 |
| 3790 | 3827 | Tashkent North | Auto loan | 205320039 | 48 | 109 | 31-60 |

61 кредит, 2 718 083 360 сумов остатка. Вверху списка — Auto-кредит на 301 млн, уже просроченный на 84 дня: один шаг до 90+.

`.copy()` после `loc` делает `watch` отдельным фреймом, поэтому новые столбцы не вызывают предупреждения о копии. `to_csv(…, index=False)` записывает файл, который откроет Бекзод; `to_excel("f.xlsx", sheet_name="…", index=False)` делает то же для Excel (нужен пакет `openpyxl`, он есть в Anaconda).

**Ваша очередь.** Тот же список для филиала Samarkand: какой остаток он держит?

```task
{"id": "w05d2-l12", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код: active, dpd > 0, branch содержит \"Samarkand\"; выведите число кредитов и сумму outstanding\n", "answer": 1098615809, "dp": 0, "hint": "Та же маска из трёх условий с \"Samarkand\" вместо \"Tashkent\"; затем len() и [\"outstanding\"].sum().", "model": "cond = (lo[\"status\"] == \"active\") & (lo[\"dpd\"] > 0) & lo[\"branch\"].str.contains(\"Samarkand\")\nw = lo.loc[cond].sort_values(\"outstanding\", ascending=False)\nprint(len(w), w[\"outstanding\"].sum())     # 17 1098615809\n\n17 кредитов, 1.10 млрд; самый крупный — кредит 1175, SME-кредит на 458.8 млн с просрочкой 12 дней."}
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

Плитки Бекзода из Дня 1 недели 4, оформленные как функция от DataFrame, чтобы следующий месяц был просто `portfolio_summary(pd.read_csv("loans_status_2026-11.csv"))`. Каждый шаг использует одно понятие из раздела 1, в том порядке, в котором вы их изучали.

1. **Шаг 1 — read_csv с parse_dates.** Функция берёт фрейм `loans`, прочитанный в разделе 1. Его даты — настоящие даты, поэтому они сравниваются с `AS_OF`.
2. **Шаг 2 — булевы маски.** `df["status"] == "active"` и период из двух условий `in_2026` (полуоткрытый: `>=` 1 января, `<` даты отчёта). `.sum()` считает строки `True`.
3. **Шаг 3 — loc с маской и столбцом.** `df.loc[df["dpd"] > 30, "outstanding"].sum()` — это `SUM(outstanding) WHERE dpd > 30`.
4. **Шаг 4 — векторная арифметика внутри функции.** Каждое отношение — это две суммы столбцов, поделённые один раз; `def` и `return` (День 1) превращают шесть плиток в один вызов, который можно перезапускать.

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

Редактор каждой задачи уже загружает `loans_status.csv` с `parse_dates` (P12 загружает `customers_dirty.csv`). Пишите код под `# ваш код`, **▶ Run**, затем **✔ Check** — выведите число, о котором спрашивает задача. В Jupyter в `data/python/day2_starter.ipynb` есть пошаговые ячейки; добавляйте по ячейке на задачу.

**P1.** *(Series и DataFrame)* Сделайте **Series** из пяти количеств по корзинам (7 429, 124, 25, 16, 234) с метками `0` … `90+` в индексе (`pd.Series(values, index=labels)`). Выведите количество 90+ по его метке, итог и долю 90+ среди всех кредитов в %.

```task
{"id": "w05d2-l13", "kind": "python", "starter": "import pandas as pd\n\n# ваш код: s = pd.Series([...], index=[...]); затем s[\"90+\"], s.sum() и доля 90+ в %\n", "answer": 2.99, "dp": 2, "hint": "pd.Series([7429, 124, 25, 16, 234], index=[\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"]); round(100 * s[\"90+\"] / s.sum(), 2).", "model": "s = pd.Series([7429, 124, 25, 16, 234], index=[\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"])\nprint(s[\"90+\"], s.sum(), round(100 * s[\"90+\"] / s.sum(), 2))     # 234 7828 2.99\n\nSeries ищется по метке индекса, как словарь: s[\"90+\"]. 3 % кредитов по количеству — но 2.55 % денег (NPL90, Уголок компании)."}
```

**P2.** *(read_csv)* Прочитайте `loans_status.csv` *без* `parse_dates`. Какой dtype у `disbursed_at` и что делает `loans["disbursed_at"].dt.year`? Исправьте двумя способами.

```task
{"id": "w05d2-p1", "kind": "choice", "options": ["datetime64[ns] — pandas сам распознаёт даты ISO", "object (текст) — и .dt вызывает AttributeError, пока вы его не преобразуете", "int64 — даты хранятся как числа", "category — даты повторяются, и pandas их сжимает"], "answer": 1, "explain": "Без parse_dates столбец — текст: .dt вызывает AttributeError: Can only use .dt accessor with datetimelike values. Исправление: parse_dates=[\"disbursed_at\"] в read_csv или потом loans[\"disbursed_at\"] = pd.to_datetime(loans[\"disbursed_at\"]); после этого info() покажет datetime64[ns]."}
```

**P3.** *(первый взгляд)* Только по `describe()`: медиана principal, среднее principal, 75-й перцентиль `dpd`, максимум `dpd`. О чём говорит разрыв между средним и медианой? Введите медиану principal.

```task
{"id": "w05d2-p2", "kind": "number", "answer": 5790000, "dp": 0, "unit": "сум", "hint": "Медиана — это строка 50% в loans[\"principal\"].describe().", "model": "Медиана 5 790 000 · среднее 51 709 668 · 75-й перцентиль dpd 0 · максимум dpd 919. Среднее в девять раз больше медианы = длинный правый хвост: несколько кредитов SME/Auto несут основные деньги (вывод недели 3 о двух портфелях). У 75 % кредитов dpd = 0, так что 399 просроченных кредитов — это верхние 5 %."}
```

**P4.** *(выбор столбцов)* Выберите два денежных столбца, `principal` и `outstanding`, как DataFrame и выведите их суммы одним вызовом. Сколько всего выдано?

```task
{"id": "w05d2-l14", "kind": "python", "starter": "import pandas as pd\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код: два столбца (двойные скобки), затем .sum()\n", "answer": 404783280000, "dp": 0, "hint": "lo[[\"principal\", \"outstanding\"]].sum().", "model": "print(lo[[\"principal\", \"outstanding\"]].sum())\n# principal 404783280000 · outstanding 208723504430\n\n.sum() на DataFrame суммирует каждый столбец и возвращает Series с именами столбцов в индексе: 404.8 млрд выдано, 208.7 млрд ещё в остатке."}
```

**P5.** *(булевы маски)* Три фильтра, три количества: SME или Auto (`isin`), principal от 10 млн до 50 млн (`between`), филиал, содержащий `Tashkent` (`str.contains`). Затем кредиты сентября 2026 по правилу полуоткрытого интервала — и покажите, что `between("2026-09-01", "2026-09-30")` здесь случайно даёт то же самое, и почему так не будет на `applied_at`.

```task
{"id": "w05d2-p4", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код — сентябрьское число выведите последним\n", "answer": 361, "dp": 0, "hint": "Проверка ищет число за сентябрь 2026: >= \"2026-09-01\" и < \"2026-10-01\", каждое в скобках, через &.", "model": "print(loans[\"product\"].isin([\"Small business loan\", \"Auto loan\"]).sum())     # 1172\nprint(loans[\"principal\"].between(10_000_000, 50_000_000).sum())                # 2087\nprint(loans[\"branch\"].str.contains(\"Tashkent\").sum())                          # 3020\nd = loans[\"disbursed_at\"]\nprint(((d >= \"2026-09-01\") & (d < \"2026-10-01\")).sum())                         # 361\nprint(d.between(\"2026-09-01\", \"2026-09-30\").sum())                             # 361\n\ndisbursed_at — чистая дата, поэтому 30-е в 00:00 включено; у applied_at есть время, и between(…, \"2026-09-30\") отбросит всё после полуночи 30-го (те самые 23 потерянные заявки с недели 1). Всегда полуоткрытый интервал."}
```

**P6.** *(loc и iloc)* Через `loc` покажите `customer`, `status` и `outstanding` кредита 4570 (маска по `loan_id` плюс список столбцов). Через `iloc` выведите `loan_id` последней строки файла. Почему это не 7 828?

```task
{"id": "w05d2-l15", "kind": "python", "starter": "import pandas as pd\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код: lo.loc[маска, [столбцы]] для кредита 4570; затем loan_id из lo.iloc[-1]\n", "answer": 7917, "dp": 0, "hint": "lo.loc[lo[\"loan_id\"] == 4570, [\"customer\", \"status\", \"outstanding\"]]; lo.iloc[-1][\"loan_id\"].", "model": "print(lo.loc[lo[\"loan_id\"] == 4570, [\"customer\", \"status\", \"outstanding\"]])   # Umida Khasanova, closed, 0\nprint(lo.iloc[-1][\"loan_id\"], len(lo))                                            # 7917 7828\n\nПоследняя строка — кредит 7917, хотя строк 7 828: некоторых номеров кредитов в последовательности нет. Поэтому метка индекса (7827), позиция (−1) и loan_id (7917) — три разных числа; никогда не используйте метку как loan_id."}
```

**P7.** *(сортировка)* Три кредита с наибольшим `outstanding`, только с `loan_id`, `product`, `outstanding` — один раз через `sort_values().head(3)`, один раз через `nlargest`. Затем три наибольших по `principal`.

```task
{"id": "w05d2-p5", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 4597, "dp": 0, "hint": "Проверка ищет loan_id с наибольшим остатком.", "model": "cols = [\"loan_id\", \"product\", \"outstanding\"]\nprint(loans.sort_values(\"outstanding\", ascending=False)[cols].head(3))\nprint(loans.nlargest(3, \"outstanding\")[cols])\nprint(loans.nlargest(3, \"principal\")[[\"loan_id\", \"product\", \"principal\"]])\n\nОстаток: 4597 (586 068 714) · 6478 (577 813 979) · 2936 (574 094 643), все SME. Основной долг: 2861 (599 060 000) · 4570 (598 450 000) · 4601 (597 540 000) — max_amount у SME равен 600 млн, и самые крупные кредиты упираются в него (S6 недели 3)."}
```

**P8.** *(новые столбцы)* Добавьте `repaid_share = 1 − outstanding ÷ principal`. Сколько **активных** кредитов уже вернули больше половины основного долга?

```task
{"id": "w05d2-l16", "kind": "python", "starter": "import pandas as pd\nlo = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код: новый столбец, затем маска (active и repaid_share > 0.5) и .sum()\n", "answer": 1072, "dp": 0, "hint": "lo[\"repaid_share\"] = 1 - lo[\"outstanding\"] / lo[\"principal\"]; затем ((lo[\"status\"] == \"active\") & (lo[\"repaid_share\"] > 0.5)).sum().", "model": "lo[\"repaid_share\"] = 1 - lo[\"outstanding\"] / lo[\"principal\"]\nprint(((lo[\"status\"] == \"active\") & (lo[\"repaid_share\"] > 0.5)).sum())     # 1072\n\n1 072 из 3 352 активных кредитов прошли половину пути. Столбец считается для всех 7 828 строк за один шаг; маска затем выбирает те, что вы считаете."}
```

**P9.** *(даты)* Добавьте столбцы `year` и `month` из `disbursed_at`; посчитайте кредиты 2026 года по месяцам и по кварталам.

```task
{"id": "w05d2-p6", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 1086, "dp": 0, "hint": "Проверка ищет число за Q3 2026. .dt.year, .dt.month, .dt.quarter, затем value_counts().sort_index().", "model": "loans[\"year\"] = loans[\"disbursed_at\"].dt.year\nloans[\"month\"] = loans[\"disbursed_at\"].dt.month\ny26 = loans[loans[\"year\"] == 2026]\nprint(y26[\"month\"].value_counts().sort_index())\nprint(y26[\"disbursed_at\"].dt.quarter.value_counts().sort_index())\n\nМесяцы: 287 · 265 · 330 · 312 · 377 · 373 · 367 · 358 · 361 (+ 21 на 1 октября); кварталы: Q1 882 · Q2 1 062 · Q3 1 086 · Q4 21. loans[\"disbursed_at\"].dt.to_period(\"M\").value_counts().sort_index() — strftime('%Y-%m') + GROUP BY из S7 недели 3 в одной строке."}
```

**P10.** *(value_counts)* Сколько кредитов просрочено (`dpd > 0`) в разрезе `status`? Какое сочетание не должно существовать, и существует ли оно?

```task
{"id": "w05d2-p3", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 14, "dp": 0, "hint": "Отфильтруйте просроченные кредиты, затем value_counts по статусу. Проверка ищет сочетание, которое выглядит невозможным.", "model": "print(loans[loans[\"dpd\"] > 0][\"status\"].value_counts())\n# written_off 190 · active 151 · default 44 · closed 14\n\n«Закрыт и просрочен» выглядит невозможным — 14 кредитов: закрыты, потому что срок последнего платежа по графику прошёл, но платёж недоплачен; неделя 2 нашла те же 14 (13 в 1–30, 1 в 31–60). Это не баг, который исправляют в pandas, — это вопрос к Севаре."}
```

**P11.** *(value_counts)* Доли через `value_counts(normalize=True)`: продукты, грейды, каналы *кредитов* (канала нет в файле — какой факт недели 3 позволяет вывести его из `product`?).

```task
{"id": "w05d2-p7", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 45.9, "dp": 1, "hint": "Проверка ищет долю канала branch в %, с одним знаком. Сопоставьте каждому продукту его канал словарём.", "model": "print(loans[\"product\"].value_counts(normalize=True).mul(100).round(1))\nprint(loans[\"grade\"].value_counts(normalize=True).mul(100).round(1))\nchannel = loans[\"product\"].map({\"Micro loan\": \"app\", \"Buy now pay later\": \"partner\",\n                                 \"Consumer loan\": \"branch\", \"Small business loan\": \"branch\", \"Auto loan\": \"branch\"})\nprint(channel.value_counts(normalize=True).mul(100).round(1))\n\nПродукты: 34.1 / 30.9 / 20.0 / 10.0 / 5.0 %; грейды: B 43.5 · C 28.9 · A 23.3 · D 4.3. Каждый канал продаёт одно семейство продуктов (S2 недели 3): app = Micro (34.1 %), partner = BNPL (20.0 %), branch = всё остальное (45.9 %) — поэтому map строит столбец канала без соединения."}
```

**P12.** *(пропущенные значения)* `customers_dirty.csv`: сколько значений `monthly_income` пропущено, среднее с `fillna(0)` и без него, среднее после заполнения медианой и число строк после `dropna()` с `subset` и без.

```task
{"id": "w05d2-p9", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\ncust = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# ваш код\n", "answer": 14347331, "dp": 0, "hint": "Проверка ищет среднее после fillna(0), округлённое до сума.", "model": "inc = cust[\"monthly_income\"]\nprint(inc.isna().sum())                         # 356\nprint(round(inc.mean()))                        # 15245933\nprint(round(inc.fillna(0).mean()))              # 14347331\nprint(round(inc.fillna(inc.median()).mean()))   # 14812719\nprint(len(cust.dropna()), len(cust.dropna(subset=[\"monthly_income\"])))   # 5684 5684\n\nНули тянут среднее вниз на 0.9 млн. dropna() и dropna(subset=...) совпадают здесь только потому, что доход — единственный столбец с пропусками, — на завтрашних объединённых таблицах это везение закончится. Никогда не заполняйте доход нулём; заполняйте подписанной оценкой или оставляйте NaN и показывайте полосу «неизвестно» (S10 недели 3: 466 кредитов)."}
```

**P13.** *(pd.cut)* `pd.cut` по `dpd` со стандартными границами; докажите, что он совпадает со столбцом `bucket` из файла для всех 7 828 строк. Затем среднее и медиана `dpd` просроченных кредитов — какая из них идёт в отчёт?

```task
{"id": "w05d2-p8", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 159, "dp": 0, "hint": "Проверка ищет медиану dpd просроченных кредитов.", "model": "edges, labels = [-1, 0, 30, 60, 90, np.inf], [\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"]\nloans[\"bucket_pd\"] = pd.cut(loans[\"dpd\"], bins=edges, labels=labels)\nprint((loans[\"bucket_pd\"].astype(str) == loans[\"bucket\"]).all())   # True\nlate = loans.loc[loans[\"dpd\"] > 0, \"dpd\"]\nprint(round(late.mean()), late.median())                              # 246 159.0\n\nastype(str) важен: сравнение category с текстом иначе даёт несовпадение типов. 234 списанных кредита с просрочкой 500–900 дней тянут среднее вверх; сообщайте медиану, а лучше — корзины."}
```

**P14.** *(SQL ↔ pandas)* Какая строка pandas возвращает то же, что этот SQL? `SELECT loan_id, outstanding FROM loans WHERE region = 'Nukus' AND dpd > 30 ORDER BY outstanding DESC LIMIT 5`

```task
{"id": "w05d2-l17", "kind": "choice", "options": ["loans[loans.region == \"Nukus\" and loans.dpd > 30][[\"loan_id\", \"outstanding\"]].sort_values(\"outstanding\").head(5)", "loans.loc[(loans[\"region\"] == \"Nukus\") & (loans[\"dpd\"] > 30), [\"loan_id\", \"outstanding\"]].sort_values(\"outstanding\", ascending=False).head(5)", "loans.loc[(loans[\"region\"] == \"Nukus\") & (loans[\"dpd\"] > 30), \"loan_id\", \"outstanding\"].nlargest(5)", "loans[[\"loan_id\", \"outstanding\"]].sort_values(\"outstanding\", ascending=False).head(5)"], "answer": 1, "explain": "WHERE → маска с & и скобками на каждое условие; SELECT → список столбцов внутри loc; ORDER BY … DESC → sort_values(ascending=False); LIMIT 5 → head(5). В первом варианте and (ValueError) и сортировка не в ту сторону; в третьем столбцы переданы без списка; в четвёртом забыт WHERE."}
```

**P15.** *(собираем вместе)* Постройте фрейм `bucket · loans · outstanding · share_pct` (пять строк, доли от общего остатка) и запишите его в `portfolio_buckets.csv` (в Jupyter — ещё и на лист `buckets` файла `portfolio.xlsx`, затем откройте его и проверьте итог).

```task
{"id": "w05d2-p10", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 2.55, "dp": 2, "hint": "Проверка ищет долю 90+ в остатке, в % с двумя знаками.", "model": "summary = (loans.groupby(\"bucket\").agg(loans=(\"loan_id\", \"size\"), outstanding=(\"outstanding\", \"sum\"))\n                .reindex([\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"]).reset_index())\nsummary[\"share_pct\"] = (100 * summary[\"outstanding\"] / summary[\"outstanding\"].sum()).round(2)\nsummary.to_csv(\"portfolio_buckets.csv\", index=False)\nprint(summary)\n\n0 → 7 429 / 197 486 207 578 / 94.62 % · 1–30 124 / 4 729 769 899 / 2.27 · 31–60 25 / 748 610 049 / 0.36 · 61–90 16 / 439 441 377 / 0.21 · 90+ 234 / 5 319 475 527 / 2.55 — таблица S9 недели 3. value_counts даёт столбец loans; суммы — это завтрашний groupby (здесь он использован один раз). index=False, иначе на листе появится столбец 0…4, о котором Бекзод обязательно спросит. Σ остатка 208 723 504 430."}
```

> 🚀 **Со звёздочкой (по желанию, +5 XP).** **P16.** *(собираем вместе)* PAR30 по продуктам и по регионам, по одной строке на каждый (Σ остатка при `dpd > 30` ÷ Σ остатка, по группам — можно подсмотреть в завтрашний `groupby`). Какой регион вы бы отметили и что делает долю маленького региона хрупкой?

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
  {"type": "single", "q": "loans[loans[\"dpd\"] > 0 & loans[\"status\"] == \"active\"] вызывает ошибку. Как исправить?", "options": ["Заменить & на and", "Взять каждое условие в скобки: (loans[\"dpd\"] > 0) & (loans[\"status\"] == \"active\")", "Преобразовать dpd в int", "Использовать iloc"], "answer": 1, "explain": "& связывает сильнее, чем > и ==, поэтому сначала вычисляется 0 & loans[\"status\"]; по паре скобок на условие (→ раздел 1, «Выбор строк»)."},
  {"type": "single", "q": "После late = loans[loans[\"dpd\"] > 0] почему late.loc[0] может упасть, а late.iloc[0] работает?", "options": ["loc работает только со столбцами", "loc ищет МЕТКУ индекса 0, а она принадлежала непросроченному кредиту; iloc берёт ПОЗИЦИЮ 0", "iloc быстрее", "Фильтр сбросил индекс"], "answer": 1, "explain": "Фильтр сохраняет исходные метки; reset_index(drop=True) снова совмещает позиции и метки (→ раздел 1, «loc и iloc»)."},
  {"type": "single", "q": "pd.cut(loans[\"dpd\"], [0, 30, 60, 90, np.inf]) даёт 7 429 NaN. Почему?", "options": ["np.inf нельзя использовать", "Интервалы закрыты справа: первый — (0, 30], он не содержит 0; начинайте границы с -1", "dpd — это текст", "pd.cut нужен labels="], "answer": 1, "explain": "Первая граница должна быть ниже наименьшего значения (→ раздел 1, «pd.cut»)."},
  {"type": "single", "q": "loans[loans[\"dpd\"] > 90][\"flag\"] = 1 выполняется лишь с предупреждением, но столбца flag в loans потом нет. Почему?", "options": ["flag — зарезервированное слово", "Цепочная индексация: первые [ ] возвращают копию, и присваивание попадает в неё — пишите loans.loc[loans[\"dpd\"] > 90, \"flag\"] = 1", "Маска пустая", "pandas нужен inplace=True"], "answer": 1, "explain": "Присваивайте через .loc — маска и столбец в одном вызове (→ раздел 1, «Новые столбцы»)."}
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
  {"type": "single", "q": "Эта строка вызывает ошибку. Как её исправить?", "code": "loans[loans[\"dpd\"] > 0 & loans[\"status\"] == \"active\"]", "options": ["Написать and вместо &", "Взять каждое условие в скобки: (loans[\"dpd\"] > 0) & (loans[\"status\"] == \"active\")", "Сначала преобразовать dpd в int", "Использовать loans.iloc вместо этого"], "answer": 1, "explain": "& связывает сильнее, чем > и ==, поэтому каждому условию нужны свои скобки; and / or не работают на целой Series (→ раздел 1, «Выбор строк»)."},
  {"type": "single", "q": "Что происходит с 7 429 кредитами с dpd = 0?", "code": "pd.cut(loans[\"dpd\"], bins=[0, 30, 60, 90, np.inf])", "options": ["pd.cut вызывает ошибку", "Они становятся NaN — интервалы закрыты справа, и (0, 30] не содержит 0", "Они попадают в (0, 30]", "pd.cut создаёт для них корзину '0'"], "answer": 1, "explain": "Первая граница должна быть ниже наименьшего значения (-1 для DPD); np.inf закрывает верх (→ раздел 1, «pd.cut»)."},
  {"type": "number", "q": "Что даёт этот код на loans_status.csv, в % с двумя знаками после запятой?", "code": "100 * loans.loc[loans[\"dpd\"] > 30, \"outstanding\"].sum() / loans[\"outstanding\"].sum()", "answer": 3.12, "tol": 0.01, "explain": "Остаток по кредитам с dpd > 30 ÷ общий остаток = 6.51 млрд из 208.7 млрд = PAR30 (→ Уголок компании)."},
  {"type": "multi", "q": "Какие утверждения о пропущенных значениях в pandas верны?", "options": ["fillna(0) для monthly_income даёт заниженное, неверное среднее", "mean() пропускает NaN, как AVG в SQL", "dropna() без subset= удаляет строку, если пропущен любой столбец", "col == np.nan находит пропущенные строки", "count() считает все строки, включая NaN"], "answer": [0, 1, 2], "explain": "NaN — это NULL в pandas: агрегаты его пропускают, == его никогда не находит (используйте isna()), а fillna(0) для дохода — это решение, которое выдумывает нулевых заёмщиков (→ раздел 1, «Пропущенные значения»)."},
  {"type": "single", "q": "Вы считаете сентябрьские заявки по applied_at, где хранятся дата и время. Какой фильтр верный?", "options": ["applied_at <= \"2026-09-30\"", "applied_at.between(\"2026-09-01\", \"2026-09-30\")", "(applied_at >= \"2026-09-01\") & (applied_at < \"2026-10-01\")", "applied_at.dt.month == 9"], "answer": 2, "explain": "between включает границы, а \"2026-09-30\" означает полночь, поэтому вечер 30-го теряется; dt.month == 9 к тому же захватывает сентябрь 2025. Всегда полуоткрытый интервал (→ раздел 1, «Выбор строк», P5)."},
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
