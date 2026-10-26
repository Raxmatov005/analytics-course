# Неделя 2 · День 4 — NULL, CASE и хитрые соединения

<span class="badge">Теория 60 мин</span> <span class="badge">Практика 60 мин</span> <span class="badge company">Уголок компании</span>

> STORY **Четверг, 9:20.** Новое лицо: Нилуфар, риск-аналитик (*risk analyst*), с открытым ноутбуком и графиком на экране. *«В понедельник я представляю FPD30 кредитному комитету — по месяцам выдачи и по каналам. Дашборд Тимура говорит, что с каналом app всё нормально. Моя таблица говорит, что нет. Кто-то из нас делит не на то.»* Мадина: *«И раз уж вы здесь — средний доход по сегментам у Рисков кажется мне слишком высоким. У шести процентов наших клиентов дохода в базе нет. Куда они делись?»*

## Сегодня в трёх строках :id=today-in-3-lines

- Вы знаете **правила NULL**: `= NULL` никогда не истинно, проверка — это `IS NULL`, `COUNT(col)` пропускает NULL, `AVG` молча их отбрасывает; `COALESCE`, `ISNULL`|`IFNULL`, `NULLIF` — для безопасного деления.
- Вы умеете писать **CASE** (поисковый и простой) для корзин и для **сводных `SUM(CASE …)`**, **анти-соединение** (`LEFT JOIN … IS NULL`), **самосоединение**, соединение по **двум столбцам** и находить **дубликаты** через `COUNT` и `COUNT(DISTINCT)`.
- Вы посчитали **FPD30 по поколениям и каналам** и можете сказать, какой канал хуже, насколько и при каком определении.

---

## 1. Теория — значение, которого нет :id=1-learn-the-value-that-is-not-there

### NULL — это не значение :id=null-is-not-a-value

**NULL** (*пустое значение*) означает *неизвестно / не записано*. Это не 0, не пустая строка и — вот что больно кусается — оно не равно ничему, включая само себя. Любое сравнение с NULL даёт *неизвестно*, а `WHERE` оставляет только строки, где условие *истинно*:

```sql
SELECT COUNT(*) FROM customers WHERE monthly_income = NULL;        -- 0, всегда; это никогда не истинно
SELECT COUNT(*) FROM customers WHERE monthly_income IS NULL;       -- 356
SELECT COUNT(*) FROM customers WHERE monthly_income <> 5000000;    -- 5684, а не 6039: 356 строк с NULL тоже не проходят проверку
```

356 отсутствующих доходов — это 5.89 % от 6 040 клиентов. Они выпадают из *каждого* фильтра: `WHERE monthly_income > x` и `WHERE monthly_income <= x` вместе возвращают 5 684 строки, а не 6 040. Когда группы отчёта не складываются в итог, ищите NULL.

### NULL в агрегатах :id=null-in-aggregates

| Выражение | Результат | Почему |
|---|---|---|
| `COUNT(*)` | 6 040 | считает строки |
| `COUNT(monthly_income)` | 5 684 | считает значения, не равные NULL |
| `COUNT(*) - COUNT(monthly_income)` | 356 | пропущенные — стандартный способ их посчитать |
| `AVG(monthly_income)` | 15 245 933 | **среднее по 5 684 известным значениям**; 356 отбрасываются, а не считаются нулями |
| `AVG(COALESCE(monthly_income, 0))` | 14 347 331 | среднее по всем 6 040, пропущенные считаются нулями — обычно неверно, но явно |
| `SUM(monthly_income)` | сумма известных | NULL игнорируются; `SUM` одних только NULL — это NULL, а не 0 |

Подозрение Мадины: с `AVG` всё в порядке — он делает ровно то, что написано, — но слайд «средний доход 15.2 млн» без пометки «(у 94 % доход в базе есть)» неполон. **Всегда указывайте количество рядом со средним** и проверяйте, пропуски случайны или сконцентрированы. Здесь по сегментам разрыв ровный (affluent 6.0 %, mass 5.8 %, sme 6.1 %); по регионам он колеблется от Termez 4.6 % до **Bukhara 7.6 %**; по `income_source` — от business 4.7 % до **self-employed 7.0 %** — вероятно, настоящий (у самозанятых нет справки о зарплате), и это замечание в записку, а не баг.

То же с `applications.credit_score`: у 388 из 14 000 (2.77 %) нет скора; app 2.64 %, branch 2.80 %, partner 2.96 %. Эти 388 были одобрены в **59.0 %** случаев против 61.5 % у заявок со скором, и 213 из них стали кредитами — поэтому «уровень одобрения по диапазонам скора» требует диапазона *нет скора*, иначе молча теряется 2.8 % базы.

### COALESCE, ISNULL / IFNULL, NULLIF :id=coalesce-isnull-ifnull-nullif

- **`COALESCE(a, b, c, …)`** возвращает первый аргумент, не равный NULL. Стандарт, работает в обоих движках. `COALESCE(SUM(p.amount), 0)` — вчерашний запрос для DPD — превращает «нет платежей» в 0, чтобы `0 < total_due` могло быть истинным. `COALESCE(CAST(monthly_income AS TEXT), 'unknown')` подписывает пропуск в списке.
- **`ISNULL(a, b)`** (SQL Server) и **`IFNULL(a, b)`** (SQLite): двухаргументные версии того же самого. Предпочитайте `COALESCE`; он переносится.
- **`NULLIF(a, b)`** возвращает NULL, когда `a = b`, иначе `a`. У него одна задача: **безопасное деление**. `x / NULLIF(y, 0)` даёт NULL вместо ошибки «деление на ноль», когда в группе нечего делить:

```sql
SELECT b.branch_name, COUNT(*) AS applications,
       ROUND(100.0 * SUM(CASE WHEN a.status LIKE 'approved%' THEN 1 ELSE 0 END)
                   / NULLIF(SUM(CASE WHEN a.status <> 'cancelled' THEN 1 ELSE 0 END), 0), 1) AS approval_decided_pct
FROM applications a JOIN branches b ON b.branch_id = a.branch_id
GROUP BY b.branch_name ORDER BY approval_decided_pct DESC;      -- Fergana Central 72.8 … Nukus Central 68.5
```

Сегодня ни в одном филиале нет нуля рассмотренных заявок; в тот день, когда такой появится, отчёт всё равно отработает.

### CASE — значение, зависящее от условия :id=case-a-value-that-depends-on-a-condition

**Поисковый CASE** проверяет условия по порядку и возвращает первое совпавшее (`ELSE` получает всё остальное; без него остальные получат NULL):

```sql
SELECT CASE WHEN monthly_income IS NULL      THEN 'unknown'
            WHEN monthly_income <  5000000   THEN '<5m'
            WHEN monthly_income < 10000000   THEN '5-10m'
            WHEN monthly_income < 20000000   THEN '10-20m'
            ELSE '20m+' END AS income_band,
       COUNT(*) AS customers
FROM customers GROUP BY income_band;        -- SQL Server: повторите весь CASE в GROUP BY (ни псевдонима, ни GROUP BY 1)
-- unknown 356 · <5m 1281 · 5-10m 2198 · 10-20m 576 · 20m+ 1629
```

Ставьте проверку на NULL **первой**: `NULL < 5000000` — неизвестно, поэтому без неё 356 строк провалились бы в `ELSE '20m+'` — самый богатый диапазон, для людей, чей доход нам неизвестен. Вчерашние корзины DPD имели ту же форму.

**Простой CASE** сравнивает одно выражение со значениями — это справочник: `CASE channel WHEN 'app' THEN 'Mobile app' WHEN 'branch' THEN 'Branch office' ELSE 'Partner shop' END`.

**Сводная таблица через `SUM(CASE …)`.** `CASE` внутри агрегата считает или суммирует *по условию* — один столбец на каждое условие, что делает вторничную длинную таблицу широкой:

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

`SUM(CASE WHEN cond THEN 1 ELSE 0 END)` = «посчитать, где cond»; `SUM(CASE WHEN cond THEN amount ELSE 0 END)` = «сумма, где cond»; `AVG(CASE WHEN cond THEN 1.0 ELSE 0 END)` = «доля, где cond». Эта запись переносима; `SUM(cond)` из SQLite и `IIF` из SQL Server, которые были во вторник, — сокращения для неё.

### Хитрые соединения :id=the-tricky-joins

**Анти-соединение** — теперь с объяснением, почему оно работает. `LEFT JOIN` заполняет правую сторону NULL там, где пары не нашлось; `WHERE right.key IS NULL` оставляет ровно эти строки, потому что столбец-ключ никогда не может быть NULL в строке, где пара *найдена*.

```sql
SELECT COUNT(*) FROM customers c LEFT JOIN applications a ON a.customer_id = c.customer_id
WHERE a.application_id IS NULL;                                                             -- 587 ни разу не подавали заявку
SELECT a.status, COUNT(*) FROM applications a LEFT JOIN loans l ON l.application_id = a.application_id
WHERE l.loan_id IS NULL AND a.status LIKE 'approved%' GROUP BY a.status;                    -- approved 89 · approved_not_disbursed 678
```

**Условие в `ON` или в `WHERE`** — ошибка LEFT JOIN, которую каждый совершает однажды. Фильтр по *правой* таблице внутри `WHERE` выбрасывает строки с NULL и превращает ваш LEFT JOIN обратно в INNER. Условия по правой стороне кладите в `ON`:

```sql
-- сохраняет все 54 207 наступивших платежей; платежи после отчётной даты просто не находят пару
FROM installments i LEFT JOIN payments p ON p.installment_id = i.installment_id AND p.paid_at <= '2026-10-01'
-- отбрасывает каждый платёж без оплаты (52 851 строка): проверка в WHERE не проходит на NULL
FROM installments i LEFT JOIN payments p ON p.installment_id = i.installment_id WHERE p.paid_at <= '2026-10-01'
```

**Самосоединение** (*self-join*) — таблица, соединённая сама с собой через два псевдонима, чтобы сравнивать строки одной таблицы. Прошлонедельный поиск дубликатов в виде соединения: клиенты с одним телефоном *и* одной датой рождения:

```sql
SELECT a.customer_id, b.customer_id, a.first_name, b.first_name
FROM customers a JOIN customers b
  ON a.phone = b.phone AND a.birth_date = b.birth_date AND a.customer_id < b.customer_id;   -- 40 пар
```

`a.customer_id < b.customer_id` оставляет каждую пару один раз и никогда не соединяет строку с самой собой. Только по телефону → 43 пары (три семейных номера с первой недели).

**Соединение по двум столбцам** — когда для совпадения нужно больше одного ключа: `ON a.x = b.x AND a.y = b.y`. Таблицам с составным ключом (`loan_id, installment_no`) оно нужно; как и любой проверке *согласованности* — `payments JOIN installments ON installment_id AND loan_id` возвращает 52 875 строк, столько же, сколько по одному `installment_id`, что доказывает: ни один платёж не указывает на платёж по графику *другого* кредита.

**Дубликаты от соединений и настоящие дубликаты.** `COUNT(*)` рядом с `COUNT(DISTINCT key)` — универсальная проверка. В `payments`: 52 875 строк, **52 850** различных `installment_id` — у 25 платежей по графику по две оплаты, а группировка по `(installment_id, paid_at, amount)` с `HAVING COUNT(*) > 1` показывает 25 групп *одинаковых* строк: 58 397 800 UZS посчитаны дважды (их удаление — упражнение на дедупликацию из недели 3). В соединении та же проверка говорит, умножило ли оно строки: 7 828 кредитов → 92 193 строки после `installments`; `COUNT(DISTINCT loan_id)` по-прежнему 7 828.

### Углубление (по желанию) :id=depth-optional

- ▶ Бараа, *NULL functions* [6:59:06](https://youtu.be/SSKVgrwhzus?t=25146&end=29270) — 50 мин; *CASE* [8:07:50](https://youtu.be/SSKVgrwhzus?t=29270&end=31416) — 35 мин; *Joins (advanced)* [3:27:29](https://youtu.be/SSKVgrwhzus?t=12449&end=14529) — анти-соединения, самосоединения, FULL.
- Русская презентация (TBC Data Analytics 2.0, если она у вас есть) `2.2 SQL-1-38.pdf` — страницы про NULL / CASE. *Термины по-английски:* пустое значение = NULL, условное выражение = CASE, самосоединение = self-join, дубликаты = duplicates.

---

## 2. Разобранный пример — сводная «кварталы по продуктам» :id=2-worked-example-the-quarter-by-product-pivot

**Задача (Бекзод, по почте):** *выдачи 2026 года, продукты по вертикали, кварталы по горизонтали.*

1. Зерно ответа: одна строка на продукт; три столбца-показателя. Зерно источника: `loans` — суммировать безопасно.
2. Границы кварталов как полуоткрытые диапазоны дат внутри `SUM(CASE …)`.

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

3. Проверка: пятнадцать ячеек в сумме дают 162 333 060 000 — вторничный итог за 2026 год. SME растёт каждый квартал; Auto упал после Q1. Это предложение и есть анализ; таблица — доказательство.

---

## 3. Практика (60 мин) :id=3-practice-60-min

Пишите каждый запрос в поле под вопросом — он сохраняется в этом браузере; **✔ Проверить** сравнивает ваш результат с ответом.

**P1.** Для `customers`: строк, строк с доходом, строк без дохода, доля без дохода (один знак после запятой) — одним запросом.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*) AS rows_, COUNT(monthly_income) AS with_income, COUNT(*) - COUNT(monthly_income) AS missing,
       ROUND(100.0 * (COUNT(*) - COUNT(monthly_income)) / COUNT(*), 2) AS missing_pct
FROM customers;                                                        -- 6040 · 5684 · 356 · 5.89
```

</details>

**P2.** Средний доход по сегментам двумя способами: `AVG(monthly_income)` и `AVG(COALESCE(monthly_income, 0))`, с числом пропусков по каждому сегменту. Какой столбец попадёт на слайд Мадины?

<details><summary>Ответ</summary>

affluent 24 961 730 против 23 469 002 (72 пропуска из 1 204) · mass 5 771 515 против 5 436 655 (208 из 3 585) · sme 33 115 571 против 31 103 753 (76 из 1 251). Первый, с подписью «среди клиентов с доходом в базе (94 %)». Считать неизвестное нулём — это *решение*, и для дохода оно неверное.

</details>

**P3.** Доля заявок без кредитного скора по каналам и по статусам. Случаен ли этот разрыв?

<details><summary>Ответ</summary>

```sql
SELECT channel, COUNT(*) AS apps, COUNT(*) - COUNT(credit_score) AS no_score,
       ROUND(100.0 * (COUNT(*) - COUNT(credit_score)) / COUNT(*), 2) AS no_score_pct
FROM applications GROUP BY channel;             -- app 2.64 · branch 2.80 · partner 2.96
```
По статусам: approved 2.69 %, approved_not_disbursed 2.36, cancelled 2.81, **rejected 3.01**. Достаточно ровно, чтобы считать случайным; в реальных данных более высокая доля среди отказов часто означает «нет файла в бюро → отказ», а это политика, а не пропуск.

</details>

**P4.** Уровень одобрения (в знаменателе все заявки) по диапазонам кредитного скора A ≥ 720, B 660–719, C 600–659, D < 600 — с диапазоном *нет скора*. Один запрос с `CASE` в `GROUP BY`.

<details><summary>Ответ</summary>

```sql
SELECT CASE WHEN credit_score IS NULL THEN 'no score' WHEN credit_score >= 720 THEN 'A 720+'
            WHEN credit_score >= 660 THEN 'B 660-719' WHEN credit_score >= 600 THEN 'C 600-659' ELSE 'D <600' END AS band,
       COUNT(*) AS apps, ROUND(100.0 * SUM(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END) / COUNT(*), 1) AS approval_pct
FROM applications GROUP BY band ORDER BY band;
-- A 2150 / 91.3 % · B 4702 / 77.4 · C 4605 / 52.2 · D 2155 / 16.8 · no score 388 / 59.0
```
Диапазоны дают в сумме 14 000 только потому, что есть диапазон для NULL. 59 % у «нет скора» лежит между B и C — такие заявки решают вручную.

</details>

**P5.** Сводная таблица: заявки по каналам (строки) × статусам (четыре столбца) плюс итог. Сверьте итоги со вторничными подсчётами.

<details><summary>Ответ</summary>

app 2 693 / 222 / 1 359 / 732 = 5 006 · branch 3 636 / 329 / 1 513 / 745 = 6 223 · partner 1 588 / 127 / 716 / 340 = 2 771 (approved / approved_not_disbursed / rejected / cancelled). Четыре столбца `SUM(CASE …)` и `COUNT(*)`.

</details>

**P6.** Анти-соединения: (a) клиенты, ни разу не подававшие заявку; (b) клиенты, которые подавали заявку, но не получили кредит, — один раз через соединение, один раз через `EXCEPT`; (c) просроченные кредиты (набор `unpaid` из Дня 3, любой DPD), по которым **нет** ни одного действия по взысканию.

<details><summary>Ответ</summary>

(a) 587. (b) `customers c JOIN applications a … LEFT JOIN loans l ON l.customer_id = c.customer_id WHERE l.loan_id IS NULL` → **1 806 строк, но 1 118 клиентов** — соединение с `applications` умножило строки на число заявок на человека; используйте `COUNT(DISTINCT c.customer_id)` или вторничный `EXCEPT` → сразу 1 118. (c) 117 из 399 просроченных (DPD > 0) кредитов ни разу не контактировали (130 из 413, если считать и 13 со сроком сегодня — им ещё не могли звонить); среди них 106 из 124 кредитов в корзине 1–30. Команда Севары работает со старым долгом и до нового ещё не добралась.

</details>

**P7.** Эксперимент ON против WHERE. Посчитайте строки `installments LEFT JOIN payments` для наступивших платежей с фильтром отчётной даты `p.paid_at <= '2026-10-01'` (a) в `ON`, (b) в `WHERE`. Объясните разницу.

<details><summary>Ответ</summary>

(a) 54 232 строки (54 207 наступивших платежей + 25 дублирующихся оплат), `COUNT(p.payment_id)` 52 851. (b) 52 851 строка: каждый платёж без оплаты пропал — `NULL <= '2026-10-01'` не истинно. 24 оплаты датированы позже отчётной даты; с фильтром в `ON` они игнорируются, *а* неоплаченные платежи остаются. (Если повторить DPD Дня 3 с этим фильтром в `ON`, получится точно тот же DPD для каждого кредита — ни одна из 24 оплат не меняет самый старый не полностью оплаченный платёж кредита.)

</details>

**P8.** Самосоединение: пары клиентов с одним телефоном, но *разными* датами рождения. Сколько их и что это такое?

<details><summary>Ответ</summary>

43 − 40 = **3** пары (например, id 786 и 1731): `a.phone = b.phone AND a.birth_date <> b.birth_date AND a.customer_id < b.customer_id`. Общие домашние номера, а не дубликаты — ложные срабатывания прошлой недели, теперь найденные одним запросом.

</details>

**P9.** Дубликаты: `COUNT(*)` против `COUNT(DISTINCT installment_id)` в `payments`; затем группы одинаковых `(installment_id, paid_at, amount)` и дважды посчитанная сумма.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*), COUNT(DISTINCT installment_id) FROM payments;                 -- 52875 · 52850
SELECT installment_id, paid_at, amount, COUNT(*) FROM payments
GROUP BY installment_id, paid_at, amount HAVING COUNT(*) > 1;                  -- 25 строк, везде COUNT = 2
```
58 397 800 UZS посчитаны дважды в каждом итоге «полученных платежей»; 25 платежей по графику выглядят *пере*оплаченными ровно на свою сумму. Для удаления нужны номера строк — Неделя 3, День 2.

</details>

**P10.** Вопрос Нилуфар, часть 1: для каждого кредита, **первый** платёж которого был со сроком не позже 2026-09-01, поставьте флаг FPD30 = 1, если платёж не оплачен полностью или первая оплата пришла более чем через 30 дней после срока. Посчитайте флаги.

<details><summary>Ответ</summary>

См. Уголок компании: 7 099 кредитов в области, помечено **91** — 51 не оплачены или оплачены частично, 40 оплачены полностью, но с опозданием более 30 дней. Важны обе части `CASE`: строгое правило «только неоплаченные» даёт 51 (0.72 %).

</details>

<span class="badge stretch">Со звёздочкой</span> **P11.** SPD30 — то же для *второго* платежа. Почему он выше, чем FPD30, и это проблема?

<details><summary>Ответ</summary>

156 из 6 735 = **2.32 %** против 1.28 %. Само по себе не тревожно: у второго платежа был ещё один месяц, чтобы проявились обычные финансовые трудности, а область — на месяц старше. FPD выделяет сигнал «изначально не собирался платить»; SPD/TPD показывают кривую ранних проблем. Показывайте их рядом по каждому поколению.

</details>

---

## 4. Домашнее задание :id=4-homework

Нового домашнего задания нет. **HW 2.2** (отчёт Севары об опозданиях за 2026 год, чистые способы оплаты, заявки несовершеннолетних) сдаётся завтра вместе с контрольной.

---

## 5. Самопроверка :id=5-self-check

1. Почему `WHERE monthly_income <> 5000000` возвращает 5 684, а не 6 039? *(→ раздел 1, «NULL — это не значение»)*
2. Где в `LEFT JOIN` должен стоять фильтр по правой таблице и что произойдёт, если поставить его в `WHERE`? *(→ раздел 1, «Условие в ON или в WHERE»; P7)*
3. Напишите `SUM(CASE …)`, который считает одобренные заявки, и `AVG(CASE …)`, который даёт их долю. *(→ раздел 1, «Сводная таблица»)*

---

## 6. Уголок компании <span class="badge company">FPD30 по поколениям и каналам</span> :id=6-company-corner-fpd30-by-vintage-and-channel

**Определение, которым мы пользуемся** (произносите его перед каждым числом): кредит считается **FPD30**, если его первый платёж (`installment_no = 1`) *не был полностью оплачен в течение 30 дней после срока*. **В область** попадают кредиты, у которых срок первого платежа наступил не позже отчётной даты − 30 дней (2026-09-01), чтобы у каждого кредита в базе прошли его 30 дней. **Поколение** (*vintage*, винтаж) — это месяц выдачи.

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

> Вопрос для собеседования: *«Как бы вы посчитали FPD30 по поколениям и каналам и в чём ловушка?»* — Первый платёж каждого кредита; LEFT JOIN payments с группировкой; флаг paid < due *или* первая оплата позже чем на 30 дней; база — только кредиты, у которых срок первого платежа минимум за 30 дней до отчётной даты; группировка по месяцу выдачи и каналу через `SUM(CASE)/COUNT(*)`. Ловушки: забыть про 30-дневную область (молодые поколения выглядят идеально), считать частичные платежи оплаченными и сравнивать две плитки, построенные на двух определениях.

Завтра: контрольная — двадцать пять вопросов от четырёх отделов, ничего нового учить не нужно.

---

## Тест дня :id=day-quiz

Для завершения дня нужно набрать 80 %. Пересдавать можно сколько угодно.

```quiz
{"id": "w02d4", "pass": 0.8, "questions": [
  {"type": "single", "q": "В customers 6 040 строк, у 356 из них нет дохода. Почему этот запрос возвращает 5 684, а не 6 039?", "code": "SELECT COUNT(*) FROM customers\nWHERE monthly_income <> 5000000;", "options": ["Никто не зарабатывает ровно 5 000 000, это совпадение", "Сравнение с NULL — неизвестно, а не истина, поэтому 356 строк тоже не проходят проверку", "<> пропускает дубликаты", "COUNT(*) игнорирует NULL"], "answer": 1, "explain": "Строки с NULL выпадают из каждого фильтра — и по =, и по <>; когда группы не складываются в итог, ищите NULL (→ раздел 1, NULL — это не значение)."},
  {"type": "number", "q": "У четырёх клиентов такие доходы (в миллионах). Что вернёт запрос?", "code": "monthly_income: 10, 20, 30, NULL\n\nSELECT AVG(monthly_income) FROM customers;", "answer": 20, "explain": "AVG отбрасывает NULL и усредняет три известных значения; неизвестное он не считает нулём (тогда получилось бы 15) — указывайте количество рядом со средним (→ раздел 1, NULL в агрегатах)."},
  {"type": "single", "q": "Куда в этом результате попадают клиенты с пустым доходом?", "code": "CASE WHEN monthly_income <  5000000 THEN '<5m'\n     WHEN monthly_income < 20000000 THEN '5-20m'\n     ELSE '20m+' END AS income_band", "options": ["В '<5m'", "В '20m+' — любая проверка NULL даёт «неизвестно», поэтому они проваливаются в ELSE", "Они исключаются из результата", "В собственный диапазон NULL"], "answer": 1, "explain": "Поставьте первым WHEN monthly_income IS NULL THEN 'unknown', иначе люди, о которых мы знаем меньше всего, попадут в самый богатый диапазон (→ раздел 1, CASE)."},
  {"type": "multi", "q": "Какие выражения дают ЧИСЛО одобренных заявок?", "options": ["SUM(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END)", "COUNT(CASE WHEN status LIKE 'approved%' THEN 1 END)", "COUNT(CASE WHEN status LIKE 'approved%' THEN 1 ELSE 0 END)", "AVG(CASE WHEN status LIKE 'approved%' THEN 1.0 ELSE 0 END)"], "answer": [0, 1], "explain": "COUNT считает значения, не равные NULL, поэтому вариант с ELSE 0 считает все строки; вариант с AVG — это доля, а не число (→ раздел 1, Сводная таблица через SUM(CASE …))."},
  {"type": "single", "q": "Что не так в этом LEFT JOIN?", "code": "SELECT COUNT(*)\nFROM installments i\nLEFT JOIN payments p ON p.installment_id = i.installment_id\nWHERE p.paid_at <= '2026-10-01';", "options": ["Ничего — он сохраняет каждый платёж по графику", "Проверка в WHERE не проходит на NULL, поэтому каждый платёж без оплаты отбрасывается: LEFT JOIN работает как INNER JOIN", "Он считает оплаты дважды", "Это синтаксическая ошибка"], "answer": 1, "explain": "Фильтр по правой таблице должен стоять в ON (… AND p.paid_at <= '2026-10-01') (→ раздел 1, Условие в ON или в WHERE; P7)."},
  {"type": "single", "q": "Зачем нужен NULLIF в x / NULLIF(y, 0)?", "options": ["Он заменяет NULL на 0", "Он превращает нулевой делитель в NULL, поэтому группа, которую не на что делить, даёт NULL, а не ошибку деления на ноль", "Он удаляет дублирующиеся строки", "Он округляет результат"], "answer": 1, "explain": "NULLIF(a, b) возвращает NULL, когда a = b; у него одна задача — безопасное деление (→ раздел 1, COALESCE, ISNULL / IFNULL, NULLIF)."},
  {"type": "single", "q": "Что делает a.customer_id < b.customer_id в этом самосоединении?", "code": "FROM customers a JOIN customers b\n  ON a.phone = b.phone\n AND a.birth_date = b.birth_date\n AND a.customer_id < b.customer_id", "options": ["Оставляет только более старого клиента", "Оставляет каждую пару один раз и никогда не соединяет строку с самой собой", "Сортирует результат", "Ничего — его можно убрать"], "answer": 1, "explain": "Без него каждая строка совпадёт сама с собой, а каждая пара появится дважды — как (a, b) и (b, a) (→ раздел 1, Самосоединение)."},
  {"type": "single", "q": "Почему в базу FPD30 входят только кредиты, у которых срок первого платежа наступил как минимум за 30 дней до отчётной даты?", "options": ["Чтобы запрос работал быстрее", "У более молодых кредитов ещё не прошли их 30 дней, они бы считались «не FPD» и делали молодые поколения идеальными", "Потому что у новых кредитов нет платежей по графику", "Регуляторы запрещают учитывать недавние кредиты"], "answer": 1, "explain": "У каждого кредита в базе должна быть возможность «провалиться»; забыть про область — классическая ловушка FPD (→ раздел 6, Уголок компании)."}
]}
```

<!-- challenge:start -->

---

## Задача дня :id=daily-challenge

Бонус для любознательных: один более сложный вопрос по теме дня. Решите его и получите XP, растущие вместе с вашей серией задач — полная неделя из пяти добавляет ещё 10 % к ваучеру в пятницу.

```challenge
{"id": "w02d4", "q": "Нилуфар спрашивает, не рискованнее ли на первом платеже клиенты, у которых в базе нет дохода. Используя определение и область FPD30 из Уголка компании (срок первого платежа не позже 2026-09-01), посчитайте ставку FPD30 для кредитов, у клиента которых monthly_income пуст. Процент с точностью до 2 знаков.", "type": "number", "dp": 2, "h": ["c6ee2214fe3286dbca701947"], "hint": "Используйте блок flags из уголка и добавьте одно соединение; вспомните, как пустое значение ведёт себя в сравнении.", "sol": "V0lUSCBmaXJzdF9pbnN0IEFTICgg4oCmdGhlIENvbXBhbnkgY29ybmVyJ3MgYmxvY2vigKYgKSwKZmxhZ3MgQVMgKCDigKZ0aGUgQ29tcGFueSBjb3JuZXIncyBibG9ja+KApiApClNFTEVDVCBDT1VOVCgqKSBBUyBsb2FucywgU1VNKGZsLmZwZDMwKSBBUyBmcGQsCiAgICAgICBST1VORCgxMDAuMCAqIFNVTShmbC5mcGQzMCkgLyBDT1VOVCgqKSwgMikgQVMgZnBkMzBfcGN0CkZST00gZmxhZ3MgZmwKSk9JTiBsb2FucyBsICAgICBPTiBsLmxvYW5faWQgPSBmbC5sb2FuX2lkCkpPSU4gY3VzdG9tZXJzIGMgT04gYy5jdXN0b21lcl9pZCA9IGwuY3VzdG9tZXJfaWQKV0hFUkUgYy5tb250aGx5X2luY29tZSBJUyBOVUxMOwotLSA0MTkgbG9hbnMgaW4gc2NvcGUsIDYgRlBEMzAg4oaSIDEuNDMgJQotLSBTUUwgU2VydmVyOiB0aGUgY29ybmVyJ3MgREFURUFERCAvIERBVEVESUZGIHNwZWxsaW5ncyBpbiB0aGUgQ1RFcywgdGhlIHJlc3QgaWRlbnRpY2FsCldpdGggaW5jb21lIG9uIGZpbGU6IDg1IG9mIDYgNjgwID0gMS4yNyAlLiBUaGUgZ2FwIGlzIGxlc3MgdGhhbiBvbmUgbG9hbiBvdXQgb2YgNDE5IOKAlCBmYXIgaW5zaWRlIHRoZSBub2lzZSBvZiBhIDYtZXZlbnQgZ3JvdXAuIFRoZSBhbnN3ZXIgZm9yIE5pbHVmYXI6IG5vIGV2aWRlbmNlIHRoYXQgYSBtaXNzaW5nIGluY29tZSBwcmVkaWN0cyBmaXJzdC1wYXltZW50IGRlZmF1bHQ7IGxvb2sgYWdhaW4gd2hlbiB0aGUgZ3JvdXAgaGFzIDMwKyBGUERzLiAoV0hFUkUgbW9udGhseV9pbmNvbWUgPSBOVUxMIGZpbmRzIG5vIGxvYW5zIGF0IGFsbC4p"}
```

<!-- challenge:end -->
