# Неделя 2 · День 3 — Строки, числа и даты: чистим данные прямо в запросе

<span class="badge">Теория 60 мин</span> <span class="badge">Детектив 30 мин</span> <span class="badge">Практика 50 мин</span> <span class="badge">Домашнее задание</span> <span class="badge company">Уголок компании</span>

> STORY **Среда, 9:05.** У Севары, руководителя взыскания, две просьбы. *«Первая: моя команда фиксирует каждый платёж, и я хочу знать по каждому, на сколько дней он опоздал, и среднее опоздание по продуктам — мне кажется, что у Micro хуже, чем у Auto, но нужна цифра. Вторая: плитка Тимура „доля платежей картой“ за ночь сдвинулась на 0.3 пункта, и никто ничего не менял.»* Мадина добавляет третье: *«Раз уж вы в датах — Риски считают, что некоторые кредиты были выплачены раньше, чем клиент подал заявку. Найдите их.»*

## Сегодня в трёх строках :id=today-in-3-lines

- **Строки:** `UPPER`/`LOWER`/`TRIM`, `LEN`|`LENGTH`, `LEFT`|`SUBSTR`, `REPLACE`, конкатенация — достаточно, чтобы `Card` и `card` стали одной группой.
- **Числа:** `ROUND`, `CAST` и ловушка целочисленного деления, превращающая 56.55 % в 0.
- **Даты:** извлечь год/месяц, разность в днях, прибавить месяцы, первый день месяца и **правильно** отфильтровать период; вы посчитали **DPD для каждого кредита** и таблицу корзин.

---

## 1. Теория — функции меняют значение на выходе :id=1-learn-functions-change-a-value-on-the-way-out

**Функция** берёт значение из строки и возвращает изменённое значение. В таблице ничего не меняется; меняется результат. Функции работают в `SELECT`, `WHERE`, `GROUP BY`, `ORDER BY` и `HAVING`. В этот день два диалекта различаются сильнее всего, поэтому в каждом примере показаны оба.

### Строки (*string functions*) :id=strings-строковые-функции

| Что делает | SQL Server | SQLite | На наших данных |
|---|---|---|---|
| верхний / нижний регистр | `UPPER(s)`, `LOWER(s)` | то же | `LOWER('CASH ')` → `'cash '` |
| убрать пробелы по краям | `TRIM(s)` (также `LTRIM`, `RTRIM`) | `TRIM(s)` | `TRIM('CASH ')` → `'CASH'` |
| длина | `LEN(s)` (игнорирует пробелы в конце!) | `LENGTH(s)` | `LENGTH('Bobur ')` → 6 |
| первые n символов | `LEFT(s, n)` | `SUBSTR(s, 1, n)` | `SUBSTR(phone, 1, 6)` → `'+99890'` |
| часть с позиции | `SUBSTRING(s, start, n)` | `SUBSTR(s, start, n)` | |
| заменить текст | `REPLACE(s, 'old', 'new')` | то же | `REPLACE(phone, '+998', '8')` |
| склеить тексты | `a + ' ' + b` или `CONCAT(a, ' ', b)` | `a \|\| ' ' \|\| b` | `first_name \|\| ' ' \|\| last_name` |

То, что исправляет вчерашнее P9:

```sql
SELECT LOWER(TRIM(method)) AS method, COUNT(*) AS payments
FROM payments
GROUP BY LOWER(TRIM(method))
ORDER BY payments DESC;
-- card 17621 · payme 8900 · click 8790 · cash 8790 · transfer 8747 · bank transfer 27
```

Шесть строк, а не десять — `Card`→`card`, `CASH `→`cash`, `PayMe`→`payme`, `Click`→`click`. Последний «выброс» — это другое *слово*, поэтому регистр и пробелы тут не помогут: `REPLACE(LOWER(TRIM(method)), 'bank transfer', 'transfer')` → пять строк, transfer 8 774. Оберните выражение один раз и используйте везде; неделя 3 превратит его в представление, чтобы никто не набирал его заново.

Сколько строк было «грязных»? `WHERE method <> LOWER(TRIM(method)) OR method LIKE 'bank%'` → **180** в SQLite. (Сортировка по умолчанию в SQL Server игнорирует регистр и конечные пробелы, поэтому там тот же тест находит только 27 строк `bank transfer`; напишите `method <> LOWER(TRIM(method)) COLLATE Latin1_General_CS_AS`, чтобы получить те же 180.) Небольшое число — но пять фантомных категорий; плитка Тимура сдвинулась потому, что 0.3 % платежей были записаны иначе.

### Числа (*numeric functions*) :id=numbers-числовые-функции

**Целочисленное деление.** Оба движка делят два целых числа *как целые*: `7917 / 14000` → **0**. Уровень одобрения молча становится нулём. Сделайте одну из сторон десятичной — умножьте на `1.0` или `100.0`, либо используйте `CAST`:

```sql
SELECT 7917 / 14000,            -- 0
       7917 * 100 / 14000,      -- 56   (снова целое: отброшено, а не округлено)
       7917 * 100.0 / 14000,    -- 56.55
       ROUND(7917 * 100.0 / 14000, 2);   -- 56.55
-- Вариант для SQL Server: CAST(7917 AS FLOAT) / 14000
```

Правило: ставьте `100.0 *` в *начало* каждого процента. **`ROUND(x, n)`** округляет до n знаков после запятой; `ROUND(x)` — до целого; `ROUND(x, -6)` — до ближайшего миллиона (SQL Server; SQLite округляет до целого — сначала поделите). **`CAST(x AS type)`** преобразует тип: `CAST(AVG(principal) AS INTEGER)` → 51 709 667 — CAST отбрасывает дробную часть, а не округляет (SQL Server: `AS BIGINT`); `CAST(julianday(...) AS INTEGER)` превращает дробные дни SQLite в целые. Для денежных отчётов делите на миллиард и округляйте один раз: `ROUND(SUM(principal) / 1000000000.0, 1)` → SME 241.1 млрд, Auto 84.8, Consumer 65.1, Micro 7.2, BNPL 6.5.

### Даты (*date functions*) :id=dates-функции-дат

SQL Server хранит даты в типе даты; SQLite хранит наши как текст `YYYY-MM-DD` (а `applied_at`, `event_time` — как `YYYY-MM-DD HH:MM:SS`). Текст в таком формате правильно сортируется и сравнивается, поэтому `WHERE applied_at >= '2025-01-01'` из первой недели работал. Для арифметики нужны функции:

| Что делает | SQL Server | SQLite |
|---|---|---|
| год, месяц числами | `YEAR(d)`, `MONTH(d)` | `CAST(strftime('%Y', d) AS INTEGER)`, `strftime('%m', d)` |
| метка «год-месяц» | `FORMAT(d, 'yyyy-MM')` | `strftime('%Y-%m', d)` |
| разность в днях (b − a) | `DATEDIFF(day, a, b)` | `julianday(b) - julianday(a)` |
| прибавить / вычесть время | `DATEADD(month, 1, d)`, `DATEADD(day, -30, d)` | `date(d, '+1 month')`, `date(d, '-30 days')` |
| первый день месяца | `DATEFROMPARTS(YEAR(d), MONTH(d), 1)` | `date(d, 'start of month')` |
| дата из даты-времени | `CAST(dt AS DATE)` | `date(dt)` |
| день недели | `DATENAME(weekday, d)` | `strftime('%w', d)` (0 = воскресенье) — или соединить с `dim_date` |

```sql
-- сколько дней кредиту 1 на отчётную дату?
SELECT DATEDIFF(day, disbursed_at, '2026-10-01') FROM loans WHERE loan_id = 1;                      -- SQL Server
SELECT CAST(julianday('2026-10-01') - julianday(disbursed_at) AS INTEGER) FROM loans WHERE loan_id = 1;  -- SQLite → 552
```

Наша таблица `dim_date` — альтернатива без функций: `JOIN dim_date d ON d.date_key = l.disbursed_at`, а затем `GROUP BY d.year, d.month_name` — одинаково на обоих движках, и она уже знает выходные (2 206 из 7 828 кредитов выданы в субботу или воскресенье — эта синтетическая компания никогда не закрывается).

**Фильтр периода — ловушка, с которой вы столкнулись в B10 первой недели.** Никогда не пишите `BETWEEN '2026-09-01' AND '2026-09-30'` для столбца, в котором может быть время: 23 заявки, поданные 30 сентября после полуночи, потеряются (598 вместо 621). И никогда не пишите `strftime('%Y-%m', applied_at) = '2026-09'` в `WHERE` на большой таблице — функция считается для каждой строки и мешает индексам (неделя 3). Правильная форма — всегда такая:

```sql
WHERE applied_at >= '2026-09-01' AND applied_at < '2026-10-01'     -- полуоткрытый интервал: начало включено, следующий период исключён
```

Она работает для дат, дат-времени, месяцев из 28–31 дня и концов года. Сделайте её привычкой уже сегодня; глава о производительности на неделе 3 скажет вам спасибо.

### Углубление (по желанию) :id=depth-optional

- ▶ Бараа, *String functions* [4:52:58](https://youtu.be/SSKVgrwhzus?t=17578&end=19124), *Numeric* [5:18:44](https://youtu.be/SSKVgrwhzus?t=19124&end=19368), *Date & time* [5:22:48](https://youtu.be/SSKVgrwhzus?t=19368&end=25146) — всего 1 ч 20 мин; везде синтаксис SQL Server, переводите его по таблице выше.
- Русская презентация (TBC Data Analytics 2.0, если она у вас есть) `2.2 SQL-1-38.pdf` — страницы про функции. *Термины по-английски:* строковые функции = string functions, преобразование типов = CAST, целочисленное деление = integer division, разница дат = date difference.

---

## 2. Детектив — кредиты, выплаченные раньше, чем были запрошены (30 мин) :id=2-detective-loans-paid-out-before-they-were-requested-30-min

Подсказка Мадины: *некоторые кредиты были выданы раньше, чем клиент подал заявку.* Это сравнение дат в двух таблицах.

**Шаг 1 — распределение.** Дни от заявки до выдачи по каждому кредиту, с подсчётом:

```sql
-- SQL Server: DATEDIFF(day, CAST(a.applied_at AS DATE), l.disbursed_at)
SELECT CAST(julianday(l.disbursed_at) - julianday(date(a.applied_at)) AS INTEGER) AS days_to_disburse, COUNT(*)
FROM loans l JOIN applications a ON a.application_id = l.application_id
GROUP BY days_to_disburse ORDER BY days_to_disburse;
```

<details><summary>Что вы увидите</summary>

Значения от 0 до 7 включают 7 816 кредитов (0 дней: 925 — канал app выплачивает в тот же день; 3 дня — мода, 1 670). А вверху списка — десять строк с **отрицательными** днями: −29, −26, −24 (два), −23 (два), −20, −18, −17, −15, −12, −6 — по одному-два кредита. Отрицательная разность означает, что кредит выдан *раньше*, чем подана заявка.

</details>

**Шаг 2 — выведите их списком.**

```sql
SELECT l.loan_id, l.application_id, date(a.applied_at) AS applied, a.decided_at, l.disbursed_at,
       CAST(julianday(l.disbursed_at) - julianday(date(a.applied_at)) AS INTEGER) AS days, l.status
FROM loans l JOIN applications a ON a.application_id = l.application_id
WHERE l.disbursed_at < date(a.applied_at)
ORDER BY days;
```

<details><summary>Результат</summary>

**12 кредитов.** Первая строка: кредит 2244 (заявка 3969), заявка подана 2026-09-27, выдан 2026-08-29 — за 29 дней до запроса. Восемь закрыты, четыре активны; выданы они между 2024-12 и 2026-08, все — Micro, Consumer или BNPL. Теперь посмотрите на их графики: первый платёж кредита 1039 приходится на 2025-02-07 — через месяц после **2025-01-07**, а не после записанного 2024-12-20. График строился по настоящей дате выдачи; позже была перезаписана только `disbursed_at` (повторный импорт, неудачная ручная правка). Записка для Тимура: *у 12 кредитов (0.15 %) `disbursed_at` на 6–29 дней раньше `applications.applied_at`; дата первого платежа минус месяц даёт истинную дату — через 0–3 дня после `decided_at`, как у всех остальных кредитов; рекомендуем восстановить `disbursed_at` по графику.* Проверьте также `l.disbursed_at < a.decided_at` — те же 12; больше ничто не было выдано до решения.

</details>

**Шаг 3 — плитка Севары.** Перестройте «долю платежей по способам» с очищенным выражением и сравните с сырым:

<details><summary>Результат</summary>

```sql
SELECT REPLACE(LOWER(TRIM(method)), 'bank transfer', 'transfer') AS method,
       COUNT(*) AS payments, ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM payments), 1) AS share_pct
FROM payments GROUP BY 1 ORDER BY payments DESC;
-- card 17621 (33.3 %) · payme 8900 (16.8) · click 8790 (16.6) · cash 8790 (16.6) · transfer 8774 (16.6)
```
(`(SELECT COUNT(*) FROM payments)` — подзапрос с одним значением, неделя 3; сегодня просто скопируйте его.) Сырое `card` было 17 564 = 33.2 % в SQLite (сортировка SQL Server по умолчанию уже объединяет `Card` с `card`); плитка сдвинулась на 57 строк `Card`. За ночь ничего не изменилось, кроме того, какие строки программа кассира написала с заглавной буквы.

</details>

---

## 3. Практика (50 мин) :id=3-practice-50-min

Пишите каждый запрос в поле под вопросом — он сохраняется в этом браузере; **✔ Проверить** сравнивает ваш результат с ответом. Показывайте оба диалекта там, где они различаются, или укажите, каким пользовались.

**P1.** 18 клиентов, у которых в имени есть пробел в конце, найденные сравнением длины (не через `LIKE`).

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*) FROM customers WHERE LENGTH(first_name) <> LENGTH(TRIM(first_name));   -- 18
-- SQL Server: LEN() игнорирует пробелы в конце, поэтому используйте DATALENGTH(first_name) <> DATALENGTH(TRIM(first_name))
```

</details>

**P2.** Один столбец `full_name` для клиентов 6001–6003, очищенный: с обрезанными пробелами, без учёта регистра первой буквы, фамилия в нижнем регистре для сравнения.

<details><summary>Ответ</summary>

```sql
SELECT customer_id, TRIM(first_name) || ' ' || last_name AS full_name, LOWER(TRIM(first_name)) || ' ' || LOWER(last_name) AS match_key
FROM customers WHERE customer_id BETWEEN 6001 AND 6003;   -- 'MALIKA jalilova' / 'malika jalilova', 'LOLA saidova', 'Bobur rakhimov'
```
`match_key` — это то, по чему группировался поиск дубликатов в прошлый четверг.

</details>

**P3.** Доля процентов в общей сумме к оплате по продуктам, с одним знаком после запятой. У какого продукта 0 % и почему?

<details><summary>Ответ</summary>

```sql
SELECT p.name, ROUND(100.0 * SUM(i.interest_due) / SUM(i.total_due), 1) AS interest_pct
FROM installments i JOIN loans l ON l.loan_id = i.loan_id JOIN products p ON p.product_id = l.product_id
GROUP BY p.name;      -- Auto 29.5 · SME 23.1 · Consumer 17.5 · Micro 9.0 · BNPL 0.0
```
У BNPL `annual_rate = 0` — платит продавец, а не заёмщик. Чем длиннее срок, тем больше доля процентов (Auto — 36 месяцев). Без `100.0` весь столбец будет нулями.

</details>

**P4.** Кредиты, выданные в сентябре 2026 года, — с полуоткрытым фильтром — и то же для заявок, *поданных* в сентябре, с показом ошибки BETWEEN рядом.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*) FROM loans WHERE disbursed_at >= '2026-09-01' AND disbursed_at < '2026-10-01';          -- 361
SELECT COUNT(*) FROM applications WHERE applied_at >= '2026-09-01' AND applied_at < '2026-10-01';       -- 621
SELECT COUNT(*) FROM applications WHERE applied_at BETWEEN '2026-09-01' AND '2026-09-30';               -- 598 (неверно: теряем 23)
```

</details>

**P5.** Средний возраст активных кредитов в днях на отчётную дату, целым числом.

<details><summary>Ответ</summary>

```sql
SELECT ROUND(AVG(julianday('2026-10-01') - julianday(disbursed_at))) FROM loans WHERE status = 'active';   -- 221
-- SQL Server: AVG(DATEDIFF(day, disbursed_at, '2026-10-01'))  (среднее от целых — сначала приведите одну сторону CAST AS FLOAT)
```

</details>

**P6.** Выданные кредиты и сумма по месяцам 2026 года с помощью `dim_date` вместо функции даты — номер месяца, название месяца, число кредитов, сумма.

<details><summary>Ответ</summary>

```sql
SELECT d.month, d.month_name, COUNT(*) AS loans, SUM(l.principal) AS disbursed
FROM loans l JOIN dim_date d ON d.date_key = l.disbursed_at
WHERE d.year = 2026 GROUP BY d.month, d.month_name ORDER BY d.month;
-- Январь 287 / 17.45 млрд … Август 358 / 22.29 млрд, Сентябрь 361 / 17.02 млрд, Октябрь 21 / 0.85 млрд (один день)
```
Те же числа, что во вторничной версии с `strftime`, без разницы между диалектами и с читаемым названием месяца в придачу.

</details>

**P7.** Первая просьба Севары: для каждого платежа — дни опоздания = дата оплаты − срок платежа (`installments` через `installment_id`). Покажите пять самых поздних платежей и общее число опоздавших.

<details><summary>Ответ</summary>

```sql
SELECT p.payment_id, p.loan_id, i.due_date, p.paid_at,
       CAST(julianday(p.paid_at) - julianday(i.due_date) AS INTEGER) AS days_late     -- DATEDIFF(day, i.due_date, p.paid_at)
FROM payments p JOIN installments i ON i.installment_id = p.installment_id
ORDER BY days_late DESC LIMIT 5;                      -- пять платежей ровно по 60 дней
SELECT COUNT(*) FROM payments p JOIN installments i ON i.installment_id = p.installment_id
WHERE p.paid_at > i.due_date;                         -- 6669 из 52875 = 12.6 % с опозданием
```
Отрицательное days_late = оплачено раньше срока (34 649 платежей); 11 557 — в срок; 534 — с опозданием более 30 дней. Максимум — 60: заёмщики в этих данных никогда не платят позже двух месяцев; после этого они перестают платить, поэтому опоздание и DPD — это два разных измерения.

</details>

**P8.** Вторая просьба Севары: среднее опоздание по продуктам — по *всем* платежам и только по *опоздавшим*. Что отвечает на её вопрос?

<details><summary>Ответ</summary>

```sql
SELECT pr.name, COUNT(*) AS payments,
       ROUND(AVG(julianday(p.paid_at) - julianday(i.due_date)), 2) AS avg_days_all,
       ROUND(100.0 * SUM(p.paid_at > i.due_date) / COUNT(*), 1) AS late_pct          -- SQL Server: SUM(IIF(p.paid_at > i.due_date, 1, 0))
FROM payments p JOIN installments i ON i.installment_id = p.installment_id
JOIN loans l ON l.loan_id = p.loan_id JOIN products pr ON pr.product_id = l.product_id
GROUP BY pr.name ORDER BY avg_days_all DESC;
```
Все платежи: Micro **+0.56** дня, SME +0.04, Consumer −0.01, BNPL −0.02, Auto **−0.21**; доля опоздавших: Micro 16.3 %, SME 12.4, Consumer 12.0, BNPL 11.5, Auto 10.1. Только опоздавшие платежи: у каждого продукта в среднем 11.0–11.4 дня — одинаково. Так что ощущение Севары верно насчёт того, *как часто* Micro опаздывает, но не насчёт того, *насколько сильно*: среднее по всем платежам смешивает одно с другим. Показывайте оба столбца и называйте их; «среднее опоздание» само по себе неоднозначно.

</details>

**P9.** По рисковым классам: доля опоздавших платежей и среднее число дней. Упорядочивает ли скоринговая карта классы?

<details><summary>Ответ</summary>

A 5.1 % с опозданием / −0.87 дня · B 9.8 % / −0.31 · C 19.6 % / +1.05 · D 35.6 % / +2.96. Монотонно — класс предсказывает платёжное поведение. Тот же запрос, что в P8, с `GROUP BY l.risk_grade`.

</details>

**P10.** Перепишите вторничный запрос «платежи по способам» с очищенным способом *и* со средним опозданием по способам. Что необычного в 27 строках `bank transfer`?

<details><summary>Ответ</summary>

card −0.03 дня, payme 0.14, click 0.20, cash 0.09, transfer 0.16 — а до объединения один лишь `bank transfer` в среднем давал **2.11** дня: 27 строк с другим написанием — не случайная выборка; их записывает другая исходная система, и позже. Очищать метку правильно; но скажите Тимуру и о том, откуда берутся эти 27.

</details>

<span class="badge stretch">Со звёздочкой</span> **P11.** Восстановите истинную дату выдачи двенадцати «детективных» кредитов по их графику: первая `due_date` минус один месяц. На сколько дней позже `decided_at` она для каждого? Затем проверьте то же правило на *всех* кредитах — сколько не совпадают с `disbursed_at` и почему большинство из них не ошибки?

<details><summary>Ответ</summary>

```sql
SELECT l.loan_id, a.decided_at, l.disbursed_at, i.due_date AS first_due,
       date(i.due_date, '-1 month') AS true_disbursed,                                  -- DATEADD(month, -1, i.due_date)
       CAST(julianday(date(i.due_date, '-1 month')) - julianday(a.decided_at) AS INTEGER) AS lag_days
FROM loans l JOIN applications a ON a.application_id = l.application_id
JOIN installments i ON i.loan_id = l.loan_id AND i.installment_no = 1
WHERE l.disbursed_at < date(a.applied_at) ORDER BY l.loan_id;
```
Лаги 0–3 дня у всех двенадцати (1039 → 2025-01-07, через 2 дня после решения; 2244 → 2026-09-30, через 3 дня) — ровно тот лаг, который показывает каждый обычный кредит. По всем 7 828 кредитам правило `date(first_due, '-1 month') <> disbursed_at` отмечает **166**: 12 настоящих плюс 154 артефакта конца месяца (выдан 2026-01-29 → срок 2026-02-28, а февраль не вернёт 29 января). Правилу для дат нужен допуск; список «неправильных» всегда нужно просматривать глазами.

</details>

---

## 4. Домашнее задание <span class="badge hw">HW 2.2 — срок: День 5</span> :id=4-homework-hw-22-due-day-5

**Отчёт Севары об опозданиях за 2026 год и чистая таблица способов оплаты.** Везде используйте платежи, полученные с 1 января по 30 сентября 2026 года (полуоткрытый фильтр по `paid_at`). Сдайте через поле 📎 ниже:

1. `lateness.sql` + `lateness.md` — (a) дни опоздания по платежам (форма из P7, с `-- result:` с числом опоздавших платежей в 2026 году), (b) по **сегментам** клиентов: платежи, доля опоздавших, среднее число дней по всем платежам, среднее число дней только по опоздавшим — один запрос со всеми четырьмя столбцами, (c) то же по **региону филиала**, (d) три предложения для Севары: какой сегмент опаздывает чаще всего, насколько обычно опаздывает опоздавший платёж и выделяется ли какой-нибудь регион.
2. `methods.sql` — очищенная таблица платежей по способам за 2026 год (пять строк) с количеством, общей суммой и долей в %, плюс число строк 2026 года, которые пришлось чистить, и предложение в одну строку, где должно быть исправление (программа кассира, ETL или справочник способов оплаты).
3. `detective.md` — новое дело с инструментами из раздела 2: **заявки, поданные людьми, которым в день подачи ещё не было 18 лет** (соедините `applications` с `customers`; сравните `date(c.birth_date, '+18 years')` с `date(a.applied_at)` — в SQL Server `DATEADD(year, 18, c.birth_date)` и `CAST(a.applied_at AS DATE)`). Сколько заявок, сколько клиентов, сколько из них стали кредитами — с разбивкой на «родились после дня подачи» и «действительно моложе 18». Таблица случаев и строка-записка для Тимура: что это говорит о данных и о процессе одобрения.

Оценивается: (a) числа совпадают с нашими с точностью до округления, (b) оба диалекта либо чёткая пометка «SQLite»/«SQL Server» в заголовке, (c) три предложения отвечают на настоящий вопрос Севары — частота против тяжести.

### 📎 Сдайте здесь :id=hand-in-here

```sqltask
{"check": "handin-W2D3", "lesson": "W2D3", "title": "HW 2.2", "tasks": [{"id": "lateness.sql", "file": "lateness.sql", "text": true, "minLines": 3, "q": "Напишите здесь `lateness.sql` — то, что требуется на странице выше."}, {"id": "methods.sql", "file": "methods.sql", "text": true, "minLines": 3, "q": "Напишите здесь `methods.sql` — то, что требуется на странице выше."}, {"id": "detective.md", "file": "detective.md", "text": true, "minLines": 3, "q": "Напишите здесь `detective.md` — то, что требуется на странице выше."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Всё остальное, что перечислено на странице (ещё один файл или .zip из нескольких)."}]}
```

---

## 5. Самопроверка :id=5-self-check

1. Почему `7917 / 14000` возвращает 0 и какое исправление в один символ? *(→ раздел 1, «Числа»)*
2. Напишите правильный фильтр для «платежей, полученных в феврале 2026 года», без BETWEEN. *(→ раздел 1, «Фильтр периода»)*
3. Севара просит «среднее опоздание по продуктам». Назовите два разных числа, которые может означать эта фраза. *(→ P8)*

---

## 6. Уголок компании <span class="badge company">DPD в расчёте</span> :id=6-company-corner-dpd-computed

В День 3 первой недели вы получили определение и числа 413 и 14 / 124 / 25 / 16 / 234, чтобы их *прочитать*. Сегодня вы их получаете сами.

**DPD (days past due, дни просрочки) кредита на дату** = число дней с момента срока его **самого старого не полностью оплаченного платежа**. Три шага, каждый — инструмент этой недели:

1. **Сколько оплачено по каждому платежу?** `installments LEFT JOIN payments`, группировка по платежу, суммирование платежей (LEFT, чтобы неоплаченные платежи остались, с 0). Оставьте только наступившие платежи (`due_date <= отчётная дата`) — и только те, где *оплачено < к оплате*. Это условие на агрегат → `HAVING`.
2. **По каждому кредиту — самый старый такой платёж:** `MIN(due_date)` с группировкой по кредиту.
3. **Дни:** отчётная дата минус эта дата.

Шаги 1 и 2 — это две группировки подряд, для их цепочки нужен CTE (`WITH … AS (…)`) с недели 3. Читайте это как два именованных результата; на следующей неделе вы сами напишете такую форму.

```sql
WITH unpaid AS (                                   -- шаг 1: наступившие платежи, не оплаченные полностью
  SELECT i.installment_id, i.loan_id, i.due_date, i.total_due,
         COALESCE(SUM(p.amount), 0) AS paid        -- COALESCE: NULL (нет платежа) → 0; День 4
  FROM installments i
  LEFT JOIN payments p ON p.installment_id = i.installment_id
  WHERE i.due_date <= '2026-10-01'
  GROUP BY i.installment_id, i.loan_id, i.due_date, i.total_due
  HAVING COALESCE(SUM(p.amount), 0) < i.total_due
),
dpd AS (                                           -- шаги 2 + 3: самый старый неоплаченный по кредиту, в днях
  SELECT loan_id,
         MIN(due_date) AS oldest_unpaid_due,
         CAST(julianday('2026-10-01') - julianday(MIN(due_date)) AS INTEGER) AS dpd,   -- DATEDIFF(day, MIN(due_date), '2026-10-01')
         COUNT(*) AS unpaid_instalments,
         SUM(total_due - paid) AS overdue_amount
  FROM unpaid GROUP BY loan_id
)
SELECT * FROM dpd ORDER BY dpd DESC;
```

**413 строк** — кредиты хотя бы с одним наступившим не полностью оплаченным платежом. Сверху: кредит 2167, самый старый неоплаченный срок 2024-03-26, **919 DPD**, 6 неоплаченных платежей, списан. Кредитов, которых нет в результате, DPD равен 0 (просрочки нет) — кредит 1 один из них: его мартовский платёж с опозданием на 45 дней оплачен, поэтому просрочки по нему сегодня нет.

**Корзины** требуют `CASE` — *инструмент завтрашнего дня: прочитайте сегодня, напишете завтра.* Замените последнюю строку на:

```sql
SELECT CASE WHEN dpd = 0  THEN '0'
            WHEN dpd <= 30 THEN '1-30'
            WHEN dpd <= 60 THEN '31-60'
            WHEN dpd <= 90 THEN '61-90'
            ELSE '90+' END AS bucket,
       COUNT(*) AS loans, SUM(overdue_amount) AS overdue
FROM dpd GROUP BY bucket ORDER BY MIN(dpd);
```

| bucket | loans | overdue (UZS) | кто в корзине |
|---|---|---|---|
| 0 | 14 | 53 018 776 | платежи со сроком *сегодня* (2026-10-01), не оплаченные на утро — ещё не просрочены |
| 1–30 | 124 | 499 314 822 | 111 активных кредитов, 13 «закрытых» (см. ниже) |
| 31–60 | 25 | 74 348 104 | 24 активных, 1 закрытый |
| 61–90 | 16 | 109 375 982 | все активные — список визитов Севары |
| 90+ | 234 | 6 863 031 110 | ровно 44 кредита `default` + 190 `written_off` |

Те же числа, что напечатала страница первой недели: **14 / 124 / 25 / 16 / 234**; 399 кредитов с DPD > 0. Корзина 90+ совпадает со столбцом статуса до единого кредита — первая проверка любого отчёта по портфелю, и она пройдена. Две вещи, которые показывает расчёт, а столбец статуса — нет:

- **Частичные платежи важны.** У 427 из 1 784 неоплаченных платежей *есть* какая-то оплата. Если считать только платежи вообще *без* оплаты (вчерашнее более простое анти-соединение), корзины станут 13 / 127 / 24 / 18 / **217**: семнадцать дефолтных или списанных кредитов, по неоплаченным платежам которых внесли символическую сумму, исчезли бы из 90+. «Не оплачено полностью» — это и есть определение; оставьте `HAVING paid < due`.
- **У пятнадцати «закрытых» кредитов есть неоплаченный наступивший платёж** (13 в 1–30, 1 в 31–60, 1 при DPD 0) — и это ровно те 15 закрытых кредитов, у которых `closed_at` равен NULL. Система закрыла их потому, что закончился график, а не потому, что поступили деньги. Находка для Тимура; в пятницу об этом спросят.

Ещё два числа получаются из того же результата `dpd`. **PAR30** (portfolio at risk, портфель под риском) = остаток долга по кредитам с DPD > 30 ÷ весь остаток долга: 6.51 млрд / 208.72 млрд = **3.1 %**. А средний DPD 151 *активного* просроченного кредита — 22.7 дня (макс. 89): живой портфель команды взыскания молод; старый долг уже списан.

> Вопрос для собеседования: *«Как бы вы посчитали DPD в SQL?»* — По каждому платежу, оплачено против к оплате через LEFT JOIN payments с HAVING paid < due; по каждому кредиту — MIN(due_date) таких платежей; DPD = отчётная дата − эта дата; корзины через CASE; проверить, что 90+ совпадает со статусами default/written-off; сказать, как учитываются частичные платежи.

Завтра: NULL (`COALESCE` выше), CASE по-настоящему и соединения, которые находят то, чего *не хватает*.

---

## Тест дня :id=day-quiz

Для завершения дня нужно набрать 80 %. Пересдавать можно сколько угодно.

```quiz
{"id": "w02d3", "pass": 0.8, "questions": [
  {"type": "single", "q": "Что вернёт этот запрос — одинаково и в SQL Server, и в SQLite?", "code": "SELECT 7917 / 14000;", "options": ["0.5655", "0", "56.55", "Ошибку"], "answer": 1, "explain": "Два целых числа делятся как целые, поэтому дробная часть отбрасывается; ставьте 100.0 * в начало каждого процента (→ раздел 1, Числа)."},
  {"type": "number", "q": "А что вернёт этот?", "code": "SELECT 7917 * 100 / 14000;", "answer": 56, "explain": "Всё ещё целочисленное деление: 791 700 / 14 000 = 56.55, усечённое (не округлённое) до 56; с 100.0 получится 56.55 (→ раздел 1, Числа)."},
  {"type": "single", "q": "Какой фильтр верен для «платежей, полученных в феврале 2026 года»?", "options": ["WHERE paid_at BETWEEN '2026-02-01' AND '2026-02-28'", "WHERE paid_at >= '2026-02-01' AND paid_at < '2026-03-01'", "WHERE MONTH(paid_at) = 2", "WHERE paid_at < '2026-02-28'"], "answer": 1, "explain": "Полуоткрытый интервал: начало включено, следующий период исключён — безопасно для дат, дат-времени и месяца любой длины; MONTH() = 2 захватит февраль каждого года (→ раздел 1, Фильтр периода)."},
  {"type": "multi", "q": "GROUP BY LOWER(TRIM(method)) — какие сырые значения попадут в одну группу?", "options": ["'Card' с 'card'", "'CASH ' с 'cash'", "'PayMe' с 'payme'", "'bank transfer' с 'transfer'"], "answer": [0, 1, 2], "explain": "Регистр и пробелы по краям исправляют LOWER и TRIM; другое слово требует REPLACE (→ раздел 1, Строки)."},
  {"type": "single", "q": "В SQL Server этот запрос не находит ни одного клиента, хотя у 18 имён есть пробел в конце. Почему?", "code": "SELECT COUNT(*) FROM customers\nWHERE LEN(first_name) <> LEN(TRIM(first_name));", "options": ["TRIM не существует в SQL Server", "LEN игнорирует пробелы в конце, поэтому обе части равны; сравнивайте DATALENGTH", "Имена равны NULL", "<> не работает с числами"], "answer": 1, "explain": "LENGTH в SQLite считает пробел, а LEN в SQL Server — нет (→ раздел 1, Строки; P1)."},
  {"type": "single", "q": "Как найти кредиты, выплаченные раньше, чем клиент подал заявку?", "options": ["WHERE disbursed_at < applied_at только по таблице loans", "Соединить loans с applications по application_id и оставить l.disbursed_at < date(a.applied_at)", "Соединить loans с customers и сравнить с registered_at", "Отсортировать loans по disbursed_at и посмотреть на первые строки"], "answer": 1, "explain": "applied_at лежит в applications, значит, это сравнение дат в двух таблицах, соединённых по ключу (→ раздел 2, Детектив)."},
  {"type": "single", "q": "Севара просит «среднее опоздание по продуктам». Какая пара чисел делает этот вопрос честным?", "options": ["Средний основной долг и средний срок", "Доля платежей с опозданием (как часто) и среднее число дней у опоздавших платежей (насколько сильно)", "Сумма дней опоздания и число продуктов", "Максимум и минимум дней опоздания"], "answer": 1, "explain": "Среднее по всем платежам смешивает частоту с тяжестью; показывайте оба числа и называйте их (→ P8)."},
  {"type": "single", "q": "Почему в запросе для DPD условие — HAVING COALESCE(SUM(p.amount), 0) < i.total_due, а не «платежи вообще без оплаты»?", "options": ["Так быстрее", "Частично оплаченный платёж всё равно просрочен; если считать только полностью неоплаченные, кредиты выпадут из корзины 90+", "COALESCE удаляет дубликаты платежей", "HAVING обязателен всякий раз, когда используется JOIN"], "answer": 1, "explain": "По определению берётся самый старый не полностью оплаченный платёж; символические платежи иначе скрыли бы кредиты в дефолте (→ раздел 6, Уголок компании)."}
]}
```

<!-- challenge:start -->

---

## Задача дня :id=daily-challenge

Бонус для любознательных: один более сложный вопрос по теме дня. Решите его и получите XP, растущие вместе с вашей серией задач — полная неделя из пяти добавляет ещё 10 % к ваучеру в пятницу.

```challenge
{"id": "w02d3", "q": "Севара хочет узнать, приходят ли банковские переводы позже, чем платежи другими способами. Возьмите платежи, полученные с 1 января по 30 сентября 2026 года, очистите способ оплаты (trim, нижний регистр, 'bank transfer' → 'transfer'), оставьте очищенные строки 'transfer' и посчитайте долю платежей, оплаченных более чем через 7 дней после срока платежа. Процент с точностью до 2 знаков.", "type": "number", "dp": 2, "h": ["e0b2149f10af3b0bcbee4f88"], "hint": "Срок платежа лежит в другой таблице, а ещё проверьте, что делает ваш движок при делении одного целого числа на другое.", "sol": "LS0gU1FMaXRlClNFTEVDVCBDT1VOVCgqKSBBUyBwYXltZW50cywKICAgICAgIFNVTShqdWxpYW5kYXkocC5wYWlkX2F0KSAtIGp1bGlhbmRheShpLmR1ZV9kYXRlKSA+IDcpIEFTIGxhdGVfb3Zlcl83LAogICAgICAgUk9VTkQoMTAwLjAgKiBTVU0oanVsaWFuZGF5KHAucGFpZF9hdCkgLSBqdWxpYW5kYXkoaS5kdWVfZGF0ZSkgPiA3KSAvIENPVU5UKCopLCAyKSBBUyBwY3QKRlJPTSBwYXltZW50cyBwCkpPSU4gaW5zdGFsbG1lbnRzIGkgT04gaS5pbnN0YWxsbWVudF9pZCA9IHAuaW5zdGFsbG1lbnRfaWQKV0hFUkUgcC5wYWlkX2F0ID49ICcyMDI2LTAxLTAxJyBBTkQgcC5wYWlkX2F0IDwgJzIwMjYtMTAtMDEnCiAgQU5EIFJFUExBQ0UoTE9XRVIoVFJJTShwLm1ldGhvZCkpLCAnYmFuayB0cmFuc2ZlcicsICd0cmFuc2ZlcicpID0gJ3RyYW5zZmVyJzsKLS0gU1FMIFNlcnZlcjogU1VNKElJRihEQVRFRElGRihkYXksIGkuZHVlX2RhdGUsIHAucGFpZF9hdCkgPiA3LCAxLCAwKSkgZm9yIHRoZSBjb3VudCwgdGhlbiAxMDAuMCAqIHRoYXQgLyBDT1VOVCgqKQotLSA0IDE1NiBwYXltZW50cywgMTg3IG1vcmUgdGhhbiA3IGRheXMgbGF0ZSDihpIgNC41MCAlCk9uIHRoZSByYXcgc3BlbGxpbmcgKG1ldGhvZCA9ICd0cmFuc2Zlcicgb25seSkgeW91IGdldCAxODUgb2YgNCAxNDIgPSA0LjQ3ICU6IHRoZSAxNCAnYmFuayB0cmFuc2Zlcicgcm93cyBvZiAyMDI2IHBheSBsYXRlciB0aGFuIGF2ZXJhZ2UsIHNvIHRoZSBjbGVhbmluZyBtb3ZlcyB0aGUgbnVtYmVyLiBDYXJkIHNpdHMgYXQgNC4wMiAlIGFuZCBwYXltZSBhdCA0LjkwICUsIHNvIHRyYW5zZmVycyBhcmUgaW4gdGhlIG1pZGRsZSDigJQgdGhlIHBheW1lbnQgbWV0aG9kIGlzIG5vdCBTZXZhcmEncyBsYXRlbmVzcyBwcm9ibGVtLiAoVGhlIDI1IGR1cGxpY2F0ZSBwYXltZW50cyBhcmUgc3RpbGwgaW4gdGhlIHRhYmxlOyB3ZWVrIDMgcmVtb3ZlcyB0aGVtLik="}
```

<!-- challenge:end -->
