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

Правило, из-за которого возникает большинство ошибок новичков: **каждый столбец в `SELECT` либо стоит внутри агрегата, либо указан в `GROUP BY`.** `SELECT p.name, l.loan_id, COUNT(*)` — ошибка в SQL Server («not contained in an aggregate function or the GROUP BY clause») — какой loan_id он показал бы для группы из 781 кредита? SQLite молча выберет какой-нибудь; никогда на это не полагайтесь.

Группируйте по **нескольким столбцам**, чтобы получить одну строку на каждую комбинацию: `GROUP BY b.region, p.name` → регион × продукт. Месяц даты — это функция от даты (тема следующего дня), но нужен он уже сегодня, поэтому вот он для обоих диалектов:

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

Число неверно в среднее число сроков раз, а оно различается по продуктам, поэтому может измениться даже *рейтинг*. Правило: **агрегируйте столбец на зерне его собственной таблицы.** Суммы кредитов — по `loans`; суммы платежей — по `installments`; если нужно и то и другое в одном результате, агрегируйте каждую таблицу отдельно и соединяйте результаты — инструмент для этого даст неделя 3 (подзапросы и CTE). А пока, когда запрос соединяет таблицу «один-ко-многим», запускайте рядом `COUNT(*)` и `COUNT(DISTINCT l.loan_id)`; если они различаются, не делайте `SUM` по столбцу кредита.

### Операции над множествами — складываем результаты стопкой :id=set-operators-stacking-results

Соединения ставят таблицы рядом; **операции над множествами** (*set operators*) кладут результаты запросов друг на друга. Оба запроса должны вернуть одинаковое число столбцов совместимых типов.

| Оператор | Что оставляет | Пример на наших данных |
|---|---|---|
| `UNION` | все строки обоих, **дубликаты убираются** | `SELECT customer_id FROM loans UNION SELECT customer_id FROM applications` → 5 453 строки (= различные заявители; каждый заёмщик подавал заявку) |
| `UNION ALL` | все строки обоих, дубликаты сохраняются (быстро) | то же с `UNION ALL` → 21 828 строк (7 828 + 14 000) |
| `EXCEPT` | строки первого запроса, которых нет во втором | `SELECT customer_id FROM applications EXCEPT SELECT customer_id FROM loans` → 1 118 человек, которые подавали заявку и ни разу не получили кредит |
| `INTERSECT` | строки, которые есть в обоих | заявители, которые тоже заёмщики → 4 335 |

`UNION` — способ сложить блоки «этот месяц» и «прошлый месяц» в одну таблицу для графика; `EXCEPT` — это анти-соединение, записанное через множества. Используйте `UNION ALL`, если только вы не *хотите* убрать дубликаты: `UNION` должен сортировать, чтобы удалить повторы, и тихо сливает строки, которые на самом деле законно одинаковы.

### Углубление (по желанию) :id=depth-optional

- ▶ Бараа, *Aggregate functions* [8:43:36](https://youtu.be/SSKVgrwhzus?t=31416&end=31811) — 7 мин; и *Set operators* [4:02:09](https://youtu.be/SSKVgrwhzus?t=14529&end=17261) — 40 мин.
- Русская презентация (TBC Data Analytics 2.0, если она у вас есть) `2.2 SQL-1-38.pdf` — страницы про GROUP BY / HAVING. *Термины по-английски:* агрегатная функция = aggregate, группировка = GROUP BY, средний чек = average ticket, объединение = UNION.

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

50 строк (10 месяцев × 5 продуктов; в октябре один день). Это **длинный формат** (*long format*) — одна строка на ячейку слайда Мадины. Её слайд — **широкий** формат (месяцы по горизонтали). Превращение длинного в широкий — это `SUM(CASE …)` Дня 4 или, на практике, сводная таблица в Excel/Power BI поверх именно этого результата. Отдавайте длинную таблицу; она правильная.

5. Проверка на здравый смысл по итогу из одного столбца: `SELECT COUNT(*), SUM(principal) FROM loans WHERE disbursed_at >= '2026-01-01'` → 3 051 кредит, 162 333 060 000. 50 строк должны давать в сумме это. Так и есть.

---

## 3. Практика (60 мин) :id=3-practice-60-min

Пишите каждый запрос в поле под вопросом — он сохраняется в этом браузере; **✔ Проверить** сравнивает ваш результат с ответом. Вчерашние соединения плюс сегодняшние агрегаты; пока без `CASE`.

**P1.** Число кредитов и общий основной долг по `status`, сначала с наибольшей суммой.

<details><summary>Ответ</summary>

```sql
SELECT status, COUNT(*) AS loans, SUM(principal) AS principal
FROM loans GROUP BY status ORDER BY principal DESC;
```
active 3 352 / 296.98 млрд · closed 4 242 / 94.15 млрд · written_off 190 / 10.02 млрд · default 44 / 3.63 млрд. Закрытых кредитов больше, но они мельче — короткие кредиты Micro и BNPL закрываются быстро.

</details>

**P2.** Кредиты, выданные за каждый год, с общей суммой и средним чеком, округлённым до целых сумов.

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

**P4.** Филиалы, где больше 900 кредитов. · **P5.** Продукты, у которых средний чек превышает 50 000 000.

<details><summary>Ответ</summary>

```sql
SELECT b.branch_name, COUNT(*) FROM loans l JOIN branches b ON b.branch_id = l.branch_id
GROUP BY b.branch_name HAVING COUNT(*) > 900 ORDER BY 2 DESC;
-- Tashkent South 1012, Tashkent North 1007, Tashkent Central 1001, Fergana Central 906
SELECT p.name, AVG(l.principal) FROM loans l JOIN products p ON p.product_id = l.product_id
GROUP BY p.name HAVING AVG(l.principal) > 50000000;             -- Auto 216.9 млн, SME 308.7 млн
```
Оба — условия на агрегат → `HAVING`. Если написать их в `WHERE`, будет синтаксическая ошибка — а это ещё добрый исход: она хотя бы видна сразу.

</details>

**P6.** У скольких клиентов больше одного кредита? Два шага: сгруппированный запрос по клиентам, затем подсчёт его строк на глаз — и учтите, что подсчёт *строк сгруппированного результата* требует инструмента, который вы получите на неделе 3.

<details><summary>Ответ</summary>

```sql
SELECT customer_id, COUNT(*) AS loans FROM loans GROUP BY customer_id HAVING COUNT(*) > 1 ORDER BY loans DESC;
```
2 246 строк (число строк показывает ваш инструмент). У четырёх клиентов по 7 кредитов (id 1893, 3216, 4435, 5478). Обернуть это в `SELECT COUNT(*) FROM ( … )` — значит написать подзапрос — Неделя 3, День 3.

</details>

**P7.** Действия по взысканию по типам с числом обещаний оплатить. У какого типа действия самая высокая *доля* обещаний? (Доля — это деление; сегодня посчитайте её вручную, а в SQL — завтра.)

<details><summary>Ответ</summary>

```sql
SELECT action_type, COUNT(*) AS actions FROM collections_actions GROUP BY action_type ORDER BY actions DESC;
SELECT action_type, COUNT(*) AS promises FROM collections_actions WHERE outcome = 'promise_to_pay' GROUP BY action_type;
```
sms 1 254 / 3 265 = 38.4 % · visit 381 / 1 506 = 25.3 % · call 785 / 3 114 = 25.2 % · restructure_offer 344 / 1 476 = 23.3 %. SMS «побеждает», потому что это первое действие по каждому просроченному кредиту, когда заёмщики ещё отвечают; это ничего не говорит о том, какое действие *работает*. Завтра вы будете делить прямо в запросе.

</details>

**P8.** Ловушка умножения в цифрах. Для активных кредитов: `COUNT(*)` и `COUNT(DISTINCT l.loan_id)` по `loans JOIN payments`, а также `SUM(l.principal)` по тому же соединению и по одной таблице `loans`.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*), COUNT(DISTINCT l.loan_id) FROM loans l JOIN payments p ON p.loan_id = l.loan_id WHERE l.status = 'active';
-- 22511 строк, 2971 кредит  → соединение умножило строки; 381 активный кредит ещё без платежей и пропал (внутреннее соединение)
SELECT SUM(principal) FROM loans WHERE status = 'active';                                   -- 296 980 040 000 (верно)
```
`SUM(l.principal)` по соединению исчисляется триллионами — каждый основной долг посчитан по разу на платёж. Когда два счёта различаются, агрегируйте столбцы кредита только по `loans`.

</details>

**P9.** Платежи по `method`: количество и общая сумма, сначала самые частые. Внимательно посмотрите на результат и напишите о нём одно предложение.

<details><summary>Ответ</summary>

```sql
SELECT method, COUNT(*) AS payments, SUM(amount) AS total FROM payments GROUP BY method ORDER BY payments DESC;
```
Десять строк там, где должно быть пять: `card` 17 564 **и** `Card` 57; `click` 8 754 и `Click` 36; `payme` 8 870 и `PayMe` 30; `cash` 8 760 и `CASH ` (пробел в конце) 30; `transfer` 8 747 и `bank transfer` 27. В 180 строках способ оплаты записан иначе, поэтому каждая «доля по способам» искажена, а у *card* кажется на 57 платежей меньше, чем есть на самом деле. `GROUP BY` группирует *точные* значения — пробел или заглавная буква образуют другую группу. Завтра мы исправим это с помощью `LOWER`, `TRIM` и `REPLACE`. (Эти десять строк — результат SQLite. Сортировка по умолчанию в SQL Server игнорирует регистр и конечные пробелы, поэтому там `GROUP BY method` покажет шесть строк, а лишние написания спрячутся внутри `card`, `click`, `payme` и `cash`; напишите `GROUP BY method COLLATE Latin1_General_CS_AS`, чтобы получить те же десять строк.)

</details>

**P10.** Ежемесячные поступления платежей в 2026 году: количество и сумма по месяцам. Есть ли что-то странное в конце списка?

<details><summary>Ответ</summary>

```sql
SELECT strftime('%Y-%m', paid_at) AS month, COUNT(*) AS payments, SUM(amount) AS received
FROM payments WHERE paid_at >= '2026-01-01' GROUP BY strftime('%Y-%m', paid_at) ORDER BY month;
```
В январе 2 466 / 11.76 млрд, к сентябрю рост до 3 159 / 16.34 млрд — а затем **2026-10: 52** и **2026-11: 8**. Данные на 1 октября; 60 платежей датированы 1 октября или позже, и **24** из них датированы *после* отчётной даты (последний — 2026-11-24). Либо выгрузка выполнена позже, чем указано в её подписи, либо это запланированные автосписания, записанные заранее. Отметьте это для Тимура; в пятницу об этом спросят.

</details>

<span class="badge stretch">Со звёздочкой</span> **P11.** С помощью `UNION ALL` постройте один результат с двумя подписанными строками: `'2025'` с числом кредитов и `'2026'` с числом кредитов. Затем сделайте то же с `UNION` и объясните, почему результат здесь одинаков, но не был бы таким, если бы в оба года число было одним и тем же.

<details><summary>Ответ</summary>

```sql
SELECT '2025' AS yr, COUNT(*) AS loans FROM loans WHERE disbursed_at >= '2025-01-01' AND disbursed_at < '2026-01-01'
UNION ALL
SELECT '2026', COUNT(*) FROM loans WHERE disbursed_at >= '2026-01-01';          -- 3041 / 3051
```
Столбец-подпись делает строки разными, поэтому `UNION` оставляет обе. Без подписи два одинаковых числа при `UNION` схлопнулись бы в одну строку — классическая тихая потеря. По умолчанию используйте `UNION ALL`.

</details>

---

## 4. Домашнее задание :id=4-homework

Нового домашнего задания нет. **HW 2.1** (кредитный портфель Бекзода) сдаётся завтра — Q6 теперь делается через `GROUP BY`.

---

## 5. Самопроверка :id=5-self-check

1. Какое предложение фильтрует группы, какое — строки, и в каком порядке они выполняются? *(→ раздел 1, «HAVING vs WHERE»)*
2. `SELECT p.name, l.loan_id, COUNT(*) … GROUP BY p.name` — почему это неверно и что скажет SQL Server? *(→ раздел 1, «GROUP BY»)*
3. Вы суммируете `principal` по `loans JOIN installments`. Насколько результат неверен и какая проверка бы это поймала? *(→ раздел 1, «ловушка умножения»; P8)*

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

**Один урок из P9.** Платежи по способам показали `Card` и `card` как две строки. В пакете Мадины для совета есть плитка «доля цифровых платежей»; если считать по сырому `method`, у card занижено на 57 платежей и 327 млн UZS, а пять лишних написаний добавляют пять фантомных категорий. В реальных данных всегда так. Первая задача завтрашнего дня — сделать так, чтобы `GROUP BY LOWER(TRIM(method))` возвращал пять строк.

> Вопрос для собеседования: *«Как бы вы построили отчёт о выдачах по месяцам и продуктам и что бы проверили?»* — `GROUP BY month, product` по `loans` (одна строка на кредит, поэтому суммы безопасны); фильтр периода через `>=` и `<`; проверить, что строки в сумме дают итог без группировки; никогда не соединять таблицу «один-ко-многим» до суммирования сумм кредитов.

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
{"id": "w02d2", "q": "Нилуфар подозревает, что некоторые кредитные инспекторы принимают решения строже других. Для заявок, поданных в 2025 году, посчитайте уровень одобрения каждого инспектора по правилу «рассмотренных» (отменённые исключены; approved_not_disbursed считается одобренной), оставив только инспекторов минимум с 80 рассмотренными заявками. У какого инспектора самый низкий уровень? Ответьте staff_id инспектора.", "type": "number", "dp": 0, "h": ["56de769469e1ba7468f6f2ed"], "hint": "Один фильтр стоит до группировки, другой — после: порог в 80 — это условие на счёт.", "sol": "LS0gU1FMaXRlClNFTEVDVCBvZmZpY2VyX2lkLCBDT1VOVCgqKSBBUyBkZWNpZGVkLAogICAgICAgUk9VTkQoMTAwLjAgKiBBVkcoc3RhdHVzIExJS0UgJ2FwcHJvdmVkJScpLCAxKSBBUyBhcHByb3ZhbF9wY3QKRlJPTSBhcHBsaWNhdGlvbnMKV0hFUkUgc3RhdHVzIDw+ICdjYW5jZWxsZWQnCiAgQU5EIGFwcGxpZWRfYXQgPj0gJzIwMjUtMDEtMDEnIEFORCBhcHBsaWVkX2F0IDwgJzIwMjYtMDEtMDEnCkdST1VQIEJZIG9mZmljZXJfaWQKSEFWSU5HIENPVU5UKCopID49IDgwCk9SREVSIEJZIGFwcHJvdmFsX3BjdDsKLS0gU1FMIFNlcnZlcjogQVZHKElJRihzdGF0dXMgTElLRSAnYXBwcm92ZWQlJywgMS4wLCAwLjApKSBpbnN0ZWFkIG9mIEFWRyhzdGF0dXMgTElLRSAnYXBwcm92ZWQlJykKLS0gZmlyc3Qgcm93OiBvZmZpY2VyIDI1IChOYXJnaXphIEtoYXNhbm92LCBUYXNoa2VudCBTb3V0aCkg4oCUIDU4IG9mIDk1ID0gNjEuMSAlOyB0aGVuIDE2IGF0IDYxLjYgJSwgNiBhdCA2My4xICUKV2l0aG91dCBIQVZJTkcgdGhlIGxvd2VzdCBpcyBvZmZpY2VyIDgxIGF0IDYwLjggJSBvbiBvbmx5IDUxIGRlY2lzaW9ucyDigJQgdG9vIGZldyB0byBjYWxsIGEgcGF0dGVybi4gV2l0aCBjYW5jZWxsZWQgYXBwbGljYXRpb25zIGluIHRoZSBkZW5vbWluYXRvciB0aGUgb3JkZXIgY2hhbmdlcyAob2ZmaWNlciA3MSBjb21lcyBmaXJzdCksIHNvIHRoZSBjb252ZW50aW9uIGRlY2lkZXMgd2hvIGdldHMgdGhlIHBob25lIGNhbGwuCjYxICUgYWdhaW5zdCBhIDIwMjUgY29tcGFueSByYXRlIG9mIGFib3V0IDcwICUgaXMgZmlyc3QgYSBxdWVzdGlvbiBhYm91dCB0aGUgb2ZmaWNlcidzIGFwcGxpY2FudHMgKHByb2R1Y3QsIHNjb3JlKSwgYW5kIG9ubHkgdGhlbiBhYm91dCB0aGUgb2ZmaWNlci4="}
```

<!-- challenge:end -->
