# Неделя 5 · День 3 — pandas II: groupby, merge и конвейер очистки

<span class="badge">Теория 60 мин</span> <span class="badge">Расследование 40 мин</span> <span class="badge">Практика 45 мин</span> <span class="badge hw">срок HW 5.1 · HW 5.2 (сдать ко Дню 5)</span> <span class="badge company">Уголок компании</span>

> STORY **Среда, 9:05.** Нилуфар, риск-аналитик (*risk analyst*), а за её спиной Жасур. *«Ваш конвейер Power Query работает — на моём ноутбуке. На сервере Жасура нет Excel. Ему нужна та же очистка в виде скрипта, который он сможет поставить на расписание: на входе `customers_dirty.csv` и `payments_dirty.csv`, на выходе 6 000 человек и 52 850 платежей, каждый понедельник в 6:00, плюс DPD по каждому кредиту, посчитанный из графика платежей, чтобы у его модели была целевая переменная.»* Жасур: *«И я хочу видеть assert-ы. Конвейер, который не может доказать собственные количества, — это конвейер, которому я не могу доверять в 6 утра.»*

## Сегодня в 3 строках :id=today-in-3-lines

- **`groupby` / `agg`** — это `GROUP BY` с именованными результатами; **`transform`** — это оконная функция (итог по группе рядом с каждой строкой); **`merge`** — это соединение, где `how=`, `validate=` и `indicator=` — страховочные ремни, которых в SQL у вас никогда не было; `concat` — это `UNION ALL`; `pivot_table` — это перекрёстная таблица.
- Очистка — это те же три исправления, что на неделе 4: текст (`.str.strip().str.lower()`, `replace`), даты (`to_datetime(errors="coerce")` **плюс бизнес-правило**), дубликаты (`duplicated` / `drop_duplicates(subset=, keep=)` после сортировки) — написанные один раз, проверенные через `assert`, перезапускаемые вечно.
- Вы можете воспроизвести в pandas все количества очистки с недели 4 — дублирующиеся люди (и ловушка ключа по имени), невозможные даты рождения, дублирующиеся платежи, написания способов оплаты — и посчитать **DPD для каждого кредита** из `installments.csv` + платежей, сверив результат со столбцом из SQL по каждому кредиту.

---

## 1. Теория — несколько таблиц, один ноутбук :id=1-learn--several-tables-one-notebook

### groupby и agg — GROUP BY с именами :id=groupby-and-agg--group-by-with-names

```python
pay.groupby("region").agg(payments=("payment_id", "size"), total=("amount", "sum"), avg=("amount", "mean"))
#            payments        total      avg
# Tashkent      20437  102605410110  5020571
# Fergana        6334   34437790032  5436973 …
pay.groupby(["product", "method"]).size().unstack(fill_value=0)      # два ключа → перекрёстная таблица
pay.groupby("region")["amount"].sum().sort_values(ascending=False)   # один агрегат, один столбец
```

`groupby("key")` разбивает фрейм на группы; `.agg(name=("column", "function"))` — **именованная агрегация** — вычисляет по одному результату на группу и даёт ему имя, как `SUM(amount) AS total`. Функции: `"size"` (строки, как `COUNT(*)`), `"count"` (непустые, как `COUNT(col)` — по `monthly_income` в разрезе сегментов: size 3 585, count 3 377), `"sum"`, `"mean"`, `"median"`, `"min"`, `"max"`, `"nunique"`, `"first"` или ваша собственная функция. Ключи становятся **индексом** результата; `as_index=False` или `.reset_index()` возвращает их в столбцы, когда нужно соединять или строить график. Несколько ключей → `MultiIndex`; `.unstack()` переносит последний ключ в столбцы.

### transform — оконная функция :id=transform--the-window-function

```python
pay["loan_total"] = pay.groupby("loan_id")["amount"].transform("sum")   # SUM(amount) OVER (PARTITION BY loan_id)
pay["share"] = pay["amount"] / pay["loan_total"]                        # доля каждого платежа в платежах по его кредиту
cust["seg_median"] = cust.groupby("segment")["monthly_income"].transform("median")
above = (cust["monthly_income"] > cust["seg_median"]).sum()             # сырой customers_dirty.csv: 2 841 зарабатывают выше медианы своего сегмента
```

`agg` сворачивает до одной строки на группу; `transform` возвращает значение **на каждую исходную строку**, выровненное по фрейму, — `OVER (PARTITION BY …)` с недели 3. Используйте его для долей от итога по группе, для «отклонения от среднего по группе», для накопительных итогов `cumsum` внутри групп (`groupby("loan_id")["amount"].cumsum()`), для `rank` внутри групп и — трюк для удаления дублей — `groupby(key).cumcount()` это `ROW_NUMBER() OVER (PARTITION BY key)`.

### merge — соединение со страховочными ремнями :id=merge--the-join-with-safety-belts

```python
m = inst.merge(paid, on="installment_id", how="left", validate="1:1", indicator=True)
m["_merge"].value_counts()      # both · left_only · right_only — прочитайте три количества (шаг 5 расследования)
```

`left.merge(right, on="key", how=...)`: `"inner"` (по умолчанию — **не** `left`; забытое `how=` отбрасывает неоплаченные платежи по графику, а они-то и есть суть), `"left"`, `"right"`, `"outer"`. `left_on=` / `right_on=`, когда имена различаются; `on=["a", "b"]` для ключа из двух столбцов. Два аргумента, которых SQL вам никогда не давал: **`validate="1:1"` / `"m:1"` / `"1:m"`** вызывает `MergeError`, если ключ не уникален на стороне, за которую вы поручились, — размножение строк с недели 2 (Σ principal ×24.7 после соединения с платежами по графику) становится ошибкой вместо неверного числа; **`indicator=True`** добавляет столбец `_merge`, говорящий, откуда пришла каждая строка, — анти-соединение это `m[m["_merge"] == "left_only"]`. Столбцы с одинаковыми именами с обеих сторон получают `_x` / `_y`; передайте `suffixes=("", "_sql")`, чтобы управлять этим. Считайте строки до и после, каждый раз: левое соединение обязано сохранить ровно `len(left)` строк.

| `how=` | SQL (неделя 2) | Power Query (неделя 4) | Какие строки остаются |
|---|---|---|---|
| `"inner"` (по умолчанию) | `INNER JOIN` | Inner | только совпадения — платежи по графику, у которых есть оплата |
| `"left"` | `LEFT JOIN` | Left Outer | каждая левая строка — 92 193 платежа по графику, `paid` NaN там, где оплаты нет |
| `"right"` | `RIGHT JOIN` | Right Outer | каждая правая строка |
| `"outer"` | `FULL OUTER JOIN` | Full Outer | всё из обеих — соединение для roll-rate по двум срезам |
| `indicator=True` + `left_only` | `LEFT JOIN … WHERE right IS NULL` | Left Anti | анти-соединение |

### concat — UNION ALL; pivot_table — перекрёстная таблица :id=concat--union-all-pivot_table--the-cross-tab

```python
pd.concat([pay[pay.region == "Tashkent"], pay[pay.region != "Tashkent"]])           # Tashkent + остальные = снова все строки, столбцы сопоставляются по ИМЕНИ
pd.concat([a, b], ignore_index=True)                                                 # перенумеровать индекс
pd.pivot_table(loans, index="bucket", columns="product", values="loan_id", aggfunc="count", fill_value=0, margins=True)
pd.crosstab(loans["grade"], loans["bucket"])                                         # только количества, короче
```

`concat` складывает фреймы стопкой; столбцы он сопоставляет **по имени**, поэтому столбец, написанный как `Amount` в одном файле, станет вторым столбцом, полным NaN, — урок Append с недели 4. `pivot_table(index, columns, values, aggfunc)` — это сводная таблица Excel: `aggfunc="sum"` / `"mean"` / `"count"`, `margins=True` для строки итогов, `fill_value=0` для пустых ячеек. `pivot` (без агрегации) переформатирует из длинной формы в широкую, когда в каждой ячейке уже по одному значению — `monthly_disbursements.csv` (170 строк) превращается в 34 месяца × 5 продуктов; `melt` возвращает обратно в длинную форму, которая нужна seaborn завтра.

### apply против векторизации :id=apply-vs-vectorised

```python
inst["total"] = inst["principal_due"] + inst["interest_due"]                              # векторно: 0.7 мс на 92 193 строках
inst["total"] = inst.apply(lambda r: r["principal_due"] + r["interest_due"], axis=1)      # apply по строкам: 720 мс — в 1 000 раз медленнее
loans["bucket"] = loans["dpd"].apply(dpd_bucket)      # нормально для функции-метки на одном столбце (0.7 мс против 0.4 у pd.cut)
```

`apply` запускает Python-функцию один раз на строку (или на значение) — это `for` под маской. Это правильный инструмент для разовой функции-метки или логики, слишком запутанной для арифметики; и неправильный, когда существует запись через арифметику или `pd.cut` / `np.where` / `.str`. Практическое правило: если вы написали `axis=1`, спросите себя, не хватило бы арифметики над столбцами.

### Аксессор `.str` — ремонт текста для целого столбца :id=the-str-accessor--text-repair-for-a-whole-column

```python
cust["first_name"].str.strip()                           # TRIM            — хвостовые пробелы уходят
cust["first_name"].str.title()                           # PROPER          — 'MALIKA' → 'Malika'; а также 'buy now pay later' → 'Buy Now Pay Later', поэтому только для имён
pay["method"].str.strip().str.lower()                    # LOWER(TRIM()) с недели 2
pay["method"].replace({"bank transfer": "transfer"})     # замена значения целиком (словарь)
cust["first_name"].str.contains(" "), .str.len(), .str.startswith("approved"), .str.split(" ").str[0], .str.replace(r"^998", "+998", regex=True)
```

`.str.<method>` применяет строковый метод к каждому значению и не трогает NaN. `Series.replace(dict)` заменяет значения целиком; `.str.replace(a, b)` правит внутри текста (регулярные выражения по желанию). Выстраивайте цепочку в порядке, который читается как журнал изменений: strip → lower → replace.

### Дубликаты: найти, посмотреть, потом удалить :id=duplicates-find-look-then-drop

```python
dup_mask = pay.duplicated(subset=["installment_id", "paid_at", "amount"], keep=False)   # True на ВСЕХ членах группы
pay[dup_mask].sort_values(["installment_id", "payment_id"])                            # смотрите, прежде чем удалять
pay_clean = pay.sort_values("payment_id").drop_duplicates(subset=[...], keep="first")  # оставить наименьший payment_id
```

`duplicated(subset=, keep=)`: `keep="first"` помечает более поздние копии (те, что уйдут), `keep=False` помечает каждого члена группы (чтобы посмотреть). `drop_duplicates` с теми же аргументами удаляет их, оставляя первую строку **в текущем порядке**, — поэтому **сначала сортируйте**: по `payment_id`, чтобы сохранить самый ранний платёж, по `registered_at`, чтобы сохранить исходную регистрацию клиента. Без `subset=` сравниваются все столбцы, и дублей здесь находится 0, потому что `payment_id` различается, — ловушка «отметить все столбцы» с недели 4, но в параметре. Ключ определяет, что считать одинаковым; сортировка определяет, кто выживет; assert на количество доказывает и то и другое.

### Даты, которые лгут: `errors="coerce"` и бизнес-правило :id=dates-that-lie-errorsquotcoercequot-and-the-business-rule

```python
cust["birth_date"] = pd.to_datetime(cust["birth_date"], errors="coerce")   # не разбирается → NaT (а не падение) — посчитайте NaT
bad = (cust["birth_date"] > AS_OF) | (cust["birth_date"] < "1920-01-01")   # бизнес-правило находит то, чего не найдёт разбор
cust["birth_date_invalid"] = bad
cust["birth_date_clean"] = cust["birth_date"].where(~bad)                   # оставить дату, где она валидна, NaT — где нет
```

`errors="coerce"` защищает вас от `"n/a"` и `"31.02.2026"`; он **не** защищает от `2031-04-12` — прекрасно разбираемой лжи. Разбор — это синтаксис; валидность — бизнес-правило, и писать его вам: не в будущем, не раньше 1920. `.where(cond)` оставляет значения там, где условие выполняется, а остальные обнуляет (`np.where(cond, a, b)` — двусторонний `IF`). Никогда не заменяйте плохую дату правдоподобной — флаг + пустое значение, как на неделе 4.

### assert — конвейер, который проверяет сам себя :id=assert--the-pipeline-that-checks-itself

```python
assert len(cust_clean) == 6000, f"expected 6000 customers, got {len(cust_clean)}"
assert pay_clean["method"].nunique() == 5
assert (m["_merge"] != "right_only").all()           # нет платежей без платежа по графику
```

`assert condition, message` останавливает ноутбук с `AssertionError`, когда условие False, и ничего не делает в противном случае. Ставьте по одному после каждого шага, чьё количество вы знаете, — строк после удаления дублей, строк после левого соединения (`== len(left)`), суммы, которая должна сходиться, — и понедельничный запуск либо завершится, либо скажет вам, на каком именно шаге всё сломалось. Это и имел в виду Жасур: количества лежат *в* скрипте, а не в вашей памяти.

### Глубже (по желанию) :id=depth-optional

**Видео (бесплатные, YouTube; каждая ссылка открывается на нужной минуте):**

- ▶ groupby и agg — [Complete Python Pandas Data Science Tutorial! (2025 Updated Edition) (Keith Galli), 1:05:47](https://youtu.be/2uvysYbKdjM?t=3947&end=4104)
- ▶ groupby, короткое видео по одной теме — [Group By and Aggregate Functions in Pandas (Alex The Analyst), 01:20](https://youtu.be/VRmXto2YA2I?t=80&end=188)
- ▶ merge / concat — Keith Galli, то же видео, [50:42](https://youtu.be/2uvysYbKdjM?t=3042&end=3513)
- ▶ Очистка (дубликаты, strip, replace, заполнение пропусков) — [Data Cleaning in Pandas (Alex The Analyst), 02:34](https://youtu.be/bDhvCp3_lYw?t=154&end=221)
- ▶ Та же тема внутри большого курса — [Python for Data Analytics (Luke Barousse), Merge 7:15:37](https://youtu.be/wUSDVGivd-8?t=26137&end=26753)

- Русская презентация (TBC Data Analytics 2.0, если она у вас есть) `4.3_Python.pdf`, стр. 82–103: `groupby` и `.agg` — стр. 82–87, сводные таблицы — стр. 88–91, `pd.merge` / `join` / `concat` — стр. 92–103; `.apply` / `.map` — стр. 74–81. `4.4_Python.pdf` — завтрашний мост (DB-API, `read_sql`, SQLAlchemy).
- *Английские термины:* groupby = группировка, aggregation = агрегация, named aggregation = именованная агрегация, window function (`transform`) = оконная функция, merge / join = слияние / соединение, concat = конкатенация, pivot table = сводная таблица, duplicates = дубликаты, data cleaning = очистка данных, assert = утверждение / проверка.

---

## 2. Расследование — файлы Нилуфар, в pandas (40 мин) :id=_2-detective-nilufar39s-files-in-pandas-40-min

Откройте `data/python/day3_starter.ipynb`; пошаговые ячейки — это первая половина. Воспроизведите количества недели 4 шаг за шагом — под спойлерами лежат числа; сначала получите свои.

**Шаг 1 — инвентаризация грязи в `customers_dirty.csv`** через `.str`: хвостовые пробелы в `first_name`, имена заглавными буквами, фамилии строчными, id выше 6 000.

<details><summary>Результат</summary>

`(c.first_name != c.first_name.str.strip()).sum()` → **18**; `c.first_name.str.isupper().sum()` → **22**; `(c.last_name == c.last_name.str.lower()).sum()` → **40**; `(c.customer_id > 6000).sum()` → **40**. 22 + 18 попадают на 40 фамилий строчными, id 6001–6040 — то же подозрение, что и на неделе 4, четыре строки вместо четырёх `SUMPRODUCT`.

</details>

**Шаг 2 — докажите дубли** тремя способами: `duplicated(subset=[нормализованное имя, фамилия, birth_date])`, `subset=["phone", "birth_date"]`, `subset=["phone"]`.

<details><summary>Результат</summary>

Ключ по имени (после `.str.strip().str.lower()`): **42** лишних в 84 строках — снова два тёзки (823/1197 *Nodir Nazarov* 1997-04-28, Tashkent против Samarkand; 2460/5562 *Eldor Karimov* 1963-04-06, разные телефоны). Сырые имена без нормализации: только **2** (регистр и пробел скрывают остальные 40 — `duplicated` ищет точное совпадение, как Remove Duplicates). `phone + birth_date`: **40**, ровно id 6001–6040 (6001 `MALIKA jalilova` ↔ 4516 `Malika Jalilova`, телефон 998908981002, 1981-08-15, доход 5 419 072). Только `phone`: **43** — три семейных номера. Все 40 дублей были зарегистрированы *после* оригинала, поэтому `sort_values("registered_at")` + `keep="first"` сохраняет оригиналы: `(clean.customer_id <= 6000).all()` → True. «Зарегистрированы в 2026» падает с 955 до 945.

</details>

**Шаг 3 — даты.** `pd.to_datetime(errors="coerce")`, посчитайте NaT, затем бизнес-правило.

<details><summary>Результат</summary>

NaT после coerce: **0** — каждое значение является корректной датой ISO, так что один лишь `coerce` ничего не находит. Правило `> AS_OF or < 1920-01-01` находит **7**: 927, 2338, 3380 (2031-04-12), 964 (2027-02-28), 957, 1020, 2934 (1900-01-01). Возраст как `(AS_OF - birth_date).dt.days / 365.25` → те же 7 имеют `< 18 or > 100`; валидные клиенты в среднем 45.7 года. `birth_date_clean = birth_date.where(~bad)` и столбец-флаг — никогда не догадка.

</details>

**Шаг 4 — платежи.** `method.value_counts()` сырой и очищенный; `duplicated` по ключу из трёх столбцов; Σ лишних.

<details><summary>Результат</summary>

Сырые: 10 написаний, **180** грязных строк (`~method.isin(five)`); `.str.strip().str.lower()` → 6 (`bank transfer` остаётся); `.replace({"bank transfer": "transfer"})` → **5**. Дубли: 50 строк в 25 группах, **25** лишних, Σ **58 397 800** — 58 миллионов Тимура; у всех 25 лишних `payment_id` > 52 850, а `duplicated()` без `subset` находит 0. После `sort_values("payment_id").drop_duplicates(...)`: 52 850 строк, Σ 255 114 772 176; 24 строки с датой в будущем (53 438 947) помечены, оставлены. Чистые количества по способам: card 17 612 · payme 8 897 · cash 8 788 · click 8 786 · transfer 8 767 (пять в сумме дают 52 850 — 25 удалённых строк были 9 card, 3 payme, 2 cash, 4 click, 7 transfer).

</details>

**Шаг 5 — соединение, которое считает DPD** (полная версия — в Уголке компании): агрегируйте чистые платежи с `paid_at <= AS_OF` по платежу графика, левым соединением присоедините к `installments.csv` с `validate="1:1", indicator=True`.

<details><summary>Результат</summary>

52 826 платежей по графику с оплатой, 39 367 без, 0 оплат без платежа по графику. Наступил срок (`due_date <= AS_OF`): **54 207**; срок наступил и `paid < total_due`: **1 784**, из них 403 оплачены частично — числа P8 недели 4. `(paid > total_due).sum()` → **0** после удаления дублей, **25** до него: дубли были единственными переплатами в портфеле, и это самое чистое доказательство того, что это были дубли, а не настоящие вторые платежи. Кредитов с неоплаченным платежом, срок которого наступил: 413; с `dpd > 0`: **399** (14 наступили в сам день отчёта, dpd 0).

</details>

---

## 3. Практика (45 мин) :id=3-practice-45-min

Добавляйте по ячейке на задачу в `day3_starter.ipynb`; выводите число или фрейм.

**P1.** Платежи по `region`: количество, итог, среднее — на грязном файле и на чистом. Какой регион потерял больше всего денег при удалении дублей?

<details><summary>Ответ</summary>

Чистые: Tashkent 20 437 / 102 605 410 110 / 5.02 млн · Fergana 6 334 / 34 437 790 032 · Samarkand 6 037 / 27 576 625 156 · Andijan 4 724 / 24 138 491 453 · Namangan 4 782 / 21 044 366 065 · Bukhara 4 088 / 16 162 119 575 · Termez 3 218 / 15 956 940 146 · Nukus 3 230 / 13 193 029 639. Больше всего потерял Samarkand (24 951 300), у Tashkent 7 из 25 строк (5 247 900). `agg(payments=("payment_id", "size"), total=("amount", "sum"), avg=("amount", "mean"))`.

</details>

**P2.** Перекрёстная таблица чистых платежей: количества `product` × `method` через `groupby(...).size().unstack()`, затем то же через `pivot_table`. Прочитайте строку SME.

<details><summary>Ответ</summary>

SME: card 2 701 · cash 1 334 · click 1 390 · payme 1 401 · transfer 1 396 — тот же состав 33 / 17 / 17 / 17 / 17 %, что и у всего портфеля; `method` не зависит от `product`. `pd.pivot_table(pay, index="product", columns="method", values="payment_id", aggfunc="count", fill_value=0)` даёт тот же самый фрейм.

</details>

**P3.** `transform`: добавьте рядом с каждым клиентом медианный доход его сегмента; сколько зарабатывают выше неё? Затем `cumcount` по `phone` как `ROW_NUMBER` с недели 3 — у скольких строк значение 1 или больше?

<details><summary>Ответ</summary>

На сыром `customers_dirty.csv`: 2 841 выше медианы своего сегмента (mass 5.79 млн · affluent 25.28 млн · sme 33.21 млн; 356 NaN сравниваются как False). На 6 000 чистых клиентов (P6): 2 823 (медианы 5.80 / 25.18 / 33.24 млн) — скажите, каким фреймом вы пользовались. `cust.groupby("phone").cumcount()` → 43 строки ≥ 1 — 40 дублей плюс три семейных номера; с ключом `["phone", "birth_date"]` — ровно 40. Сортируйте по `registered_at` перед `cumcount`, иначе «0» может оказаться более поздней копией.

</details>

**P4.** Ловушка inner-соединения: повторите шаг 5 с `how` по умолчанию. Сколько строк получится и какие кредиты расчёт DPD тогда пропустит?

<details><summary>Ответ</summary>

52 826 строк — каждый платёж по графику **без** оплаты исчезает, так что неоплаченный платёж не «не оплачен», а отсутствует, и каждый кредит с полной просрочкой (234 в 90+ с месяцами без единой оплаты) выглядит текущим. `how="left"` + `fillna(0)` — это `LEFT JOIN … COALESCE(SUM, 0)` с недели 2; `assert len(m) == len(inst)` после соединения — страховочный ремень.

</details>

**P5.** `validate`: соедините чистые платежи с `loans_status.csv` (`loan_id`) с `validate="m:1"` — всё в порядке. Теперь присоедините `installments.csv` к **сырым** платежам с `validate="1:1"`, затем к **чистым** платежам — что происходит каждый раз и что сообщение говорит о зерне?

<details><summary>Ответ</summary>

Сырые: `MergeError: Merge keys are not unique in left dataset; not a one-to-one merge` — 25 пар дублей дают по две строки платежей на 25 платежей по графику, так что сырые платежи → платежи по графику это **m:1**; неверно заявленное зерно ловится до того, как неверным станет любое число. Чистые: соединение проходит — после удаления дублей у каждого платежа по графику не более одной оплаты (P11 недели 3: частичные — это единичные платежи меньше `total_due`, а не несколько платежей). Всё равно оставьте в скрипте `validate="m:1"`: это зерно, которое допускает бизнес, и оно не сломается в тот день, когда придёт настоящий разделённый платёж. Правило: пишите тот `validate`, в который вы *верите*; `MergeError` — бесплатный урок о данных.

</details>

**P6.** Очистите `customers_dirty.csv` от начала до конца одной цепочкой (strip + title, флаги, сортировка, удаление дублей) и сделайте `assert` на четыре количества: 6 000 строк, 7 невалидных дат, 354 пропущенных дохода, ни одного id выше 6 000. Почему 354, а не 356?

<details><summary>Ответ</summary>

Две из 40 дублирующихся строк копировали клиента с пустым доходом, так что их удаление убирает 2 из 356 NaN. Цепочка — это `clean_customers` в ноутбуке: `.str.strip().str.title()` по двум столбцам имён → `birth_date_invalid` → `birth_date_clean = birth_date.where(~invalid)` → `sort_values("registered_at").drop_duplicates(subset=["phone", "birth_date"], keep="first")` → `sort_values("customer_id")`.

</details>

**P7.** Доля собранных платежей по месяцу срока за 2026 из объединённого фрейма шага 5: `due_month = due_date.dt.to_period("M")`, `groupby` → Σ к оплате, Σ оплачено, доля. Сравните сентябрь с неделей 4.

<details><summary>Ответ</summary>

Янв 97.3 % · Фев 97.0 · Мар 96.8 · Апр 96.9 · Май 97.1 · Июн 96.9 · Июл 96.7 · Авг 96.5 · **Сен 94.1 %** (3 305 платежей по графику, 16 987 977 718 к оплате, 15 982 118 926 оплачено) — идентично таблице Power Query, потому что платежи обрезаны по дате отчёта внутри `paid`. `m[(m.due_date >= "2026-01-01") & (m.due_date < "2026-10-01")].groupby("due_month").agg(due=("total_due", "sum"), paid=("paid", "sum"))`, затем `rate = paid / due`.

</details>

**P8.** `apply` против векторизации: посчитайте `total_due` из двух частей обоими способами на 92 193 платежах графика и замерьте время через `%%timeit` (или `time.perf_counter()`). Затем примените `dpd_bucket` из HW 5.1 к `dpd` и сравните с `pd.cut`.

<details><summary>Ответ</summary>

Построчный `apply(axis=1)` ≈ 0.7 с; `inst.principal_due + inst.interest_due` ≈ 0.7 мс — в тысячу раз быстрее; оба равны `total_due` в каждой строке (файл согласован). `dpd.apply(dpd_bucket)` и `pd.cut` дают одинаковые метки на 7 828 строках, и оба работают около миллисекунды — для функции-метки на одном столбце `apply` годится; избегать нужно `axis=1`.

</details>

**P9.** `concat`: разделите чистые платежи на Tashkent и остальных, добавьте каждой части столбец `source`, склейте с `ignore_index=True`. Сколько строк? Затем переименуйте `amount` в `Amount` в одной половине и склейте снова — как выглядит результат?

<details><summary>Ответ</summary>

20 437 + 32 413 = **52 850**, `source` говорит, из какой половины пришла каждая строка (происхождение для двенадцати месячных файлов). С `Amount` в одной половине: по-прежнему 52 850 строк, но **на один столбец больше**, `amount` — NaN в 20 437 строках, а `Amount` — NaN в 32 413 — без ошибки, расщеплённый столбец; `assert set(a.columns) == set(b.columns)` перед каждым `concat`.

</details>

<span class="badge stretch">Со звёздочкой</span> **P10.** Изменение формы: `monthly_disbursements.csv` (170 длинных строк) → `pivot` в 34 месяца × 5 продуктов, добавьте столбец `total` и долю SME по месяцам; затем `melt` обратно в длинную форму. В каком месяце доля SME была наибольшей и какой она была в сентябре 2026?

<details><summary>Ответ</summary>

`md.pivot(index="month", columns="product", values="amount")` → (34, 5); наибольшая доля SME — **2024-07, 77.2 %**; в сентябре 2026 она составляет 50.6 % от 17.0 млрд (8.60 млрд). `w.reset_index().melt(id_vars="month", var_name="product", value_name="amount")` → снова 170 строк. Широкая форма — для чтения и Excel, длинная — для `groupby` и seaborn; завтрашнему lineplot нужна длинная форма.

</details>

### Ошибки, которые стоят балла на этой неделе :id=mistakes-that-cost-a-point-this-week

- `merge` без `how=` — по умолчанию inner; неоплаченные платежи по графику исчезают.
- Нет `validate=` на соединении, зерно которого вы «знаете», — размножение строк с недели 2, без предупреждения.
- `drop_duplicates` без `subset=` (удалено 0) или без предварительной сортировки (оставлен не тот выживший).
- `errors="coerce"` принят за валидацию — 7 невозможных дат проходят.
- `fillna` до соединения вместо после — NaN, означающий «нет оплаты», теряется.
- Построчный `apply(axis=1)` там, где есть арифметика над столбцами.
- `concat` фреймов с по-разному написанными столбцами — тихое расщепление.
- Количества, которые живут в вашей голове, а не в строках `assert`.

---

## 4. Домашнее задание <span class="badge hw">HW 5.2 — сдать ко Дню 5</span> :id=4-homework-hw-52--due-day-5

**Понедельничный скрипт Жасура.** Сдайте `clean_nur.py` (блок 📎 ниже) (или выполненный `day3_starter.ipynb` с заполненными тремя функциями TODO) и три CSV, которые он записывает:

1. **`customers_clean.csv`** — 6 000 строк из `customers_dirty.csv`: имена без лишних пробелов и с заглавной буквы, дубли удалены по `phone` + `birth_date` с сохранением самого раннего `registered_at`, `birth_date_invalid` (7 True), `birth_date_clean` (NaT при невалидной), пропуски `monthly_income` остаются NaN (354).
2. **`payments_clean.csv`** — 52 850 строк: `method` из 5 значений, дубли удалены по `installment_id` + `paid_at` + `amount` с сохранением наименьшего `payment_id`, `is_forward_dated` (24 True, строки сохранены). Σ `amount` 255 114 772 176.
3. **`dpd_per_loan.csv`** — одна строка на кредит (7 828): `loan_id`, `dpd`, `bucket`, посчитанные из `installments.csv` + ваших чистых платежей, как в Уголке компании; 399 кредитов с `dpd > 0`, корзины 7 429 / 124 / 25 / 16 / 234, равные `dpd` из `loans_status.csv` для каждого кредита.
4. **Asserts** на каждое количество выше внутри скрипта, плюс `len(merged) == len(installments)` после соединения; запуск `python clean_nur.py` не печатает ничего, кроме трёх имён файлов, когда всё в порядке.

**Пути.** Ваш ментор запускает ваш скрипт в папке, где сырые файлы лежат в папке `data/excel/` рядом со скриптом. Поэтому читайте их как `Path("data/excel/customers_dirty.csv")` (чтобы проверить скрипт, положите скачанные файлы в папку `data/excel/` рядом с ним), а три CSV записывайте в текущую папку (`customers_clean.csv`, а не путь куда-то ещё). Если вы сдаёте ноутбук вместо скрипта, приложите и три CSV.

Оценивается: (а) количества (6 000 / 7 / 52 850 / 5 / 24 / 399 и корзины), (б) asserts присутствуют, а скрипт работает сверху донизу из сырых файлов — проверяющий удаляет CSV и запускает его заново, (в) при удалении дублей остаётся правильный выживший (оригиналы ≤ 6 000; наименьший `payment_id`), а DPD совпадает с SQL для всех 7 828 кредитов. Сегодня также срок **HW 5.1** в `day-1/`.

### 📎 Сдайте здесь :id=hand-in-here

```sqltask
{"check": "handin-W5D3", "lesson": "W5D3", "title": "HW 5.2", "tasks": [{"id": "clean_nur.py", "file": "clean_nur.py", "names": ["clean_nur.py", "day3_starter.ipynb"], "upload": true, "accept": ".ipynb,.py", "q": "Прикрепите `clean_nur.py` или `day3_starter.ipynb` — то, что требует страница выше."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Всё остальное, что перечислено на странице (ещё один файл или .zip из нескольких)."}]}
```

---

## 5. Самопроверка :id=5-self-check

1. `agg` против `transform` — какая из них возвращает одну строку на группу, какая — на исходную строку, и какая является оконной функцией? *(→ раздел 1, «groupby», «transform»)*
2. Вы соединяете платежи с платежами по графику и получаете меньше строк, чем 92 193. Что вы забыли и какой `assert` это бы поймал? *(→ раздел 1, «merge», P4)*
3. `pd.to_datetime(errors="coerce")` нашёл 0 плохих дат рождения. Значит ли это, что даты чистые? *(→ раздел 1, «Даты, которые лгут», шаг 3 расследования)*

---

## 6. Уголок компании <span class="badge company">DPD в pandas</span> :id=6-company-corner-dpd-in-pandas

Блок DPD с недели 2, `v_loan_status` с недели 3, соединение Power Query с недели 4 — теперь в виде функции, которую Жасур ставит на расписание. Дисциплина зерна — это весь метод: платёж по графику → кредит.

```python
AS_OF = pd.Timestamp("2026-10-01")
inst = pd.read_csv("../excel/installments.csv", parse_dates=["due_date"])            # зерно: платёж по графику, 92 193
pay  = clean_payments(pd.read_csv("../excel/payments_dirty.csv", parse_dates=["paid_at"]))   # 52 850

paid = (pay[pay["paid_at"] <= AS_OF]                                                # 1. платежи до даты отчёта включительно …
        .groupby("installment_id", as_index=False).agg(paid=("amount", "sum")))     #    … агрегированные по платежу графика
m = inst.merge(paid, on="installment_id", how="left", validate="1:1")               # 2. каждый платёж графика сохранён
assert len(m) == len(inst)
m["paid"] = m["paid"].fillna(0)                                                     #    нет оплаты = 0 оплачено
m["unpaid"]  = m["paid"] < m["total_due"]                                           # 3. оплачен не полностью
m["matured"] = m["due_date"] <= AS_OF                                               #    и срок уже наступил
late = m[m["unpaid"] & m["matured"]]                                                #    1 784 платежа
dpd = (AS_OF - late.groupby("loan_id")["due_date"].min()).dt.days.rename("dpd")     # 4. по кредиту: дата отчёта − самая старая дата неоплаченного срока
loans = (pd.read_csv("../excel/loans_status.csv")[["loan_id"]]                      # 5. каждый кредит, 0, если просрочки нет
         .merge(dpd, on="loan_id", how="left").fillna({"dpd": 0}).astype({"dpd": int}))
loans["bucket"] = pd.cut(loans["dpd"], [-1, 0, 30, 60, 90, np.inf], labels=["0", "1-30", "31-60", "61-90", "90+"])
```

`(loans.dpd > 0).sum()` → **399**; `loans.bucket.value_counts().sort_index()` → **7 429 / 124 / 25 / 16 / 234**; при сверке с `loans_status.csv` `(dpd == dpd_sql).all()` → **True** для всех 7 828 кредитов. То же определение, те же строки, третий инструмент, то же число — единственный приемлемый исход. Где версия на pandas *лучше* SQL: `validate="1:1"` и `assert` делают зерно явным; `AS_OF` — одна переменная, так что срез на 1 сентября для roll rate — это та же функция с другим аргументом; а 25 дублей обрабатываются именованным шагом (`clean_payments`), а не представлением, о котором кто-то должен не забыть.

**FPD30 по поколению (винтажу) × каналу = один `pivot_table`.** Первый платёж по графику на кредит, попадает в охват, если срок его оплаты ≤ даты отчёта − 30 дней; просрочен, если не оплачен полностью в течение 30 дней (`paid < total_due` или `first_paid − due_date > 30`); поколение (винтаж) = месяц выдачи; канал — из `applications` через `nur.db` (в `loans_status.csv` канала нет):

```python
first = inst[(inst["installment_no"] == 1) & (inst["due_date"] <= AS_OF - pd.Timedelta(days=30))]
paid1 = pay[pay["paid_at"] <= AS_OF].groupby("installment_id", as_index=False).agg(paid=("amount", "sum"), first_paid=("paid_at", "min"))
f = first.merge(paid1, on="installment_id", how="left").fillna({"paid": 0})
f["fpd30"] = ((f["paid"] < f["total_due"]) | ((f["first_paid"] - f["due_date"]).dt.days > 30)).astype(int)
f = f.merge(loan_channel, on="loan_id", validate="1:1")          # loan_id, disbursed_at, channel из nur.db
f["vintage"] = f["disbursed_at"].dt.to_period("M").astype(str)
pd.pivot_table(f, index="vintage", columns="channel", values="fpd30", aggfunc="mean").mul(100).round(2)
```

В охвате **7 099**, FPD30 **91 = 1.28 %**; по каналам app 41 / 2 411 = **1.70 %**, partner 16 / 1 425 = 1.12 %, branch 34 / 3 263 = 1.04 % — таблица недели 2, ячейка в ячейку. Последние строки сводной таблицы: 2026-05 app 0.76 / branch 1.12 / partner 5.97 (4 из 67 — слишком мало, чтобы читать); 2026-06 0.74 / 0.62 / 1.33; 2026-07 1.64 / 0.62 / 1.19; 2026-08 — 11 кредитов в охвате, а partner — NaN: пустая ячейка, а не 0. Замените `columns="channel"` на `"risk_grade"` (A 0.60 · B 0.97 · C 2.16 · D 2.23 %) или `aggfunc=["sum", "count"]`, чтобы показать количества рядом с долями, и группируйте по кварталам (`dt.to_period("Q")`), когда месячные ячейки так малы. Определение «только неоплаченные» (один лишь `paid < total_due`) даёт app 1.04 % — плитка Тимура; одно булево слагаемое и есть весь спор на 0.66 пункта между двумя отделами.

> Версия для собеседования: *«Посчитайте DPD по кредиту в pandas из графика и таблицы платежей.»* — удалите дубли и обрежьте платежи по дате отчёта; `groupby(installment_id).sum()`; левое соединение с платежами графика с `validate="1:1"` и assert на число строк; не оплачен = paid < due, срок наступил = due ≤ as-of; по кредиту `as_of − min(due_date)` по неоплаченным строкам с наступившим сроком; `pd.cut` для корзин; сверьте 399 и количества по корзинам с хранилищем, прежде чем кто-то использует это как целевую переменную модели.

Завтра: числа становятся картинками — matplotlib, seaborn и `pd.read_sql`, который позволяет каждому CTE с недели 3 приземляться прямо в DataFrame. Пакет рисунков для Тимура.

---

## Тест дня :id=day-quiz

Для завершения дня нужно набрать 80 %. Пересдавать можно сколько угодно.

```quiz
{"id": "w05d3", "pass": 0.8, "questions": [
  {"type": "single", "q": "Вам нужна доля каждого платежа в итоге по его кредиту, на каждой строке платежа. Какой вызов даёт итог по кредиту на каждой строке?", "options": ["pay.pivot_table(index=\"loan_id\", values=\"amount\")", "pay.groupby(\"loan_id\")[\"amount\"].transform(\"sum\")", "pay.groupby(\"loan_id\")[\"amount\"].agg(\"sum\")", "pay[\"amount\"].sum()"], "answer": 1, "explain": "agg возвращает одну строку на группу; transform возвращает по значению на каждую исходную строку — оконную функцию SUM() OVER (PARTITION BY) (→ раздел 1, «transform»)."},
  {"type": "single", "q": "Вы ожидали len(m) == 92 193. Почему получилось меньше?", "code": "m = inst.merge(paid, on=\"installment_id\")\nlen(inst), len(m)", "options": ["merge по умолчанию использует how=\"inner\", поэтому платежи графика без оплаты исчезают", "В paid есть повторяющиеся installment_id", "installment_id в одной из таблиц — текст", "merge отбрасывает строки с NaN в любом столбце"], "answer": 0, "explain": "Соединение по умолчанию — inner; используйте how=\"left\", fillna(0) после соединения и assert len(m) == len(inst) (→ раздел 1, «merge», P4)."},
  {"type": "number", "q": "В inst 10 платежей графика; в paid по одной строке на каждый из 6 платежей графика, получивших оплату. Сколько строк в m?", "code": "m = inst.merge(paid, on=\"installment_id\")\nlen(m)", "answer": 6, "tol": 0, "explain": "Соединение по умолчанию — inner: выживают только платежи графика с оплатой, а 4 без оплаты — как раз те, что нужны для DPD, — исчезают; how=\"left\" сохраняет все 10 (→ раздел 1, «merge»)."},
  {"type": "single", "q": "installments.merge(payments_raw, on=\"installment_id\", validate=\"1:1\") вызывает MergeError на сыром файле платежей. О чём это говорит?", "options": ["pandas не умеет валидировать больше 50 000 строк", "Соединение нужно переписать циклом", "У некоторых платежей графика больше одной строки оплаты (здесь — дублирующиеся платежи), поэтому платежи к платежам графика — это m:1; заявленное вами зерно было неверным", "В installment_id есть значения NaN"], "answer": 2, "explain": "validate превращает неверное убеждение о зерне в ошибку до того, как неверным станет любое число — размножение строк с недели 2, пойманное вовремя (→ раздел 1, «merge», P5)."},
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
{"id": "w05d3", "q": "Севара хочет рейтинг по взысканию за последний квартал по филиалам. Возьмите платежи графика со сроком с 1 июля по 30 сентября 2026 (installments.csv), то, что было оплачено по каждому на дату отчёта 2026-10-01 (payments_dirty.csv, с удалёнными дублями, как в сегодняшнем расследовании), и филиал кредита из loans_status.csv. Доля собранного = Σ оплачено ÷ Σ total_due. Какова доля ХУДШЕГО филиала? Дайте процент с точностью до 2 знаков.", "type": "number", "dp": 2, "h": ["8aa6be7c2de4b2c386aeab63"], "hint": "Уголок компании уже строит фрейм на уровне платежей графика с paid рядом с total_due; ещё одно соединение приносит филиал — проверьте его зерно через validate, прежде чем группировать.", "sol": "QVNfT0YgPSBwZC5UaW1lc3RhbXAoIjIwMjYtMTAtMDEiKQppbnN0ID0gcGQucmVhZF9jc3YoIi4uL2V4Y2VsL2luc3RhbGxtZW50cy5jc3YiLCBwYXJzZV9kYXRlcz1bImR1ZV9kYXRlIl0pCnBheSA9IHBkLnJlYWRfY3N2KCIuLi9leGNlbC9wYXltZW50c19kaXJ0eS5jc3YiLCBwYXJzZV9kYXRlcz1bInBhaWRfYXQiXSkKcGF5ID0gcGF5LnNvcnRfdmFsdWVzKCJwYXltZW50X2lkIikuZHJvcF9kdXBsaWNhdGVzKHN1YnNldD1bImluc3RhbGxtZW50X2lkIiwgInBhaWRfYXQiLCAiYW1vdW50Il0pICAgIyA1MiA4NTAKcGFpZCA9IHBheVtwYXlbInBhaWRfYXQiXSA8PSBBU19PRl0uZ3JvdXBieSgiaW5zdGFsbG1lbnRfaWQiLCBhc19pbmRleD1GYWxzZSkuYWdnKHBhaWQ9KCJhbW91bnQiLCAic3VtIikpCm0gPSBpbnN0Lm1lcmdlKHBhaWQsIG9uPSJpbnN0YWxsbWVudF9pZCIsIGhvdz0ibGVmdCIsIHZhbGlkYXRlPSIxOjEiKS5maWxsbmEoeyJwYWlkIjogMH0pCmxvYW5zID0gcGQucmVhZF9jc3YoIi4uL2V4Y2VsL2xvYW5zX3N0YXR1cy5jc3YiKQptID0gbS5tZXJnZShsb2Fuc1tbImxvYW5faWQiLCAiYnJhbmNoIl1dLCBvbj0ibG9hbl9pZCIsIGhvdz0ibGVmdCIsIHZhbGlkYXRlPSJtOjEiKQpxMyA9IG1bKG1bImR1ZV9kYXRlIl0gPj0gIjIwMjYtMDctMDEiKSAmIChtWyJkdWVfZGF0ZSJdIDwgIjIwMjYtMTAtMDEiKV0KZyA9IHEzLmdyb3VwYnkoImJyYW5jaCIpLmFnZyhkdWU9KCJ0b3RhbF9kdWUiLCAic3VtIiksIHBhaWQ9KCJwYWlkIiwgInN1bSIpKQpnWyJyYXRlIl0gPSAxMDAgKiBnWyJwYWlkIl0gLyBnWyJkdWUiXQpnLnNvcnRfdmFsdWVzKCJyYXRlIikuaGVhZCgzKQojIEJ1a2hhcmEgQ2VudHJhbCA5Mi44MCDCtyBUYXNoa2VudCBTb3V0aCA5My4zNSDCtyBOYW1hbmdhbiBDZW50cmFsIDkzLjU0IOKApiBiZXN0IFRlcm1leiBDZW50cmFsIDk4LjQ5Cgo5Mi44MCAlOiBCdWtoYXJhIENlbnRyYWwgY29sbGVjdGVkIDMuMTggYm4gb2YgdGhlIDMuNDMgYm4gdGhhdCBmZWxsIGR1ZSBpbiBRMyDigJQgdGhlIHdvcnN0IG9mIHRoZSB0ZW4gYnJhbmNoZXMsIGFsbW9zdCBzaXggcG9pbnRzIGJlaGluZCBUZXJtZXogQ2VudHJhbC4KVGhlIHR3byB0cmFwcyBhcmUgYW4gaW5uZXIgbWVyZ2UgKHRoZSB1bnBhaWQgaW5zdGFsbWVudHMgdmFuaXNoIGFuZCBldmVyeSByYXRlIGNsaW1icyB0b3dhcmRzIDEwMCAlKSBhbmQgdGhlIGR1cGxpY2F0ZSBwYXltZW50cyAobGVmdCBpbiwgdGhleSBhZGQgMzguMyBtIHRvIHRoZSBRMyBpbnN0YWxtZW50cyDigJQgNTguNCBtIG92ZXIgdGhlIHdob2xlIGJvb2sg4oCUIHRoYXQgd2FzIG5ldmVyIHBhaWQgdHdpY2UpLgpTZXB0ZW1iZXIgaW5zdGFsbWVudHMgaGF2ZSBoYWQgbGl0dGxlIHRpbWUgdG8gYmUgcGFpZCwgc28gYWxsIGJyYW5jaGVzIGxvb2sgd29yc2UgdGhhbiBpbiBKdWx5OyB0aGUgcmFua2luZywgbm90IHRoZSBsZXZlbCwgaXMgdGhlIGZpbmRpbmcu"}
```

<!-- challenge:end -->
