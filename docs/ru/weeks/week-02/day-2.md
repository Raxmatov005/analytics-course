# Неделя 2 · День 2 — Считаем и суммируем: портфель в цифрах

<span class="badge">Теория 60 мин</span> <span class="badge">Практика 60 мин</span> <span class="badge company">Уголок компании</span>

> STORY **Вторник, 8:50.** Мадина кладёт вам на стол распечатанный слайд: таблица из пяти строк-продуктов и двенадцати столбцов-месяцев, половина ячеек зачёркнута красной ручкой. *«Октябрьский пакет для совета. Обычно Тимур собирает его из хранилища, но хранилище загрузилось первого числа, а совет хочет сентябрьские цифры, пересчитанные по продуктам, по филиалам и по месяцам — число кредитов и выданная сумма — сегодня. Вчера вы соединяли таблицы. Сегодня вы их складываете. И, пожалуйста, без Excel.»*

## Сегодня в трёх строках :id=today-in-3-lines

- Вы умеете пользоваться пятью **агрегатами** (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) вместе с **GROUP BY** по одному или нескольким столбцам, фильтровать группы через **HAVING** и сортировать по агрегату.
- Вы знаете разницу между **COUNT(\*)** и **COUNT(DISTINCT …)** и понимаете, почему агрегат после соединения «один-ко-многим» даёт неверное — и правдоподобное — число.
- Вы можете получить **выдачи по месяцам и продуктам**, **средний чек** и **уровень одобрения по каналам** — по одному запросу на каждое.

---

## 1. Теория — сворачиваем строки в числа :id=1-learn-collapsing-rows-into-numbers

### Пять агрегатов :id=the-five-aggregates

**Агрегатная функция** (*aggregate function*) берёт столбец по многим строкам и возвращает одно значение:

```sql
SELECT COUNT(*)        AS loans,          -- 7828
       SUM(principal)  AS disbursed,      -- 404 783 280 000
       AVG(principal)  AS avg_ticket,     -- 51 709 667.86
       MIN(principal)  AS smallest,       -- 300 000
       MAX(principal)  AS largest         -- 599 060 000
FROM loans;
```

На выходе одна строка. `COUNT(*)` считает строки; `COUNT(столбец)` считает строки, где этот столбец не NULL (в День 4 это станет важным). Добавьте `WHERE` — и агрегаты считаются только по отфильтрованным строкам: `WHERE status = 'active'` → 3 352 кредита, выдано 296 980 040 000.

> 💡 **Главное.** Агрегат превращает много строк в одно число. `COUNT(*)` считает строки, `COUNT(столбец)` — значения, которые не NULL, `COUNT(DISTINCT столбец)` — различные значения. Это три разных вопроса.

### GROUP BY — одно число на группу :id=group-by-one-number-per-group

Чтобы получить те же числа *по каждому продукту*, назовите столбец, по которому нужна одна строка:

```sql
SELECT p.name, COUNT(*) AS loans, SUM(l.principal) AS disbursed, AVG(l.principal) AS avg_ticket
FROM loans l
JOIN products p ON p.product_id = l.product_id
GROUP BY p.name
ORDER BY disbursed DESC;
```

| name | loans | disbursed | avg_ticket |
|---|---|---|---|
| Small business loan | 781 | 241 117 150 000 | 308 728 745 |
| Auto loan | 391 | 84 791 530 000 | 216 858 133 |
| Consumer loan | 2 418 | 65 109 280 000 | 26 926 915 |
| Micro loan | 2 669 | 7 221 210 000 | 2 705 586 |
| Buy now pay later | 1 569 | 6 544 110 000 | 4 170 880 |

Правило, из-за которого возникает большинство ошибок новичков: **каждый столбец в `SELECT` либо стоит внутри агрегата, либо указан в `GROUP BY`.**

> ⚠️ **Осторожно.** `SELECT p.name, l.loan_id, COUNT(*) … GROUP BY p.name` — ошибка в SQL Server («not contained in an aggregate function or the GROUP BY clause») — какой loan_id он показал бы для группы из 781 кредита? SQLite молча выберет какой-нибудь и выполнит запрос; никогда на это не полагайтесь.

Группируйте по **нескольким столбцам**, чтобы получить одну строку на каждую комбинацию: `GROUP BY b.region, p.name` → регион × продукт. Месяц даты — это функция от даты (тема среды), но нужен он уже сегодня, поэтому вот он для обоих диалектов; скопируйте как есть:

```sql
-- SQL Server:  FORMAT(l.disbursed_at, 'yyyy-MM')      SQLite:  strftime('%Y-%m', l.disbursed_at)
SELECT strftime('%Y-%m', l.disbursed_at) AS month, p.name, COUNT(*) AS loans, SUM(l.principal) AS disbursed
FROM loans l JOIN products p ON p.product_id = l.product_id
WHERE l.disbursed_at >= '2026-01-01'
GROUP BY strftime('%Y-%m', l.disbursed_at), p.name
ORDER BY month, disbursed DESC;
```

SQL Server не позволяет писать в `GROUP BY` псевдоним `month`; повторите выражение (SQLite принимает оба варианта). `ORDER BY` *может* использовать псевдонимы везде, а также сортировать по агрегату: `ORDER BY COUNT(*) DESC`.

### HAVING vs WHERE :id=having-vs-where

`WHERE` фильтрует **строки до** группировки; `HAVING` фильтрует **группы после** агрегации. Написать `WHERE COUNT(*) > 900` нельзя — когда выполняется WHERE, никакого счёта ещё нет.

```sql
SELECT b.branch_name, COUNT(*) AS active_loans
FROM loans l JOIN branches b ON b.branch_id = l.branch_id
WHERE l.status = 'active'            -- оставляем только активные кредиты (строки)
GROUP BY b.branch_name
HAVING COUNT(*) > 300                -- оставляем только филиалы, где их больше 300 (группы)
ORDER BY active_loans DESC;          -- 6 филиалов: Tashkent Central 435 … Andijan Central 334
```

Порядок выполнения, который стоит держать в голове: `FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY`. Поэтому `WHERE` не видит ни псевдонимов, ни агрегатов, а `HAVING` — видит.

> 💡 **Главное.** Условие на столбец ставится в `WHERE` (строки, до группировки); условие на агрегат — в `HAVING` (группы, после группировки). «Активные кредиты, филиалы, где их больше 300» требует обоих.

Расставьте три предложения по пропускам сами:

```game
{"id": "w02d2-g1", "type": "cloze", "title": "WHERE, GROUP BY или HAVING?", "text": "SELECT b.branch_name, COUNT(*) AS active_loans FROM loans l JOIN branches b ON b.branch_id = l.branch_id {{0}} l.status = 'active' {{1}} b.branch_name {{2}} COUNT(*) > 300 ORDER BY active_loans DESC;", "blanks": [["WHERE"], ["GROUP BY"], ["HAVING"]], "distractors": ["ORDER BY", "SUM", "DISTINCT"]}
```

А теперь порядок, в котором база на самом деле выполняет запрос:

```game
{"id": "w02d2-g2", "type": "order", "title": "Порядок выполнения запроса", "items": ["FROM", "JOIN", "WHERE", "GROUP BY", "HAVING", "SELECT", "ORDER BY"]}
```

### COUNT(DISTINCT) :id=countdistinct

`COUNT(*)` считает строки группы; `COUNT(DISTINCT l.customer_id)` считает различных клиентов в ней:

```sql
SELECT p.name, COUNT(*) AS loans, COUNT(DISTINCT l.customer_id) AS customers
FROM loans l JOIN products p ON p.product_id = l.product_id
GROUP BY p.name ORDER BY loans DESC;
-- Micro 2669 кредитов / 2133 клиента · Consumer 2418 / 2000 · BNPL 1569 / 1364 · SME 781 / 724 · Auto 391 / 381
```

Заёмщики Micro возвращаются: 2 669 кредитов на 2 133 человека. Сообщайте *кредиты*, когда имеете в виду кредиты, и *клиентов*, когда имеете в виду людей — случай с сорока клиентами в прошлый четверг был именно путаницей такого рода.

### Агрегаты после соединения — ловушка умножения :id=aggregates-after-a-join-the-multiplication-trap

Вчера: в `loans JOIN installments` 92 193 строки, каждый кредит повторяется по разу на платёж. Просуммируйте по ним столбец *кредита* — и каждый основной долг будет посчитан столько раз, сколько платежей в сроке кредита:

```sql
SELECT p.name, SUM(l.principal)
FROM loans l JOIN installments i ON i.loan_id = l.loan_id
JOIN products p ON p.product_id = l.product_id
GROUP BY p.name;                     -- SME 5 862 295 560 000 — в 24 раза больше, и никто не моргнёт
```

Число неверно в среднее число сроков раз, а оно различается по продуктам, поэтому может измениться даже *рейтинг*. Правило: **агрегируйте столбец на зерне его собственной таблицы.** Суммы кредитов — по `loans`; суммы платежей — по `installments`; если нужно и то и другое в одном результате, агрегируйте каждую таблицу отдельно и соединяйте результаты — инструмент для этого даст неделя 3 (подзапросы и CTE).

> ⚠️ **Осторожно.** Когда запрос соединяет таблицу «один-ко-многим», сначала запустите рядом `COUNT(*)` и `COUNT(DISTINCT l.loan_id)`. Если они различаются, соединение размножило кредиты — не делайте по нему `SUM` или `AVG` по столбцу кредита.

### Операции над множествами — складываем результаты стопкой :id=set-operators-stacking-results

Соединения ставят таблицы рядом; **операции над множествами** (*set operators*) кладут результаты запросов друг на друга. Оба запроса должны вернуть одинаковое число столбцов совместимых типов.

| Оператор | Что оставляет | Пример на наших данных |
|---|---|---|
| `UNION` | все строки обоих, **дубликаты убираются** | `SELECT customer_id FROM loans UNION SELECT customer_id FROM applications` → 5 453 строки (= различные заявители; каждый заёмщик подавал заявку) |
| `UNION ALL` | все строки обоих, дубликаты сохраняются (быстро) | то же с `UNION ALL` → 21 828 строк (7 828 + 14 000) |
| `EXCEPT` | строки первого запроса, которых нет во втором | `SELECT customer_id FROM applications EXCEPT SELECT customer_id FROM loans` → 1 118 человек, которые подавали заявку и ни разу не получили кредит |
| `INTERSECT` | строки, которые есть в обоих | заявители, которые тоже заёмщики → 4 335 |

`UNION` — способ сложить блоки «этот месяц» и «прошлый месяц» в одну таблицу для графика; `EXCEPT` — это анти-соединение, записанное через множества.

> 💡 **Главное.** По умолчанию пишите `UNION ALL`. `UNION` должен сортировать, чтобы удалить повторы, и тихо сливает строки, которые законно одинаковы, — два месяца с одинаковым числом превращаются в одну строку.

### Углубление (по желанию) :id=depth-optional

- ▶ Бараа, *Aggregate functions* [8:43:36](https://youtu.be/SSKVgrwhzus?t=31416&end=31811) — 7 мин; и *Set operators* [4:02:09](https://youtu.be/SSKVgrwhzus?t=14529&end=17261) — 40 мин.
- Русская презентация (TBC Data Analytics 2.0, если она у вас есть) `2.2 SQL-1-38.pdf` — страницы про GROUP BY / HAVING. *Термины по-английски:* агрегатная функция = aggregate, группировка = GROUP BY, средний чек = average ticket, объединение = UNION.

```videoquiz
{"video": "SSKVgrwhzus", "stops": [
  {"at": 15100, "q": "Два запроса складываются через UNION. Какому правилу они должны подчиняться?", "options": ["Одинаковое число строк", "Одинаковое число столбцов совместимых типов", "Одна и та же таблица во FROM", "ORDER BY в каждом запросе"], "answer": 1, "explain": "Операции над множествами кладут результаты строка под строкой, поэтому столбцы должны совпадать; число строк может быть любым.", "back": 60},
  {"at": 15900, "q": "Чем UNION отличается от UNION ALL?", "options": ["UNION ALL убирает дубликаты, UNION сохраняет", "UNION убирает повторяющиеся строки, UNION ALL сохраняет все", "UNION работает только с двумя таблицами, UNION ALL — с многими", "Ничем"], "answer": 1, "explain": "UNION убирает дубликаты (и для этого должен сортировать); UNION ALL оставляет всё и работает быстрее — это выбор по умолчанию, если не нужно убирать повторы.", "back": 60},
  {"at": 16800, "q": "Какой оператор возвращает строки первого запроса, которых нет во втором?", "options": ["INTERSECT", "UNION", "EXCEPT", "UNION ALL"], "answer": 2, "explain": "EXCEPT — это анти-соединение, записанное через множества: заявители EXCEPT заёмщики = 1 118 человек, так и не получивших кредит.", "back": 60},
  {"at": 31600, "q": "Что возвращает агрегатная функция вроде SUM или AVG по набору строк?", "options": ["Одно значение на весь набор (или на каждую группу)", "Одно значение на строку", "Отсортированные строки", "Только строки, где нет NULL"], "answer": 0, "explain": "Агрегаты сворачивают много строк в одно число; с GROUP BY — в одно число на группу.", "back": 60}]}
```

---

## 2. Разобранный пример — таблица для совета :id=2-worked-example-the-board-pack-table

**Задача (Мадина):** *число кредитов и выданная сумма в 2026 году по месяцам и продуктам.*

1. *Зерно ответа:* одна строка на (месяц, продукт). *Зерно источника:* `loans` — один кредит на строку, поэтому `COUNT(*)` и `SUM(principal)` безопасны. Платежи по графику не нужны. Хорошо.
2. *Какие таблицы?* `loans` — для дат и сумм, `products` — для названия; связь «многие к одному», умножения нет.
3. *Фильтр периода:* `disbursed_at >= '2026-01-01'` (и `< '2027-01-01'`, если бы данные могли идти дальше; наши заканчиваются 2026-10-01).
4. Запрос: запрос «месяц × продукт» из раздела 1. Первые строки результата:

| month | product | loans | disbursed |
|---|---|---|---|
| 2026-01 | Small business loan | 34 | 10 042 990 000 |
| 2026-01 | Auto loan | 20 | 4 620 560 000 |
| 2026-01 | Consumer loan | 90 | 2 337 660 000 |
| 2026-01 | Micro loan | 99 | 262 110 000 |
| 2026-01 | Buy now pay later | 44 | 189 050 000 |
| 2026-02 | Small business loan | 21 | 6 035 880 000 |
| … | | | |

50 строк (10 месяцев × 5 продуктов; в октябре один день). Это **длинный формат** (*long format*) — одна строка на ячейку слайда Мадины. Её слайд — **широкий** формат (месяцы по горизонтали). Превращение длинного в широкий — это четверговый `SUM(CASE …)` или, на практике, сводная таблица в Excel/Power BI поверх именно этого результата. Отдавайте длинную таблицу; она правильная.

5. Проверка на здравый смысл по итогу из одного столбца: `SELECT COUNT(*), SUM(principal) FROM loans WHERE disbursed_at >= '2026-01-01'` → 3 051 кредит, 162 333 060 000. 50 строк должны давать в сумме это. Так и есть.

---

## 3. Практика (60 мин) :id=3-practice-60-min

Под вопросами, ответ на которые — запрос, есть поле: напишите запрос, нажмите **▶ Выполнить**, затем **✔ Проверить** — сайт сравнит ваш результат с ответом, не показывая его; запрос сохраняется в этом браузере. У вопросов, где нужно число или объяснение, есть своё поле для ответа. Вчерашние соединения плюс сегодняшние агрегаты; пока без `CASE`. Панель **«База данных»** (кнопка справа внизу) показывает все таблицы и столбцы.

**P1.** Число кредитов и общий основной долг по `status`, сначала с наибольшей суммой.

<details><summary>Ответ</summary>

```sql
SELECT status, COUNT(*) AS loans, SUM(principal) AS principal
FROM loans GROUP BY status ORDER BY principal DESC;
```
active 3 352 / 296.98 млрд · closed 4 242 / 94.15 млрд · written_off 190 / 10.02 млрд · default 44 / 3.63 млрд. Закрытых кредитов больше, но они мельче — короткие кредиты Micro и BNPL закрываются быстро.

</details>

**P2.** Кредиты, выданные за каждый год, с общей суммой и средним чеком, округлённым до целых сумов (`ROUND(x)` округляет до целого; подробно — в среду).

<details><summary>Ответ</summary>

```sql
-- SQL Server: YEAR(disbursed_at)          SQLite: strftime('%Y', disbursed_at)
SELECT strftime('%Y', disbursed_at) AS yr, COUNT(*) AS loans, SUM(principal) AS disbursed, ROUND(AVG(principal)) AS avg_ticket
FROM loans GROUP BY strftime('%Y', disbursed_at) ORDER BY yr;
```
2024: 1 736 кредитов, 86.52 млрд · 2025: 3 041, 155.93 млрд · 2026 (до 1 октября): 3 051, 162.33 млрд. Девять месяцев 2026 года уже превзошли весь 2025.

</details>

**P3.** Кредиты по филиалам (название и регион) с суммой основного долга, сначала где больше денег. Какой филиал выдаёт больше всех?

<details><summary>Ответ</summary>

```sql
SELECT b.branch_name, b.region, COUNT(*) AS loans, SUM(l.principal) AS disbursed
FROM loans l JOIN branches b ON b.branch_id = l.branch_id
GROUP BY b.branch_name, b.region ORDER BY disbursed DESC;
```
Первым идёт Tashkent Central — 1 001 кредит / 55.64 млрд, хотя у Tashkent South кредитов больше (1 012 / 53.36 млрд). Последним — Termez Central: 483 / 22.99 млрд. По количеству и по сумме рейтинги различаются — говорите, по чему сортировали.

</details>

**P4.** Филиалы, где больше 900 кредитов, сначала самые крупные.

<details><summary>Ответ</summary>

```sql
SELECT b.branch_name, COUNT(*) FROM loans l JOIN branches b ON b.branch_id = l.branch_id
GROUP BY b.branch_name HAVING COUNT(*) > 900 ORDER BY 2 DESC;
-- Tashkent South 1012, Tashkent North 1007, Tashkent Central 1001, Fergana Central 906
```
Условие на агрегат → `HAVING`. Если написать его в `WHERE`, будет синтаксическая ошибка — а это ещё добрый исход: она хотя бы видна сразу.

</details>

**P5.** Продукты, у которых средний чек превышает 50 000 000.

<details><summary>Ответ</summary>

```sql
SELECT p.name, AVG(l.principal) FROM loans l JOIN products p ON p.product_id = l.product_id
GROUP BY p.name HAVING AVG(l.principal) > 50000000;             -- Auto 216.9 млн, SME 308.7 млн
```

</details>

**P6.** Клиенты, у которых больше одного кредита: одна строка на такого клиента с числом его кредитов, сначала с наибольшим числом.

<details><summary>Ответ</summary>

```sql
SELECT customer_id, COUNT(*) AS loans FROM loans GROUP BY customer_id HAVING COUNT(*) > 1 ORDER BY loans DESC;
```
2 246 строк — строка над таблицей результата показывает их число. У четырёх клиентов по 7 кредитов (id 1893, 3216, 4435, 5478). Получить эти 2 246 числом *внутри* SQL — значит посчитать строки сгруппированного результата: `SELECT COUNT(*) FROM ( … )`, подзапрос, Неделя 3, День 3.

</details>

Так у скольких клиентов больше одного кредита? (Возьмите число строк вашего результата.)

```task
{"id": "w02d2-p6", "kind": "number", "answer": 2246, "dp": 0, "unit": "клиентов", "hint": "Ваш сгруппированный запрос возвращает по строке на каждого такого клиента; поле показывает, сколько строк вернулось.", "model": "У 2 246 клиентов два кредита или больше — примерно у половины из 4 335 заёмщиков. У четырёх из них по 7 кредитов."}
```

**P7.** Действия по взысканию по типам и число тех из них, что закончились обещанием оплатить, по типам — два сгруппированных запроса.

<details><summary>Ответ</summary>

```sql
SELECT action_type, COUNT(*) AS actions FROM collections_actions GROUP BY action_type ORDER BY actions DESC;
SELECT action_type, COUNT(*) AS promises FROM collections_actions WHERE outcome = 'promise_to_pay' GROUP BY action_type;
```
sms 1 254 / 3 265 = 38.4 % · visit 381 / 1 506 = 25.3 % · call 785 / 3 114 = 25.2 % · restructure_offer 344 / 1 476 = 23.3 %. SMS «побеждает», потому что это первое действие по каждому просроченному кредиту, когда заёмщики ещё отвечают; это ничего не говорит о том, какое действие *работает*. Завтра вы будете делить прямо в запросе.

</details>

Разделите вручную: какова самая высокая доля действий, закончившихся обещанием оплатить, в % с одним знаком после запятой?

```task
{"id": "w02d2-p7", "kind": "number", "answer": 38.4, "dp": 1, "unit": "%", "hint": "обещания ÷ действия × 100 для каждого типа; побеждает наибольшая доля.", "model": "SMS: 1 254 из 3 265 = 38.4 % (visit 25.3, call 25.2, restructure_offer 23.3). SMS — первое касание по каждому просроченному кредиту, пока заёмщики ещё отвечают; доля ничего не говорит о том, какое действие работает."}
```

**P8.** Ловушка умножения в цифрах. Для активных кредитов: `COUNT(*)` и `COUNT(DISTINCT l.loan_id)` по `loans JOIN payments`, а также `SUM(principal)` по одной таблице `loans`.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*), COUNT(DISTINCT l.loan_id) FROM loans l JOIN payments p ON p.loan_id = l.loan_id WHERE l.status = 'active';
-- 22511 строк, 2971 кредит  → соединение умножило строки; 381 активный кредит ещё без платежей и пропал (внутреннее соединение)
SELECT SUM(principal) FROM loans WHERE status = 'active';                                   -- 296 980 040 000 (верно)
```
`SUM(l.principal)` по соединению исчисляется триллионами — каждый основной долг посчитан по разу на платёж. Когда два счёта различаются, агрегируйте столбцы кредита только по `loans`.

</details>

**P9.** Платежи по `method`: количество и общая сумма, сначала самые частые. Внимательно посмотрите на результат.

<details><summary>Ответ</summary>

```sql
SELECT method, COUNT(*) AS payments, SUM(amount) AS total FROM payments GROUP BY method ORDER BY payments DESC;
```
Десять строк там, где должно быть пять: `card` 17 564 **и** `Card` 57; `click` 8 754 и `Click` 36; `payme` 8 870 и `PayMe` 30; `cash` 8 760 и `CASH ` (пробел в конце) 30; `transfer` 8 747 и `bank transfer` 27. В 180 строках способ оплаты записан иначе, поэтому каждая «доля по способам» искажена, а у *card* кажется на 57 платежей меньше, чем есть на самом деле. `GROUP BY` группирует *точные* значения — пробел или заглавная буква образуют другую группу. Завтра мы исправим это с помощью `LOWER`, `TRIM` и `REPLACE`. (Эти десять строк — результат SQLite. Сортировка по умолчанию в SQL Server игнорирует регистр и конечные пробелы, поэтому там `GROUP BY method` покажет шесть строк, а лишние написания спрячутся внутри `card`, `click`, `payme` и `cash`; напишите `GROUP BY method COLLATE Latin1_General_CS_AS`, чтобы получить те же десять строк.)

</details>

Сколько групп возвращает ваш запрос (в SQLite)? Потом посмотрите в объяснении ответа, почему их не пять.

```task
{"id": "w02d2-p9", "kind": "number", "answer": 10, "dp": 0, "unit": "групп", "hint": "Посчитайте строки результата — а затем посмотрите на написания.", "model": "10 групп на 5 настоящих способов: card/Card, click/Click, payme/PayMe, cash/'CASH ' (пробел в конце), transfer/bank transfer. GROUP BY группирует точные значения, поэтому 180 строк с другим написанием дают пять фантомных категорий."}
```

> ⚠️ **Осторожно.** `GROUP BY` группирует *точные* значения. `'Card'`, `'card'` и `'card '` — три группы; посмотрите на подписи любого сгруппированного результата, прежде чем доверять его числам.

**P10.** Поступления платежей в 2026 году: количество и сумма по месяцам. Есть ли что-то странное в конце списка?

<details><summary>Ответ</summary>

```sql
SELECT strftime('%Y-%m', paid_at) AS month, COUNT(*) AS payments, SUM(amount) AS received
FROM payments WHERE paid_at >= '2026-01-01' GROUP BY strftime('%Y-%m', paid_at) ORDER BY month;
```
В январе 2 466 / 11.76 млрд, к сентябрю рост до 3 159 / 16.34 млрд — а затем **2026-10: 52** и **2026-11: 8**. Данные на 1 октября; 60 платежей датированы 1 октября или позже, и **24** из них датированы *после* отчётной даты (последний — 2026-11-24). Либо выгрузка выполнена позже, чем указано в её подписи, либо это запланированные автосписания, записанные заранее. Отметьте это для Тимура; в пятницу об этом спросят.

</details>

Сколько платежей датировано **после** отчётной даты 2026-10-01? (Ещё один запрос: `WHERE paid_at > '2026-10-01'`.)

```task
{"id": "w02d2-p10", "kind": "number", "answer": 24, "dp": 0, "unit": "платежей", "hint": "COUNT(*) FROM payments, где paid_at строго больше '2026-10-01'.", "model": "24 платежа, последний — 2026-11-24: деньги «получены» раньше, чем были получены. Либо выгрузка сделана позже своей подписи, либо это списания, записанные наперёд; заметка для Тимура."}
```

> 🚀 **Со звёздочкой (по желанию, +5 XP).** Операции над множествами на практике — для завершения дня не обязательно.

**P11.** С помощью `UNION ALL` постройте один результат с двумя подписанными строками: `'2025'` с числом кредитов и `'2026'` с числом кредитов. Затем выполните то же с `UNION`.

<details><summary>Ответ</summary>

```sql
SELECT '2025' AS yr, COUNT(*) AS loans FROM loans WHERE disbursed_at >= '2025-01-01' AND disbursed_at < '2026-01-01'
UNION ALL
SELECT '2026', COUNT(*) FROM loans WHERE disbursed_at >= '2026-01-01';          -- 3041 / 3051
```
Столбец-подпись делает строки разными, поэтому `UNION` оставляет обе. Без подписи два одинаковых числа при `UNION` схлопнулись бы в одну строку — классическая тихая потеря. По умолчанию используйте `UNION ALL`.

</details>

Почему `UNION` и `UNION ALL` дают здесь одни и те же две строки — и когда `UNION` потерял бы одну?

```task
{"id": "w02d2-p11", "kind": "free", "min": 20, "model": "UNION убирает только строки, совпадающие во всех столбцах. Здесь строки ('2025', 3041) и ('2026', 3051): одного столбца-подписи достаточно, чтобы они различались, поэтому ничего не удаляется. Если убрать подпись и в оба года число окажется одинаковым, строки станут одинаковыми и UNION молча оставит одну — поэтому по умолчанию я пишу UNION ALL.", "rubric": ["Говорит, что UNION убирает строки, совпадающие во всех столбцах", "Называет столбец-подпись (или разные числа) тем, что делает строки разными", "Называет случай потери строки: нет подписи и числа равны", "Рекомендует UNION ALL по умолчанию"], "xp": 2}
```

### SQL-лаборатория — сводные таблицы :id=sql-lab-summary-tables

Агрегированный результат можно сохранить как отдельную таблицу — так и собирается пакет для совета: одна сводная таблица на слайд. Эта лаборатория работает с **вашей учебной копией** базы (панель **«База данных»** покажет ваши новые таблицы; **База данных → Сбросить** вернёт исходные данные).

```sqllab
{"id": "w02d2-lab", "title": "Сводка по продуктам для Мадины", "intro": "Сохраните сводку «кредиты по продуктам» как таблицу, добавьте столбец, исправьте одну строку и оставьте только продукты, нужные для слайда об объёмах, — а затем постройте вторую сводку с HAVING.",
 "steps": [
  {"say": "Создайте my_product_summary из сгруппированного запроса: название продукта (как product), число кредитов (как loans) и общий основной долг (как disbursed), одна строка на продукт.", "hint": "CREATE TABLE my_product_summary AS SELECT p.name AS product, COUNT(*) AS loans, SUM(l.principal) AS disbursed FROM loans l JOIN products p ON p.product_id = l.product_id GROUP BY p.name;", "expect": "SELECT COUNT(*) FROM my_product_summary", "want": 5},
  {"say": "Добавьте столбец avg_ticket INTEGER и заполните его значением disbursed / loans для каждой строки.", "hint": "ALTER TABLE my_product_summary ADD COLUMN avg_ticket INTEGER; UPDATE my_product_summary SET avg_ticket = disbursed / loans;", "expect": "SELECT avg_ticket FROM my_product_summary WHERE product = 'Micro loan'", "want": 2705586},
  {"say": "На слайде написано 'BNPL', а не 'Buy now pay later'. Исправьте (UPDATE) название продукта в этой одной строке.", "hint": "UPDATE my_product_summary SET product = 'BNPL' WHERE product = 'Buy now pay later';", "expect": "SELECT COUNT(*) FROM my_product_summary WHERE product = 'BNPL'", "want": 1},
  {"say": "Слайд об объёмах показывает только продукты, где не меньше 1 000 кредитов. Удалите (DELETE) остальные строки.", "hint": "DELETE FROM my_product_summary WHERE loans < 1000;", "expect": "SELECT COUNT(*) FROM my_product_summary", "want": 3},
  {"say": "Теперь слайд о филиалах: создайте my_branch_summary (branch_name, loans) только с филиалами, где больше 900 кредитов, — отфильтруйте группы через HAVING.", "hint": "CREATE TABLE my_branch_summary AS SELECT b.branch_name, COUNT(*) AS loans FROM loans l JOIN branches b ON b.branch_id = l.branch_id GROUP BY b.branch_name HAVING COUNT(*) > 900;", "expect": "SELECT COUNT(*) FROM my_branch_summary", "want": 4}],
 "cleanup": "DROP TABLE IF EXISTS my_product_summary; DROP TABLE IF EXISTS my_branch_summary"}
```

Среднее на шаге 2 получилось целым, потому что `disbursed / loans` делит два целых числа — дробная часть отбрасывается, а не округляется (2 705 586.36 стало 2 705 586). В среду вы узнаете почему и как это исправить одним символом.

---

## 4. Домашнее задание :id=4-homework

Нового домашнего задания нет. **HW 2.1** (кредитный портфель Бекзода) сдаётся завтра — с сегодняшними инструментами вы теперь можете закончить **Q6** (кредиты по инспекторам — это `GROUP BY`) и **Q10** (`COUNT(*)` и `SUM` по кредитам клиентов-дубликатов).

---

## 5. Самопроверка :id=5-self-check

```check
{"id": "w02d2-sc", "questions": [
  {"type": "single", "q": "«Активные кредиты по филиалам, только филиалы, где их больше 300». Куда идёт каждое условие?", "options": ["status = 'active' — в WHERE, COUNT(*) > 300 — в HAVING", "Оба в WHERE", "Оба в HAVING", "status = 'active' — в HAVING, COUNT(*) > 300 — в WHERE"], "answer": 0, "explain": "WHERE фильтрует строки до группировки; HAVING фильтрует группы, когда счёт уже есть (→ раздел 1, HAVING vs WHERE)."},
  {"type": "single", "q": "Что не так с `SELECT p.name, l.loan_id, COUNT(*) … GROUP BY p.name`?", "options": ["Всё в порядке", "loan_id не агрегирован и не входит в группировку: SQL Server откажется, SQLite выберет случайный loan_id", "COUNT(*) нельзя использовать с GROUP BY", "p.name должен стоять внутри агрегата"], "answer": 1, "explain": "Каждый столбец SELECT либо внутри агрегата, либо в GROUP BY (→ раздел 1, GROUP BY)."},
  {"type": "single", "q": "Вы суммируете `l.principal` по `loans JOIN installments`. Какая быстрая проверка показала бы, что сумма неверна?", "options": ["COUNT(*) рядом с COUNT(DISTINCT l.loan_id) — они различаются", "MAX(principal) рядом с MIN(principal)", "Выполнить запрос дважды", "ORDER BY по сумме"], "answer": 0, "explain": "Строк больше, чем кредитов, — значит, каждый основной долг посчитан несколько раз; агрегируйте столбцы кредита только по loans (→ раздел 1, ловушка умножения; P8)."},
  {"type": "multi", "q": "Какие из этих функций — агрегатные?", "options": ["COUNT", "SUM", "AVG", "ROUND", "MAX", "LOWER"], "answer": [0, 1, 2, 4], "explain": "Агрегаты превращают много строк в одно значение: COUNT, SUM, AVG, MIN, MAX. ROUND и LOWER меняют одно значение в каждой строке — это функции среды (→ раздел 1, Пять агрегатов)."}
]}
```

---

## 6. Уголок компании <span class="badge company">Выдачи, чек, уровень одобрения</span> :id=6-company-corner-disbursements-ticket-approval-rate

Три показателя портфеля, которые полностью сводятся к `GROUP BY`, и один, где нужно деление.

**Выдачи** (*disbursements*) — количество и сумма кредитов, выплаченных за период, по продуктам. Сентябрь 2026:

```sql
SELECT p.name, COUNT(*) AS loans, SUM(l.principal) AS disbursed
FROM loans l JOIN products p ON p.product_id = l.product_id
WHERE l.disbursed_at >= '2026-09-01' AND l.disbursed_at < '2026-10-01'
GROUP BY p.name ORDER BY disbursed DESC;
```

| product | loans | disbursed |
|---|---|---|
| Small business loan | 30 | 8 601 880 000 |
| Auto loan | 21 | 4 398 600 000 |
| Consumer loan | 121 | 3 409 790 000 |
| Micro loan | 123 | 328 630 000 |
| Buy now pay later | 66 | 276 590 000 |

361 кредит, 17.02 млрд UZS. Тридцать кредитов малому бизнесу — половина денег; 123 кредита Micro — 2 % от них. Из-за такого состава и «портфель вырос» у Бекзода, и «мы выдали больше кредитов» у Маркетинга могут быть правдой и обе мимо сути. С начала 2026 года строка SME — 305 кредитов / 95.24 млрд из общих 162.33 млрд.

**Средний чек** (*average ticket*) — `AVG(principal)` по продуктам: в 2026 году SME 312.2 млн, Auto 219.5 млн, Consumer 27.2 млн, BNPL 4.1 млн, Micro 2.7 млн. Чек меняется, когда меняется *состав клиентов* продукта; падающий чек SME при растущем количестве обычно означает новый сегмент, а не более мелкий бизнес.

**Уровень одобрения по каналам** (*approval rate by channel*). На первой неделе вы считали его двумя подсчётами для всей компании. По каналам способ «двумя запросами» — это по три группы в каждом:

```sql
SELECT channel, COUNT(*) AS applications FROM applications GROUP BY channel;                            -- app 5006 · branch 6223 · partner 2771
SELECT channel, COUNT(*) AS approved FROM applications WHERE status LIKE 'approved%' GROUP BY channel;  -- app 2915 · branch 3965 · partner 1715
```

app 58.2 % · branch 63.7 % · partner 61.9 % (в знаменателе все заявки). Один запрос вместо двух: усредните выражение 0/1. В SQLite сравнение *и есть* 0 или 1, поэтому `AVG(status LIKE 'approved%')` работает; SQL Server нужен `IIF`, чтобы превратить проверку в число:

```sql
-- SQLite
SELECT channel, COUNT(*) AS applications, ROUND(100.0 * AVG(status LIKE 'approved%'), 1) AS approval_pct
FROM applications GROUP BY channel;
-- SQL Server
SELECT channel, COUNT(*) AS applications, ROUND(100.0 * AVG(IIF(status LIKE 'approved%', 1.0, 0)), 1) AS approval_pct
FROM applications GROUP BY channel;
```

Те же три числа. Четверговый `SUM(CASE WHEN … THEN 1 ELSE 0 END)` — переносимая запись той же идеи; прочтите её там, а пользуйтесь той, что нравится вашей СУБД. Если взять в знаменатель *рассмотренные* заявки (отменённые исключены), каналы выглядят как 68.2 / 72.4 / 70.5 %; приложение на 4–5 пунктов ниже филиала при любом способе подсчёта, потому что в приложении нет сотрудника, который отстоял бы пограничный случай.

**Один урок из P9.** Платежи по способам показали `Card` и `card` как две строки. В пакете Мадины для совета есть плитка «доля платежей картой»; если считать по сырому `method`, у card занижено на 57 платежей и 327 млн UZS, а пять лишних написаний добавляют пять фантомных категорий. В реальных данных всегда так. Первая задача завтрашнего дня — сделать так, чтобы `GROUP BY LOWER(TRIM(method))` возвращал пять строк.

```game
{"id": "w02d2-g3", "type": "match", "title": "Показатели для совета", "pairs": [["Выдачи", "COUNT(*) и SUM(principal) кредитов, выплаченных за период, по продуктам"], ["Средний чек", "AVG(principal) по продуктам"], ["Уровень одобрения", "одобренные заявки ÷ заявки, по каналам"], ["Длинный формат", "одна строка на (месяц, продукт) — то, что возвращает GROUP BY"], ["Широкий формат", "месяцы по горизонтали, столбцами — слайд, который строят потом через SUM(CASE …) или сводную таблицу"]]}
```

> 🎯 **Версия для собеседования.** *«Как бы вы построили отчёт о выдачах по месяцам и продуктам и что бы проверили?»* — `GROUP BY month, product` по `loans` (одна строка на кредит, поэтому суммы безопасны); фильтр периода через `>=` и `<`; проверить, что строки в сумме дают итог без группировки; никогда не соединять таблицу «один-ко-многим» до суммирования сумм кредитов.

**Скажите как на собеседовании.** *«Как бы вы построили отчёт о выдачах по месяцам и продуктам и что бы проверили перед отправкой?»* Ответьте так, как сказали бы вслух, с числами Nur Finance.

```task
{"id": "w02d2-iv", "kind": "free", "min": 30, "model": "Я агрегирую саму таблицу loans, потому что одна строка в ней — один кредит со своим основным долгом: GROUP BY по месяцу disbursed_at и названию продукта из products (связь «многие к одному»), с COUNT(*) и SUM(principal). Период — полуоткрытый фильтр, disbursed_at >= '2026-01-01'. Перед отправкой проверяю, что 50 строк в сумме дают итог без группировки — 3 051 кредит и 162.3 млрд UZS за 2026 год, — и никогда не соединяю installments или payments до суммирования, потому что это размножает каждый основной долг.", "rubric": ["Агрегирует по loans (одна строка на кредит) с GROUP BY по месяцу и продукту", "Использует COUNT(*) и SUM(principal) с полуоткрытым фильтром периода", "Сверяет сгруппированные строки с итогом без группировки", "Предупреждает о соединении «один-ко-многим» до суммирования", "Приводит число Nur Finance"], "xp": 2}
```

Завтра: вопрос Севары об опозданиях и плитка Тимура, которая сдвинулась сама, — функции, которые чистят и вычисляют значения прямо в запросе.

---

## Тест дня :id=day-quiz

Для завершения дня нужно набрать 80 %. Пересдавать можно сколько угодно.

```quiz
{"id": "w02d2", "pass": 0.8, "questions": [
  {"type": "single", "q": "В какой строке ошибка?", "code": "1  SELECT b.branch_name, COUNT(*) AS loans\n2  FROM loans l JOIN branches b ON b.branch_id = l.branch_id\n3  WHERE COUNT(*) > 900\n4  GROUP BY b.branch_name;", "options": ["Строка 1", "Строка 2", "Строка 3 — условие на агрегат должно стоять в HAVING, после GROUP BY", "Строка 4"], "answer": 2, "explain": "WHERE фильтрует строки до группировки, когда счёта ещё нет; HAVING фильтрует группы (→ раздел 1, HAVING vs WHERE)."},
  {"type": "single", "q": "Что сделает SQL Server с этим запросом?", "code": "SELECT p.name, l.loan_id, COUNT(*)\nFROM loans l JOIN products p ON p.product_id = l.product_id\nGROUP BY p.name;", "options": ["Вернёт одну строку на кредит", "Откажется выполнять: loan_id не агрегирован и не входит в GROUP BY", "Вернёт одну строку на продукт с первым loan_id", "Вернёт только количество"], "answer": 1, "explain": "Каждый столбец SELECT либо внутри агрегата, либо в GROUP BY; SQLite молча выберет какой-нибудь loan_id, на что никогда нельзя полагаться (→ раздел 1, GROUP BY)."},
  {"type": "single", "q": "У Micro COUNT(*) равен 2 669, а COUNT(DISTINCT l.customer_id) — 2 133. Какое утверждение верно?", "options": ["2 669 клиентов Micro", "2 669 кредитов Micro, взятых 2 133 разными людьми", "534 кредита Micro — дубликаты, которые нужно удалить", "2 133 кредита Micro"], "answer": 1, "explain": "COUNT(*) считает строки (кредиты); COUNT(DISTINCT …) считает различных клиентов — называйте то, что имеете в виду (→ раздел 1, COUNT(DISTINCT))."},
  {"type": "number", "q": "В SQLite столбец method содержит эти пять значений. Сколько строк вернёт запрос?", "code": "method: 'card', 'card', 'Card', 'cash', 'CASH '\n\nSELECT method, COUNT(*)\nFROM payments\nGROUP BY method;", "answer": 4, "explain": "GROUP BY группирует точные значения: card, Card, cash и 'CASH ' (пробел в конце) — это четыре разные группы (→ P9)."},
  {"type": "single", "q": "Вы соединяете loans с payments и хотите SUM(l.principal). Какая быстрая проверка покажет, что сумма небезопасна?", "options": ["COUNT(*) и COUNT(DISTINCT l.loan_id) различаются", "Сумма — круглое число", "Запрос выполняется медленно", "MIN(principal) равен 0"], "answer": 0, "explain": "Если строк больше, чем кредитов, каждый основной долг посчитан несколько раз; агрегируйте столбец на зерне его собственной таблицы (→ раздел 1, ловушка умножения; P8)."},
  {"type": "multi", "q": "Какие утверждения об операциях над множествами верны?", "options": ["UNION убирает повторяющиеся строки", "UNION ALL сохраняет дубликаты и работает быстрее", "EXCEPT возвращает строки первого запроса, которых нет во втором", "UNION ставит две таблицы рядом, как соединение", "Оба запроса должны возвращать одинаковое число строк"], "answer": [0, 1, 2], "explain": "Операции над множествами кладут результаты стопкой, поэтому должно совпадать число столбцов, а не строк; по умолчанию используйте UNION ALL (→ раздел 1, Операции над множествами)."},
  {"type": "single", "q": "Какое предложение может использовать псевдоним столбца, заданный в SELECT (например, ORDER BY active_loans), и в SQL Server, и в SQLite?", "options": ["WHERE", "GROUP BY", "ORDER BY", "Никакое из них"], "answer": 2, "explain": "ORDER BY выполняется после SELECT в порядке FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY; SQL Server требует повторить выражение в GROUP BY (→ раздел 1, GROUP BY; HAVING vs WHERE)."},
  {"type": "single", "q": "Что вычисляет этот столбец по каждому каналу в SQLite?", "code": "SELECT channel,\n       ROUND(100.0 * AVG(status LIKE 'approved%'), 1)\nFROM applications\nGROUP BY channel;", "options": ["Число одобренных заявок", "Уровень одобрения в %, где в знаменателе все заявки", "Уровень одобрения без учёта отменённых заявок", "Средний кредитный скор одобренных заявок"], "answer": 1, "explain": "Сравнение даёт 1 или 0, поэтому его среднее — доля единиц; здесь — по всем заявкам канала (→ раздел 6, Уголок компании)."}
]}
```

<!-- challenge:start -->

---

## Задача дня :id=daily-challenge

Бонус для любознательных: один более сложный вопрос по теме дня. Решите его и получите XP, растущие вместе с вашей серией задач — полная неделя из пяти добавляет ещё 10 % к ваучеру в пятницу.

```challenge
{"id": "w02d2", "sql": true, "q": "Нилуфар подозревает, что некоторые кредитные инспекторы принимают решения строже других. Для заявок, поданных в 2025 году, посчитайте уровень одобрения каждого инспектора по правилу «рассмотренных» (отменённые исключены; approved_not_disbursed считается одобренной), оставив только инспекторов минимум с 80 рассмотренными заявками. У какого инспектора самый низкий уровень? Ответьте staff_id инспектора.", "type": "number", "dp": 0, "h": ["56de769469e1ba7468f6f2ed"], "hint": "Один фильтр стоит до группировки, другой — после: порог в 80 — это условие на счёт.", "sol": "LS0gU1FMaXRlClNFTEVDVCBvZmZpY2VyX2lkLCBDT1VOVCgqKSBBUyBkZWNpZGVkLAogICAgICAgUk9VTkQoMTAwLjAgKiBBVkcoc3RhdHVzIExJS0UgJ2FwcHJvdmVkJScpLCAxKSBBUyBhcHByb3ZhbF9wY3QKRlJPTSBhcHBsaWNhdGlvbnMKV0hFUkUgc3RhdHVzIDw+ICdjYW5jZWxsZWQnCiAgQU5EIGFwcGxpZWRfYXQgPj0gJzIwMjUtMDEtMDEnIEFORCBhcHBsaWVkX2F0IDwgJzIwMjYtMDEtMDEnCkdST1VQIEJZIG9mZmljZXJfaWQKSEFWSU5HIENPVU5UKCopID49IDgwCk9SREVSIEJZIGFwcHJvdmFsX3BjdDsKLS0gU1FMIFNlcnZlcjogQVZHKElJRihzdGF0dXMgTElLRSAnYXBwcm92ZWQlJywgMS4wLCAwLjApKSBpbnN0ZWFkIG9mIEFWRyhzdGF0dXMgTElLRSAnYXBwcm92ZWQlJykKLS0gZmlyc3Qgcm93OiBvZmZpY2VyIDI1IChOYXJnaXphIEtoYXNhbm92LCBUYXNoa2VudCBTb3V0aCkg4oCUIDU4IG9mIDk1ID0gNjEuMSAlOyB0aGVuIDE2IGF0IDYxLjYgJSwgNiBhdCA2My4xICUKV2l0aG91dCBIQVZJTkcgdGhlIGxvd2VzdCBpcyBvZmZpY2VyIDgxIGF0IDYwLjggJSBvbiBvbmx5IDUxIGRlY2lzaW9ucyDigJQgdG9vIGZldyB0byBjYWxsIGEgcGF0dGVybi4gV2l0aCBjYW5jZWxsZWQgYXBwbGljYXRpb25zIGluIHRoZSBkZW5vbWluYXRvciB0aGUgb3JkZXIgY2hhbmdlcyAob2ZmaWNlciA3MSBjb21lcyBmaXJzdCksIHNvIHRoZSBjb252ZW50aW9uIGRlY2lkZXMgd2hvIGdldHMgdGhlIHBob25lIGNhbGwuCjYxICUgYWdhaW5zdCBhIDIwMjUgY29tcGFueSByYXRlIG9mIGFib3V0IDcwICUgaXMgZmlyc3QgYSBxdWVzdGlvbiBhYm91dCB0aGUgb2ZmaWNlcidzIGFwcGxpY2FudHMgKHByb2R1Y3QsIHNjb3JlKSwgYW5kIG9ubHkgdGhlbiBhYm91dCB0aGUgb2ZmaWNlci4="}
```

<!-- challenge:end -->
