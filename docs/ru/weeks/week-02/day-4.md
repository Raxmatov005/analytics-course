# Неделя 2 · День 4 — NULL, CASE и хитрые соединения

<span class="badge">Теория 60 мин</span> <span class="badge">Практика 60 мин</span> <span class="badge company">Уголок компании</span>

> STORY **Четверг, 9:20.** Нилуфар, риск-аналитик (*risk analyst*), с открытым ноутбуком и графиком на экране. *«В понедельник я представляю FPD30 кредитному комитету — по месяцам выдачи и по каналам. Дашборд Тимура говорит, что с каналом app всё нормально. Моя таблица говорит, что нет. Кто-то из нас делит не на то.»* Мадина: *«И раз уж вы здесь — средний доход по сегментам у Рисков кажется мне слишком высоким. У шести процентов наших клиентов дохода в базе нет. Куда они делись?»*

## Сегодня в трёх строках :id=today-in-3-lines

- Вы знаете **правила NULL**: `= NULL` никогда не истинно, проверка — это `IS NULL`, `COUNT(col)` пропускает NULL, `AVG` молча их отбрасывает; `COALESCE`, `ISNULL`|`IFNULL`, `NULLIF` — для безопасного деления.
- Вы умеете писать **CASE** (поисковый и простой) для корзин и для **сводных `SUM(CASE …)`**, **анти-соединение** (`LEFT JOIN … IS NULL`), **самосоединение**, соединение по **двум столбцам** и находить **дубликаты** через `COUNT` и `COUNT(DISTINCT)`.
- Вы посчитали **FPD30 по поколениям и каналам** и можете сказать, какой канал хуже, насколько и при каком определении.

---

## 1. Теория — значение, которого нет, и соединения, которые оно ломает :id=1-learn-the-value-that-is-not-there-and-the-joins-it-breaks

### NULL — значение, которого нет :id=null-the-value-that-is-not-there

**Что это.** **NULL** (*пустое значение*) значит *неизвестно* или *не записано*. Это не 0 и не пустой текст `''`. В столбце NULL, когда его никто не заполнил: клиент не указал доход, кредит ещё не закрыт, правая сторона строки LEFT JOIN без пары.

**Как пишется.** NULL не пишут в фильтр как значение — его ищут. Быстрый подсчёт пустых значений столбца:

```sql
SELECT COUNT(*)                AS customers,      -- 6 040
       COUNT(monthly_income)   AS with_income,    -- 5 684
       COUNT(*) - COUNT(monthly_income) AS no_income   -- 356
FROM customers;
```

У 356 из 6 040 клиентов (5.89 %) доход не указан. `COUNT(столбец)` пропускает NULL, поэтому `COUNT(*) − COUNT(столбец)` — стандартный способ посчитать пропуски.

**Когда применять.** На каждом столбце, который вы собираетесь фильтровать, группировать или усреднять: сколько значений пропущено и что значит пропуск — «неизвестно» (доход) или «ещё нет» (`closed_at` у активного кредита)?

**Ваша очередь.** У скольких кредитов нет `closed_at`? (Большинство из них просто ещё не закрыты.)

```task
{"id": "w02d4-l1", "kind": "number", "answer": 3601, "dp": 0, "unit": "кредитов", "hint": "COUNT(*) - COUNT(closed_at) FROM loans.", "model": "3 601: 3 352 активных + 44 в дефолте + 190 списанных = 3 586 незакрытых, плюс 15 закрытых кредитов без даты закрытия — о них спросят в пятницу."}
```

### Сравнение с NULL — IS NULL, никогда = NULL :id=comparing-with-null-is-null-never-null

**Что это.** NULL ничему не равен — даже другому NULL. Любое сравнение с NULL (`=`, `<>`, `<`, `>`) даёт *неизвестно*, а `WHERE` оставляет только строки, где условие *истинно*. Работают только проверки **IS NULL** и **IS NOT NULL**.

**Как пишется.**

```sql
SELECT COUNT(*) FROM customers WHERE monthly_income = NULL;        -- 0, всегда: это никогда не истина
SELECT COUNT(*) FROM customers WHERE monthly_income IS NULL;       -- 356
SELECT COUNT(*) FROM customers WHERE monthly_income <> 5000000;    -- 5 684, а не 6 039: 356 строк с NULL тоже не проходят
```

356 строк выпадают из *любого* сравнения: `monthly_income > x` и `monthly_income <= x` вместе дают 5 684 строки, а не 6 040.

**Когда применять.** Найти пропуски (`IS NULL`), сознательно их исключить (`IS NOT NULL`) и проверить, что группы сходятся: если группы отчёта не дают в сумме итог, ищите NULL.

> ⚠️ **Осторожно.** `= NULL` и `<> NULL` не падают с ошибкой — они молча возвращают 0 строк. Любая проверка на «пусто» пишется `IS NULL`.

**Ваша очередь.**

```game
{"id": "w02d4-g1", "type": "bug", "title": "Куда делись пропущенные доходы?", "q": "Мадине нужно число клиентов без дохода в базе. Запрос возвращает 0. Нажмите на неверную строку.", "code": "SELECT COUNT(*) AS no_income\nFROM customers\nWHERE monthly_income = NULL;", "answer": [2], "why": "Сравнение с NULL — «неизвестно», никогда не «истина», поэтому ни одна строка не проходит. Пишите WHERE monthly_income IS NULL → 356."}
```

### NULL в арифметике — всё, что соединено с NULL, становится NULL :id=null-in-arithmetic-anything-combined-with-null-is-null

**Что это.** Вычисление с NULL внутри возвращает NULL: `5 + NULL`, `NULL * 0`, `'Eldor' || NULL` — всё это NULL. База не может считать со значением, которого не знает.

**Как пишется.**

```sql
SELECT customer_id, monthly_income, monthly_income * 12 AS yearly_income
FROM customers
WHERE customer_id <= 5;                  -- пять месячных доходов, пять годовых
SELECT COUNT(*) - COUNT(monthly_income * 12) AS no_yearly
FROM customers;                          -- 356: каждый пропущенный доход даёт пропущенный годовой доход
```

Клиент 1 зарабатывает 3 894 708 в месяц, 46 736 496 в год. У 356 клиентов без дохода `monthly_income * 12` тоже NULL.

**Когда применять.** Каждый раз, когда вычисляемый столбец (доля, сумма двух столбцов, полное имя) пуст в некоторых строках: один из его входов — NULL.

> ⚠️ **Осторожно.** `principal - paid` для кредита без платежей — это NULL, а не `principal`. Сначала превратите NULL в 0, если 0 — правильный смысл: через подраздел, `COALESCE`.

**Ваша очередь.** Что вернёт `SELECT 5 + NULL`?

```task
{"id": "w02d4-l2", "kind": "choice", "options": ["5", "0", "NULL", "Ошибку"], "answer": 2, "explain": "Любая арифметика с NULL даёт NULL. COALESCE(x, 0) + 5 даёт 5, если 0 — правильный смысл «пропуска»."}
```

### NULL в агрегатах — COUNT, SUM и AVG его пропускают :id=null-in-aggregates-count-sum-and-avg-skip-it

**Что это.** Агрегаты работают только с известными значениями. `COUNT(столбец)` считает значения, кроме NULL, `SUM` их складывает, `AVG` делит их сумму на **их** количество. Только `COUNT(*)` считает каждую строку.

```pic
{"id": "w02d4-pic1", "title": "COUNT(столбец) и AVG пропускают NULL", "caption": "Шесть клиентов, у одного доход не указан. `COUNT(*)` считает 6 строк, `COUNT(monthly_income)` — только 5 известных значений, а `AVG` делит их сумму на 5, а не на 6.", "tables": [{"name": "customers", "cols": ["customer_id", "monthly_income"], "rows": [[10, "6 548 453"], [11, "35 330 309"], [12, "32 573 331"], [13, "5 894 498"], [14, null], [15, "12 982 263"]], "cells": [[4, "monthly_income"]]}, {"name": "результат", "cols": ["rows_", "with_income", "avg_income"], "rows": [[6, 5, "18 665 771"]], "tags": {"rows_": "COUNT(*)", "with_income": "COUNT(col)", "avg_income": "AVG(col)"}, "via": "агрегаты по шести строкам"}]}
```

**Как пишется.**

| Выражение | Результат | Почему |
|---|---|---|
| `COUNT(*)` | 6 040 | считает строки |
| `COUNT(monthly_income)` | 5 684 | считает значения, кроме NULL |
| `COUNT(*) - COUNT(monthly_income)` | 356 | пропуски — стандартный способ их посчитать |
| `AVG(monthly_income)` | 15 245 933 | **среднее по 5 684 известным значениям**; 356 отброшены, а не считаются нулём |
| `AVG(COALESCE(monthly_income, 0))` | 14 347 331 | среднее по всем 6 040, пропуски как 0 — обычно неверно, но явно |
| `SUM(monthly_income)` | сумма известных | NULL игнорируются; `SUM` из одних NULL — это NULL, а не 0 |

Средний доход — 15.2 млн сумов — у тех 94 % клиентов, чей доход есть в базе. С `AVG` всё в порядке: он делает ровно то, что написано. Но слайд «средний доход 15.2 млн» без «(у 94 % клиентов с указанным доходом)» неполон.

**Когда применять.** У каждого среднего и каждой доли: показывайте рядом количество и проверяйте, случайны ли пропуски или сосредоточены. Здесь по сегментам разрыв ровный (affluent 6.0 %, mass 5.8 %, sme 6.1 %); по регионам — от Termez 4.6 % до **Bukhara 7.6 %**; по `income_source` — от business 4.7 % до **self-employed 7.0 %**: правдоподобно (у самозанятых нет справки о зарплате) и годится как заметка для записки, а не как ошибка.

> 💡 **Главное.** Агрегаты пропускают NULL: `COUNT(col)` и `AVG(col)` работают только с известными значениями. Ставьте рядом с каждым средним количество — и долю пропусков, — чтобы читатель знал, на чём стоит число.

**Ваша очередь.**

```game
{"id": "w02d4-g2", "type": "sort", "title": "Кто видит 356 пустых доходов?", "groups": {"Включает 356 пустых строк": ["COUNT(*)", "WHERE monthly_income IS NULL", "AVG(COALESCE(monthly_income, 0))"], "Не учитывает 356 строк": ["COUNT(monthly_income)", "AVG(monthly_income)", "WHERE monthly_income <> 5000000"]}}
```

### COALESCE и IFNULL — значение вместо NULL :id=coalesce-and-ifnull-a-value-instead-of-null

**Что это.** **COALESCE**`(a, b, c, …)` возвращает первый аргумент, не равный NULL. Это стандартный SQL, работает на обоих движках. **IFNULL**`(a, b)` (SQLite) и **ISNULL**`(a, b)` (SQL Server) — двухаргументные версии того же. Предпочитайте `COALESCE`: он переносим.

**Как пишется.**

```sql
SELECT COALESCE(NULL, NULL, 'x'),                -- 'x': первый аргумент не NULL
       IFNULL(NULL, 0);                          -- 0      SQL Server: ISNULL(NULL, 0)

SELECT customer_id,
       COALESCE(CAST(monthly_income AS TEXT), 'unknown') AS income_shown   -- подпись вместо пустой ячейки
FROM customers
WHERE customer_id IN (1, 14);                    -- 3894708 · unknown
```

Запрос DPD из среды использует `COALESCE(SUM(p.amount), 0)`: платёж по графику без оплат получает «оплачено = 0» вместо NULL, поэтому проверка `paid < total_due` для него может быть истинной.

**Когда применять.** Когда у NULL известный смысл: «нет платежа» значит «оплачено 0»; «нет подписи» должно печататься как `'unknown'`. Но не когда NULL значит «мы не знаем»: неизвестный доход — это не доход 0.

> ⚠️ **Осторожно.** `AVG(COALESCE(monthly_income, 0))` — это 14.3 млн, а не 15.2 млн: он придумывает 356 человек, которые ничего не зарабатывают. Заполняйте NULL, только если можете сказать, что он значит.

**Ваша очередь.** Что вернёт `COALESCE(NULL, 0, 5)`?

```task
{"id": "w02d4-l3", "kind": "number", "answer": 0, "dp": 0, "unit": "", "hint": "Первый аргумент, не равный NULL, — 0 тоже значение.", "model": "0. COALESCE останавливается на первом аргументе, не равном NULL; 0 — настоящее значение, поэтому до 5 дело не доходит."}
```

### NULLIF — безопасное деление :id=nullif-safe-division

**Что это.** **NULLIF**`(a, b)` возвращает NULL, когда `a = b`, и `a` в остальных случаях. Его единственная работа — **безопасное деление**: `x / NULLIF(y, 0)` возвращает NULL вместо ошибки, когда `y` равен 0.

**Как пишется.**

```sql
SELECT b.branch_name, COUNT(*) AS applications,
       ROUND(100.0 * SUM(CASE WHEN a.status LIKE 'approved%' THEN 1 ELSE 0 END)
                   / NULLIF(SUM(CASE WHEN a.status <> 'cancelled' THEN 1 ELSE 0 END), 0), 1) AS approval_decided_pct
FROM applications a JOIN branches b ON b.branch_id = a.branch_id
GROUP BY b.branch_name ORDER BY approval_decided_pct DESC;      -- Fergana Central 72.8 … Nukus Central 68.5
```

Fergana Central одобряет 72.8 % рассмотренных заявок; Nukus Central — 68.5 %. Сегодня ни у одного филиала нет нуля рассмотренных заявок; в тот день, когда появится, отчёт всё равно выполнится. (`SUM(CASE …)` объясняется через четыре подраздела — пока читайте его как «посчитать строки, где …».)

**Когда применять.** В каждом делении, где знаменатель — количество или сумма, которая в какой-то группе может быть 0: доля по филиалу, по месяцу, по сотруднику взыскания.

> ⚠️ **Осторожно.** Без него движки ведут себя по-разному: SQL Server останавливает весь запрос с «Divide by zero error encountered»; SQLite молча возвращает NULL для `10 / 0`. `NULLIF` заставляет оба вернуть NULL.

**Ваша очередь.** Что вернёт `SELECT 10 / NULLIF(0, 0)`?

```task
{"id": "w02d4-l4", "kind": "choice", "options": ["NULL", "0", "10", "Ошибку"], "answer": 0, "explain": "NULLIF(0, 0) — это NULL, а 10 / NULL — NULL; на обоих движках и без ошибки."}
```

### Поисковый CASE — значение, выбранное по условиям :id=searched-case-a-value-chosen-by-conditions

**Что это.** **Поисковый CASE** (*searched CASE*, условное выражение) проверяет условия по порядку и возвращает значение **первого** истинного. `ELSE` — то, что получают все остальные строки; без `ELSE` они получают NULL.

```pic
{"id": "w02d4-pic2", "title": "CASE даёт строке значение первого истинного WHEN", "caption": "Каждый доход идёт по строкам `WHEN` и останавливается на первой истинной; пустой доход ловит первая строка, `IS NULL`, и он становится `'unknown'`. Один цвет — одна полоса.", "tables": [{"name": "customers", "cols": ["customer_id", "monthly_income", "income_band"], "rows": [[13, "5 894 498", "5-10m"], [14, null, "unknown"], [15, "12 982 263", "10-20m"], [16, "3 120 523", "<5m"], [17, "4 074 987", "<5m"], [18, "22 271 413", "20m+"]], "tone": ["b", null, "c", "a", "a", "d"], "new": ["income_band"], "cells": [[1, "income_band"]]}]}
```

**Как пишется.**

```sql
SELECT CASE WHEN monthly_income IS NULL      THEN 'unknown'      -- проверка на NULL первой
            WHEN monthly_income <  5000000   THEN '<5m'
            WHEN monthly_income < 10000000   THEN '5-10m'
            WHEN monthly_income < 20000000   THEN '10-20m'
            ELSE '20m+' END AS income_band,
       COUNT(*) AS customers
FROM customers GROUP BY income_band;        -- SQL Server: повторите весь CASE в GROUP BY (без псевдонима, без GROUP BY 1)
-- unknown 356 · <5m 1281 · 5-10m 2198 · 10-20m 576 · 20m+ 1629
```

Пять групп, в сумме 6 040. Порядок важен: клиент с 3 млн попадает в `< 5000000` первым и до `< 10000000` не доходит.

**Когда применять.** Корзины и диапазоны (доход, DPD, скоринговый балл), флаги (опоздал или нет), подписи из нескольких столбцов.

> ⚠️ **Осторожно.** Любое сравнение с NULL — «неизвестно», поэтому пустые значения проваливаются в `ELSE`. Без первой строки 356 неизвестных доходов попадут в `'20m+'` — 1 985 «богатых» клиентов вместо 1 629. Пишите `WHEN col IS NULL THEN 'unknown'` первой строкой каждого CASE для диапазонов.

**Ваша очередь.** Что получит строка, которая не подошла ни под один `WHEN`, если нет `ELSE`?

```task
{"id": "w02d4-l5", "kind": "choice", "options": ["NULL", "0", "Значение последнего THEN", "Пустой текст ''"], "answer": 0, "explain": "CASE без ELSE возвращает NULL для неподошедших строк — в GROUP BY они образуют группу NULL. Пишите тот ELSE, который имеете в виду."}
```

### Простой CASE — подстановка по одному значению :id=simple-case-a-lookup-on-one-value

**Что это.** **Простой CASE** (*simple CASE*) сравнивает одно выражение со списком значений: `CASE выражение WHEN значение1 THEN результат1 WHEN значение2 THEN результат2 ELSE иначе END`. Это короткая запись подстановки; он умеет проверять только равенство.

**Как пишется.**

```sql
SELECT CASE channel WHEN 'app'    THEN 'Mobile app'
                    WHEN 'branch' THEN 'Branch office'
                    ELSE 'Partner shop' END AS channel_name,
       COUNT(*) AS applications
FROM applications
GROUP BY channel_name;                    -- Branch office 6 223 · Mobile app 5 006 · Partner shop 2 771
```

Три читаемые подписи для трёх кодов каналов; числа — вторничные.

**Когда применять.** Коды в названия для отчёта, когда нет справочника, с которым можно соединиться. Для диапазонов (`< 5000000`) или проверок на NULL нужна поисковая форма.

> ⚠️ **Осторожно.** `CASE monthly_income WHEN NULL THEN …` никогда не срабатывает: простой CASE сравнивает через `=`, а `= NULL` никогда не истина. Пишите `CASE WHEN monthly_income IS NULL THEN …`.

**Ваша очередь.** Превратите коды продуктов из `products` в короткие названия простым CASE: `'MICRO'` → `'Micro'`, `'CONS'` → `'Consumer'`, всё остальное — сам код.

```task
{"id": "w02d4-l6", "kind": "sql", "model": "SELECT code, CASE code WHEN 'MICRO' THEN 'Micro' WHEN 'CONS' THEN 'Consumer' ELSE code END AS short_name FROM products;", "note": "Пять строк: Micro, Consumer, BNPL, AUTO, SME. ELSE code оставляет остальные коды как есть."}
```

### CASE в ORDER BY — свой порядок сортировки :id=case-in-order-by-a-sort-order-of-your-own

**Что это.** `ORDER BY` может сортировать по `CASE`, который превращает каждое значение в номер. Так получается деловой порядок вместо алфавитного.

**Как пишется.**

```sql
SELECT status, COUNT(*) AS loans
FROM loans
GROUP BY status
ORDER BY CASE status WHEN 'active'      THEN 1
                     WHEN 'default'     THEN 2
                     WHEN 'written_off' THEN 3
                     ELSE 4 END;          -- active 3 352 · default 44 · written_off 190 · closed 4 242
```

Статусы идут в порядке жизни кредита — активные, потом плохие исходы, закрытые последними, — а не `active, closed, default, written_off`.

**Когда применять.** Диапазоны (`<5m`, `5-10m`, … неправильно сортируются как текст), статусы, названия дней недели — любой список, у которого естественный порядок не алфавитный.

**Ваша очередь.** Отсортируйте пять групп дохода из примера с поисковым CASE от меньшей к большей, `unknown` — последней.

```task
{"id": "w02d4-l7", "kind": "sql", "model": "SELECT CASE WHEN monthly_income IS NULL THEN 'unknown' WHEN monthly_income < 5000000 THEN '<5m' WHEN monthly_income < 10000000 THEN '5-10m' WHEN monthly_income < 20000000 THEN '10-20m' ELSE '20m+' END AS income_band, COUNT(*) AS customers FROM customers GROUP BY income_band ORDER BY CASE income_band WHEN '<5m' THEN 1 WHEN '5-10m' THEN 2 WHEN '10-20m' THEN 3 WHEN '20m+' THEN 4 ELSE 5 END;", "note": "<5m 1281 · 5-10m 2198 · 10-20m 576 · 20m+ 1629 · unknown 356. SQLite принимает псевдоним внутри ORDER BY CASE; в SQL Server используйте столбец-номер или повторите выражения."}
```

### CASE внутри SUM и COUNT — посчитать, где :id=case-inside-sum-and-count-counting-where

**Что это.** `CASE` внутри агрегата считает или складывает **по условию**: `SUM(CASE WHEN усл THEN 1 ELSE 0 END)` — это «посчитать строки, где усл». По одному такому столбцу на условие — и вторничная длинная таблица становится широкой: это **сводная** (*pivot*).

**Как пишется.**

```sql
SELECT p.name,
       SUM(CASE WHEN l.status = 'active'      THEN 1 ELSE 0 END) AS active,
       SUM(CASE WHEN l.status = 'closed'      THEN 1 ELSE 0 END) AS closed,
       SUM(CASE WHEN l.status = 'default'     THEN 1 ELSE 0 END) AS in_default,
       SUM(CASE WHEN l.status = 'written_off' THEN 1 ELSE 0 END) AS written_off
FROM loans l JOIN products p ON p.product_id = l.product_id
GROUP BY p.name ORDER BY p.name;
```

| product | active | closed | default | written_off |
|---|---|---|---|---|
| Auto loan | 358 | 23 | 2 | 8 |
| Buy now pay later | 470 | 1 057 | 9 | 33 |
| Consumer loan | 1 359 | 982 | 15 | 62 |
| Micro loan | 575 | 2 018 | 13 | 63 |
| Small business loan | 590 | 162 | 5 | 24 |

Пять продуктов по вертикали, четыре статуса по горизонтали: двадцать чисел, в сумме 7 828.

**Когда применять.**

| Нужно | Пишем |
|---|---|
| посчитать, где | `SUM(CASE WHEN усл THEN 1 ELSE 0 END)` или `COUNT(CASE WHEN усл THEN 1 END)` |
| сложить, где | `SUM(CASE WHEN усл THEN amount ELSE 0 END)` |
| доля, где | `AVG(CASE WHEN усл THEN 1.0 ELSE 0 END)` |

Эта запись переносима; `SUM(усл)` в SQLite и `IIF` в SQL Server из вторника — её сокращения.

> ⚠️ **Осторожно.** `COUNT(CASE WHEN усл THEN 1 ELSE 0 END)` считает **каждую** строку (14 000 в `applications`): 0 — это значение, а `COUNT` считает значения. С `COUNT` уберите `ELSE`, чтобы остальные строки получили NULL (8 595 одобренных).

**Ваша очередь.**

```game
{"id": "w02d4-g3", "type": "cloze", "title": "Посчитать, где", "text": "SELECT p.name, SUM(CASE {{0}} l.status = 'active' {{1}} 1 {{2}} 0 {{3}}) AS active FROM loans l JOIN products p ON p.product_id = l.product_id {{4}} p.name;", "blanks": [["WHEN"], ["THEN"], ["ELSE"], ["END"], ["GROUP BY"]], "distractors": ["IF", "WHERE", "COUNT"]}
```

### Анти-соединение — почему IS NULL находит строки без пары :id=the-anti-join-why-is-null-finds-the-rows-with-no-partner

**Что это.** Понедельничное анти-соединение, теперь с объяснением, почему оно работает. `LEFT JOIN` заполняет правую сторону NULL там, где пары нет. `WHERE правая.ключ IS NULL` оставляет ровно эти строки, потому что столбец ключа никогда не равен NULL в строке *с парой*.

**Как пишется.**

```sql
SELECT COUNT(*) FROM customers c LEFT JOIN applications a ON a.customer_id = c.customer_id
WHERE a.application_id IS NULL;                                                             -- 587 ни разу не подавали заявку
SELECT a.status, COUNT(*) FROM applications a LEFT JOIN loans l ON l.application_id = a.application_id
WHERE l.loan_id IS NULL AND a.status LIKE 'approved%' GROUP BY a.status;                    -- approved 89 · approved_not_disbursed 678
```

587 клиентов ни разу не подавали заявку. У 767 одобренных заявок нет кредита: 678 помечены `approved_not_disbursed` и 89 — `approved`, понедельничный конвейер.

**Когда применять.** «У каких X нет Y». Проверяйте **ключ** правой таблицы, а не столбец, который может быть NULL и в строках с парой.

> ⚠️ **Осторожно.** `WHERE l.closed_at IS NULL` — не анти-соединение: `closed_at` равен NULL и у каждого найденного активного кредита. Проверяйте столбец, который никогда не пуст в настоящей строке, — ключ.

**Ваша очередь.** Какая проверка находит кредиты, по которым не было ни одного действия по взысканию?

```task
{"id": "w02d4-l8", "kind": "choice", "options": ["FROM loans l LEFT JOIN collections_actions ca ON ca.loan_id = l.loan_id WHERE ca.action_id IS NULL", "FROM loans l JOIN collections_actions ca ON ca.loan_id = l.loan_id WHERE ca.action_id IS NULL", "FROM loans l LEFT JOIN collections_actions ca ON ca.loan_id = l.loan_id WHERE ca.outcome = NULL", "FROM loans l WHERE l.loan_id <> NULL"], "answer": 0, "explain": "LEFT сохраняет каждый кредит; ключ действия равен NULL только там, где действие не нашлось, — 7 545 кредитов. Вариант с INNER возвращает 0; = NULL никогда не истина."}
```

### LEFT JOIN, который превращается в INNER JOIN, — ON vs WHERE :id=the-left-join-that-turns-into-an-inner-join-on-vs-where

**Что это.** Фильтр по **правой** таблице в `WHERE` выполняется после соединения. В каждой строке без пары правые столбцы — NULL, поэтому проверка не истинна, и `WHERE` удаляет ровно те строки, ради которых был нужен LEFT. LEFT JOIN становится INNER JOIN. В `ON` тот же фильтр лишь решает, какие правые строки считаются парой.

```pic
{"id": "w02d4-pic3", "title": "Фильтр по правой таблице в WHERE удаляет строки, которые сохранил LEFT", "caption": "У клиента 8 только закрытый кредит. С `l.status = 'active'` в `ON` клиент 8 остаётся с NULL. В `WHERE` соединение сначала даёт клиенту 8 его закрытый кредит, затем `WHERE` вычёркивает строку — и клиента 8 нет.", "tables": [{"id": "on", "name": "результат", "label": "в ON", "cols": ["customer_id", "loan_id", "status"], "rows": [[5, 1305, "active"], [8, null, null]], "keep": [0, 1]}, {"id": "wh", "name": "результат", "label": "в WHERE", "cols": ["customer_id", "loan_id", "status"], "rows": [[5, 1305, "active"], [8, 2418, "closed"]], "keep": [0], "drop": [1]}], "stack": true}
```

**Как пишется.** «Каждый клиент с его активными кредитами»:

| Фильтр `l.status = 'active'` в … | строк | клиентов осталось |
|---|---|---|
| `ON` (`LEFT JOIN loans l ON l.customer_id = c.customer_id AND l.status = 'active'`) | 6 894 | все 6 040 — у кого нет активного кредита, получают NULL |
| `WHERE` (`LEFT JOIN loans l ON l.customer_id = c.customer_id WHERE l.status = 'active'`) | 3 352 | только клиенты с активным кредитом |

```sql
SELECT COUNT(*) AS rows_, COUNT(DISTINCT c.customer_id) AS customers
FROM customers c
LEFT JOIN loans l ON l.customer_id = c.customer_id AND l.status = 'active';   -- 6 894 · 6 040
```

6 894 строки: по одной на активный кредит плюс по строке с NULL на каждого клиента без активного кредита. Все 6 040 клиентов на месте. Перенесите условие в `WHERE` — останется 3 352 строки, по одной на активный кредит; все остальные клиенты исчезнут.

**Когда применять.** В каждом LEFT JOIN с условием на правую таблицу: фильтр отчётной даты по платежам (`p.paid_at <= '2026-10-01'`), «только одобренные заявки», «только действия этого месяца».

> ⚠️ **Осторожно.** Условие на правую таблицу в `WHERE` ложно в каждой строке без пары (NULL), поэтому оно удаляет те строки, ради которых был нужен LEFT JOIN. Фильтры правой стороны ставьте в `ON`; `WHERE` — для левой таблицы и для проверок `IS NULL`.

**Ваша очередь.**

```game
{"id": "w02d4-g5", "type": "bug", "title": "Список филиалов, потерявший филиал", "q": "Мадине нужен каждый филиал с его кредитами за сентябрь 2026 года, включая филиалы без кредитов. Одна строка превращает LEFT JOIN в INNER JOIN.", "code": "SELECT b.branch_name, COUNT(l.loan_id) AS sept_loans\nFROM branches b\nLEFT JOIN loans l ON l.branch_id = b.branch_id\nWHERE l.disbursed_at >= '2026-09-01' AND l.disbursed_at < '2026-10-01'\nGROUP BY b.branch_name;", "answer": [3], "why": "Проверка даты — по правой таблице, поэтому для строки филиала без кредита она не истинна, и WHERE выбрасывает этот филиал. Перенесите её в ON: LEFT JOIN loans l ON l.branch_id = b.branch_id AND l.disbursed_at >= '2026-09-01' AND l.disbursed_at < '2026-10-01'."}
```

### Соединение по двум столбцам :id=joining-on-two-columns

**Что это.** Некоторым совпадениям нужен больше чем один ключ: `ON a.x = b.x AND a.y = b.y`. Строка подходит, только когда равны **обе** пары.

**Как пишется.** Поиск дубликатов прошлой недели как самосоединение по двум столбцам: клиенты с общим телефоном *и* общей датой рождения.

```sql
SELECT a.customer_id, b.customer_id AS other_id, a.first_name, b.first_name AS other_first
FROM customers a JOIN customers b
  ON a.phone = b.phone AND a.birth_date = b.birth_date AND a.customer_id < b.customer_id;   -- 40 пар
```

40 пар — ровно 40 дубликатов с id 6001+. Только по телефону выходит 43 пары: три — члены семьи с общим номером.

**Когда применять.** Таблицы с ключом из двух столбцов (`loan_id, installment_no`); поиск дубликатов, которому нужны два доказательства; **проверки согласованности** — `payments JOIN installments ON installment_id AND loan_id` возвращает 52 875 строк, столько же, сколько только по `installment_id`, и это доказывает, что ни один платёж не указывает на платёж по графику *другого* кредита.

**Ваша очередь.** Самосоединение только по телефону даёт 43 пары, по телефону и дате рождения — 40. Кто остальные 3?

```task
{"id": "w02d4-l9", "kind": "choice", "options": ["Разные люди с общим номером телефона (семья), а не дубликаты", "Дубликаты с опечаткой в телефоне", "Клиенты без даты рождения", "Пары, посчитанные дважды"], "answer": 0, "explain": "Телефон общий, даты рождения разные: три семейных номера. Второй столбец превратил три ложные тревоги в несовпадения."}
```

### Соединения, которые умножают строки, — «один ко многим» с двух сторон :id=joins-that-multiply-rows-one-to-many-on-both-sides

**Что это.** Соедините одну таблицу с **двумя** таблицами «многие» по одному ключу — и каждая строка первой стороны «многие» встанет в пару с каждой строкой второй: 2 платежа × 3 действия = 6 строк на один кредит. Это **размножение** (*fan-out*). Каждый подсчёт и каждая сумма по нему умножены.

**Как пишется.** Кредит 7 с двумя платежами и тремя действиями:

| `loans` | `payments` | `collections_actions` | `loans JOIN payments JOIN collections_actions` |
|---|---|---|---|
| 7 | p1, p2 | a1, a2, a3 | (p1,a1) (p1,a2) (p1,a3) (p2,a1) (p2,a2) (p2,a3) — 6 строк |

На настоящих данных — кредит 2167 (списан, 919 дней просрочки):

```sql
SELECT COUNT(*) AS rows_, COUNT(DISTINCT p.payment_id) AS payments, COUNT(DISTINCT ca.action_id) AS actions,
       SUM(p.amount) AS summed_amount
FROM loans l
JOIN payments p             ON p.loan_id  = l.loan_id
JOIN collections_actions ca ON ca.loan_id = l.loan_id
WHERE l.loan_id = 2167;                   -- 72 · 2 · 36 · 21 443 436
```

72 строки = 2 платежа × 36 действий. `SUM(p.amount)` говорит 21.4 млн сумов; на самом деле два платежа по кредиту дают 595 651 — каждый посчитан 36 раз.

**Когда применять.** Чтобы узнать его в лицо: любой запрос, который соединяет две дочерние таблицы одного родителя (платежи **и** действия, платежи по графику **и** платежи по `loan_id`), а потом считает или суммирует.

> ⚠️ **Осторожно.** По 283 кредитам с действиями по взысканию это соединение даёт 48 161 строку и 205.6 млрд сумов «платежей»; настоящие платежи по этим кредитам — 4.6 млрд. Решение — через подраздел: свести каждую дочернюю таблицу к одной строке на кредит *до* соединения.

**Ваша очередь.** У кредита 2235 7 платежей и 151 действие по взысканию. Сколько строк вернёт для него `loans JOIN payments JOIN collections_actions`?

```task
{"id": "w02d4-l10", "kind": "number", "answer": 1057, "dp": 0, "unit": "строк", "hint": "Каждый платёж встаёт в пару с каждым действием.", "model": "7 × 151 = 1 057 строк на один кредит. Любая сумма платежей по ним в 151 раз больше настоящей."}
```

### Дубликаты — COUNT(*) рядом с COUNT(DISTINCT key) :id=duplicates-count-next-to-countdistinct-key

**Что это.** **Дубликат** — строка, которая повторяет факт, уже записанный в таблице. `COUNT(*)` рядом с `COUNT(DISTINCT ключ)` их находит: числа равны — одна строка на ключ; различаются — какой-то ключ повторяется.

**Как пишется.**

```sql
SELECT COUNT(*), COUNT(DISTINCT installment_id) FROM payments;                 -- 52 875 · 52 850
SELECT installment_id, paid_at, amount, COUNT(*) AS copies
FROM payments
GROUP BY installment_id, paid_at, amount
HAVING COUNT(*) > 1;                                                            -- 25 строк, у всех copies = 2
```

У 25 платежей по графику по два платежа, и каждая пара одинакова — тот же платёж по графику, та же дата, та же сумма. 58 397 800 сумов посчитаны дважды в каждом итоге «получено платежей».

**Когда применять.** На каждой таблице перед суммированием и после каждого соединения: та же проверка говорит, умножило ли соединение строки (7 828 кредитов → 92 193 строки после `installments`; `COUNT(DISTINCT loan_id)` по-прежнему 7 828).

> 💡 **Главное.** `COUNT(*)` рядом с `COUNT(DISTINCT key)` одной строкой отвечает на два вопроса: умножило ли соединение строки и есть ли в таблице дубликаты? Числа равны — одна строка на ключ; различаются — выясните почему, прежде чем суммировать.

**Ваша очередь.** В `payments` 52 875 строк и 52 850 различных `installment_id`. У скольких платежей по графику больше одного платежа?

```task
{"id": "w02d4-l11", "kind": "number", "answer": 25, "dp": 0, "unit": "платежей по графику", "hint": "Строки минус различные ключи — если ни один ключ не встречается трижды.", "model": "25: 52 875 − 52 850, и запрос с HAVING подтверждает, что каждый из них встречается ровно дважды."}
```

### Уберите дубликаты до соединения — взгляд на Неделю 3 :id=de-duplicate-before-you-join-a-preview-of-week-3

**Что это.** Решение и для размножения, и для дубликатов одно: сначала сделайте каждую таблицу **одной строкой на ключ**, потом соединяйте. `SELECT DISTINCT` убирает точные копии; `GROUP BY ключ` сворачивает дочернюю таблицу до одной строки на родителя. Обоим нужен промежуточный результат с именем — `WITH имя AS (…)`, инструмент Недели 3. Сегодня — прочитайте и запустите.

**Как пишется.**

```sql
WITH pay AS (SELECT loan_id, COUNT(*) AS payments, SUM(amount) AS paid      -- одна строка на кредит
             FROM payments GROUP BY loan_id),
     act AS (SELECT loan_id, COUNT(*) AS actions                            -- одна строка на кредит
             FROM collections_actions GROUP BY loan_id)
SELECT l.loan_id, pay.payments, pay.paid, act.actions
FROM loans l
LEFT JOIN pay ON pay.loan_id = l.loan_id
LEFT JOIN act ON act.loan_id = l.loan_id
WHERE l.loan_id = 2167;                    -- 2 · 595 651 · 36
```

Одна строка для кредита 2167: 2 платежа, оплачено 595 651 сум, 36 действий — настоящие числа. Та же идея убирает 25 дублированных платежей: в `WITH clean AS (SELECT DISTINCT loan_id, installment_id, paid_at, amount FROM payments)` 52 850 строк.

**Когда применять.** Всякий раз, когда две дочерние таблицы встречаются в одном запросе, и всякий раз, когда в таблице есть дубликаты, которые нельзя удалить. На Неделе 3 `WITH` и `ROW_NUMBER` разберём как следует.

**Ваша очередь.** С блоком `clean` выше — какова общая сумма платежей без дубликатов? (`SELECT SUM(amount) FROM clean`)

```task
{"id": "w02d4-l12", "kind": "number", "answer": 255114772176, "dp": 0, "unit": "сумов", "hint": "WITH clean AS (SELECT DISTINCT loan_id, installment_id, paid_at, amount FROM payments) SELECT SUM(amount) FROM clean;", "model": "255 114 772 176 сумов — на 58 397 800 меньше сырых 255 173 169 976. 25 копий исчезли."}
```

### Собираем вместе :id=putting-it-together

Один запрос, инструменты дня вместе. *«По группам дохода, включая неизвестный: клиенты, кредиты и доля кредитов, ставших плохими (дефолт или списание)».*

```sql
SELECT CASE WHEN c.monthly_income IS NULL     THEN 'unknown'                          -- проверка на NULL первой
            WHEN c.monthly_income <  5000000  THEN '<5m'
            WHEN c.monthly_income < 20000000  THEN '5-20m'
            ELSE '20m+' END                                    AS income_band,        -- поисковый CASE
       COUNT(DISTINCT c.customer_id)                           AS customers,          -- соединение размножает клиентов
       COUNT(l.loan_id)                                        AS loans,              -- NULL (нет кредита) не считается
       SUM(CASE WHEN l.status IN ('default', 'written_off') THEN 1 ELSE 0 END) AS bad_loans,   -- посчитать, где
       ROUND(100.0 * SUM(CASE WHEN l.status IN ('default', 'written_off') THEN 1 ELSE 0 END)
                   / NULLIF(COUNT(l.loan_id), 0), 1)           AS bad_pct             -- безопасное деление
FROM customers c
LEFT JOIN loans l ON l.customer_id = c.customer_id                                   -- клиенты без кредитов остаются
GROUP BY income_band
ORDER BY bad_pct DESC;
```

| income_band | customers | loans | bad_loans | bad_pct |
|---|---|---|---|---|
| 5-20m | 2 774 | 3 555 | 124 | 3.5 |
| 20m+ | 1 629 | 2 137 | 57 | 2.7 |
| <5m | 1 281 | 1 670 | 44 | 2.6 |
| unknown | 356 | 466 | 9 | 1.9 |

Четыре группы вмещают всех 6 040 клиентов и все 7 828 кредитов. Клиенты без указанного дохода становятся плохими *реже всех* (1.9 %) — пропущенный доход здесь не сигнал риска. Без первого `WHEN` эти 356 клиентов попали бы в группу `20m+` и занизили бы её долю.

### Углубление (по желанию) :id=depth-optional

- ▶ Бараа, *NULL functions* [6:59:06](https://youtu.be/SSKVgrwhzus?t=25146&end=29270) — 50 мин; *CASE* [8:07:50](https://youtu.be/SSKVgrwhzus?t=29270&end=31416) — 35 мин; *Joins (advanced)* [3:27:29](https://youtu.be/SSKVgrwhzus?t=12449&end=14529) — анти-соединения, самосоединения, FULL.
- Русская презентация (TBC Data Analytics 2.0, если она у вас есть) `2.2 SQL-1-38.pdf` — страницы про NULL / CASE. *Термины по-английски:* пустое значение = NULL, условное выражение = CASE, самосоединение = self-join, дубликаты = duplicates.

```videoquiz
{"video": "SSKVgrwhzus", "stops": [
  {"at": 13500, "q": "Как найти строки таблицы A, у которых НЕТ пары в таблице B?", "options": ["INNER JOIN B и оставить совпадения", "LEFT JOIN B, затем WHERE B.key IS NULL", "RIGHT JOIN B, затем WHERE A.key IS NULL", "FULL JOIN и оставить всё"], "answer": 1, "explain": "Левое анти-соединение: LEFT сохраняет каждую строку A, а IS NULL по ключу B оставляет те, что не нашли пару, — 587 клиентов, ни разу не подававших заявку.", "back": 60},
  {"at": 26200, "q": "Что вернёт COALESCE(monthly_income, 0) для клиента без дохода в базе?", "options": ["NULL", "0", "Ошибку", "Средний доход"], "answer": 1, "explain": "COALESCE возвращает первый аргумент, не равный NULL, — и тогда AVG считает, что этот клиент зарабатывает 0; поэтому среднее меняется.", "back": 60},
  {"at": 27900, "q": "Зачем писать x / NULLIF(y, 0)?", "options": ["Чтобы округлить результат", "Чтобы превратить нулевой делитель в NULL: запрос вернёт NULL, а не ошибку деления на ноль", "Чтобы заменить NULL на 0", "Чтобы посчитать NULL"], "answer": 1, "explain": "NULLIF(a, b) даёт NULL, когда a = b; деление на NULL даёт NULL, а не ошибку.", "back": 60},
  {"at": 30300, "q": "В CASE нет ELSE, и ни одно условие не подошло к строке. Что получит строка?", "options": ["0", "Пустую строку", "NULL", "Первое значение THEN"], "answer": 2, "explain": "Без ELSE строки без совпадения получают NULL — а пустой доход проходит мимо каждого WHEN, поэтому сначала проверяйте IS NULL.", "back": 60}]}
```

---

## 2. Разобранный пример — сводная «кварталы по продуктам» :id=2-worked-example-the-quarter-by-product-pivot

**Задача (Бекзод, по почте):** *выдачи 2026 года, продукты по вертикали, кварталы по горизонтали.*

Каждый шаг использует один подраздел раздела 1, в том порядке, в каком вы их изучили.

1. **NULL в агрегатах.** Сводная суммирует `principal` и раскладывает кредиты по кварталам по `disbursed_at`. Сначала проверьте оба столбца: `SELECT COUNT(*) - COUNT(disbursed_at), COUNT(*) - COUNT(principal) FROM loans` → 0 и 0. Кредит без даты не попал бы ни в один квартал и молча исчез бы из всех ячеек.
2. **Поисковый CASE.** Каждый квартал — полуоткрытый диапазон дат, записанный как условие `WHEN`. Зерно ответа: одна строка на продукт; три столбца-показателя. Зерно источника: `loans` — суммировать безопасно.
3. **CASE внутри SUM.** `SUM(CASE WHEN <квартал> THEN l.principal ELSE 0 END)` — это «сложить, где»: по одному столбцу на квартал.
4. **Без размножения.** Единственное соединение — `loans → products`, «многие к одному». Одна строка — по-прежнему один кредит, поэтому ничего не считается дважды.

```sql
SELECT p.name,
       SUM(CASE WHEN l.disbursed_at <  '2026-04-01' THEN l.principal ELSE 0 END) AS q1,
       SUM(CASE WHEN l.disbursed_at >= '2026-04-01' AND l.disbursed_at < '2026-07-01' THEN l.principal ELSE 0 END) AS q2,
       SUM(CASE WHEN l.disbursed_at >= '2026-07-01' THEN l.principal ELSE 0 END) AS q3_plus
FROM loans l JOIN products p ON p.product_id = l.product_id
WHERE l.disbursed_at >= '2026-01-01'
GROUP BY p.name ORDER BY p.name;
```

| product | Q1 | Q2 | Q3 (+1 Oct) |
|---|---|---|---|
| Auto loan | 13 637 110 000 | 10 773 540 000 | 11 807 660 000 |
| Buy now pay later | 775 920 000 | 733 850 000 | 939 560 000 |
| Consumer loan | 7 465 620 000 | 9 226 930 000 | 8 925 820 000 |
| Micro loan | 782 600 000 | 988 770 000 | 1 040 580 000 |
| Small business loan | 26 342 380 000 | 30 754 010 000 | 38 138 710 000 |

5. **Проверка:** пятнадцать ячеек в сумме дают 162 333 060 000 — вторничный итог за 2026 год. SME растёт каждый квартал; Auto упал после Q1. Это предложение и есть анализ; таблица — доказательство. (У последнего столбца нет верхней границы, поэтому 1 октября попадает туда же — годится для «Q3 и позже», неверно для строгого Q3; завтрашнее T7 просит строгий.)

---

## 3. Практика (60 мин) :id=3-practice-60-min

Под вопросами, ответ на которые — запрос, есть поле: напишите запрос, нажмите **▶ Выполнить**, затем **✔ Проверить** — сайт сравнит ваш результат с ответом, не показывая его; запрос сохраняется в этом браузере. У вопросов, где нужно число или объяснение, есть своё поле для ответа. Вопросы идут в порядке раздела 1; метка в скобках называет подраздел, который тренирует вопрос. Сегодняшние инструменты: проверки на NULL, `COALESCE`, `NULLIF`, `CASE`, `SUM(CASE …)`, анти-соединения и соединения по двум столбцам — поверх всего, что было на неделе. P16, P17 и P18 используют блоки `WITH`, напечатанные на этой странице и в Уголке компании Дня 3, — копируйте их как есть; писать свой `WITH` вы будете на неделе 3.

**P1.** *(Сравнение с NULL)* Закрытые кредиты без даты закрытия: посчитайте их один раз через `closed_at = NULL` и один раз через `closed_at IS NULL`.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*) FROM loans WHERE status = 'closed' AND closed_at = NULL;       -- 0: никогда не истина
SELECT COUNT(*) FROM loans WHERE status = 'closed' AND closed_at IS NULL;      -- 15
```
15 кредитов «закрыты», но без даты закрытия. Вариант с `= NULL` отвечает 0 без всякой ошибки — самая опасная разновидность неверного ответа.

</details>

**P2.** *(NULL в арифметике)* График кредита 1 с платежами (`installments LEFT JOIN payments`): добавьте столбец `i.total_due - p.amount`. Во скольких строках там NULL и почему? Затем исправьте через `COALESCE(p.amount, 0)`.

<details><summary>Ответ</summary>

```sql
SELECT i.installment_no, i.total_due, p.amount,
       i.total_due - p.amount              AS gap_raw,          -- NULL в 6 строках
       i.total_due - COALESCE(p.amount, 0) AS left_to_pay       -- в этих строках — вся сумма к оплате
FROM installments i
LEFT JOIN payments p ON p.installment_id = i.installment_id
WHERE i.loan_id = 1
ORDER BY i.installment_no;
```
**6** строк: у шести открытых платежей по графику нет оплаты, поэтому `p.amount` — NULL, и всё, что с ним посчитано, тоже. С `COALESCE` они показывают всю сумму к оплате; `SUM(left_to_pay)` — 10 449 693 сума, которые ещё предстоит получить по кредиту 1.

</details>

**P3.** *(NULL в агрегатах)* Для `customers`: строк, строк с доходом, строк без дохода, доля без дохода (один знак после запятой) — одним запросом.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*) AS rows_, COUNT(monthly_income) AS with_income, COUNT(*) - COUNT(monthly_income) AS missing,
       ROUND(100.0 * (COUNT(*) - COUNT(monthly_income)) / COUNT(*), 2) AS missing_pct
FROM customers;                                                        -- 6040 · 5684 · 356 · 5.89
```

</details>

**P4.** *(NULL в агрегатах)* Доля заявок без кредитного балла по каналам и по статусам.

<details><summary>Ответ</summary>

```sql
SELECT channel, COUNT(*) AS apps, COUNT(*) - COUNT(credit_score) AS no_score,
       ROUND(100.0 * (COUNT(*) - COUNT(credit_score)) / COUNT(*), 2) AS no_score_pct
FROM applications GROUP BY channel;             -- app 2.64 · branch 2.80 · partner 2.96
SELECT status, COUNT(*) AS apps, COUNT(*) - COUNT(credit_score) AS no_score,
       ROUND(100.0 * (COUNT(*) - COUNT(credit_score)) / COUNT(*), 2) AS no_score_pct
FROM applications GROUP BY status;              -- approved 2.69 · approved_not_disbursed 2.36 · cancelled 2.81 · rejected 3.01
```
Достаточно ровно, чтобы считать случайным; в реальных данных повышенная доля среди отказов часто означает «нет кредитной истории → отказ», а это политика, а не пропуск.

</details>

Случаен ли пропуск балла?

```task
{"id": "w02d4-p3", "kind": "choice", "options": ["В целом да: 2.4–3.0 % в каждом канале и статусе, ни одна группа сильно не выделяется", "Нет: у отклонённых заявок балл пропущен вдвое чаще", "Нет: у канала app баллов нет вовсе", "Без графика судить нельзя"], "answer": 0, "explain": "Каналы 2.64 / 2.80 / 2.96 %, статусы 2.36–3.01 %. У отклонённых — выше всех, это стоит одного предложения (в реальных данных «нет кредитной истории → отказ» — это политика), но ничего не сосредоточено.", "xp": 1}
```

**P5.** *(COALESCE)* Средний доход по сегментам двумя способами: `AVG(monthly_income)` и `AVG(COALESCE(monthly_income, 0))`, с числом пропусков в каждом сегменте.

<details><summary>Ответ</summary>

```sql
SELECT segment, COUNT(*) AS customers, COUNT(*) - COUNT(monthly_income) AS missing,
       ROUND(AVG(monthly_income)) AS avg_known, ROUND(AVG(COALESCE(monthly_income, 0))) AS avg_as_zero
FROM customers GROUP BY segment ORDER BY segment;
```
affluent 24 961 730 против 23 469 002 (72 пропуска из 1 204) · mass 5 771 515 против 5 436 655 (208 из 3 585) · sme 33 115 571 против 31 103 753 (76 из 1 251). Первый — с подписью «у клиентов с указанным доходом (94 %)». Считать неизвестное нулём — это *решение*, и для дохода неверное.

</details>

Какой столбец идёт на слайд Мадины?

```task
{"id": "w02d4-p2", "kind": "choice", "options": ["AVG(monthly_income) с подписью «у клиентов с указанным доходом (94 %)»", "AVG(COALESCE(monthly_income, 0)) — он охватывает каждого клиента", "Ни один — доход нельзя усреднять", "Разница между ними"], "answer": 0, "explain": "Среднее по известным значениям честно говорит, на чём стоит, если подпись это сообщает. Если считать неизвестный доход нулём, появляются 356 человек без дохода, и каждый сегмент проседает примерно на 6 %.", "xp": 1}
```

**P6.** *(NULLIF)* По каналам: одобренных заявок (`status LIKE 'approved%'`) на одну отклонённую, два знака, безопасно для канала без отказов.

<details><summary>Ответ</summary>

```sql
SELECT channel,
       SUM(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END) AS approved,
       SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END)     AS rejected,
       ROUND(1.0 * SUM(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END)
                 / NULLIF(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0), 2) AS approved_per_rejected
FROM applications GROUP BY channel;      -- app 2.14 · branch 2.62 · partner 2.40
```
Филиал одобряет 2.62 заявки на каждую отклонённую; приложение — 2.14. Канал без отказов показал бы NULL, а не остановил бы запрос.

</details>

**P7.** *(Поисковый CASE)* Доля одобрений (знаменатель — все заявки) по группам кредитного балла A ≥ 720, B 660–719, C 600–659, D < 600 — с группой *no score*. Один запрос с `CASE` в `GROUP BY`.

<details><summary>Ответ</summary>

```sql
SELECT CASE WHEN credit_score IS NULL THEN 'no score' WHEN credit_score >= 720 THEN 'A 720+'
            WHEN credit_score >= 660 THEN 'B 660-719' WHEN credit_score >= 600 THEN 'C 600-659' ELSE 'D <600' END AS band,
       COUNT(*) AS apps, ROUND(100.0 * SUM(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END) / COUNT(*), 1) AS approval_pct
FROM applications GROUP BY band ORDER BY band;
-- A 2150 / 91.3 % · B 4702 / 77.4 · C 4605 / 52.2 · D 2155 / 16.8 · no score 388 / 59.0
```
Группы дают в сумме 14 000 только потому, что есть группа для NULL. 59 % у «no score» — между B и C: такие заявки кто-то решает вручную.

</details>

**P8.** *(Простой CASE)* Клиенты по сегментам с читаемыми подписями: `'mass'` → `'Mass market'`, `'affluent'` → `'Affluent'`, всё остальное → `'Small business'`.

<details><summary>Ответ</summary>

```sql
SELECT CASE segment WHEN 'mass'     THEN 'Mass market'
                    WHEN 'affluent' THEN 'Affluent'
                    ELSE 'Small business' END AS segment_name,
       COUNT(*) AS customers
FROM customers GROUP BY segment_name;    -- Affluent 1204 · Mass market 3585 · Small business 1251
```

</details>

**P9.** *(CASE в ORDER BY)* Заявки по статусам в порядке конвейера: approved, approved_not_disbursed, rejected, cancelled.

<details><summary>Ответ</summary>

```sql
SELECT status, COUNT(*) AS applications
FROM applications
GROUP BY status
ORDER BY CASE status WHEN 'approved' THEN 1 WHEN 'approved_not_disbursed' THEN 2
                     WHEN 'rejected' THEN 3 ELSE 4 END;
-- approved 7917 · approved_not_disbursed 678 · rejected 3588 · cancelled 1817
```

</details>

**P10.** *(CASE внутри SUM)* Сводная: заявки по каналам (строки) × статусам (четыре столбца) плюс итог. Сверьте итоги со вторничными числами.

<details><summary>Ответ</summary>

```sql
SELECT channel,
       SUM(CASE WHEN status = 'approved'               THEN 1 ELSE 0 END) AS approved,
       SUM(CASE WHEN status = 'approved_not_disbursed' THEN 1 ELSE 0 END) AS approved_not_disbursed,
       SUM(CASE WHEN status = 'rejected'               THEN 1 ELSE 0 END) AS rejected,
       SUM(CASE WHEN status = 'cancelled'              THEN 1 ELSE 0 END) AS cancelled,
       COUNT(*) AS total
FROM applications GROUP BY channel ORDER BY channel;
```
app 2 693 / 222 / 1 359 / 732 = 5 006 · branch 3 636 / 329 / 1 513 / 745 = 6 223 · partner 1 588 / 127 / 716 / 340 = 2 771 (approved / approved_not_disbursed / rejected / cancelled). Итоги — вторничные числа по каналам.

</details>

**P11.** *(Анти-соединение)* Анти-соединения: (a) клиенты, которые ни разу не подавали заявку; (b) клиенты, которые подавали заявку, но так и не получили кредит, — один раз через соединение, один раз через `EXCEPT`; (c) просроченные кредиты (набор `dpd` из Дня 3), по которым **не было** ни одного действия по взысканию.

<details><summary>Ответ</summary>

```sql
-- (a)
SELECT COUNT(*) FROM customers c LEFT JOIN applications a ON a.customer_id = c.customer_id
WHERE a.application_id IS NULL;                                                  -- 587
-- (b) через соединение: строки против различных клиентов
SELECT COUNT(*) AS rows_, COUNT(DISTINCT c.customer_id) AS customers
FROM customers c JOIN applications a ON a.customer_id = c.customer_id
LEFT JOIN loans l ON l.customer_id = c.customer_id
WHERE l.loan_id IS NULL;                                                         -- 1806 · 1118
-- (b) через EXCEPT (вторничная операция над множествами): список из 1118 клиентов
SELECT customer_id FROM applications EXCEPT SELECT customer_id FROM loans;
-- (c) блок WITH из Дня 3, затем анти-соединение с collections_actions
WITH unpaid AS (
  SELECT i.installment_id, i.loan_id, i.due_date, i.total_due, COALESCE(SUM(p.amount), 0) AS paid
  FROM installments i
  LEFT JOIN payments p ON p.installment_id = i.installment_id
  WHERE i.due_date <= '2026-10-01'
  GROUP BY i.installment_id, i.loan_id, i.due_date, i.total_due
  HAVING COALESCE(SUM(p.amount), 0) < i.total_due
),
dpd AS (
  SELECT loan_id, CAST(julianday('2026-10-01') - julianday(MIN(due_date)) AS INTEGER) AS dpd
  FROM unpaid GROUP BY loan_id
)
SELECT COUNT(*) AS never_contacted,
       SUM(CASE WHEN d.dpd > 0 THEN 1 ELSE 0 END) AS late_never_contacted,
       SUM(CASE WHEN d.dpd BETWEEN 1 AND 30 THEN 1 ELSE 0 END) AS of_which_1_30
FROM dpd d LEFT JOIN collections_actions ca ON ca.loan_id = d.loan_id
WHERE ca.action_id IS NULL;                                                      -- 130 · 117 · 106
```
(a) 587. (b) **1 806 строк, но 1 118 клиентов** — соединение с `applications` размножило строки по числу заявок на человека; используйте `COUNT(DISTINCT c.customer_id)` или вторничный `EXCEPT` → сразу 1 118. (c) По 117 из 399 просроченных (DPD > 0) кредитов ни разу не связывались с клиентом (130 из 413, если считать и 13, у которых срок наступает сегодня, — по ним ещё не могли позвонить); из них 106 — из 124 кредитов корзины 1–30. Команда Севары работает со старым долгом и ещё не добралась до нового.

</details>

По скольким из 399 просроченных кредитов (DPD > 0) ни разу не было действий по взысканию?

```task
{"id": "w02d4-p6", "kind": "number", "answer": 117, "dp": 0, "unit": "кредитов", "hint": "Анти-соединение возвращает 130 кредитов; у 13 из них срок наступает сегодня (DPD 0), они ещё не просрочены.", "model": "117 из 399 — 106 из них в корзине 1–30. Команда работает со старым долгом; свежие, ещё исправимые случаи ждут."}
```

**P12.** *(LEFT JOIN, который превращается в INNER JOIN)* Эксперимент «ON против WHERE». Посчитайте строки `installments LEFT JOIN payments` для наступивших платежей по графику с фильтром отчётной даты `p.paid_at <= '2026-10-01'` (a) в `ON`, (b) в `WHERE`.

<details><summary>Ответ</summary>

```sql
-- (a) фильтр в ON
SELECT COUNT(*) AS rows_, COUNT(p.payment_id) AS with_payment
FROM installments i
LEFT JOIN payments p ON p.installment_id = i.installment_id AND p.paid_at <= '2026-10-01'
WHERE i.due_date <= '2026-10-01';                                                -- 54232 · 52851
-- (b) фильтр в WHERE
SELECT COUNT(*) AS rows_
FROM installments i
LEFT JOIN payments p ON p.installment_id = i.installment_id
WHERE i.due_date <= '2026-10-01' AND p.paid_at <= '2026-10-01';                  -- 52851
```
(a) 54 232 строки (54 207 наступивших платежей по графику + 25 дублированных платежей), `COUNT(p.payment_id)` 52 851. (b) 52 851 строка: каждый платёж по графику без оплаты исчез — `NULL <= '2026-10-01'` не истина. 24 платежа датированы после отчётной даты; с фильтром в `ON` они не учитываются, *а* неоплаченные платежи по графику остаются. (Если пересчитать DPD Дня 3 с этим фильтром в `ON`, DPD каждого кредита не изменится — ни один из 24 не меняет самый старый не полностью оплаченный платёж кредита.)

</details>

Сколько строк потерял вариант с `WHERE` по сравнению с вариантом с `ON`?

```task
{"id": "w02d4-p7", "kind": "number", "answer": 1381, "dp": 0, "unit": "строк", "hint": "Вычтите (b) из (a).", "model": "54 232 − 52 851 = 1 381 строка: 1 357 наступивших платежей по графику вообще без оплаты плюс 24, у которых единственная оплата датирована после отчётной даты. Ровно те строки, ради которых нужен LEFT JOIN."}
```

**P13.** *(Соединение по двум столбцам)* Самосоединение: пары клиентов с одинаковым телефоном, но *разной* датой рождения.

<details><summary>Ответ</summary>

```sql
SELECT a.customer_id, b.customer_id, a.first_name, b.first_name, a.birth_date, b.birth_date
FROM customers a JOIN customers b
  ON a.phone = b.phone AND a.birth_date <> b.birth_date AND a.customer_id < b.customer_id;
```
43 − 40 = **3** пары (786 и 1731, 2212 и 2242, 3645 и 5771). Общие семейные номера, а не дубликаты — ложные срабатывания прошлой недели, теперь найденные одним запросом.

</details>

Сколько пар и кто это?

```task
{"id": "w02d4-p8", "kind": "number", "answer": 3, "dp": 0, "unit": "пары", "hint": "Только по телефону — 43 пары, по телефону и дате рождения — 40.", "model": "3 пары (например, 786 и 1731): разные люди с общим семейным телефоном — не дубликаты. Ложные срабатывания прошлой недели, найденные одним запросом."}
```

**P14.** *(Соединения, которые умножают строки)* Соедините `installments` кредита 1 с его `payments` по `loan_id` вместо `installment_id`. Сколько строк и откуда это число?

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*) FROM installments i JOIN payments p ON p.loan_id = i.loan_id WHERE i.loan_id = 1;   -- 432
SELECT COUNT(*) FROM installments WHERE loan_id = 1;                                                 -- 24
SELECT COUNT(*) FROM payments WHERE loan_id = 1;                                                     -- 18
```
432 = 24 платежа по графику × 18 платежей: `loan_id` — ключ родителя обеих таблиц, поэтому каждый платёж по графику встречается с каждым платежом кредита. Правильный ключ, `installment_id`, даёт одну строку на платёж (18) — или 24 с LEFT JOIN.

</details>

```task
{"id": "w02d4-l13", "kind": "number", "answer": 432, "dp": 0, "unit": "строк", "hint": "Посчитайте платежи по графику и платежи кредита 1 отдельно, затем перемножьте.", "model": "24 × 18 = 432. Две дочерние таблицы, соединённые через ключ родителя, размножаются; соединяйте дочернюю с дочерней только по ключу, который связывает их напрямую (installment_id)."}
```

**P15.** *(Дубликаты)* Дубликаты: `COUNT(*)` против `COUNT(DISTINCT installment_id)` по `payments`; затем группы одинаковых `(installment_id, paid_at, amount)` и сумма, посчитанная дважды.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*), COUNT(DISTINCT installment_id) FROM payments;                 -- 52875 · 52850
SELECT installment_id, paid_at, amount, COUNT(*) FROM payments
GROUP BY installment_id, paid_at, amount HAVING COUNT(*) > 1;                  -- 25 строк, у всех COUNT = 2
```
58 397 800 сумов посчитаны дважды в каждом итоге «получено платежей»; 25 платежей по графику выглядят *пере*плаченными ровно на свою сумму. Чтобы их убрать, нужны номера строк — Неделя 3, День 2.

</details>

**P16.** *(Уберите дубликаты до соединения)* С блоками `pay` и `act` из раздела 1 выведите три кредита с наибольшим числом действий по взысканию, с числом их платежей и оплаченной суммой. Сравните с тем, что для кредита 2235 насчитал бы `loans JOIN payments JOIN collections_actions`.

<details><summary>Ответ</summary>

```sql
WITH pay AS (SELECT loan_id, COUNT(*) AS payments, SUM(amount) AS paid FROM payments GROUP BY loan_id),
     act AS (SELECT loan_id, COUNT(*) AS actions FROM collections_actions GROUP BY loan_id)
SELECT act.loan_id, act.actions, pay.payments, pay.paid
FROM act
LEFT JOIN pay ON pay.loan_id = act.loan_id
ORDER BY act.actions DESC
LIMIT 3;
-- 2235 · 151 действие · 7 платежей · 29 554 662   |   6945 · 144 · 17 · 132 363 259   |   1494 · 143 · 10 · 75 023 491
```
Одна строка на кредит, настоящие суммы. Размноженное соединение сложило бы платежи по кредиту 2235 151 раз: около 4.5 млрд сумов вместо 29.6 млн.

</details>

**P17.** *(Собираем вместе)* Вопрос Нилуфар, часть 1: для каждого кредита, у которого **первый** платёж по графику наступил не позже 2026-09-01, поставьте флаг FPD30 = 1, если этот платёж не был оплачен полностью или первая оплата пришла позже чем через 30 дней после срока. Посчитайте кредиты в базе и флаги. (Скопируйте блоки `first_inst` и `flags` из Уголка компании ниже и закончите одним `SELECT`.)

<details><summary>Ответ</summary>

```sql
WITH first_inst AS (
  SELECT i.loan_id, i.due_date, i.total_due, MIN(p.paid_at) AS first_paid, COALESCE(SUM(p.amount), 0) AS paid
  FROM installments i
  LEFT JOIN payments p ON p.installment_id = i.installment_id
  WHERE i.installment_no = 1
    AND i.due_date <= date('2026-10-01', '-30 days')
  GROUP BY i.loan_id, i.due_date, i.total_due
),
flags AS (
  SELECT f.loan_id,
         CASE WHEN f.paid < f.total_due THEN 1
              WHEN julianday(f.first_paid) - julianday(f.due_date) > 30 THEN 1
              ELSE 0 END AS fpd30
  FROM first_inst f
)
SELECT COUNT(*) AS loans_in_scope, SUM(fpd30) AS fpd30 FROM flags;             -- 7099 · 91
```
7 099 кредитов в базе, **91** с флагом — 51 не оплачен или оплачен частично, 40 оплачены полностью, но позже чем через 30 дней. Важны обе части `CASE`: строгое правило «только неоплаченные» даёт 51 (0.72 %).

</details>

Сколько кредитов отмечено FPD30?

```task
{"id": "w02d4-p10", "kind": "number", "answer": 91, "dp": 0, "unit": "кредит", "hint": "SUM флага 0/1 по кредитам в базе.", "model": "91 из 7 099 = 1.28 %: 51 так и не оплачен полностью, 40 оплачены полностью, но позже чем через 30 дней."}
```

> 🚀 **Со звёздочкой (по желанию, +5 XP).** Ещё один шаг по кривой ранних проблем — для завершения дня не обязательно.

**P18.** *(Собираем вместе)* SPD30 — тот же флаг для *второго* платежа по графику (`installment_no = 2`, срок не позже 2026-09-01). Кредиты в базе, флаги и доля в % с двумя знаками.

<details><summary>Ответ</summary>

```sql
WITH second_inst AS (
  SELECT i.loan_id, i.due_date, i.total_due, MIN(p.paid_at) AS first_paid, COALESCE(SUM(p.amount), 0) AS paid
  FROM installments i
  LEFT JOIN payments p ON p.installment_id = i.installment_id
  WHERE i.installment_no = 2
    AND i.due_date <= date('2026-10-01', '-30 days')
  GROUP BY i.loan_id, i.due_date, i.total_due
)
SELECT COUNT(*) AS loans_in_scope,
       SUM(CASE WHEN paid < total_due THEN 1
                WHEN julianday(first_paid) - julianday(due_date) > 30 THEN 1 ELSE 0 END) AS spd30,
       ROUND(100.0 * SUM(CASE WHEN paid < total_due THEN 1
                              WHEN julianday(first_paid) - julianday(due_date) > 30 THEN 1 ELSE 0 END) / COUNT(*), 2) AS spd30_pct
FROM second_inst;                                                               -- 6735 · 156 · 2.32
```
156 из 6 735 = **2.32 %** против 1.28 %. Само по себе не тревожно: у второго платежа был ещё месяц, чтобы проявились обычные финансовые трудности, и база на месяц старше. FPD выделяет сигнал «и не собирался платить»; SPD/TPD показывают кривую ранних проблем. Показывайте их рядом по каждому поколению.

</details>

Какова доля SPD30 в % с двумя знаками? Прежде чем открыть образец ответа, скажите себе, почему она выше FPD30.

```task
{"id": "w02d4-p11", "kind": "number", "answer": 2.32, "dp": 2, "unit": "%", "hint": "Тот же флаг, что в уголке, installment_no = 2; 100.0 * флаги / кредиты в базе.", "model": "156 из 6 735 = 2.32 % против 1.28 % у FPD30. У второго платежа был ещё месяц, чтобы проявились обычные трудности; FPD выделяет «и не собирался платить», SPD/TPD показывают кривую ранних проблем — показывайте их рядом по каждому поколению.", "xp": 2}
```

### SQL-лаборатория — таблица с пропусками :id=sql-lab-a-table-with-gaps

NULL ведут себя так же и в вашей собственной таблице. Эта лаборатория работает с **вашей учебной копией** базы (новая таблица появится в панели «База данных»; **База данных → Сбросить** вернёт исходные данные).

```sqllab
{"id": "w02d4-lab", "title": "Доходы Бухары вместе с пропусками", "intro": "В Бухаре самая большая доля пропущенных доходов (7.6 %). Скопируйте её клиентов в свою таблицу, пометьте пропуски, заполните плановую цифру, не разрушая исходные данные, а затем удалите пустые строки — проверкой, которая действительно работает.",
 "steps": [
  {"say": "Создайте my_income с customer_id, segment и monthly_income клиентов, у которых region = 'Bukhara'.", "hint": "CREATE TABLE my_income AS SELECT customer_id, segment, monthly_income FROM customers WHERE region = 'Bukhara';", "expect": "SELECT COUNT(*) FROM my_income", "want": 503},
  {"say": "Добавьте текстовый столбец income_flag и заполните его через CASE: 'unknown', где доход пуст, иначе 'known'. Сколько unknown вы ожидаете?", "hint": "ALTER TABLE my_income ADD COLUMN income_flag TEXT; UPDATE my_income SET income_flag = CASE WHEN monthly_income IS NULL THEN 'unknown' ELSE 'known' END;", "expect": "SELECT COUNT(*) FROM my_income WHERE income_flag = 'unknown'", "want": 38},
  {"say": "Рискам нужна плановая цифра: добавьте столбец income_filled и запишите в него доход или 5 000 000 (минимум по политике), где доход пуст. monthly_income оставьте как есть.", "hint": "ALTER TABLE my_income ADD COLUMN income_filled INTEGER; UPDATE my_income SET income_filled = COALESCE(monthly_income, 5000000);", "expect": "SELECT COUNT(*) FROM my_income WHERE income_filled IS NULL", "want": 0},
  {"say": "Удалите строки без дохода в базе. Сначала попробуйте WHERE monthly_income = NULL и посмотрите на сообщение — изменено 0 строк. Затем используйте проверку, которая работает.", "hint": "DELETE FROM my_income WHERE monthly_income IS NULL;", "expect": "SELECT COUNT(*) FROM my_income", "want": 465}],
 "cleanup": "DROP TABLE IF EXISTS my_income"}
```

Плановый столбец и флаг сохранили то, что удаление потом выбросило: после шага 4 уже никто не скажет, что у 38 клиентов Бухары не было дохода. Сначала флаг, заполнение — в новом столбце, удаление — последним, и только если вопрос действительно об известных значениях.

---

## 4. Домашнее задание :id=4-homework

Нового домашнего задания нет. **HW 2.2** (отчёт Севары об опозданиях за 2026 год, чистые способы оплаты, заявки несовершеннолетних) сдаётся завтра вместе с контрольной.

---

## 5. Самопроверка :id=5-self-check

```check
{"id": "w02d4-sc", "questions": [
  {"type": "number", "q": "В customers 6 040 строк, а COUNT(monthly_income) возвращает 5 684. У скольких клиентов нет дохода в базе?", "answer": 356, "explain": "COUNT(*) − COUNT(col) — стандартный способ посчитать пропуски (→ раздел 1, NULL в агрегатах)."},
  {"type": "single", "q": "Вам нужен каждый наступивший платёж по графику с оплатами до отчётной даты, неоплаченные платежи тоже. Куда поставить p.paid_at <= '2026-10-01'?", "options": ["В ON, рядом с ключом соединения", "В WHERE", "В HAVING", "С LEFT JOIN это не написать"], "answer": 0, "explain": "В WHERE условие не проходит на каждой строке с NULL, и LEFT JOIN становится INNER JOIN (→ раздел 1, LEFT JOIN, который превращается в INNER JOIN; P12)."},
  {"type": "multi", "q": "Какие выражения дают ДОЛЮ одобренных заявок (дробью или в %)?", "options": ["AVG(CASE WHEN status LIKE 'approved%' THEN 1.0 ELSE 0 END)", "100.0 * SUM(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END) / COUNT(*)", "SUM(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END)", "COUNT(CASE WHEN status LIKE 'approved%' THEN 1 END)"], "answer": [0, 1], "explain": "Последние два — это количества; среднее столбца 0/1 или количество, делённое на COUNT(*), — это доля (→ раздел 1, CASE внутри SUM и COUNT)."},
  {"type": "single", "q": "payments: COUNT(*) = 52 875, COUNT(DISTINCT installment_id) = 52 850. О чём говорит разница в 25?", "options": ["У 25 платежей по графику по две оплаты — выясните, не дубликаты ли это, прежде чем суммировать", "У 25 оплат нет платежа по графику", "Ни о чём — эти два числа всегда различаются", "25 сумм равны NULL"], "answer": 0, "explain": "Строк больше, чем ключей, значит, какой-то ключ повторяется; здесь это 25 одинаковых строк, 58 397 800 UZS посчитаны дважды (→ раздел 1, Дубликаты; P15)."}
]}
```

---

## 6. Уголок компании <span class="badge company">FPD30 по поколениям и каналам</span> :id=6-company-corner-fpd30-by-vintage-and-channel

**Определение, которым мы пользуемся** (произносите его перед каждым числом): кредит считается **FPD30**, если его первый платёж (`installment_no = 1`) *не был полностью оплачен в течение 30 дней после срока*. **В область** попадают кредиты, у которых срок первого платежа наступил не позже отчётной даты − 30 дней (2026-09-01), чтобы у каждого кредита в базе прошли его 30 дней. **Поколение** (*vintage*, винтаж) — это месяц выдачи.

Запрос устроен как DPD в среду: два именованных шага в блоке `WITH`, затем `SELECT` с группировкой. `WITH` — инструмент недели 3; сегодня читайте его как два именованных результата, запускайте и меняйте только последний `SELECT`.

```sql
WITH first_inst AS (                                   -- одна строка на кредит в области: срок, итог, дата первой оплаты, оплаченная сумма
  SELECT i.loan_id, i.due_date, i.total_due, MIN(p.paid_at) AS first_paid, COALESCE(SUM(p.amount), 0) AS paid
  FROM installments i
  LEFT JOIN payments p ON p.installment_id = i.installment_id
  WHERE i.installment_no = 1
    AND i.due_date <= date('2026-10-01', '-30 days')    -- SQL Server: DATEADD(day, -30, '2026-10-01')
  GROUP BY i.loan_id, i.due_date, i.total_due
),
flags AS (
  SELECT f.loan_id,
         CASE WHEN f.paid < f.total_due THEN 1                                            -- так и не оплачен полностью
              WHEN julianday(f.first_paid) - julianday(f.due_date) > 30 THEN 1           -- DATEDIFF(day, f.due_date, f.first_paid) > 30
              ELSE 0 END AS fpd30
  FROM first_inst f
)
SELECT strftime('%Y-%m', l.disbursed_at) AS vintage,                                     -- FORMAT(l.disbursed_at, 'yyyy-MM')
       a.channel,
       COUNT(*) AS loans,
       SUM(fpd30) AS fpd,
       ROUND(100.0 * SUM(fpd30) / COUNT(*), 2) AS fpd30_pct
FROM flags fl
JOIN loans l        ON l.loan_id = fl.loan_id
JOIN applications a ON a.application_id = l.application_id
GROUP BY vintage, a.channel
ORDER BY vintage, a.channel;
```

**В целом:** 7 099 кредитов в области, **91 FPD30 = 1.28 %** — число, которое цитировала страница первой недели, теперь ваше. Из 91: 41 списан, 5 в дефолте, 31 закрыт и 14 активны: FPD предсказывает убыток (половина из них — мёртвые кредиты), но не равен убытку (треть в итоге погасили).

**По каналам** (уберите `vintage` из запроса):

| channel | loans | FPD30 | rate | | определение «только неоплаченные» |
|---|---|---|---|---|---|
| app | 2 411 | 41 | **1.70 %** | | 1.04 % |
| partner | 1 425 | 16 | 1.12 % | | 0.49 % |
| branch | 3 263 | 34 | 1.04 % | | 0.58 % |

Канал app хуже на **0.66 пункта — в 1.6 раза выше ставки филиала** (при ставке филиала 2 411 кредитов канала app дали бы около 25 FPD; дали 41). Нилуфар и Тимур были правы оба: плитка Тимура использует правило *только неоплаченные* (app 1.04 % — «нормально»), таблица Нилуфар — правило *в течение 30 дней*. Одни и те же данные, два определения, разрыв 0.7 пункта у app. Решение — предложение в начале этого уголка, написанное на слайде.

**По поколениям** (только 2026, все каналы): янв 1.05 % · фев 1.13 · мар **0.00** · апр 1.60 · май 1.86 · июн 0.80 · июл 1.09 · авг 0 из 11 (едва вошло в область). По всем 32 поколениям ставка колеблется от 0.0 до 3.1 % на 100–380 кредитах каждое — при 3 FPD в месяц один кредит сдвигает ставку на 0.3 пункта. Когда числа так малы, читайте поколения *по кварталам*: 2026-Q1 app 1.40 % против branch 0.24 %; 2026-Q2 app 1.07 % против branch 1.22 % против partner 2.58 % (5 из 194). Превышение у app устойчиво в 2024–2025 (2.16 / 1.76 % против branch 0.50 / 1.59 %) и сузилось в 2026 (1.27 против 0.74 %).

**По продуктам и классам** (тот же запрос, замените измерение): Micro 1.70 % (= app: Micro — единственный продукт канала app), Consumer 1.14, BNPL 1.12, SME 0.98, Auto 0.58; классы A 0.60, B 0.97, C 2.16, D 2.23 — скоринговая карта разделяет A/B и C/D уже на первом платеже.

**Что сказать в понедельник:** *«FPD30 (первый платёж не оплачен полностью в течение 30 дней; база — кредиты, у которых срок первого платежа старше 30 дней) составляет 1.28 % в целом. Канал app даёт 1.70 % против 1.04 % в филиалах — в 1.6 раза больше, стабильно с 2024 года и с сужением в 2026-м. Месячные поколения слишком малы, чтобы читать их по отдельности; по кварталам app выше филиала в 10 из 11. Рекомендация: ужесточить порог для app по классу C, где FPD равен 2.2 %.»*

Расставьте расчёт по порядку:

```game
{"id": "w02d4-g4", "type": "order", "title": "FPD30 шаг за шагом", "items": ["Взять платёж № 1 каждого кредита, у которого срок первого платежа не позже 2026-09-01", "LEFT JOIN его оплат и сложить их по кредиту, COALESCE до 0", "Флаг 1, если оплачено меньше суммы к оплате или первая оплата пришла позже чем через 30 дней", "Присоединить loans и applications ради месяца выдачи и канала", "SUM(флаг) / COUNT(*) по поколению и каналу, с количеством рядом со ставкой"]}
```

> 🎯 **Версия для собеседования.** *«Как бы вы посчитали FPD30 по поколениям и каналам и в чём ловушка?»* — Первый платёж каждого кредита; LEFT JOIN payments с группировкой; флаг paid < due *или* первая оплата позже чем на 30 дней; база — только кредиты, у которых срок первого платежа минимум за 30 дней до отчётной даты; группировка по месяцу выдачи и каналу через `SUM(CASE)/COUNT(*)`. Ловушки: забыть про 30-дневную область (молодые поколения выглядят идеально), считать частичные платежи оплаченными и сравнивать две плитки, построенные на двух определениях.

**Скажите как на собеседовании.** *«Как бы вы посчитали FPD30 по поколениям и каналам и в чём ловушка?»* Ответьте так, как сказали бы вслух, с числами Nur Finance.

```task
{"id": "w02d4-iv", "kind": "free", "min": 30, "model": "FPD30 помечает кредит, первый платёж которого не был полностью оплачен в течение 30 дней после срока. Я беру платёж № 1 каждого кредита, делаю LEFT JOIN оплат и складываю их по кредиту, а флаг ставлю, если оплачено меньше суммы к оплате или первая оплата пришла позже чем через 30 дней. В базу входят только кредиты, у которых срок первого платежа минимум за 30 дней до отчётной даты, иначе молодые поколения выглядят идеально. Затем группирую по месяцу выдачи и каналу и делю SUM(флаг) на COUNT(*). В Nur Finance это 1.28 % в целом, 1.70 % в app против 1.04 % в филиалах — а плитка Тимура «только неоплаченные» показывала app на 1.04 %, поэтому определение я бы написала на слайде.", "rubric": ["Даёт определение: первый платёж не оплачен полностью в течение 30 дней", "Ограничивает базу кредитами, у которых срок первого платежа минимум за 30 дней до отчётной даты", "Считает частичные оплаты неоплаченными (LEFT JOIN payments, paid < due)", "Группирует по поколению и каналу через SUM(флаг) / COUNT(*) и показывает количества", "Приводит числа Nur Finance (1.28 %; app 1.70 % против branch 1.04 %)"], "xp": 2}
```

Завтра: контрольная — двадцать пять вопросов от четырёх отделов, ничего нового учить не нужно.

---

## Тест дня :id=day-quiz

Для завершения дня нужно набрать 80 %. Пересдавать можно сколько угодно.

```quiz
{"id": "w02d4", "pass": 0.8, "questions": [
  {"type": "single", "q": "В customers 6 040 строк, у 356 из них нет дохода. Почему этот запрос возвращает 5 684, а не 6 039?", "code": "SELECT COUNT(*) FROM customers\nWHERE monthly_income <> 5000000;", "options": ["Никто не зарабатывает ровно 5 000 000, это совпадение", "Сравнение с NULL — неизвестно, а не истина, поэтому 356 строк тоже не проходят проверку", "<> пропускает дубликаты", "COUNT(*) игнорирует NULL"], "answer": 1, "explain": "Строки с NULL выпадают из каждого фильтра — и по =, и по <>; когда группы не складываются в итог, ищите NULL (→ раздел 1, Сравнение с NULL)."},
  {"type": "number", "q": "У четырёх клиентов такие доходы (в миллионах). Что вернёт запрос?", "code": "monthly_income: 10, 20, 30, NULL\n\nSELECT AVG(monthly_income) FROM customers;", "answer": 20, "explain": "AVG отбрасывает NULL и усредняет три известных значения; неизвестное он не считает нулём (тогда получилось бы 15) — указывайте количество рядом со средним (→ раздел 1, NULL в агрегатах)."},
  {"type": "single", "q": "Куда в этом результате попадают клиенты с пустым доходом?", "code": "CASE WHEN monthly_income <  5000000 THEN '<5m'\n     WHEN monthly_income < 20000000 THEN '5-20m'\n     ELSE '20m+' END AS income_band", "options": ["В '<5m'", "В '20m+' — любая проверка NULL даёт «неизвестно», поэтому они проваливаются в ELSE", "Они исключаются из результата", "В собственный диапазон NULL"], "answer": 1, "explain": "Поставьте первым WHEN monthly_income IS NULL THEN 'unknown', иначе люди, о которых мы знаем меньше всего, попадут в самый богатый диапазон (→ раздел 1, Поисковый CASE)."},
  {"type": "multi", "q": "Какие выражения дают ЧИСЛО одобренных заявок?", "options": ["SUM(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END)", "COUNT(CASE WHEN status LIKE 'approved%' THEN 1 END)", "COUNT(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END)", "AVG(CASE WHEN status LIKE 'approved%' THEN 1.0 ELSE 0 END)"], "answer": [0, 1], "explain": "COUNT считает значения, не равные NULL, поэтому вариант с ELSE 0 считает все строки; вариант с AVG — это доля, а не число (→ раздел 1, CASE внутри SUM и COUNT)."},
  {"type": "single", "q": "Что не так в этом LEFT JOIN?", "code": "SELECT COUNT(*)\nFROM installments i\nLEFT JOIN payments p ON p.installment_id = i.installment_id\nWHERE p.paid_at <= '2026-10-01';", "options": ["Ничего — он сохраняет каждый платёж по графику", "Проверка в WHERE не проходит на NULL, поэтому каждый платёж без оплаты отбрасывается: LEFT JOIN работает как INNER JOIN", "Он считает оплаты дважды", "Это синтаксическая ошибка"], "answer": 1, "explain": "Фильтр по правой таблице должен стоять в ON (… AND p.paid_at <= '2026-10-01') (→ раздел 1, LEFT JOIN, который превращается в INNER JOIN; P12)."},
  {"type": "single", "q": "Зачем нужен NULLIF в x / NULLIF(y, 0)?", "options": ["Он заменяет NULL на 0", "Он превращает нулевой делитель в NULL, поэтому группа, которую не на что делить, даёт NULL, а не ошибку деления на ноль", "Он удаляет дублирующиеся строки", "Он округляет результат"], "answer": 1, "explain": "NULLIF(a, b) возвращает NULL, когда a = b; у него одна задача — безопасное деление (→ раздел 1, NULLIF)."},
  {"type": "single", "q": "Что делает a.customer_id < b.customer_id в этом самосоединении?", "code": "FROM customers a JOIN customers b\n  ON a.phone = b.phone\n AND a.birth_date = b.birth_date\n AND a.customer_id < b.customer_id", "options": ["Оставляет только более старого клиента", "Оставляет каждую пару один раз и никогда не соединяет строку с самой собой", "Сортирует результат", "Ничего — его можно убрать"], "answer": 1, "explain": "Без него каждая строка совпадёт сама с собой, а каждая пара появится дважды — как (a, b) и (b, a) (→ раздел 1, Соединение по двум столбцам)."},
  {"type": "single", "q": "Почему в базу FPD30 входят только кредиты, у которых срок первого платежа наступил как минимум за 30 дней до отчётной даты?", "options": ["Чтобы запрос работал быстрее", "У более молодых кредитов ещё не прошли их 30 дней, они бы считались «не FPD» и делали молодые поколения идеальными", "Потому что у новых кредитов нет платежей по графику", "Регуляторы запрещают учитывать недавние кредиты"], "answer": 1, "explain": "У каждого кредита в базе должна быть возможность «провалиться»; забыть про область — классическая ловушка FPD (→ раздел 6, Уголок компании)."}
]}
```

<!-- challenge:start -->

---

## Задача дня :id=daily-challenge

Бонус для любознательных: один более сложный вопрос по теме дня. Решите его и получите XP, растущие вместе с вашей серией задач — полная неделя из пяти добавляет ещё 10 % к ваучеру в пятницу.

```challenge
{"id": "w02d4", "sql": true, "q": "Нилуфар спрашивает, не рискованнее ли на первом платеже клиенты, у которых в базе нет дохода. Используя определение и область FPD30 из Уголка компании (срок первого платежа не позже 2026-09-01), посчитайте ставку FPD30 для кредитов, у клиента которых monthly_income пуст. Процент с точностью до 2 знаков.", "type": "number", "dp": 2, "h": ["c6ee2214fe3286dbca701947"], "hint": "Используйте блок flags из уголка и добавьте одно соединение; вспомните, как пустое значение ведёт себя в сравнении.", "sol": "V0lUSCBmaXJzdF9pbnN0IEFTICgg4oCmdGhlIENvbXBhbnkgY29ybmVyJ3MgYmxvY2vigKYgKSwKZmxhZ3MgQVMgKCDigKZ0aGUgQ29tcGFueSBjb3JuZXIncyBibG9ja+KApiApClNFTEVDVCBDT1VOVCgqKSBBUyBsb2FucywgU1VNKGZsLmZwZDMwKSBBUyBmcGQsCiAgICAgICBST1VORCgxMDAuMCAqIFNVTShmbC5mcGQzMCkgLyBDT1VOVCgqKSwgMikgQVMgZnBkMzBfcGN0CkZST00gZmxhZ3MgZmwKSk9JTiBsb2FucyBsICAgICBPTiBsLmxvYW5faWQgPSBmbC5sb2FuX2lkCkpPSU4gY3VzdG9tZXJzIGMgT04gYy5jdXN0b21lcl9pZCA9IGwuY3VzdG9tZXJfaWQKV0hFUkUgYy5tb250aGx5X2luY29tZSBJUyBOVUxMOwotLSA0MTkgbG9hbnMgaW4gc2NvcGUsIDYgRlBEMzAg4oaSIDEuNDMgJQotLSBTUUwgU2VydmVyOiB0aGUgY29ybmVyJ3MgREFURUFERCAvIERBVEVESUZGIHNwZWxsaW5ncyBpbiB0aGUgQ1RFcywgdGhlIHJlc3QgaWRlbnRpY2FsCldpdGggaW5jb21lIG9uIGZpbGU6IDg1IG9mIDYgNjgwID0gMS4yNyAlLiBUaGUgZ2FwIGlzIGxlc3MgdGhhbiBvbmUgbG9hbiBvdXQgb2YgNDE5IOKAlCBmYXIgaW5zaWRlIHRoZSBub2lzZSBvZiBhIDYtZXZlbnQgZ3JvdXAuIFRoZSBhbnN3ZXIgZm9yIE5pbHVmYXI6IG5vIGV2aWRlbmNlIHRoYXQgYSBtaXNzaW5nIGluY29tZSBwcmVkaWN0cyBmaXJzdC1wYXltZW50IGRlZmF1bHQ7IGxvb2sgYWdhaW4gd2hlbiB0aGUgZ3JvdXAgaGFzIDMwKyBGUERzLiAoV0hFUkUgbW9udGhseV9pbmNvbWUgPSBOVUxMIGZpbmRzIG5vIGxvYW5zIGF0IGFsbC4p"}
```

<!-- challenge:end -->
