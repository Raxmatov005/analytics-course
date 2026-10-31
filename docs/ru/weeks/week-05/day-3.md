# Неделя 5 · День 3 — pandas II: groupby, merge и конвейер очистки

<span class="badge">Теория 60 мин</span> <span class="badge">Расследование 40 мин</span> <span class="badge">Практика 45 мин</span> <span class="badge hw">срок HW 5.1 · HW 5.2 (сдать ко Дню 5)</span> <span class="badge company">Уголок компании</span>

> STORY **Среда, 9:05.** Нилуфар, риск-аналитик (*risk analyst*), а за её спиной Жасур. *«Ваш конвейер Power Query работает — на моём ноутбуке. На сервере Жасура нет Excel. Ему нужна та же очистка в виде скрипта, который он сможет поставить на расписание: на входе `customers_dirty.csv` и `payments_dirty.csv`, на выходе 6 000 человек и 52 850 платежей, каждый понедельник в 6:00, плюс DPD по каждому кредиту, посчитанный из графика платежей, чтобы у его модели была целевая переменная.»* Жасур: *«И я хочу видеть assert-ы. Конвейер, который не может доказать собственные количества, — это конвейер, которому я не могу доверять в 6 утра.»*

## Сегодня в 3 строках :id=today-in-3-lines

- **`groupby` / `agg`** — это `GROUP BY` с именованными результатами; **`transform`** — это оконная функция (итог по группе рядом с каждой строкой); **`merge`** — это соединение, где `how=`, `validate=` и `indicator=` — страховочные ремни, которых в SQL у вас никогда не было; `concat` — это `UNION ALL`; `pivot_table` — это перекрёстная таблица.
- Очистка — это те же три исправления, что на неделе 4: текст (`.str.strip().str.lower()`, `replace`), даты (`to_datetime(errors="coerce")` **плюс бизнес-правило**), дубликаты (`duplicated` / `drop_duplicates(subset=, keep=)` после сортировки) — написанные один раз, проверенные через `assert`, перезапускаемые вечно.
- Вы можете воспроизвести в pandas все количества очистки с недели 4 — дублирующиеся люди (и ловушка ключа по имени), невозможные даты рождения, дублирующиеся платежи, написания способов оплаты — и посчитать **DPD для каждого кредита** из `installments.csv` + платежей, сверив результат со столбцом из SQL по каждому кредиту.

---

## 1. Теория — несколько таблиц, один ноутбук :id=1-learn--several-tables-one-notebook

У каждого понятия ниже одни и те же пять частей: что это, как пишется (блок, который можно запустить), когда применять, ловушка и небольшое задание. Запускайте блоки сверху вниз — все они используют фреймы первого блока.

### Сегодняшние фреймы :id=todays-frames

Запустите этот блок первым (▶ Run); все блоки ниже используют его пять фреймов. В `pay` дубли уже удалены, а `method` исправлен — это два исправления, которые вы изучите ниже, — поэтому числа в комментариях совпадают с чистым портфелем; `pay_raw` хранит файл в том виде, как он записан.

```python
import pandas as pd
import numpy as np
AS_OF = pd.Timestamp("2026-10-01")
# 52 875 строк, как записано
pay_raw = pd.read_csv("../excel/payments_dirty.csv", parse_dates=["paid_at"])
pay = (pay_raw.sort_values("payment_id")
              # 52 850 — удаление дублей, объяснено ниже
              .drop_duplicates(subset=["installment_id", "paid_at", "amount"])
              .assign(method=lambda d: d["method"].str.strip().str.lower().replace({"bank transfer": "transfer"})))
# 6 040 строк, грязные намеренно
cust = pd.read_csv("../excel/customers_dirty.csv")
# 92 193 платежа по графику
inst = pd.read_csv("../excel/installments.csv", parse_dates=["due_date"])
# 7 828 кредитов
loans = pd.read_csv("../excel/loans_status.csv", parse_dates=["disbursed_at"])
len(pay_raw), len(pay), len(cust), len(inst), len(loans)
```

Блок показывает `(52875, 52850, 6040, 92193, 7828)`: пять количеств строк, с которых начинается каждый блок ниже.

### groupby — один агрегат на группу :id=groupby--one-aggregate-per-group

**Что это.** `groupby` (*group by*, группировка) разбивает фрейм на группы по значениям **ключевого** столбца, считает по одному числу на группу и собирает результаты — по одной строке на группу. Это `GROUP BY` с недели 2.

**Как пишется.**

```python
by_region = pay.groupby("region")["amount"].sum()  # ключ → столбец → агрегат
by_region.sort_values(ascending=False).head()
```

| region | amount |
|---|---|
| Tashkent | 102 605 410 110 |
| Fergana | 34 437 790 032 |
| Samarkand | 27 576 625 156 |
| Andijan | 24 138 491 453 |
| Namangan | 21 044 366 065 |

Возвращаются восемь регионов, по строке на каждый; клиенты Ташкента заплатили 102.6 млрд — втрое больше, чем Фергана с её 34.4 млрд.

Три шага на четырёх оплатах:

```pic
{"id": "w05d3-pic1", "title": "Разбить по ключу, сложить каждую группу, собрать", "caption": "Каждый цвет — одна группа. Две оплаты Tashkent дают 400, Fergana — 250, и в результате по строке на регион. Ключ становится индексом, отсортированным: Fergana перед Tashkent.", "tables": [{"id": "src", "name": "pay", "cols": ["region", "amount"], "rows": [["Tashkent", 100], ["Fergana", 200], ["Tashkent", 300], ["Fergana", 50]], "tone": ["a", "b", "a", "b"]}, {"id": "res", "name": "результат", "cols": ["region", "amount"], "rows": [["Fergana", 250], ["Tashkent", 400]], "tone": ["b", "a"], "tags": {"region": "индекс"}, "via": "groupby(\"region\") → sum"}]}
```

Функции, которые можно назвать: `sum`, `mean`, `median`, `min`, `max`, `count`, `size`, `nunique`, `first`. **Ключ становится индексом** результата; `.reset_index()` возвращает его в столбец.

**Когда применять.**
- Любой вопрос «по X»: оплачено по региону, кредитов по филиалу, остаток долга по продукту.
- Перед графиком: по столбику на группу.

> ⚠️ **Осторожно.** `groupby` молча отбрасывает строки, у которых ключ — NaN. Сгруппируйте клиентов по столбцу с пропусками — и группы «пусто» в результате просто не будет; передайте `dropna=False`, чтобы увидеть её строкой (снова полоса NULL с недели 2). Для ключа типа `category` передавайте `observed=True`, иначе pandas добавит пустые строки для категорий без данных.

**Ваша очередь.**

```game
{"type": "cloze", "id": "w05d3-g1", "title": "Сумма оплат по регионам", "text": "pay.groupby({{0}})[{{1}}].{{2}}()     # Σ amount per region", "blanks": [["\"region\""], ["\"amount\""], ["sum"]], "distractors": ["\"payment_id\"", "transform", "mean"]}
```

> 🎬 **Остались вопросы про groupby?** [Глеб Михайлов объясняет · 10 мин](https://youtu.be/dd3RcafdOQk?t=10364&end=10956)

### agg — несколько агрегатов с именами :id=agg--several-aggregates-with-names

**Что это.** `.agg(name=("column", "function"))` считает **несколько** чисел на группу за один вызов и даёт имя каждому результату. Это **именованная агрегация** (*named aggregation*) — `SUM(amount) AS total` со встроенным `AS`.

**Как пишется.**

```python
by_region = pay.groupby("region").agg(payments=("payment_id", "size"),
                                      total=("amount", "sum"),
                                      avg=("amount", "mean"))
by_region.sort_values("total", ascending=False).round(0).head(3)
```

| region | payments | total | avg |
|---|---|---|---|
| Tashkent | 20 437 | 102 605 410 110 | 5 020 571 |
| Fergana | 6 334 | 34 437 790 032 | 5 436 973 |
| Samarkand | 6 037 | 27 576 625 156 | 4 567 935 |

В Ташкенте 20 437 оплат в среднем по 5.02 млн; в Фергане их втрое меньше, зато каждая крупнее — 5.44 млн.

**`size` против `count`.** `size` считает строки; `count` — непустые значения столбца: `COUNT(*)` против `COUNT(col)`:

```python
cust.groupby("segment").agg(customers=("customer_id", "size"), with_income=("monthly_income", "count"))
```

| segment | customers | with_income |
|---|---|---|
| affluent | 1 204 | 1 132 |
| mass | 3 585 | 3 377 |
| sme | 1 251 | 1 175 |

3 585 клиентов mass, но доход указан только у 3 377 из них: разница — это 208 пропущенных доходов.

**Когда применять.**
- Сводная таблица с несколькими столбцами на группу: количество, итог, среднее.
- Каждый раз, когда вы написали бы две строки `groupby` по одному и тому же ключу.

> ⚠️ **Осторожно.** `"count"` пропускает NaN, `"size"` — нет. Клиентов считайте через `size` (или `count` по id); *ответы* — через `count` по самому столбцу. Если их перепутать, доля молча не учтёт пропуски.

**Ваша очередь.** У скольких клиентов affluent нет дохода в данных?

```task
{"id": "w05d3-l1", "kind": "python", "starter": "import pandas as pd\nc3 = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# ваш код: по сегменту — строки (size) и указанные доходы (count по monthly_income); выведите разницу для affluent\n", "answer": 72, "dp": 0, "hint": "g = c3.groupby(\"segment\").agg(n=(\"customer_id\", \"size\"), inc=(\"monthly_income\", \"count\")); затем g[\"n\"] - g[\"inc\"].", "model": "g = c3.groupby(\"segment\").agg(n=(\"customer_id\", \"size\"), inc=(\"monthly_income\", \"count\"))\nprint(g[\"n\"] - g[\"inc\"])     # affluent 72 · mass 208 · sme 76\n\n72 + 208 + 76 = 356 — все пропущенные доходы файла."}
```

### groupby по двум ключам — и unstack :id=groupby-on-two-keys--and-unstack

**Что это.** Список ключей группирует по каждой **комбинации**: `groupby(["product", "method"])` даёт по группе на каждую пару «продукт и способ». У результата двухуровневый индекс (`MultiIndex`); `.unstack()` переносит последний ключ в столбцы и превращает список в перекрёстную таблицу.

**Как пишется.**

```python
# строка на пару: 5 × 5 = 25 строк
pm = pay.groupby(["product", "method"]).size()
# второй ключ становится столбцами
pm.unstack(fill_value=0)
```

| product | card | cash | click | payme | transfer |
|---|---|---|---|---|---|
| Auto loan | 1 563 | 799 | 766 | 784 | 776 |
| Buy now pay later | 2 762 | 1 411 | 1 356 | 1 419 | 1 426 |
| Consumer loan | 7 154 | 3 596 | 3 556 | 3 667 | 3 501 |
| Micro loan | 3 432 | 1 648 | 1 718 | 1 626 | 1 668 |
| Small business loan | 2 701 | 1 334 | 1 390 | 1 401 | 1 396 |

25 ячеек, по одной на продукт и способ; в каждой строке на карту приходится около трети, а на каждый из остальных четырёх — около шестой части: способ оплаты не зависит от продукта.

`as_index=False` (или `.reset_index()`) возвращает ключи обычными столбцами — такая форма нужна перед `merge` или графиком.

**Когда применять.**
- «По X и Y»: кредиты по региону и статусу, оплаты по продукту и способу.
- Перекрёстная таблица количеств или сумм (`unstack`) или длинные данные для графика seaborn (без `unstack`).

> ⚠️ **Осторожно.** `unstack()` без `fill_value=0` пишет NaN там, где у пары нет строк (например, нет ни одного кредита SME в 61–90). NaN в таблице количеств означает «ноль» — заполните его.

**Ваша очередь.** Сколько кредитов в Ташкенте списано (written_off)?

```task
{"id": "w05d3-l2", "kind": "python", "starter": "import pandas as pd\nls3 = pd.read_csv(\"../excel/loans_status.csv\")\n\n# ваш код: кредиты по региону и статусу как перекрёстная таблица; выведите строку Tashkent\n", "answer": 73, "dp": 0, "hint": "ls3.groupby([\"region\", \"status\"]).size().unstack(fill_value=0).loc[\"Tashkent\"]", "model": "t = ls3.groupby([\"region\", \"status\"]).size().unstack(fill_value=0)\nprint(t.loc[\"Tashkent\"])     # active 1279 · closed 1650 · default 18 · written_off 73\n\n73 списанных кредита из 3 020 ташкентских; у Termez нет ни одного кредита в default, и его ячейка равна 0 только благодаря fill_value=0."}
```

### transform — число группы в каждой строке :id=transform--the-groups-number-on-every-row

**Что это.** `transform` считает число группы и записывает его **рядом с каждой строкой этой группы**. В результате столько же строк, сколько во фрейме. Это оконная функция с недели 3: `SUM(amount) OVER (PARTITION BY loan_id)`.

```pic
{"id": "w05d3-pic2", "title": "transform пишет итог группы в каждую строку", "caption": "18 оплат кредита 1 дают 31 350 600, 9 оплат кредита 2 — 25 119 000. Каждый итог стоит в каждой строке своего кредита (один цвет), поэтому во фрейме остаются все строки — `agg` вернул бы по строке на кредит.", "tables": [{"id": "p", "name": "pay", "cols": ["payment_id", "loan_id", "amount", "loan_total"], "rows": [[1, 1, "1 741 700", "31 350 600"], [2, 1, "1 741 700", "31 350 600"], [19, 2, "2 791 000", "25 119 000"], [20, 2, "2 791 000", "25 119 000"]], "new": ["loan_total"], "tone": ["a", "a", "b", "b"], "more": "… ещё строки"}]}
```

**Как пишется.**

```python
# SUM(amount) OVER (PARTITION BY loan_id)
pay["loan_total"] = pay.groupby("loan_id")["amount"].transform("sum")
# доля каждой оплаты в оплатах по её кредиту
pay["share"] = pay["amount"] / pay["loan_total"]
pay[["payment_id", "loan_id", "amount", "loan_total", "share"]].head(3).round(4)
```

| payment_id | loan_id | amount | loan_total | share |
|---|---|---|---|---|
| 1 | 1 | 1 741 700 | 31 350 600 | 0.0556 |
| 2 | 1 | 1 741 700 | 31 350 600 | 0.0556 |
| 3 | 1 | 1 741 700 | 31 350 600 | 0.0556 |

Восемнадцать оплат по кредиту 1 дают в сумме 31 350 600, и этот итог стоит в каждой из 18 строк — поэтому каждая оплата составляет 1/18 денег по кредиту (0.0556).

Та же схема отвечает на вопрос «по сравнению с моей группой»: медиана дохода сегмента рядом с каждым клиентом, затем сравнение в строке.

```python
cust["seg_median"] = cust.groupby("segment")["monthly_income"].transform("median")
# сырой customers_dirty.csv: 2 841 зарабатывают выше медианы своего сегмента
(cust["monthly_income"] > cust["seg_median"]).sum()
```

| | `agg` | `transform` |
|---|---|---|
| строк в ответе | по одной на группу | по одной на исходную строку |
| SQL | `GROUP BY` | `… OVER (PARTITION BY …)` |
| для чего | сводная таблица | доля группы, отклонение от среднего группы, ранг внутри группы |

`groupby(key).cumsum()` — накопительный итог внутри каждой группы; `groupby(key).cumcount()` нумерует строки 0, 1, 2 … — это `ROW_NUMBER() OVER (PARTITION BY key)`.

**Когда применять.**
- Доли от итога группы, отклонение от среднего по группе, флаг «выше моего сегмента».
- Спросите «сколько строк я хочу получить?» — столько же, сколько во фрейме → `transform`; одну на группу → `agg`.

> ⚠️ **Осторожно.** Результат `agg`, присвоенный как столбец (`pay["t"] = pay.groupby("loan_id")["amount"].sum()`), не повторяется по строкам: pandas выравнивает его по индексу, и большинство строк получат NaN или итог чужого кредита. Для столбца «на каждую строку» нужен `transform`.

**Ваша очередь.** У скольких кредитов остаток долга больше, чем у среднего кредита их собственного продукта?

```task
{"id": "w05d3-l3", "kind": "python", "starter": "import pandas as pd\nls3 = pd.read_csv(\"../excel/loans_status.csv\")\n\n# ваш код: средний остаток продукта в каждой строке (transform), затем посчитайте кредиты выше него\n", "answer": 2286, "dp": 0, "hint": "ls3[\"prod_avg\"] = ls3.groupby(\"product\")[\"outstanding\"].transform(\"mean\"); затем (ls3[\"outstanding\"] > ls3[\"prod_avg\"]).sum().", "model": "ls3[\"prod_avg\"] = ls3.groupby(\"product\")[\"outstanding\"].transform(\"mean\")\nprint((ls3[\"outstanding\"] > ls3[\"prod_avg\"]).sum())     # 2286\n\n2 286 из 7 828 кредитов — меньше трети, потому что закрытые кредиты (остаток 0) тянут среднее каждого продукта вниз."}
```

### value_counts — короткий путь для подсчёта :id=value_counts--the-shortcut-for-counting

**Что это.** `col.value_counts()` считает строки по каждому значению одного столбца, от большего к меньшему. Это отсортированный `groupby(col).size()` — самый частый `GROUP BY … COUNT(*)` в одно слово. `normalize=True` даёт доли вместо количеств.

**Как пишется.**

```python
counts = pay["method"].value_counts()
shares = pay["method"].value_counts(normalize=True).mul(100).round(2)
pd.DataFrame({"payments": counts, "share_pct": shares})
```

| method | payments | share_pct |
|---|---|---|
| card | 17 612 | 33.32 |
| payme | 8 897 | 16.83 |
| cash | 8 788 | 16.63 |
| click | 8 786 | 16.62 |
| transfer | 8 767 | 16.59 |

На карту приходится треть из 52 850 оплат (17 612, 33.32 %); остальные четыре способа делят остаток почти поровну.

| вам нужно | пишите |
|---|---|
| количества, от большего | `col.value_counts()` |
| доли | `col.value_counts(normalize=True)` |
| в естественном порядке (корзины) | `col.value_counts().sort_index()` |
| пропуски отдельной строкой | `col.value_counts(dropna=False)` |
| сколько разных значений | `col.nunique()` |

**Когда применять.**
- Первый взгляд на любой текстовый столбец: какие значения, как часто, какие написания.
- Подсчёт по одному столбцу; для двух столбцов или другого агрегата — `groupby`.

> ⚠️ **Осторожно.** `value_counts()` по умолчанию скрывает NaN — 356 пропущенных доходов просто не стали бы строкой. Добавляйте `dropna=False`, когда пропуски возможны.

**Ваша очередь.** Какая доля кредитов имеет грейд D, в % с двумя знаками?

```task
{"id": "w05d3-l4", "kind": "python", "starter": "import pandas as pd\nls3 = pd.read_csv(\"../excel/loans_status.csv\")\n\n# ваш код: доля каждого грейда, в %\n", "answer": 4.33, "dp": 2, "hint": "ls3[\"grade\"].value_counts(normalize=True).mul(100).round(2)", "model": "print(ls3[\"grade\"].value_counts(normalize=True).mul(100).round(2))\n# B 43.48 · C 28.92 · A 23.26 · D 4.33\n\n339 из 7 828 кредитов имеют грейд D: 4.33 %."}
```

### merge — соединение и его четыре how= :id=merge--the-join-and-its-four-how

**Что это.** `left.merge(right, on="key", how=...)` — это **соединение** (*join*): строки двух фреймов ставятся рядом там, где совпадает ключ. `how=` решает, что будет со строкой **без пары**, — ровно INNER / LEFT / RIGHT / FULL с недели 2.

```pic
{"id": "w05d3-pic3", "title": "how=\"left\" сохраняет каждую левую строку; без пары — NaN", "caption": "Платежи 2 и 3 находят оплату (тот же цвет). У платежа 1 оплаты нет, и он остаётся с **NaN** в `paid`; у лишней оплаты 4 нет левой строки, поэтому левое соединение её отбрасывает (зачёркнута).", "tables": [{"id": "sched", "name": "sched", "cols": ["installment_id", "total_due"], "rows": [[1, 100], [2, 100], [3, 100]]}, {"id": "got", "name": "got", "cols": ["installment_id", "paid"], "rows": [[2, 100], [3, 60], [4, 50]], "drop": [2]}, {"id": "res", "name": "результат", "cols": ["installment_id", "total_due", "paid"], "rows": [[1, 100, "NaN"], [2, 100, 100], [3, 100, 60]], "cells": [[0, "paid"]], "via": "merge(got, how=\"left\")"}], "links": [{"from": ["sched", 1, "installment_id"], "to": ["got", 0, "installment_id"]}, {"from": ["sched", 2, "installment_id"], "to": ["got", 1, "installment_id"]}]}
```

**Как пишется.** Сначала два крошечных фрейма: три платежа по графику и оплаты для платежей 2, 3 и случайного 4.

```python
sched = pd.DataFrame({"installment_id": [1, 2, 3], "total_due": [100, 100, 100]})
got = pd.DataFrame({"installment_id": [2, 3, 4], "paid": [100, 60, 50]})
for how in ["inner", "left", "right", "outer"]:
    print(how, "\n", sched.merge(got, on="installment_id", how=how), "\n")
```

| `sched` | installment_id | total_due |
|---|---|---|
| | 1 | 100 |
| | 2 | 100 |
| | 3 | 100 |

| `got` | installment_id | paid |
|---|---|---|
| | 2 | 100 |
| | 3 | 60 |
| | 4 | 50 |

| `how=` | installment_id | total_due | paid | строк |
|---|---|---|---|---|
| `"inner"` (по умолчанию) | 2, 3 | 100, 100 | 100, 60 | 2 — только совпадения |
| `"left"` | 1, 2, 3 | 100, 100, 100 | **NaN**, 100, 60 | 3 — каждая левая строка |
| `"right"` | 2, 3, 4 | 100, 100, **NaN** | 100, 60, 50 | 3 — каждая правая строка |
| `"outer"` | 1, 2, 3, 4 | 100, 100, 100, NaN | NaN, 100, 60, 50 | 4 — всё |

У платежа 1 нет оплаты: его сохраняют только `left` и `outer`, с NaN в `paid`. Случайная оплата 4 выживает только в `right` и `outer`.

На реальных данных:

```python
paid = pay[pay["paid_at"] <= AS_OF].groupby("installment_id", as_index=False).agg(paid=("amount", "sum"))
len(paid), len(inst.merge(paid, on="installment_id")), len(inst.merge(paid, on="installment_id", how="left"))
```

Блок показывает `(52826, 52826, 92193)`: у 52 826 платежей по графику есть оплата; внутреннее соединение оставляет только их, левое сохраняет все 92 193.

| `how=` | SQL (неделя 2) | Power Query (неделя 4) |
|---|---|---|
| `"inner"` (по умолчанию) | `INNER JOIN` | Inner |
| `"left"` | `LEFT JOIN` | Left Outer |
| `"right"` | `RIGHT JOIN` | Right Outer |
| `"outer"` | `FULL OUTER JOIN` | Full Outer |

**Когда применять.**
- Столбцы из двух таблиц в одной строке: платёж по графику с тем, что по нему оплачено; оплата с продуктом её кредита.
- `how="left"` всегда, когда левая таблица — «список, который должен быть полным»: все платежи по графику, все кредиты.

> ⚠️ **Осторожно.** По умолчанию `how="inner"`, **а не** `left`. Забытое `how=` отбрасывает каждый платёж по графику без оплаты — ровно те неоплаченные, ради которых считается DPD, — и ничто вас не предупредит. Пишите `how=` в каждом merge и считайте строки после него.

**Ваша очередь.** При левом соединении `paid` с `inst` — у скольких платежей по графику нет ни одной оплаты до даты отчёта?

```task
{"id": "w05d3-l5", "kind": "python", "starter": "import pandas as pd\nAS_OF = pd.Timestamp(\"2026-10-01\")\ni3 = pd.read_csv(\"../excel/installments.csv\", parse_dates=[\"due_date\"])\np3 = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n        .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))\npd3 = p3[p3[\"paid_at\"] <= AS_OF].groupby(\"installment_id\", as_index=False).agg(paid=(\"amount\", \"sum\"))\n\n# ваш код: левое соединение pd3 с i3, затем посчитайте строки, где paid — NaN\n", "answer": 39367, "dp": 0, "hint": "m = i3.merge(pd3, on=\"installment_id\", how=\"left\"); m[\"paid\"].isna().sum()", "model": "m = i3.merge(pd3, on=\"installment_id\", how=\"left\")\nprint(len(m), m[\"paid\"].isna().sum())     # 92193 39367\n\n39 367 платежей по графику без оплаты — большинство из них просто ещё не наступили (графики идут до 2030 года)."}
```

> 🎬 **Остались вопросы про соединение таблиц (join / merge)?** [Глеб Михайлов объясняет · 10 мин](https://youtu.be/dd3RcafdOQk?t=16035&end=16612)

### Ключи merge — on, left_on / right_on, суффиксы :id=merge-keys--on-left_on--right_on-suffixes

**Что это.** **Ключ** — это столбец, который должен совпасть. `on="loan_id"`, когда в обоих фреймах он называется одинаково; `left_on=` / `right_on=`, когда имена различаются; `on=["a", "b"]` — ключ из двух столбцов. Столбцы, которые есть с обеих сторон и не являются ключом, получают **суффиксы** `_x` / `_y`.

**Как пишется.**

```python
prod = pd.DataFrame({"name": ["Micro loan", "Consumer loan", "Buy now pay later", "Auto loan", "Small business loan"],
                     # products.annual_rate
                     "annual_rate": [0.42, 0.30, 0.0, 0.24, 0.26]})
# разные имена с каждой стороны
lr = loans.merge(prod, left_on="product", right_on="name", how="left")
print(len(lr), round(lr["annual_rate"].mean(), 4))
both = pay.merge(loans[["loan_id", "product", "region"]], on="loan_id", how="left")
print([c for c in both.columns if c[:7] in ("product", "region_")])
```

```output
7828 0.2738
['product_x', 'region_x', 'product_y', 'region_y']
```

Каждый из 7 828 кредитов нашёл ставку своего продукта, и средний кредит стоит 27.38 % годовых. И в оплатах, и в кредитах есть `product` и `region`, поэтому соединение сохраняет обе копии: `_x` (слева) и `_y` (справа).

| у вас | пишите |
|---|---|
| одно и то же имя ключа с обеих сторон | `on="loan_id"` |
| разные имена | `left_on="product", right_on="name"` |
| ключ из двух столбцов | `on=["loan_id", "installment_no"]` |
| совпадающие имена столбцов | `suffixes=("", "_loan")` — левое имя без изменений, правое помечено |

**Когда применять.**
- В каждом merge: называйте ключ намеренно, не полагайтесь на то, что pandas сам найдёт общий столбец.
- `suffixes=` — всегда, когда оба фрейма несут одни и те же описательные столбцы.

> ⚠️ **Осторожно.** Ключ, который выглядит одинаково, но имеет другой тип, не совпадёт: `loan_id` как `int64` с одной стороны и как текст с другой вызывает `ValueError: You are trying to merge on int64 and object columns`. Проверьте `dtypes` и приведите одну сторону перед соединением.

**Ваша очередь.** Средняя годовая ставка по всем 7 828 кредитам, в % с двумя знаками.

```task
{"id": "w05d3-l6", "kind": "python", "starter": "import pandas as pd\nls3 = pd.read_csv(\"../excel/loans_status.csv\")\nrates = pd.DataFrame({\"name\": [\"Micro loan\", \"Consumer loan\", \"Buy now pay later\", \"Auto loan\", \"Small business loan\"],\n                      \"annual_rate\": [0.42, 0.30, 0.0, 0.24, 0.26]})\n\n# ваш код: присоедините ставку к каждому кредиту (у ключа разные имена), затем средняя ставка в %\n", "answer": 27.38, "dp": 2, "hint": "ls3.merge(rates, left_on=\"product\", right_on=\"name\", how=\"left\")[\"annual_rate\"].mean() * 100", "model": "m = ls3.merge(rates, left_on=\"product\", right_on=\"name\", how=\"left\")\nprint(len(m), round(100 * m[\"annual_rate\"].mean(), 2))     # 7828 27.38\n\nЧисло строк остаётся 7 828: каждый кредит находит ровно один продукт."}
```

### validate= и indicator= — страховочные ремни :id=validate-and-indicator--the-safety-belts

**Что это.** Два аргумента, которых SQL вам никогда не давал. **`validate=`** заявляет ожидаемое зерно — `"1:1"`, `"m:1"` или `"1:m"` — и вызывает `MergeError`, если ключ не уникален на той стороне, за которую вы поручились. **`indicator=True`** добавляет столбец `_merge`, который говорит, откуда пришла каждая строка: `both`, `left_only` или `right_only`.

**Как пишется.**

```python
m = inst.merge(paid, on="installment_id", how="left", validate="1:1", indicator=True)
m["_merge"].value_counts()
```

| _merge | count |
|---|---|
| both | 52 826 |
| left_only | 39 367 |
| right_only | 0 |

52 826 платежей по графику нашли итог оплат, у 39 367 его нет, и ни один итог оплат не указывает на несуществующий платёж по графику. `validate="1:1"` прошёл: каждый платёж по графику встречается по одному разу с каждой стороны.

**Анти-соединение** — это один фильтр по этому столбцу: `m[m["_merge"] == "left_only"]` — платежи по графику без оплаты, `LEFT JOIN … WHERE right IS NULL` с недели 2.

| аргумент | что проверяет | какую ошибку недели 2 останавливает |
|---|---|---|
| `validate="m:1"` | ключ справа уникален | размножение строк: Σ principal ×24.7 после соединения с платежами по графику |
| `validate="1:1"` | оба ключа уникальны | дубль строки с любой стороны |
| `indicator=True` | откуда пришла каждая строка | анти-соединение вручную или строки, потерянные без следа |

**Когда применять.**
- `validate=` — в каждом merge, зерно которого вы «знаете»: тогда соединение его докажет.
- `indicator=True` — когда нужны строки без пары или нужно убедиться, что их нет.

> ⚠️ **Осторожно.** `validate=` ничего не стоит, и все его пропускают. Без него дублирующийся ключ справа размножает строки, и каждая сумма после этого завышена — без всякой ошибки. Пишите то зерно, в которое верите; `MergeError` — бесплатный урок о данных.

**Ваша очередь.** Вы присоединяете кредиты к оплатам: `pay.merge(loans, on="loan_id", how="left", validate=…)`. Какое зерно верно?

```task
{"id": "w05d3-l7", "kind": "choice", "options": ["\"1:1\" — одна оплата на кредит", "\"m:1\" — много оплат на кредит, каждый кредит один раз в loans", "\"1:m\" — одна оплата, много кредитов", "validate в этом соединении невозможен"], "answer": 1, "explain": "У кредита много оплат (слева loan_id повторяется), а в loans одна строка на кредит (справа уникально): m:1. \"1:1\" вызвал бы MergeError на первом же кредите с двумя оплатами."}
```

### concat — складываем фреймы стопкой (UNION ALL) :id=concat--stacking-frames-union-all

**Что это.** `pd.concat([a, b])` кладёт фреймы **друг под друга**: строки `a`, затем строки `b`. Столбцы сопоставляются **по имени**. Это `UNION ALL` из SQL и Append с недели 4.

**Как пишется.**

```python
a = pay[pay["region"] == "Tashkent"].assign(source="tashkent")
b = pay[pay["region"] != "Tashkent"].assign(source="rest")
u = pd.concat([a, b], ignore_index=True)  # перенумеровать индекс 0 … n-1
len(a), len(b), len(u)
```

| фрейм | строк |
|---|---|
| `a` (Tashkent) | 20 437 |
| `b` (остальные) | 32 413 |
| `pd.concat([a, b])` | 52 850 |

20 437 + 32 413 = 52 850: две половины снова складываются в весь чистый портфель. Столбец `source` помнит, из какой половины пришла каждая строка.

| | `concat` | `merge` |
|---|---|---|
| ставит фреймы | друг под друга (строки) | рядом (столбцы) |
| сопоставляет | столбцы по имени | строки по ключу |
| SQL | `UNION ALL` | `JOIN` |

**Когда применять.**
- Двенадцать месячных файлов в один фрейм; выгрузка этого месяца под выгрузкой прошлого.
- Сначала добавьте столбец `source`, чтобы каждая строка помнила свой файл.

> ⚠️ **Осторожно.** Столбец, написанный по-разному в двух фреймах (`Amount` и `amount`), не вызывает ошибку: в результате будет **два** столбца, каждый — NaN в строках другого фрейма. Проверяйте `set(a.columns) == set(b.columns)` перед каждым concat.

**Ваша очередь.**

```game
{"type": "match", "id": "w05d3-g2", "title": "Какое это соединение?", "pairs": [["how=\"inner\"", "INNER JOIN — только совпадения"], ["how=\"left\"", "LEFT JOIN — каждая левая строка, NaN там, где нет совпадения"], ["how=\"outer\"", "FULL OUTER JOIN — всё с обеих сторон"], ["indicator=True + \"left_only\"", "анти-соединение: LEFT JOIN … WHERE right IS NULL"], ["validate=\"m:1\"", "ошибка, если ключ справа не уникален"], ["pd.concat([a, b])", "UNION ALL — сложить строки, столбцы по имени"]]}
```

### pivot_table — перекрёстная таблица (а также pivot / melt) :id=pivot_table--the-cross-tab-and-pivot--melt

**Что это.** `pd.pivot_table` — это сводная таблица Excel (*pivot table*): значения одного столбца становятся строками (`index=`), значения другого — столбцами (`columns=`), а в каждой ячейке — агрегат (`aggfunc=`) третьего (`values=`). `margins=True` добавляет строку и столбец итогов.

**Как пишется.**

```python
pd.pivot_table(loans, index="bucket", columns="product", values="loan_id",
               aggfunc="count", fill_value=0, margins=True)
```

| bucket | Auto loan | Buy now pay later | Consumer loan | Micro loan | Small business loan | All |
|---|---|---|---|---|---|---|
| 0 | 362 | 1 505 | 2 280 | 2 548 | 734 | 7 429 |
| 1-30 | 14 | 16 | 50 | 28 | 16 | 124 |
| 61-90 | 2 | 2 | 4 | 8 | 0 | 16 |
| 90+ | 10 | 42 | 77 | 76 | 29 | 234 |
| All | 391 | 1 569 | 2 418 | 2 669 | 781 | 7 828 |

(Строка 31-60 — 25 кредитов — на картинке опущена.) Из 234 кредитов в 90+ 77 — Consumer и 76 — Micro; ячейка SME в 61-90 равна 0 только потому, что `fill_value=0` заполнил пустую пару.

Два родственника:

| вызов | делает | для чего |
|---|---|---|
| `pd.crosstab(a, b)` | только количества, короче | грейд × корзина |
| `df.pivot(index=, columns=, values=)` | из длинной формы в широкую, **без** агрегации | `monthly_disbursements.csv`: 170 строк → 34 месяца × 5 продуктов |
| `df.melt(id_vars=, var_name=, value_name=)` | из широкой в длинную | форма, которую хочет seaborn (День 4) |

**Когда применять.**
- Двумерная таблица количеств, сумм или средних для читателя: корзина × продукт, регион × статус.
- `pivot` / `melt` — когда в каждой ячейке уже одно значение и неверна только форма.

> ⚠️ **Осторожно.** `pivot` (без `_table`) вызывает `ValueError: Index contains duplicate entries`, когда две строки делят одну пару «строка–столбец»: складывать он не умеет. Когда пары повторяются, нужен `pivot_table` с `aggfunc`.

**Ваша очередь.** Остаток долга (сумма) по региону × продукту: сколько остатка SME приходится на Ташкент?

```task
{"id": "w05d3-l8", "kind": "python", "starter": "import pandas as pd\nls3 = pd.read_csv(\"../excel/loans_status.csv\")\n\n# ваш код: pivot_table по outstanding, сумма, регион × продукт; выведите ячейку Tashkent / SME\n", "answer": 47901694555, "dp": 0, "hint": "pt = pd.pivot_table(ls3, index=\"region\", columns=\"product\", values=\"outstanding\", aggfunc=\"sum\", fill_value=0); pt.loc[\"Tashkent\", \"Small business loan\"]", "model": "pt = pd.pivot_table(ls3, index=\"region\", columns=\"product\", values=\"outstanding\", aggfunc=\"sum\", fill_value=0)\nprint(pt.loc[\"Tashkent\", \"Small business loan\"])     # 47901694555\n\n47.9 млрд — больше пятой части всего портфеля 208.7 млрд лежит в ташкентских кредитах SME."}
```

> 🎬 **Остались вопросы про pivot_table?** [Глеб Михайлов объясняет · 9 мин](https://youtu.be/dd3RcafdOQk?t=12425&end=12960)

### Ремонт текста через .str — strip, lower, replace :id=text-repair-with-str--strip-lower-replace

**Что это.** `col.str.<method>` применяет строковый метод к **каждому значению** текстового столбца и не трогает NaN: `.str.strip()`, `.str.lower()`, `.str.title()`, `.str.contains()`, `.str.startswith()`, `.str.replace()`. `col.replace({old: new})` заменяет **значения целиком**.

**Как пишется.**

```python
raw = pay_raw["method"].value_counts()
clean = pay_raw["method"].str.strip().str.lower().replace({"bank transfer": "transfer"}).value_counts()
raw.head(10), clean
```

| сырое написание | строк | | чистое | строк |
|---|---|---|---|---|
| card | 17 564 | | card | 17 621 |
| Card | 57 | | payme | 8 900 |
| Click | 36 | | cash | 8 790 |
| PayMe | 30 | | click | 8 790 |
| `CASH ` | 30 | | transfer | 8 774 |
| bank transfer | 27 | | | |

Десять сырых написаний — 180 строк вне пяти чистых — сворачиваются в пять способов. (Эти количества — на сырых 52 875 строках; в `pay` без дублей card — 17 612.)

| неделя 4 (Excel / Power Query) | pandas |
|---|---|
| `TRIM` | `.str.strip()` |
| `LOWER` / `PROPER` | `.str.lower()` / `.str.title()` |
| `SUBSTITUTE` внутри текста | `.str.replace("a", "b")` |
| Замена значений (вся ячейка) | `.replace({"bank transfer": "transfer"})` |
| текст содержит | `.str.contains("Tashkent")` |

**Когда применять.**
- Любой текстовый ключ перед группировкой или соединением: пробелы и регистр дробят одну группу на несколько.
- Имена для отчёта: `.str.strip().str.title()`.

> ⚠️ **Осторожно.** Стройте цепочку в порядке журнала изменений: strip → lower → replace. Замена `"bank transfer"` до приведения к нижнему регистру пропустит `"Bank Transfer"`; а `"cash "` с пробелом не станет `"cash"`, пока вы не сделаете strip.

**Ваша очередь.** Сколько сырых строк оплат имеют способ, которого нет среди пяти чистых написаний?

```task
{"id": "w05d3-l9", "kind": "python", "starter": "import pandas as pd\npr3 = pd.read_csv(\"../excel/payments_dirty.csv\")\nfive = [\"card\", \"payme\", \"cash\", \"click\", \"transfer\"]\n\n# ваш код: посчитайте строки, у которых method не входит в five; затем покажите, что после strip/lower/replace таких не осталось\n", "answer": 180, "dp": 0, "hint": "(~pr3[\"method\"].isin(five)).sum(); затем та же проверка на очищенном столбце.", "model": "print((~pr3[\"method\"].isin(five)).sum())     # 180\nclean = pr3[\"method\"].str.strip().str.lower().replace({\"bank transfer\": \"transfer\"})\nprint((~clean.isin(five)).sum())             # 0"}
```

### Даты, которые лгут — to_datetime(errors=) и бизнес-правило :id=dates-that-lie--to_datetimeerrors-and-the-business-rule

**Что это.** `pd.to_datetime(col, errors="coerce")` превращает текст в даты и пишет **NaT** (*Not a Time*, NULL для дат) везде, где значение не разбирается, — вместо остановки. Разбор проверяет **синтаксис**. Возможна ли дата — не в будущем, не раньше 1920 — это **бизнес-правило**, которое вы пишете сами.

**Как пишется.**

```python
# не разбирается → NaT (а не падение)
cust["birth_date"] = pd.to_datetime(cust["birth_date"], errors="coerce")
# бизнес-правило находит то, чего не найдёт разбор
bad = (cust["birth_date"] > AS_OF) | (cust["birth_date"] < "1920-01-01")
cust["birth_date_invalid"] = bad
# оставить дату, где она валидна, NaT — где нет
cust["birth_date_clean"] = cust["birth_date"].where(~bad)
print(cust["birth_date"].isna().sum(), bad.sum())
cust.loc[bad, ["customer_id", "birth_date"]].head()
```

| customer_id | birth_date |
|---|---|
| 927 | 2031-04-12 |
| 957 | 1900-01-01 |
| 964 | 2027-02-28 |
| 1020 | 1900-01-01 |
| 2338 | 2031-04-12 |

Разбор находит 0 плохих значений — каждая дата рождения корректна по ISO, — но правило находит 7: три в 2031 году, одну в 2027-м, три 1900-01-01 (ещё две, 2934 и 3380, ниже пяти показанных).

| `errors=` | на `"n/a"` или `"2026-02-31"` |
|---|---|
| `"raise"` (по умолчанию) | останавливается с ошибкой |
| `"coerce"` | NaT — посчитайте их через `.isna().sum()` |

`.where(cond)` оставляет значения там, где условие выполняется, а остальные обнуляет; `np.where(cond, a, b)` — двусторонний `IF`.

**Когда применять.**
- Каждый столбец дат из файла, который делали не вы: разбор с `coerce`, подсчёт NaT, затем правило.
- Плохую дату помечайте и обнуляйте; никогда не заменяйте её правдоподобной.

> ⚠️ **Осторожно.** `errors="coerce"` защищает вас от `"n/a"` и `"31.02.2026"`; он **не** защищает от `2031-04-12` — прекрасно разбираемой лжи. Разбор — это синтаксис; валидность — правило, и писать его вам.

**Ваша очередь.** Средний возраст клиентов с валидной датой рождения на дату отчёта, в годах с одним знаком.

```task
{"id": "w05d3-l10", "kind": "python", "starter": "import pandas as pd\nAS_OF = pd.Timestamp(\"2026-10-01\")\nc3 = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# ваш код: разберите birth_date (coerce), оставьте валидные (не позже AS_OF, не раньше 1920), возраст = дни / 365.25\n", "answer": 45.7, "dp": 1, "hint": "b = pd.to_datetime(c3[\"birth_date\"], errors=\"coerce\"); ok = (b <= AS_OF) & (b >= \"1920-01-01\"); ((AS_OF - b[ok]).dt.days / 365.25).mean()", "model": "b = pd.to_datetime(c3[\"birth_date\"], errors=\"coerce\")\nok = (b <= AS_OF) & (b >= \"1920-01-01\")\nprint(ok.sum(), round(((AS_OF - b[ok]).dt.days / 365.25).mean(), 1))     # 6033 45.7\n\nЕсли оставить 7 невозможных дат, дни рождения 1900 года добавят 126-летних, а 2031 года — отрицательный возраст: среднее сдвинется без реальной причины."}
```

### Дубликаты — найти, посмотреть, потом удалить :id=duplicates--find-look-then-drop

**Что это.** `duplicated(subset=, keep=)` помечает строки, которые повторяют более раннюю строку по **ключевым** столбцам из `subset`. `drop_duplicates(subset=, keep=)` удаляет их. `keep="first"` оставляет первую строку каждой группы **в текущем порядке** — поэтому то, какая строка выживет, решает сортировка перед этим.

**Как пишется.**

```python
key = ["installment_id", "paid_at", "amount"]
# True на ВСЕХ членах группы
dup_mask = pay_raw.duplicated(subset=key, keep=False)
print(dup_mask.sum())
# смотрите, прежде чем удалять
pay_raw[dup_mask].sort_values(["installment_id", "payment_id"]).head(2)
```

| payment_id | loan_id | installment_id | paid_at | amount | method |
|---|---|---|---|---|---|
| 110 | 18 | 174 | 2025-05-28 | 663 300 | click |
| 52869 | 18 | 174 | 2025-05-28 | 663 300 | click |

50 строк входят в группы дублей — 25 пар. Оплата 52869 повторяет оплату 110 до дня и до сума: тот же платёж по графику кредита 18, та же дата и сумма, записанные дважды.

```python
# оставить наименьший payment_id
pay_clean = pay_raw.sort_values("payment_id").drop_duplicates(subset=key, keep="first")
# 52 850
len(pay_clean)
```

| `keep=` | `duplicated` помечает | `drop_duplicates` оставляет |
|---|---|---|
| `"first"` | каждую более позднюю копию | первую строку каждой группы |
| `"last"` | каждую более раннюю копию | последнюю строку каждой группы |
| `False` | **каждого** члена (чтобы посмотреть) | ни одного члена |

**Когда применять.**
- Оплаты, записанные дважды; люди, зарегистрированные дважды; выгрузка, загруженная дважды.
- Всегда в три шага: `keep=False`, чтобы посмотреть; сортировка, чтобы выбрать выжившего; `drop_duplicates`, чтобы удалить.

> 💡 **Главное.** Ключ определяет, что считать одинаковым; сортировка определяет, кто выживет; assert на количество доказывает и то и другое.

> ⚠️ **Осторожно.** Без `subset=` pandas сравнивает **все** столбцы и находит здесь 0 дублей, потому что `payment_id` различается в каждой строке, — ловушка «отметить все столбцы» с недели 4, но в параметре.

**Ваша очередь.** Сколько строк `customers_dirty.csv` входит в группы дублей по `phone` + `birth_date` (считая каждого члена)?

```task
{"id": "w05d3-l11", "kind": "python", "starter": "import pandas as pd\nc3 = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# ваш код: duplicated с keep=False по [\"phone\", \"birth_date\"]\n", "answer": 80, "dp": 0, "hint": "c3.duplicated(subset=[\"phone\", \"birth_date\"], keep=False).sum()", "model": "print(c3.duplicated(subset=[\"phone\", \"birth_date\"], keep=False).sum())     # 80\nprint(c3.duplicated(subset=[\"phone\", \"birth_date\"]).sum())                 # 40\n\n80 строк в 40 парах: keep=False помечает обоих членов, keep=\"first\" — только 40 более поздних копий."}
```

### Корзины через pd.cut — категории из чисел :id=buckets-with-pdcut--categories-from-numbers

**Что это.** `pd.cut(col, bins=edges, labels=names)` относит каждое число к интервалу и возвращает его метку. Результат — столбец типа **category** с метками по порядку. Это `CASE WHEN dpd <= 30 THEN …` с недели 2 в одну строку.

**Как пишется.**

```python
edges = [0, 5e6, 10e6, 20e6, np.inf]
bands = pd.cut(cust["monthly_income"], bins=edges, labels=["<5m", "5-10m", "10-20m", "20m+"], right=False)
bands.value_counts(dropna=False).sort_index()
```

| band | customers |
|---|---|
| <5m | 1 281 |
| 5-10m | 2 198 |
| 10-20m | 576 |
| 20m+ | 1 629 |
| NaN | 356 |

2 198 клиентов зарабатывают 5–10 млн в месяц — это самая большая группа; у 356 дохода нет, и они попадают в NaN — видно это только благодаря `dropna=False`.

| аргумент | означает | пример |
|---|---|---|
| по умолчанию (`right=True`) | интервалы `(a, b]` — правая граница входит | DPD: `[-1, 0, 30, 60, 90, np.inf]`, поэтому 30 — это `1-30` |
| `right=False` | интервалы `[a, b)` — левая граница входит | доход: правило `< 5 000 000` |
| первая граница | должна быть *ниже* наименьшего значения | `-1` для DPD, иначе `dpd = 0` станет NaN |
| `np.inf` | открытый верх | `90+`, `20m+` |

`pd.qcut(col, 10)` режет на десять равных по численности групп (децили) — `NTILE(10)` с недели 3.

**Когда применять.**
- Любые группы, заданные границами: корзины DPD, доходные группы, размеры чека.
- Перед `groupby` или `crosstab` по группе; category держит группы по порядку для графиков.

> ⚠️ **Осторожно.** С первой границей 0 и правозамкнутыми интервалами по умолчанию `(0, 30]` не содержит 0: каждый кредит с `dpd = 0` — 7 429 штук — становится NaN. Начинайте границы DPD с −1.

**Ваша очередь.** Сколько клиентов попадает в группу `20m+`?

```task
{"id": "w05d3-l12", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nc3 = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# ваш код: разрежьте monthly_income на <5m / 5-10m / 10-20m / 20m+ с right=False, затем посчитайте по группам\n", "answer": 1629, "dp": 0, "hint": "pd.cut(c3[\"monthly_income\"], [0, 5e6, 10e6, 20e6, np.inf], labels=[\"<5m\", \"5-10m\", \"10-20m\", \"20m+\"], right=False).value_counts()", "model": "b = pd.cut(c3[\"monthly_income\"], [0, 5e6, 10e6, 20e6, np.inf], labels=[\"<5m\", \"5-10m\", \"10-20m\", \"20m+\"], right=False)\nprint(b.value_counts(dropna=False).sort_index())     # 1281 · 2198 · 576 · 1629 · NaN 356"}
```

### apply против векторизации :id=apply-vs-vectorised

**Что это.** **Векторный** код работает со столбцами целиком: `a + b`, `pd.cut`, `.str`, `np.where`. `apply` запускает Python-функцию **по разу на значение** (или по разу на строку с `axis=1`) — это `for` под маской. Ответ одинаковый; скорость различается до тысячи раз.

**Как пишется.**

```python
# функция из HW 5.1, в одну строку
def dpd_bucket(dpd):
    return "0" if dpd <= 0 else "1-30" if dpd <= 30 else "31-60" if dpd <= 60 else "61-90" if dpd <= 90 else "90+"

# векторно: миллисекунды на 92 193 строках
inst["total"] = inst["principal_due"] + inst["interest_due"]
# apply по строкам: ~в 1 000 раз медленнее (на странице — секунды)
inst["total"] = inst.apply(lambda r: r["principal_due"] + r["interest_due"], axis=1)
# нормально для функции-метки на одном столбце
loans["bucket_fn"] = loans["dpd"].apply(dpd_bucket)
(inst["total"] == inst["total_due"]).all(), (loans["bucket_fn"] == loans["bucket"].astype(str)).all()
```

Блок показывает `(True, True)`: оба способа восстанавливают `total_due` на всех 92 193 платежах по графику, а функция-метка даёт корзину из файла для всех 7 828 кредитов.

| | векторно | `apply` по одному столбцу | `apply(axis=1)` |
|---|---|---|---|
| выполняется | один раз, на столбце | по разу на значение | по разу на строку |
| скорость | самый быстрый | один вызов Python на значение | один вызов Python на строку — примерно в 1 000 раз медленнее векторного |
| для чего | арифметика, `pd.cut`, `.str`, `np.where` | функция-метка с логикой | логика по нескольким столбцам, у которой нет записи через столбцы |

**Когда применять.**
- Сначала векторно — всегда, когда такая запись существует.
- `apply` — для разовой функции, слишком запутанной для арифметики; если вы написали `axis=1`, спросите себя, не хватило бы арифметики над столбцами.

> ⚠️ **Осторожно.** `apply(axis=1)` кажется естественным после вчерашних циклов, и это самая медленная строка в большинстве ноутбуков новичков. На десяти миллионах строк это разница между секундой и часом.

**Ваша очередь.**

```game
{"type": "build", "id": "w05d3-g4", "title": "Векторный итог", "q": "Восстановите total_due для каждого платежа по графику без apply.", "tokens": ["inst[\"total\"] =", "inst[\"principal_due\"]", "+", "inst[\"interest_due\"]"], "alts": [["inst[\"total\"] =", "inst[\"interest_due\"]", "+", "inst[\"principal_due\"]"]], "distractors": [".apply(", "axis=1", "for r in inst"]}
```

### assert — конвейер, который проверяет сам себя :id=assert--the-pipeline-that-checks-itself

**Что это.** `assert condition, message` останавливает ноутбук с `AssertionError: message`, когда условие `False`, и ничего не делает, когда оно `True`. Assert после каждого шага превращает известные вам количества в проверки, которые код выполняет при каждом запуске.

**Как пишется.**

```python
assert len(pay_clean) == 52_850, f"expected 52 850 payments, got {len(pay_clean)}"
assert pay["method"].nunique() == 5
# левое соединение сохраняет каждый платёж по графику
assert len(m) == len(inst)
# нет оплат без платежа по графику
assert (m["_merge"] != "right_only").all()
print("all checks passed")
```

```text
all checks passed
```

Четыре факта доказаны четырьмя строками: 52 850 оплат после удаления дублей, 5 способов, 92 193 платежа по графику сохранены левым соединением, ни одной оплаты-сироты.

| ставьте assert после | проверка |
|---|---|
| удаления дублей | число строк (`== 52_850`) |
| левого соединения | `len(m) == len(left)` |
| шага очистки | число разных значений (`nunique() == 5`) |
| итога | сумма против хранилища (`== 255_114_772_176`) |

**Когда применять.**
- После каждого шага, результат которого вы знаете, — тогда понедельничный запуск либо завершится, либо назовёт сломавшийся шаг.
- Прежде чем отдать число кому-то: assert — это доказательство.

> ⚠️ **Осторожно.** Assert для чисел с плавающей точкой никогда не использует `==`: `assert abs(par30 - 0.0312) < 0.0001`. Два float, посчитанные в разном порядке, различаются в последних знаках.

**Ваша очередь.** Проверьте через assert размер чистого портфеля, затем выведите деньги, оплаченные не позже даты отчёта.

```task
{"id": "w05d3-l13", "kind": "python", "starter": "import pandas as pd\nAS_OF = pd.Timestamp(\"2026-10-01\")\np3 = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n        .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))\n\n# ваш код: assert, что строк 52 850, затем выведите сумму amount там, где paid_at <= AS_OF\n", "answer": 255061333229, "dp": 0, "hint": "assert len(p3) == 52_850; затем p3.loc[p3[\"paid_at\"] <= AS_OF, \"amount\"].sum()", "model": "assert len(p3) == 52_850, len(p3)\nprint(p3.loc[p3[\"paid_at\"] <= AS_OF, \"amount\"].sum())     # 255061333229\n\n24 строки с датой в будущем (53 438 947) — это разница с полной чистой суммой 255 114 772 176."}
```

### Собираем вместе :id=putting-it-together

Один вопрос, большинство инструментов дня: *сколько денег не доплачено по наступившим платежам графика, по продуктам?* Оплаты без дублей с чистыми способами (**.str**, **дубликаты**), оплачено по платежу графика (**groupby + agg**), левый **merge** с **validate** и **assert**, NaN заполнен после соединения, продукт присоединён по **ключу** (`m:1`), затем **agg** по продукту.

```python
paid = pay[pay["paid_at"] <= AS_OF].groupby("installment_id", as_index=False).agg(paid=("amount", "sum"))
m = inst.merge(paid, on="installment_id", how="left", validate="1:1")
assert len(m) == len(inst)
# нет оплаты = оплачено 0, ПОСЛЕ соединения
m["paid"] = m["paid"].fillna(0)
# срок наступил, оплачено не полностью
open_ = m[(m["due_date"] <= AS_OF) & (m["paid"] < m["total_due"])].copy()
open_["owed"] = open_["total_due"] - open_["paid"]
open_ = open_.merge(loans[["loan_id", "product"]], on="loan_id", how="left", validate="m:1")
owed = (open_.groupby("product").agg(instalments=("installment_id", "size"), owed=("owed", "sum"))
             .sort_values("owed", ascending=False))
owed
```

| product | instalments | owed |
|---|---|---|
| Small business loan | 299 | 4 873 942 406 |
| Consumer loan | 804 | 1 336 020 831 |
| Auto loan | 149 | 1 163 781 535 |
| Micro loan | 301 | 181 751 727 |
| Buy now pay later | 231 | 97 031 242 |

1 784 наступивших платежа по графику оплачены не полностью, и по ним всё ещё должны 7.65 млрд. У SME из них лишь 299 платежей, но 4.87 млрд денег; у Consumer больше всего платежей, 804, на 1.34 млрд.

**Ваша очередь.** Какая доля недоплаченных денег приходится на кредиты SME, в % с одним знаком?

```task
{"id": "w05d3-l14", "kind": "python", "starter": "# выполняется после блока «Собираем вместе» выше (использует owed)\n\n# ваш код: owed для SME в % от всего owed\n", "answer": 63.7, "dp": 1, "hint": "100 * owed.loc[\"Small business loan\", \"owed\"] / owed[\"owed\"].sum()", "model": "print(round(100 * owed.loc[\"Small business loan\", \"owed\"] / owed[\"owed\"].sum(), 1))     # 63.7\n\n63.7 % просрочки на 17 % открытых платежей: деньги решают крупные кредиты, а нагрузку на взыскание — мелкие."}
```

### Глубже (по желанию) :id=depth-optional

**Видео (бесплатные, YouTube; каждая ссылка открывается на нужной минуте):**

- ▶ (на англ.) groupby и agg — [Complete Python Pandas Data Science Tutorial! (2025 Updated Edition) (Keith Galli), 1:05:47](https://youtu.be/2uvysYbKdjM?t=3947&end=4104)
- ▶ (на англ.) groupby, короткое видео по одной теме — [Group By and Aggregate Functions in Pandas (Alex The Analyst), 01:20](https://youtu.be/VRmXto2YA2I?t=80&end=188)
- ▶ (на англ.) merge / concat — Keith Galli, то же видео, [50:42](https://youtu.be/2uvysYbKdjM?t=3042&end=3513)
- ▶ (на англ.) Очистка (дубликаты, strip, replace, заполнение пропусков) — [Data Cleaning in Pandas (Alex The Analyst), 02:34](https://youtu.be/bDhvCp3_lYw?t=154&end=221)
- ▶ (на англ.) Та же тема внутри большого курса — [Python for Data Analytics (Luke Barousse), Merge 7:15:37](https://youtu.be/wUSDVGivd-8?t=26137&end=26753)

- Русская презентация (TBC Data Analytics 2.0, если она у вас есть) `4.3_Python.pdf`, стр. 82–103: `groupby` и `.agg` — стр. 82–87, сводные таблицы — стр. 88–91, `pd.merge` / `join` / `concat` — стр. 92–103; `.apply` / `.map` — стр. 74–81. `4.4_Python.pdf` — завтрашний мост (DB-API, `read_sql`, SQLAlchemy).
- *Английские термины:* groupby = группировка, aggregation = агрегация, named aggregation = именованная агрегация, window function (`transform`) = оконная функция, merge / join = слияние / соединение, concat = конкатенация, pivot table = сводная таблица, duplicates = дубликаты, data cleaning = очистка данных, assert = утверждение / проверка.

```videoquiz
{"video": "2uvysYbKdjM", "stops": [
  {"at": 3200, "q": "Какой merge сохраняет каждую строку левой таблицы, с NaN там, где справа нет совпадения?", "options": ["how=\"inner\"", "how=\"left\"", "how=\"right\"", "по умолчанию"], "answer": 1, "explain": "По умолчанию inner — только совпадения; left сохраняет все левые строки. Для DPD левая таблица — платежи по графику.", "back": 60},
  {"at": 3450, "q": "pd.concat([a, b]) выравнивает столбцы по…", "options": ["позиции", "имени", "типу", "никак — при любом различии будет ошибка"], "answer": 1, "explain": "По имени: столбец, иначе написанный в одном фрейме, становится вторым столбцом, полным NaN, — без ошибки.", "back": 60},
  {"at": 4020, "q": "df.groupby(\"region\")[\"amount\"].sum() возвращает…", "options": ["по значению на каждую исходную строку", "одну строку на регион", "общий итог", "отсортированную копию df"], "answer": 1, "explain": "groupby + агрегат сворачивает до строки на группу — GROUP BY; transform сохранил бы значение на каждую строку.", "back": 60}]}
```

```videoquiz
{"video": "VRmXto2YA2I", "stops": [
  {"at": 120, "q": "Что становится индексом результата groupby?", "options": ["Номера строк", "Столбец (столбцы) группировки", "Агрегируемый столбец", "Ничего — индекса нет"], "answer": 1, "explain": "Ключи становятся индексом; as_index=False или reset_index() возвращают их в столбцы.", "back": 40},
  {"at": 170, "q": "Нужно несколько статистик по группе за один вызов. Какой метод?", "options": [".agg(...)", ".apply(print)", ".head()", ".pivot()"], "answer": 0, "explain": "agg принимает несколько функций или именованные результаты: agg(total=(\"amount\", \"sum\"), avg=(\"amount\", \"mean\")).", "back": 40}]}
```

```videoquiz
{"video": "bDhvCp3_lYw", "stops": [
  {"at": 180, "q": "drop_duplicates() без subset= сравнивает…", "options": ["только первый столбец", "все столбцы", "индекс", "только текстовые столбцы"], "answer": 1, "explain": "Совпасть должны все столбцы — поэтому два платежа, отличающиеся только payment_id, не дубли; назовите ключ через subset=.", "back": 30},
  {"at": 210, "q": "Какой вызов убирает пробелы по краям каждого значения текстового столбца?", "options": ["col.strip()", "col.str.strip()", "col.replace(' ', '')", "col.trim()"], "answer": 1, "explain": ".str применяет строковый метод к каждому значению; replace(' ', '') удалил бы и пробелы внутри имени.", "back": 30}]}
```

```videoquiz
{"video": "wUSDVGivd-8", "stops": [
  {"at": 26350, "q": "У двух таблиц общий ключевой столбец. Какой вызов pandas их соединяет?", "options": ["pd.concat", "df.merge(other, on=\"key\")", "df.append", "df.groupby"], "answer": 1, "explain": "merge — это соединение; concat складывает строки (UNION ALL).", "back": 60},
  {"at": 26600, "q": "Сколько строк должно быть после левого соединения, если правый ключ уникален?", "options": ["Ровно столько, сколько в левой таблице", "Столько, сколько в правой", "Сумма обеих", "Зависит от порядка столбцов"], "answer": 0, "explain": "Левое соединение по уникальному ключу сохраняет len(left) строк — проверьте assert; больше строк значит, что ключ не уникален (размножение).", "back": 60}]}
```

---

## 2. Разбор примера — файлы Нилуфар, в pandas (расследование, 40 мин) :id=2-worked-example--nilufars-files-in-pandas-detective-40-min

Воспроизведите количества недели 4 шаг за шагом. Каждый шаг называет понятие из раздела 1, которое он использует, в том порядке, в каком вы их изучали. У каждого шага свой редактор, который загружает сырой файл; выведите числа, затем ✔ Check. В Jupyter в первой половине `data/python/day3_starter.ipynb` лежат пошаговые ячейки.

**Шаг 1 — ремонт текста через `.str`, потому что грязь — в пробелах и регистре.** Инвентаризация `customers_dirty.csv`: хвостовые пробелы в `first_name`, имена заглавными буквами, фамилии строчными, id выше 6 000.

```task
{"id": "w05d3-d1", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nc = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# ваш код\n", "answer": 18, "dp": 0, "hint": "Проверка ищет число имён с хвостовыми пробелами: сравните столбец с его версией .str.strip().", "model": "print((c.first_name != c.first_name.str.strip()).sum())    # 18\nprint(c.first_name.str.isupper().sum())                     # 22\nprint((c.last_name == c.last_name.str.lower()).sum())       # 40\nprint((c.customer_id > 6000).sum())                         # 40\n\n22 + 18 попадают на 40 фамилий строчными, id 6001–6040 — то же подозрение, что и на неделе 4, четыре строки вместо четырёх SUMPRODUCT."}
```

**Шаг 2 — `duplicated` с `subset=`, потому что «тот же человек» — это то, что говорит ключ.** Докажите дубли тремя способами: `duplicated(subset=[нормализованное имя, фамилия, birth_date])`, `subset=["phone", "birth_date"]`, `subset=["phone"]`.

```task
{"id": "w05d3-d2", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nc = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# ваш код\n", "answer": 40, "dp": 0, "hint": "Проверка ищет число лишних по phone + birth_date. duplicated(subset=[...]).sum() считает более поздние копии.", "model": "c[\"fn\"] = c.first_name.str.strip().str.lower(); c[\"ln\"] = c.last_name.str.strip().str.lower()\nprint(c.duplicated(subset=[\"fn\", \"ln\", \"birth_date\"]).sum())                  # 42\nprint(c.duplicated(subset=[\"first_name\", \"last_name\", \"birth_date\"]).sum())  # 2 — сырые имена прячут 40\nprint(c.duplicated(subset=[\"phone\", \"birth_date\"]).sum())                     # 40\nprint(c.duplicated(subset=[\"phone\"]).sum())                                    # 43\n\nКлюч по имени находит 42 — эти 40 плюс два тёзки (823/1197 Nodir Nazarov, 2460/5562 Eldor Karimov: разные люди). phone + birth_date находит ровно id 6001–6040 (6001 MALIKA jalilova ↔ 4516 Malika Jalilova). Только phone: 43 — три семейных номера. Все 40 дублей зарегистрированы после оригинала, поэтому sort_values(\"registered_at\") + keep=\"first\" сохраняет оригиналы; «зарегистрированы в 2026» падает с 955 до 945."}
```

**Шаг 3 — `to_datetime(errors="coerce")` плюс бизнес-правило, потому что один разбор ничего не находит.** Посчитайте NaT, затем примените правило.

```task
{"id": "w05d3-d3", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\nc = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# ваш код\n", "answer": 7, "dp": 0, "hint": "Проверка ищет даты, которые отвергает бизнес-правило: позже даты отчёта или раньше 1920-01-01.", "model": "c[\"birth_date\"] = pd.to_datetime(c[\"birth_date\"], errors=\"coerce\")\nprint(c[\"birth_date\"].isna().sum())                                            # 0 NaT\nbad = (c[\"birth_date\"] > AS_OF) | (c[\"birth_date\"] < \"1920-01-01\")\nprint(bad.sum())                                                                # 7\nprint(c.loc[bad, [\"customer_id\", \"birth_date\"]])\n\nОдин лишь coerce ничего не находит — каждое значение корректная дата ISO. Правило находит 7: 927, 2338, 3380 (2031-04-12), 964 (2027-02-28), 957, 1020, 2934 (1900-01-01). Возраст как (AS_OF - birth_date).dt.days / 365.25 даёт те же 7 как < 18 или > 100; валидные клиенты в среднем 45.7 года. Помечайте и обнуляйте через .where(~bad) — никогда не догадка."}
```

**Шаг 4 — `value_counts`, `.str` и `duplicated` на оплатах, потому что 58 миллионов — это копии с общим ключом.** `method.value_counts()` сырой и очищенный; `duplicated` по ключу из трёх столбцов; Σ лишних.

```task
{"id": "w05d3-d4", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\npay_raw = pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n\n# ваш код\n", "answer": 58397800, "dp": 0, "hint": "Проверка ищет сумму лишних копий: duplicated(subset=key, keep=\"first\") помечает ровно те строки, что уйдут.", "model": "five = [\"card\", \"payme\", \"cash\", \"click\", \"transfer\"]\nprint(pay_raw[\"method\"].nunique(), (~pay_raw[\"method\"].isin(five)).sum())     # 10 написаний, 180 грязных строк\nclean = pay_raw[\"method\"].str.strip().str.lower().replace({\"bank transfer\": \"transfer\"})\nprint(clean.nunique())                                                           # 5\nkey = [\"installment_id\", \"paid_at\", \"amount\"]\nextra = pay_raw.sort_values(\"payment_id\").duplicated(subset=key, keep=\"first\")\nprint(extra.sum(), pay_raw.sort_values(\"payment_id\").loc[extra, \"amount\"].sum())  # 25 58397800\n\n25 лишних, Σ 58 397 800 — 58 миллионов Тимура; у всех 25 payment_id > 52 850, а duplicated() без subset находит 0. После удаления дублей: 52 850 строк, Σ 255 114 772 176; 24 строки с датой в будущем (53 438 947) помечены, оставлены. Чистые количества: card 17 612 · payme 8 897 · cash 8 788 · click 8 786 · transfer 8 767."}
```

**Шаг 5 — `groupby` + `agg`, затем левый `merge` с `validate=` и `indicator=`, потому что каждый платёж по графику должен остаться** (полная версия — в Уголке компании): агрегируйте чистые платежи с `paid_at <= AS_OF` по платежу графика, левым соединением присоедините к `installments.csv` с `validate="1:1", indicator=True`. Сколько платежей по графику с наступившим сроком оплачены не полностью?

```task
{"id": "w05d3-d5", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\ninst = pd.read_csv(\"../excel/installments.csv\", parse_dates=[\"due_date\"])\npay = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n         .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))\n\n# ваш код\n", "answer": 1784, "dp": 0, "hint": "Проверка ищет: срок наступил (due_date <= AS_OF) и paid < total_due. fillna(0) после соединения, а не до.", "model": "paid = pay[pay[\"paid_at\"] <= AS_OF].groupby(\"installment_id\", as_index=False).agg(paid=(\"amount\", \"sum\"))\nm = inst.merge(paid, on=\"installment_id\", how=\"left\", validate=\"1:1\", indicator=True)\nprint(m[\"_merge\"].value_counts())                    # both 52826 · left_only 39367 · right_only 0\nm[\"paid\"] = m[\"paid\"].fillna(0)\nmatured = m[\"due_date\"] <= AS_OF\nprint(matured.sum(), (matured & (m[\"paid\"] < m[\"total_due\"])).sum())   # 54207 1784\n\n1 784 неоплаченных платежа с наступившим сроком, из них 403 оплачены частично — числа P8 недели 4. (paid > total_due).sum() равно 0 после удаления дублей и 25 до него: дубли были единственными переплатами в портфеле. Кредитов с неоплаченным платежом, срок которого наступил: 413; с dpd > 0: 399 (14 наступили в сам день отчёта, dpd 0)."}
```

---

## 3. Практика (45 мин) :id=3-practice-45-min

Каждый редактор загружает то, что нужно задаче: стартовый код для платежей даёт и `pay_raw` (как записано), и `pay` (без дублей). Выведите число, затем ✔ Check. В Jupyter добавляйте по ячейке на задачу в `day3_starter.ipynb`.

**P1.** *(groupby — один агрегат)* Деньги, оплаченные не позже даты отчёта, по `method` (чистые платежи), от большего к меньшему. Сколько пришло картой?

```task
{"id": "w05d3-l15", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\npay = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n         .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))   # чистые: 52 850\npay[\"method\"] = pay[\"method\"].str.strip().str.lower().replace({\"bank transfer\": \"transfer\"})\n\n# ваш код\n", "answer": 84744713422, "dp": 0, "hint": "pay[pay[\"paid_at\"] <= AS_OF].groupby(\"method\")[\"amount\"].sum().sort_values(ascending=False)", "model": "s = pay[pay[\"paid_at\"] <= AS_OF].groupby(\"method\")[\"amount\"].sum().sort_values(ascending=False)\nprint(s)     # card 84744713422 · transfer 43028739812 · click 42938566151 · payme 42922172076 · cash 41427141768\n\nКарта приносит треть денег, как и треть платежей: 84.7 млрд из 255.1 млрд."}
```

**P2.** *(несколько агрегатов через agg)* Платежи по `region`: количество, итог, среднее — на грязном файле и на чистом. Какой регион потерял больше всего денег при удалении дублей?

```task
{"id": "w05d3-p1", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\npay_raw = pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\npay = pay_raw.sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"])   # чистые: 52 850\n\n# ваш код\n", "answer": 24951300, "dp": 0, "hint": "Проверка ищет наибольшую потерю в сумах: итог по региону на сыром файле минус итог на чистом.", "model": "g = lambda d: d.groupby(\"region\").agg(payments=(\"payment_id\", \"size\"), total=(\"amount\", \"sum\"), avg=(\"amount\", \"mean\"))\nprint(g(pay))\nlost = (g(pay_raw)[\"total\"] - g(pay)[\"total\"]).sort_values(ascending=False)\nprint(lost)        # Samarkand 24951300 · Fergana 17964000 · Andijan 7666600 · Tashkent 5247900 …\n\nЧистые: Tashkent 20 437 / 102 605 410 110 / 5.02 млн · Fergana 6 334 / 34 437 790 032 · Samarkand 6 037 / 27 576 625 156 · Andijan 4 724 / 24 138 491 453 · Namangan 4 782 / 21 044 366 065 · Bukhara 4 088 / 16 162 119 575 · Termez 3 218 / 15 956 940 146 · Nukus 3 230 / 13 193 029 639. Больше всего потерял Samarkand (24 951 300) на 3 строках; у Tashkent 7 из 25 строк, но потеря лишь 5 247 900."}
```

**P3.** *(groupby по двум ключам)* Перекрёстная таблица чистых платежей: количества `product` × `method` через `groupby(...).size().unstack()`, затем то же через `pivot_table`. Прочитайте строку SME.

```task
{"id": "w05d3-p2", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\npay_raw = pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\npay = pay_raw.sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"])   # чистые: 52 850\npay[\"method\"] = pay[\"method\"].str.strip().str.lower().replace({\"bank transfer\": \"transfer\"})            # 5 способов\n\n# ваш код\n", "answer": 2701, "dp": 0, "hint": "Проверка ищет число оплат картой (card) у SME.", "model": "ct = pay.groupby([\"product\", \"method\"]).size().unstack(fill_value=0)\nprint(ct.loc[\"Small business loan\"])     # card 2701 · cash 1334 · click 1390 · payme 1401 · transfer 1396\npt = pd.pivot_table(pay, index=\"product\", columns=\"method\", values=\"payment_id\", aggfunc=\"count\", fill_value=0)\nprint((ct == pt).all().all())            # True\n\nТот же состав 33 / 17 / 17 / 17 / 17 %, что и у всего портфеля: method не зависит от product."}
```

**P4.** *(transform)* Добавьте рядом с каждым клиентом медианный доход его сегмента; сколько зарабатывают выше неё? Затем `cumcount` по `phone` как `ROW_NUMBER` с недели 3 — у скольких строк значение 1 или больше?

```task
{"id": "w05d3-p3", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\ncust = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# ваш код\n", "answer": 2841, "dp": 0, "hint": "Проверка ищет число выше медианы сегмента на сыром файле.", "model": "cust[\"seg_median\"] = cust.groupby(\"segment\")[\"monthly_income\"].transform(\"median\")\nprint((cust[\"monthly_income\"] > cust[\"seg_median\"]).sum())              # 2841\nrn = cust.sort_values(\"registered_at\").groupby(\"phone\").cumcount()\nprint((rn >= 1).sum())                                                   # 43\n\nМедианы: mass 5.79 млн · affluent 25.28 млн · sme 33.21 млн; 356 NaN сравниваются как False. На 6 000 чистых клиентов (P6) ответ — 2 823; скажите, каким фреймом вы пользовались. cumcount по phone даёт 43 строки ≥ 1 — 40 дублей плюс три семейных номера; с ключом [\"phone\", \"birth_date\"] — ровно 40. Сначала сортируйте по registered_at, иначе «0» может оказаться более поздней копией."}
```

**P5.** *(value_counts)* Грейды 234 кредитов в корзине 90+: доля каждого, в %. Какой грейд держит половину из них и как это соотносится с его долей во всём портфеле?

```task
{"id": "w05d3-l16", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 49.6, "dp": 1, "hint": "loans.loc[loans[\"dpd\"] > 90, \"grade\"].value_counts(normalize=True).mul(100).round(1)", "model": "print(loans.loc[loans[\"dpd\"] > 90, \"grade\"].value_counts(normalize=True).mul(100).round(1))\n# C 49.6 · B 27.4 · D 15.8 · A 7.3\n\nГрейд C — это 28.9 % всех кредитов, но 49.6 % кредитов в 90+; D — 4.3 % портфеля и 15.8 % в 90+. Грейды действительно ранжируют риск."}
```

**P6.** *(merge — how=)* Ловушка inner-соединения: повторите шаг 5 с `how` по умолчанию. Сколько строк получится и какие кредиты расчёт DPD тогда пропустит?

```task
{"id": "w05d3-p4", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\ninst = pd.read_csv(\"../excel/installments.csv\", parse_dates=[\"due_date\"])\npay = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n         .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))\n\n# ваш код\n", "answer": 52826, "dp": 0, "hint": "Проверка ищет число строк соединения без how=.", "model": "paid = pay[pay[\"paid_at\"] <= AS_OF].groupby(\"installment_id\", as_index=False).agg(paid=(\"amount\", \"sum\"))\nm = inst.merge(paid, on=\"installment_id\")\nprint(len(inst), len(m))     # 92193 52826\n\nКаждый платёж по графику без оплаты исчезает, так что неоплаченный платёж не «не оплачен», а отсутствует, и каждый кредит с полной просрочкой (234 в 90+ с месяцами без единой оплаты) выглядит текущим. how=\"left\" + fillna(0) — это LEFT JOIN … COALESCE(SUM, 0) с недели 2; assert len(m) == len(inst) после соединения — страховочный ремень."}
```

**P7.** *(ключи merge)* Итог оплат по кредиту (чистые платежи, любая дата), присоединённый к каждому кредиту из `loans_status.csv` по `loan_id`. Сколько кредитов не имеют ни одного платежа?

```task
{"id": "w05d3-l17", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\npay = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n         .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))   # чистые: 52 850\npay[\"method\"] = pay[\"method\"].str.strip().str.lower().replace({\"bank transfer\": \"transfer\"})\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 392, "dp": 0, "hint": "per_loan = pay.groupby(\"loan_id\", as_index=False).agg(paid=(\"amount\", \"sum\")); then loans.merge(per_loan, on=\"loan_id\", how=\"left\", validate=\"1:1\") and count paid.isna()", "model": "per_loan = pay.groupby(\"loan_id\", as_index=False).agg(paid=(\"amount\", \"sum\"))\nm = loans.merge(per_loan, on=\"loan_id\", how=\"left\", validate=\"1:1\")\nprint(len(m), m[\"paid\"].isna().sum())     # 7828 392\n\n392 кредита никогда ничего не платили — число антисоединения недели 2: новые кредиты, у которых первый платёж ещё не наступил, и худшие неплательщики."}
```

**P8.** *(validate= и indicator=)* Соедините чистые платежи с `loans_status.csv` (`loan_id`) с `validate="m:1"` — всё в порядке. Теперь присоедините `installments.csv` к **сырым** платежам с `validate="1:1"` (`pay_raw.merge(inst, on="installment_id", validate="1:1")`), затем к **чистым** платежам — что происходит каждый раз?

```task
{"id": "w05d3-p5", "kind": "choice", "options": ["Оба соединения проходят — validate проверяет только типы столбцов", "Сырые: MergeError, потому что у 25 платежей графика по две строки оплаты; чистые: проходит, потому что после удаления дублей у каждого платежа графика не более одной оплаты", "Оба вызывают MergeError — таблица платежей всегда m:1", "Сырые проходят, чистые падают — удаление дублей сломало ключ"], "answer": 1, "explain": "Сырые: MergeError: Merge keys are not unique in left dataset; not a one-to-one merge — 25 пар дублей делают сырые платежи → платежи графика m:1, и неверно заявленное зерно ловится до того, как неверным станет любое число. Чистые: проходит — частичные оплаты это единичные платежи меньше total_due (P11 недели 3), а не несколько платежей. Всё равно оставьте в скрипте validate=\"m:1\": это зерно, которое допускает бизнес, и оно не сломается в день, когда придёт настоящий разделённый платёж. Пишите тот validate, в который верите; MergeError — бесплатный урок о данных."}
```

**P9.** *(concat)* Разделите чистые платежи на Tashkent и остальных, добавьте каждой части столбец `source`, склейте с `ignore_index=True`. Сколько строк? Затем переименуйте `amount` в `Amount` в одной половине и склейте снова — как выглядит результат?

```task
{"id": "w05d3-p9", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\npay = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n         .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))\n\n# ваш код\n", "answer": 52850, "dp": 0, "hint": "Проверка ищет число строк после concat.", "model": "a = pay[pay[\"region\"] == \"Tashkent\"].assign(source=\"tashkent\")\nb = pay[pay[\"region\"] != \"Tashkent\"].assign(source=\"rest\")\nu = pd.concat([a, b], ignore_index=True)\nprint(len(a), len(b), len(u))                     # 20437 32413 52850\nbad = pd.concat([a, b.rename(columns={\"amount\": \"Amount\"})], ignore_index=True)\nprint(bad.shape, bad[\"amount\"].isna().sum(), bad[\"Amount\"].isna().sum())   # на один столбец больше; 32413 / 20437 NaN\n\nsource говорит, из какой половины пришла каждая строка (происхождение для двенадцати месячных файлов). С Amount в одной половине: по-прежнему 52 850 строк, но на один столбец больше, amount — NaN в 32 413 строках, а Amount — NaN в 20 437 — без ошибки, расщеплённый столбец; assert set(a.columns) == set(b.columns) перед каждым concat."}
```

**P10.** *(pivot_table)* `pivot_table` по `outstanding` (сумма), `bucket` × `product`, с `margins=True`. Прочитайте столбец `All`: сколько остатка долга в корзине 90+?

```task
{"id": "w05d3-l18", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 5319475527, "dp": 0, "hint": "pt = pd.pivot_table(loans, index=\"bucket\", columns=\"product\", values=\"outstanding\", aggfunc=\"sum\", fill_value=0, margins=True); pt.loc[\"90+\", \"All\"]", "model": "pt = pd.pivot_table(loans, index=\"bucket\", columns=\"product\", values=\"outstanding\", aggfunc=\"sum\", fill_value=0, margins=True)\nprint(pt[\"All\"])     # 0 197486207578 · 1-30 4729769899 · 31-60 748610049 · 61-90 439441377 · 90+ 5319475527 · All 208723504430\n\n5.32 млрд в 90+ из портфеля 208.7 млрд — NPL90 = 2.55 %; строка и столбец All сверяют итог."}
```

**P11.** *(ремонт текста через .str)* `applications.csv`: сколько статусов начинается с `approved` (`.str.startswith`) и сколько содержит `not` (`.str.contains`)?

```task
{"id": "w05d3-l19", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\napps = pd.read_csv(\"../excel/applications.csv\")\n\n# ваш код\n", "answer": 8595, "dp": 0, "hint": "apps[\"status\"].str.startswith(\"approved\").sum(), then apps[\"status\"].str.contains(\"not\").sum()", "model": "print(apps[\"status\"].str.startswith(\"approved\").sum())     # 8595\nprint(apps[\"status\"].str.contains(\"not\").sum())         # 678\n\n8 595 одобрений в двух написаниях; 678 строк approved_not_disbursed — ровно те, что потеряло бы == \"approved\"."}
```

**P12.** *(даты: errors= и бизнес-правило)* Разберите `birth_date` с `errors="coerce"`, примените бизнес-правило и посчитайте валидных клиентов в возрасте 60 лет и старше на дату отчёта (возраст = дни / 365.25).

```task
{"id": "w05d3-l20", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\nc = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# ваш код\n", "answer": 1384, "dp": 0, "hint": "b = pd.to_datetime(c[\"birth_date\"], errors=\"coerce\"); ok = (b <= AS_OF) & (b >= \"1920-01-01\"); age = (AS_OF - b).dt.days / 365.25; (ok & (age >= 60)).sum()", "model": "b = pd.to_datetime(c[\"birth_date\"], errors=\"coerce\")\nok = (b <= AS_OF) & (b >= \"1920-01-01\")\nage = (AS_OF - b).dt.days / 365.25\nprint((ok & (age >= 60)).sum())     # 1384\n\nБез правила три дня рождения 1900-01-01 добавили бы к счёту трёх 126-летних: 1 387."}
```

**P13.** *(дубликаты)* Отсортируйте `customers_dirty.csv` по `registered_at` и удалите дубли по `phone` + `birth_date` — один раз с `keep="first"`, другой с `keep="last"`. Сколько id выше 6 000 выживает в каждом случае?

```task
{"id": "w05d3-l21", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nc = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# ваш код\n", "answer": 40, "dp": 0, "hint": "s = c.sort_values(\"registered_at\"), then for each keep: (s.drop_duplicates(subset=[\"phone\", \"birth_date\"], keep=keep)[\"customer_id\"] > 6000).sum()", "model": "s = c.sort_values(\"registered_at\")\nfor keep in [\"first\", \"last\"]:\n    d = s.drop_duplicates(subset=[\"phone\", \"birth_date\"], keep=keep)\n    print(keep, len(d), (d[\"customer_id\"] > 6000).sum())\n# first 6000 0 · last 6000 40\n\nОба варианта оставляют 6 000 строк — по количеству не понять, кто выжил. keep=\"last\" сохраняет 40 более поздних регистраций (id 6001–6040) и выбрасывает оригиналы; решение — это сортировка плюс keep."}
```

**P14.** *(корзины через pd.cut)* `pd.cut` по `dpd` с границами `[-1, 0, 30, 60, 90, np.inf]` и пятью метками. Сколько кредитов просрочено больше чем на 30 дней (три последние корзины)? Затем поставьте первую границу 0 — сколько NaN?

```task
{"id": "w05d3-l22", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nloans = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 275, "dp": 0, "hint": "b = pd.cut(loans[\"dpd\"], [-1, 0, 30, 60, 90, np.inf], labels=[\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"]); b.isin([\"31-60\", \"61-90\", \"90+\"]).sum()", "model": "b = pd.cut(loans[\"dpd\"], [-1, 0, 30, 60, 90, np.inf], labels=[\"0\", \"1-30\", \"31-60\", \"61-90\", \"90+\"])\nprint(b.value_counts().sort_index())                 # 7429 · 124 · 25 · 16 · 234\nprint(b.isin([\"31-60\", \"61-90\", \"90+\"]).sum())       # 275\nprint(pd.cut(loans[\"dpd\"], [0, 30, 60, 90, np.inf]).isna().sum())   # 7429\n\n275 кредитов с просрочкой больше 30 дней несут 6.51 млрд PAR30. С первой границей 0 все 7 429 текущих кредитов выпадают в NaN."}
```

**P15.** *(apply против векторизации)* Посчитайте `total_due` из двух частей обоими способами на 92 193 платежах графика и замерьте время (`%%timeit` в Jupyter или `time.perf_counter()`). Затем примените `dpd_bucket` из HW 5.1 к `dpd` и сравните с `pd.cut`. Какое утверждение верно?

```task
{"id": "w05d3-p8", "kind": "choice", "options": ["apply(axis=1) примерно так же быстр — pandas векторизует его за вас", "Арифметика над столбцами примерно в тысячу раз быстрее, чем apply(axis=1); функция-метка на одном столбце через apply — нормально", "pd.cut в тысячу раз быстрее, чем apply на одном столбце", "apply даёт другие итоги, чем арифметика"], "answer": 1, "explain": "Построчный apply(axis=1) ≈ 0.7 с; inst.principal_due + inst.interest_due ≈ 0.7 мс — оба равны total_due в каждой строке. dpd.apply(dpd_bucket) и pd.cut дают одинаковые метки на 7 828 строках примерно за миллисекунду каждый — для функции-метки на одном столбце apply годится; избегать нужно axis=1."}
```

**P16.** *(assert — вся цепочка очистки)* Очистите `customers_dirty.csv` от начала до конца одной цепочкой (strip + title, флаги, сортировка, удаление дублей) и сделайте `assert` на четыре количества: 6 000 строк, 7 невалидных дат, 354 пропущенных дохода, ни одного id выше 6 000. Почему 354, а не 356?

```task
{"id": "w05d3-p6", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\ncust = pd.read_csv(\"../excel/customers_dirty.csv\")\n\n# ваш код — выведите число пропущенных доходов после удаления дублей\n", "answer": 354, "dp": 0, "hint": "Проверка ищет monthly_income.isna().sum() на чистом фрейме. Удаляйте дубли по [\"phone\", \"birth_date\"] после sort_values(\"registered_at\").", "model": "c = cust.copy()\nfor col in [\"first_name\", \"last_name\"]:\n    c[col] = c[col].str.strip().str.title()\nc[\"birth_date\"] = pd.to_datetime(c[\"birth_date\"], errors=\"coerce\")\nc[\"birth_date_invalid\"] = (c[\"birth_date\"] > AS_OF) | (c[\"birth_date\"] < \"1920-01-01\")\nc[\"birth_date_clean\"] = c[\"birth_date\"].where(~c[\"birth_date_invalid\"])\nc = (c.sort_values(\"registered_at\").drop_duplicates(subset=[\"phone\", \"birth_date\"], keep=\"first\")\n      .sort_values(\"customer_id\"))\nassert len(c) == 6000 and c[\"birth_date_invalid\"].sum() == 7\nassert (c[\"customer_id\"] <= 6000).all()\nprint(c[\"monthly_income\"].isna().sum())     # 354\n\nДве из 40 дублирующихся строк копировали клиента с пустым доходом, так что их удаление убирает 2 из 356 NaN. Эта цепочка — clean_customers в ноутбуке."}
```

**P17.** *(собираем вместе)* Доля собранных платежей по месяцу срока за 2026 из объединённого фрейма шага 5: `due_month = due_date.dt.to_period("M")`, `groupby` → Σ к оплате, Σ оплачено, доля. Сравните сентябрь с неделей 4.

```task
{"id": "w05d3-p7", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\ninst = pd.read_csv(\"../excel/installments.csv\", parse_dates=[\"due_date\"])\npay = (pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"])\n         .sort_values(\"payment_id\").drop_duplicates(subset=[\"installment_id\", \"paid_at\", \"amount\"]))\n\n# ваш код\n", "answer": 94.1, "dp": 1, "hint": "Проверка ищет долю за сентябрь 2026 в %, с одним знаком.", "model": "paid = pay[pay[\"paid_at\"] <= AS_OF].groupby(\"installment_id\", as_index=False).agg(paid=(\"amount\", \"sum\"))\nm = inst.merge(paid, on=\"installment_id\", how=\"left\", validate=\"1:1\").fillna({\"paid\": 0})\ny = m[(m[\"due_date\"] >= \"2026-01-01\") & (m[\"due_date\"] < \"2026-10-01\")].copy()\ny[\"due_month\"] = y[\"due_date\"].dt.to_period(\"M\")\ng = y.groupby(\"due_month\").agg(due=(\"total_due\", \"sum\"), paid=(\"paid\", \"sum\"))\ng[\"rate\"] = (100 * g[\"paid\"] / g[\"due\"]).round(1)\nprint(g)\n\nЯнв 97.3 % · Фев 97.0 · Мар 96.8 · Апр 96.9 · Май 97.1 · Июн 96.9 · Июл 96.7 · Авг 96.5 · Сен 94.1 % (3 305 платежей по графику, 16 987 977 718 к оплате, 15 982 118 926 оплачено) — идентично таблице Power Query, потому что платежи обрезаны по дате отчёта внутри paid."}
```

> 🚀 **Со звёздочкой (по желанию, +5 XP).** **P18.** *(pivot и melt)* `monthly_disbursements.csv` (170 длинных строк) → `pivot` в 34 месяца × 5 продуктов, добавьте столбец `total` и долю SME по месяцам; затем `melt` обратно в длинную форму. В каком месяце доля SME была наибольшей и какой она была в сентябре 2026?

```task
{"id": "w05d3-p10", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nmd = pd.read_csv(\"../excel/monthly_disbursements.csv\")\n\n# ваш код\n", "answer": 77.2, "dp": 1, "xp": 2, "hint": "Проверка ищет наибольшую месячную долю SME в %, с одним знаком.", "model": "w = md.pivot(index=\"month\", columns=\"product\", values=\"amount\")\nprint(w.shape)                                                   # (34, 5)\nw[\"total\"] = w.sum(axis=1)\nw[\"sme_share\"] = 100 * w[\"Small business loan\"] / w[\"total\"]\nprint(w[\"sme_share\"].idxmax(), round(w[\"sme_share\"].max(), 1))   # 2024-07-01 77.2\nprint(round(w.loc[\"2026-09-01\", \"sme_share\"], 1))                # 50.6\nlong = w.drop(columns=[\"total\", \"sme_share\"]).reset_index().melt(id_vars=\"month\", var_name=\"product\", value_name=\"amount\")\nprint(len(long))                                                 # 170\n\nДоля SME достигает пика в июле 2024 — 77.2 %; в сентябре 2026 она составляет 50.6 % от 17.0 млрд (8.60 млрд). Широкая форма — для чтения и Excel, длинная — для groupby и seaborn; завтрашнему lineplot нужна длинная форма."}
```

### Ошибки, которые стоят балла на этой неделе :id=mistakes-that-cost-a-point-this-week

- `merge` без `how=` — по умолчанию inner; неоплаченные платежи по графику исчезают.
- Нет `validate=` на соединении, зерно которого вы «знаете», — размножение строк с недели 2, без предупреждения.
- `drop_duplicates` без `subset=` (удалено 0) или без предварительной сортировки (оставлен не тот выживший).
- `errors="coerce"` принят за валидацию — 7 невозможных дат проходят.
- `fillna` до соединения вместо после — NaN, означающий «нет оплаты», теряется.
- `groupby` по ключу с пропусками без `dropna=False` — группа молча пропала.
- Построчный `apply(axis=1)` там, где есть арифметика над столбцами.
- `concat` фреймов с по-разному написанными столбцами — тихое расщепление.
- Количества, которые живут в вашей голове, а не в строках `assert`.

---

## 4. Домашнее задание <span class="badge hw">HW 5.2 — срок: День 5</span> :id=4-homework-hw-52--due-day-5

**Понедельничный скрипт Жасура.** Сдайте `clean_nur.py` (или выполненный `day3_starter.ipynb` с заполненными тремя функциями TODO) и три CSV, которые он записывает, через блок 📎 ниже:

1. **`customers_clean.csv`** — 6 000 строк из `customers_dirty.csv`: имена без лишних пробелов и с заглавной буквы, дубли удалены по `phone` + `birth_date` с сохранением самого раннего `registered_at`, `birth_date_invalid` (7 True), `birth_date_clean` (NaT при невалидной), пропуски `monthly_income` остаются NaN (354).
2. **`payments_clean.csv`** — 52 850 строк: `method` из 5 значений, дубли удалены по `installment_id` + `paid_at` + `amount` с сохранением наименьшего `payment_id`, `is_forward_dated` (24 True, строки сохранены). Σ `amount` 255 114 772 176.
3. **`dpd_per_loan.csv`** — одна строка на кредит (7 828): `loan_id`, `dpd`, `bucket`, посчитанные из `installments.csv` + ваших чистых платежей, как в Уголке компании; 399 кредитов с `dpd > 0`, корзины 7 429 / 124 / 25 / 16 / 234, равные `dpd` из `loans_status.csv` для каждого кредита.
4. **Asserts** на каждое количество выше внутри скрипта, плюс `len(merged) == len(installments)` после соединения; запуск `python clean_nur.py` не печатает ничего, кроме трёх имён файлов, когда всё в порядке.

**Пути.** Ваш ментор запускает ваш скрипт в папке, где сырые файлы лежат в папке `data/excel/` рядом со скриптом. Поэтому читайте их как `Path("data/excel/customers_dirty.csv")` (чтобы проверить скрипт, положите скачанные файлы в папку `data/excel/` рядом с ним), а три CSV записывайте в текущую папку (`customers_clean.csv`, а не путь куда-то ещё). Редакторы ниже читают копии курса по пути самой страницы (`../excel/…`) — отличается только строка чтения. Сегодня также срок **HW 5.1** — в блоке сдачи Дня 1.

**Проверьте ключевые числа перед сдачей.** Вставьте каждую свою функцию в её редактор; проверка сравнит то, что она печатает, с хранилищем.

```task
{"id": "w05d3-hw1", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\n\n# вставьте сюда свою clean_customers(df)\n\n\nc = clean_customers(pd.read_csv(\"../excel/customers_dirty.csv\"))\nprint(len(c), c[\"birth_date_invalid\"].sum(), c[\"monthly_income\"].isna().sum())\n", "answer": 6000, "dp": 0, "hint": "Сортируйте по registered_at перед drop_duplicates по [\"phone\", \"birth_date\"], иначе останется не тот выживший.", "model": "6 000 строк, 7 невалидных дат рождения, 354 пропущенных дохода; каждый customer_id ≤ 6 000."}
```

```task
{"id": "w05d3-hw2", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\n\n# вставьте сюда свою clean_payments(df)\n\n\np = clean_payments(pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"]))\nprint(len(p), p[\"method\"].nunique(), p[\"is_forward_dated\"].sum())\nprint(p[\"amount\"].sum())\n", "answer": 255114772176, "dp": 0, "hint": "Удаляйте дубли по installment_id + paid_at + amount после sort_values(\"payment_id\"); помечайте paid_at > AS_OF, но строки оставляйте.", "model": "52 850 строк, 5 способов оплаты, 24 строки с датой в будущем, Σ amount 255 114 772 176."}
```

```task
{"id": "w05d3-hw3", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nAS_OF = pd.Timestamp(\"2026-10-01\")\n\n# вставьте сюда clean_payments(df) и dpd_per_loan(inst, pay, as_of)\n\n\ninst = pd.read_csv(\"../excel/installments.csv\", parse_dates=[\"due_date\"])\npay = clean_payments(pd.read_csv(\"../excel/payments_dirty.csv\", parse_dates=[\"paid_at\"]))\nd = dpd_per_loan(inst, pay, AS_OF)\nprint(len(d), (d[\"dpd\"] > 0).sum())\nprint(d[\"bucket\"].value_counts().sort_index())\n", "answer": 399, "dp": 0, "hint": "Левое соединение, fillna(0) после соединения, срок наступил и оплачен не полностью, AS_OF − самая старая такая дата по кредиту, затем все кредиты loans_status.csv с 0 там, где просрочки нет.", "model": "7 828 кредитов, 399 с dpd > 0; корзины 7 429 / 124 / 25 / 16 / 234."}
```

### 📎 Сдайте здесь :id=hand-in-here

```sqltask
{"check": "handin-W5D3", "lesson": "W5D3", "title": "HW 5.2", "why": "Это скрипт, который Жасур ставит на понедельник, 6:00: те же три исправления, что на неделе 4, но написанные один раз, доказанные собственными assert-ами и перезапускаемые без человека за клавиатурой, — а его DPD становится целевой переменной модели.", "graded": ["Количества: 6 000 / 7 / 52 850 / 5 / 24 / 399 и пять корзин", "Asserts присутствуют, а скрипт работает сверху донизу из сырых файлов — проверяющий удаляет CSV и запускает его заново", "При удалении дублей остаётся правильный выживший (оригиналы ≤ 6 000; наименьший payment_id), а DPD совпадает с SQL для всех 7 828 кредитов"], "tasks": [{"id": "clean_nur.py", "file": "clean_nur.py", "names": ["clean_nur.py", "day3_starter.ipynb"], "upload": true, "accept": ".ipynb,.py", "q": "Прикрепите `clean_nur.py` или `day3_starter.ipynb` — то, что требует страница выше."}, {"id": "customers_clean.csv", "file": "customers_clean.csv", "names": ["customers_clean.csv"], "upload": true, "accept": ".csv", "q": "Прикрепите `customers_clean.csv` (6 000 строк)."}, {"id": "payments_clean.csv", "file": "payments_clean.csv", "names": ["payments_clean.csv"], "upload": true, "accept": ".csv", "q": "Прикрепите `payments_clean.csv` (52 850 строк)."}, {"id": "dpd_per_loan.csv", "file": "dpd_per_loan.csv", "names": ["dpd_per_loan.csv"], "upload": true, "accept": ".csv", "q": "Прикрепите `dpd_per_loan.csv` (7 828 строк)."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Всё остальное, что перечислено на странице (ещё один файл или .zip из нескольких)."}]}
```

---

## 5. Самопроверка :id=5-self-check

```check
{"id": "w05d3-sc", "questions": [
  {"type": "single", "q": "agg или transform — какая из них оконная функция?", "options": ["agg: одна строка на группу", "transform: одно значение на исходную строку, выровненное по фрейму — SUM() OVER (PARTITION BY)", "Обе — оконные функции", "Ни одна — в pandas нет оконных функций"], "answer": 1, "explain": "agg сворачивает до строки на группу (GROUP BY); transform пишет значение группы рядом с каждым её членом (→ раздел 1, «agg», «transform»)."},
  {"type": "single", "q": "Вы соединяете платежи с платежами по графику и получаете меньше строк, чем 92 193. Что вы забыли?", "options": ["validate=", "how=\"left\" — inner по умолчанию отбрасывает платежи графика без оплаты; assert len(m) == len(inst) поймал бы это", "sort=True", "indicator=True"], "answer": 1, "explain": "Неоплаченные платежи по графику — ровно те, что нужны для DPD (→ раздел 1, «merge», P6)."},
  {"type": "single", "q": "pd.to_datetime(errors=\"coerce\") нашёл 0 плохих дат рождения. Даты чистые?", "options": ["Да — каждое значение разобралось", "Нет — 2031-04-12 прекрасно разбирается; для валидности нужно бизнес-правило (не позже даты отчёта, не раньше 1920), оно находит 7", "Да, если dtype — datetime64", "Нет — coerce превратил их в 1900-01-01"], "answer": 1, "explain": "Разбор — синтаксис; валидность — правило, которое пишете вы (→ раздел 1, «Даты, которые лгут», шаг 3 расследования)."},
  {"type": "single", "q": "Вы группируете клиентов по столбцу с пропусками. Где клиенты с пустым ключом?", "options": ["В группе с именем NaN", "Нигде — groupby отбрасывает ключи NaN, если не передать dropna=False", "В первой группе", "groupby вызывает ошибку"], "answer": 1, "explain": "Пустая группа молча исчезает; dropna=False показывает её строкой (→ раздел 1, «groupby — один агрегат на группу»)."}
]}
```

---

## 6. Уголок компании <span class="badge company">DPD в pandas</span> :id=6-company-corner-dpd-in-pandas

Блок DPD с недели 2, `v_loan_status` с недели 3, соединение Power Query с недели 4 — теперь в виде функции, которую Жасур ставит на расписание. Дисциплина зерна — это весь метод: платёж по графику → кредит.

```game
{"type": "order", "id": "w05d3-g3", "title": "Конвейер DPD по порядку", "items": ["Удалить дубли платежей и обрезать их по дате отчёта", "Просуммировать оплаченное по платежу графика", "Левое соединение с графиком с validate=\"1:1\"", "Assert на число строк, затем fillna(0)", "Оставить платежи с наступившим сроком, оплаченные не полностью", "По кредиту: дата отчёта − самая старая дата неоплаченного срока", "pd.cut по корзинам и сверка с SQL"], "why": "Каждый шаг меняет зерно или смысл NaN — именно порядок даёт правильные 399."}
```

```python
AS_OF = pd.Timestamp("2026-10-01")
# зерно: платёж по графику, 92 193
inst = pd.read_csv("../excel/installments.csv", parse_dates=["due_date"])
# clean_payments(): 52 850
pay  = (pd.read_csv("../excel/payments_dirty.csv", parse_dates=["paid_at"])
          .sort_values("payment_id").drop_duplicates(subset=["installment_id", "paid_at", "amount"]))

# 1. платежи до даты отчёта включительно …
paid = (pay[pay["paid_at"] <= AS_OF]
        # … агрегированные по платежу графика
        .groupby("installment_id", as_index=False).agg(paid=("amount", "sum")))
# 2. каждый платёж графика сохранён
m = inst.merge(paid, on="installment_id", how="left", validate="1:1")
assert len(m) == len(inst)
# нет оплаты = 0 оплачено
m["paid"] = m["paid"].fillna(0)
# 3. оплачен не полностью
m["unpaid"]  = m["paid"] < m["total_due"]
# и срок уже наступил
m["matured"] = m["due_date"] <= AS_OF
# 1 784 платежа
late = m[m["unpaid"] & m["matured"]]
# 4. по кредиту: дата отчёта − самая старая дата неоплаченного срока
dpd = (AS_OF - late.groupby("loan_id")["due_date"].min()).dt.days.rename("dpd")
# 5. каждый кредит, 0, если просрочки нет
loans = (pd.read_csv("../excel/loans_status.csv")[["loan_id"]]
         .merge(dpd, on="loan_id", how="left").fillna({"dpd": 0}).astype({"dpd": int}))
loans["bucket"] = pd.cut(loans["dpd"], [-1, 0, 30, 60, 90, np.inf], labels=["0", "1-30", "31-60", "61-90", "90+"])
(loans["dpd"] > 0).sum(), loans["bucket"].value_counts().sort_index()
```

`(loans.dpd > 0).sum()` → **399**; `loans.bucket.value_counts().sort_index()` → **7 429 / 124 / 25 / 16 / 234**; при сверке с `loans_status.csv` `(dpd == dpd_sql).all()` → **True** для всех 7 828 кредитов. То же определение, те же строки, третий инструмент, то же число — единственный приемлемый исход.

> 💡 **Главное.** Где версия на pandas *лучше* SQL: `validate="1:1"` и `assert` делают зерно явным; `AS_OF` — одна переменная, так что срез на 1 сентября для roll rate — это та же функция с другим аргументом; а 25 дублей обрабатываются именованным шагом (`clean_payments`), а не представлением, о котором кто-то должен не забыть.

**FPD30 по поколению (винтажу) × каналу = один `pivot_table`.** Первый платёж по графику на кредит, попадает в охват, если срок его оплаты ≤ даты отчёта − 30 дней; просрочен, если не оплачен полностью в течение 30 дней (`paid < total_due` или `first_paid − due_date > 30`); поколение (винтаж) = месяц выдачи; канал — из продукта (P11 Дня 2: приложение продаёт Micro, партнёр — BNPL, филиал — всё остальное; столбца канала в `loans_status.csv` нет):

```python
ls = pd.read_csv("../excel/loans_status.csv", parse_dates=["disbursed_at"])
loan_channel = ls[["loan_id", "disbursed_at"]].assign(
    channel=ls["product"].map({"Micro loan": "app", "Buy now pay later": "partner"}).fillna("branch"))
first = inst[(inst["installment_no"] == 1) & (inst["due_date"] <= AS_OF - pd.Timedelta(days=30))]
paid1 = pay[pay["paid_at"] <= AS_OF].groupby("installment_id", as_index=False).agg(paid=("amount", "sum"), first_paid=("paid_at", "min"))
f = first.merge(paid1, on="installment_id", how="left").fillna({"paid": 0})
f["fpd30"] = ((f["paid"] < f["total_due"]) | ((f["first_paid"] - f["due_date"]).dt.days > 30)).astype(int)
# loan_id, disbursed_at, channel
f = f.merge(loan_channel, on="loan_id", validate="1:1")
f["vintage"] = f["disbursed_at"].dt.to_period("M").astype(str)
pd.pivot_table(f, index="vintage", columns="channel", values="fpd30", aggfunc="mean").mul(100).round(2)
```

В охвате **7 099**, FPD30 **91 = 1.28 %**; по каналам app 41 / 2 411 = **1.70 %**, partner 16 / 1 425 = 1.12 %, branch 34 / 3 263 = 1.04 % — таблица недели 2, ячейка в ячейку. Последние строки сводной таблицы: 2026-05 app 0.76 / branch 1.12 / partner 5.97 (4 из 67 — слишком мало, чтобы читать); 2026-06 0.74 / 0.62 / 1.33; 2026-07 1.64 / 0.62 / 1.19; 2026-08 — 11 кредитов в охвате, а partner — NaN: пустая ячейка, а не 0. Замените `columns="channel"` на `"grade"` (A 0.60 · B 0.97 · C 2.16 · D 2.23 %, добавив `grade` в `loan_channel`) или `aggfunc=["sum", "count"]`, чтобы показать количества рядом с долями, и группируйте по кварталам (`dt.to_period("Q")`), когда месячные ячейки так малы. Определение «только неоплаченные» (один лишь `paid < total_due`) даёт app 1.04 % — плитка Тимура; одно булево слагаемое и есть весь спор на 0.66 пункта между двумя отделами.

> 🎯 **Версия для собеседования.** *«Посчитайте DPD по кредиту в pandas из графика и таблицы платежей.»* — удалите дубли и обрежьте платежи по дате отчёта; `groupby(installment_id).sum()`; левое соединение с платежами графика с `validate="1:1"` и assert на число строк; не оплачен = paid < due, срок наступил = due ≤ as-of; по кредиту `as_of − min(due_date)` по неоплаченным строкам с наступившим сроком; `pd.cut` для корзин; сверьте 399 и количества по корзинам с хранилищем, прежде чем кто-то использует это как целевую переменную модели.

**Скажите это как на собеседовании.** Ответьте на вопрос выше своими словами, как сказали бы вслух, с цифрами Nur Finance.

```task
{"id": "w05d3-int", "kind": "free", "min": 30, "model": "Я начинаю с платежей: удаляю строки-дубли по платежу графика, дате и сумме — в Nur Finance их 25 — и оставляю только оплаты на дату отчёта или раньше. Затем суммирую оплаченное по каждому платежу графика и левым соединением присоединяю к полному графику с validate=\"1:1\", проверяя assert-ом, что строк осталось 92 193, и только после этого заполняю пропуски оплаты нулём. Платёж просрочен, если срок наступил, а оплачено меньше положенного; по кредиту DPD — это дата отчёта минус самая старая такая дата, у остальных кредитов 0. Делю на корзины через pd.cut и сверяю до любого использования: 399 просроченных кредитов, корзины 7 429 / 124 / 25 / 16 / 234, совпадают с SQL по каждому кредиту.", "rubric": ["Удаляет дубли платежей и обрезает их по дате отчёта", "Левое соединение (не inner) с validate и assert на число строк; fillna после соединения", "DPD = дата отчёта − самая старая неоплаченная дата с наступившим сроком, иначе 0", "Сверяет с хранилищем (399 / корзины) до использования"]}
```

Завтра: числа становятся картинками — matplotlib, seaborn и `pd.read_sql`, который позволяет каждому CTE с недели 3 приземляться прямо в DataFrame. Пакет рисунков для Тимура.

---

## Тест дня :id=day-quiz

Для завершения дня нужно набрать 80 %. Пересдавать можно сколько угодно.

```quiz
{"id": "w05d3", "pass": 0.8, "questions": [
  {"type": "single", "q": "Вам нужна доля каждого платежа в итоге по его кредиту, на каждой строке платежа. Какой вызов даёт итог по кредиту на каждой строке?", "options": ["pay.pivot_table(index=\"loan_id\", values=\"amount\")", "pay.groupby(\"loan_id\")[\"amount\"].transform(\"sum\")", "pay.groupby(\"loan_id\")[\"amount\"].agg(\"sum\")", "pay[\"amount\"].sum()"], "answer": 1, "explain": "agg возвращает одну строку на группу; transform возвращает по значению на каждую исходную строку — оконную функцию SUM() OVER (PARTITION BY) (→ раздел 1, «transform»)."},
  {"type": "single", "q": "Вы ожидали len(m) == 92 193. Почему получилось меньше?", "code": "m = inst.merge(paid, on=\"installment_id\")\nlen(inst), len(m)", "options": ["merge по умолчанию использует how=\"inner\", поэтому платежи графика без оплаты исчезают", "В paid есть повторяющиеся installment_id", "installment_id в одной из таблиц — текст", "merge отбрасывает строки с NaN в любом столбце"], "answer": 0, "explain": "Соединение по умолчанию — inner; используйте how=\"left\", fillna(0) после соединения и assert len(m) == len(inst) (→ раздел 1, «merge», P6)."},
  {"type": "number", "q": "В inst 10 платежей графика; в paid по одной строке на каждый из 6 платежей графика, получивших оплату. Сколько строк в m?", "code": "m = inst.merge(paid, on=\"installment_id\")\nlen(m)", "answer": 6, "tol": 0, "explain": "Соединение по умолчанию — inner: выживают только платежи графика с оплатой, а 4 без оплаты — как раз те, что нужны для DPD, — исчезают; how=\"left\" сохраняет все 10 (→ раздел 1, «merge»)."},
  {"type": "single", "q": "installments.merge(payments_raw, on=\"installment_id\", validate=\"1:1\") вызывает MergeError на сыром файле платежей. О чём это говорит?", "options": ["pandas не умеет валидировать больше 50 000 строк", "Соединение нужно переписать циклом", "У некоторых платежей графика больше одной строки оплаты (здесь — дублирующиеся платежи), поэтому платежи к платежам графика — это m:1; заявленное вами зерно было неверным", "В installment_id есть значения NaN"], "answer": 2, "explain": "validate превращает неверное убеждение о зерне в ошибку до того, как неверным станет любое число — размножение строк с недели 2, пойманное вовремя (→ раздел 1, «validate= и indicator=», P8)."},
  {"type": "multi", "q": "Какие утверждения о duplicated / drop_duplicates верны?", "options": ["Без subset= сравниваются все столбцы, и дублей платежей находится 0, потому что payment_id различается", "subset= определяет, что считать «одинаковым»", "drop_duplicates оставляет первую строку в текущем порядке, поэтому сначала сортируйте", "duplicated(keep=False) помечает каждого члена группы дублей", "Он всегда оставляет строку с наименьшим id, независимо от порядка"], "answer": [0, 1, 2, 3], "explain": "Ключ определяет, что одинаково, сортировка определяет выжившего, assert доказывает и то и другое (→ раздел 1, «Дубликаты»)."},
  {"type": "single", "q": "pd.to_datetime(birth_date, errors=\"coerce\") даёт 0 NaT. Значит ли это, что даты рождения чистые?", "options": ["Да, если dtype — datetime64", "Нет — разбор это синтаксис; 2031-04-12 прекрасно разбирается и всё равно нарушает бизнес-правило", "Нет — coerce молча превращает плохие даты в 1900-01-01", "Да — каждое значение разобралось"], "answer": 1, "explain": "Валидность — правило, которое пишете вы (не в будущем, не раньше 1920); помечайте и обнуляйте через .where, никогда не угадывайте дату (→ раздел 1, «Даты, которые лгут»)."},
  {"type": "single", "q": "Что даёт этот concat?", "code": "a = pay[pay[\"region\"] == \"Tashkent\"]\nb = pay[pay[\"region\"] != \"Tashkent\"].rename(columns={\"amount\": \"Amount\"})\npd.concat([a, b])", "options": ["Все строки и на один столбец больше: amount — NaN в строках b, Amount — NaN в строках a", "Ошибку: имена столбцов различаются", "Только столбцы, общие для обоих фреймов", "Один столбец amount — pandas игнорирует регистр"], "answer": 0, "explain": "concat сопоставляет столбцы по имени, без ошибки; assert set(a.columns) == set(b.columns) перед каждым concat (→ раздел 1, «concat», P9)."},
  {"type": "single", "q": "Уголок компании: в функции DPD просрочка просроченного кредита равна…", "options": ["дата отчёта − срок оплаты самого старого платежа графика с наступившим сроком, оплаченного не полностью", "дата отчёта − дата выдачи", "числу неоплаченных платежей графика × 30", "дата отчёта − срок оплаты самого свежего неоплаченного платежа графика"], "answer": 0, "explain": "По кредиту: AS_OF − min(due_date) по платежам графика, срок которых наступил и которые оплачены не полностью; 0, когда просрочки нет (→ Уголок компании)."}
]}
```

<!-- challenge:start -->

---

## Задача дня :id=daily-challenge

Бонус для любознательных: один более сложный вопрос по теме сегодняшнего дня. Решите его за XP, которые растут вместе с серией задач, — полная неделя из пяти ещё и добавляет 10 % к пятничному ваучеру.

```challenge
{"id": "w05d3", "q": "Севара хочет рейтинг по взысканию за последний квартал по филиалам. Возьмите платежи графика со сроком с 1 июля по 30 сентября 2026 (installments.csv), то, что было оплачено по каждому на дату отчёта 2026-10-01 (payments_dirty.csv, с удалёнными дублями, как в сегодняшнем расследовании), и филиал кредита из loans_status.csv. Доля собранного = Σ оплачено ÷ Σ total_due. Какова доля ХУДШЕГО филиала? Дайте процент с точностью до 2 знаков.", "type": "number", "dp": 2, "python": true, "h": ["8aa6be7c2de4b2c386aeab63"], "hint": "Уголок компании уже строит фрейм на уровне платежей графика с paid рядом с total_due; ещё одно соединение приносит филиал — проверьте его зерно через validate, прежде чем группировать.", "sol": "QVNfT0YgPSBwZC5UaW1lc3RhbXAoIjIwMjYtMTAtMDEiKQppbnN0ID0gcGQucmVhZF9jc3YoIi4uL2V4Y2VsL2luc3RhbGxtZW50cy5jc3YiLCBwYXJzZV9kYXRlcz1bImR1ZV9kYXRlIl0pCnBheSA9IHBkLnJlYWRfY3N2KCIuLi9leGNlbC9wYXltZW50c19kaXJ0eS5jc3YiLCBwYXJzZV9kYXRlcz1bInBhaWRfYXQiXSkKcGF5ID0gcGF5LnNvcnRfdmFsdWVzKCJwYXltZW50X2lkIikuZHJvcF9kdXBsaWNhdGVzKHN1YnNldD1bImluc3RhbGxtZW50X2lkIiwgInBhaWRfYXQiLCAiYW1vdW50Il0pICAgIyA1MiA4NTAKcGFpZCA9IHBheVtwYXlbInBhaWRfYXQiXSA8PSBBU19PRl0uZ3JvdXBieSgiaW5zdGFsbG1lbnRfaWQiLCBhc19pbmRleD1GYWxzZSkuYWdnKHBhaWQ9KCJhbW91bnQiLCAic3VtIikpCm0gPSBpbnN0Lm1lcmdlKHBhaWQsIG9uPSJpbnN0YWxsbWVudF9pZCIsIGhvdz0ibGVmdCIsIHZhbGlkYXRlPSIxOjEiKS5maWxsbmEoeyJwYWlkIjogMH0pCmxvYW5zID0gcGQucmVhZF9jc3YoIi4uL2V4Y2VsL2xvYW5zX3N0YXR1cy5jc3YiKQptID0gbS5tZXJnZShsb2Fuc1tbImxvYW5faWQiLCAiYnJhbmNoIl1dLCBvbj0ibG9hbl9pZCIsIGhvdz0ibGVmdCIsIHZhbGlkYXRlPSJtOjEiKQpxMyA9IG1bKG1bImR1ZV9kYXRlIl0gPj0gIjIwMjYtMDctMDEiKSAmIChtWyJkdWVfZGF0ZSJdIDwgIjIwMjYtMTAtMDEiKV0KZyA9IHEzLmdyb3VwYnkoImJyYW5jaCIpLmFnZyhkdWU9KCJ0b3RhbF9kdWUiLCAic3VtIiksIHBhaWQ9KCJwYWlkIiwgInN1bSIpKQpnWyJyYXRlIl0gPSAxMDAgKiBnWyJwYWlkIl0gLyBnWyJkdWUiXQpnLnNvcnRfdmFsdWVzKCJyYXRlIikuaGVhZCgzKQojIEJ1a2hhcmEgQ2VudHJhbCA5Mi44MCDCtyBUYXNoa2VudCBTb3V0aCA5My4zNSDCtyBOYW1hbmdhbiBDZW50cmFsIDkzLjU0IOKApiBiZXN0IFRlcm1leiBDZW50cmFsIDk4LjQ5Cgo5Mi44MCAlOiBCdWtoYXJhIENlbnRyYWwgY29sbGVjdGVkIDMuMTggYm4gb2YgdGhlIDMuNDMgYm4gdGhhdCBmZWxsIGR1ZSBpbiBRMyDigJQgdGhlIHdvcnN0IG9mIHRoZSB0ZW4gYnJhbmNoZXMsIGFsbW9zdCBzaXggcG9pbnRzIGJlaGluZCBUZXJtZXogQ2VudHJhbC4KVGhlIHR3byB0cmFwcyBhcmUgYW4gaW5uZXIgbWVyZ2UgKHRoZSB1bnBhaWQgaW5zdGFsbWVudHMgdmFuaXNoIGFuZCBldmVyeSByYXRlIGNsaW1icyB0b3dhcmRzIDEwMCAlKSBhbmQgdGhlIGR1cGxpY2F0ZSBwYXltZW50cyAobGVmdCBpbiwgdGhleSBhZGQgMzguMyBtIHRvIHRoZSBRMyBpbnN0YWxtZW50cyDigJQgNTguNCBtIG92ZXIgdGhlIHdob2xlIGJvb2sg4oCUIHRoYXQgd2FzIG5ldmVyIHBhaWQgdHdpY2UpLgpTZXB0ZW1iZXIgaW5zdGFsbWVudHMgaGF2ZSBoYWQgbGl0dGxlIHRpbWUgdG8gYmUgcGFpZCwgc28gYWxsIGJyYW5jaGVzIGxvb2sgd29yc2UgdGhhbiBpbiBKdWx5OyB0aGUgcmFua2luZywgbm90IHRoZSBsZXZlbCwgaXMgdGhlIGZpbmRpbmcu"}
```

<!-- challenge:end -->
