# Неделя 3 · День 4 — Представления, временные таблицы и ускорение запросов

<span class="badge">Теория 60 мин</span> <span class="badge">Разобранный пример 15 мин</span> <span class="badge">Практика 50 мин</span> <span class="badge">Домашнее задание</span> <span class="badge company">Уголок компании</span>

> STORY **Четверг, 9:00.** Тимур, BI-специалист, с ноутбуком, полным вкладок Power BI. *«В каждом показателе моего дашборда лежит своя копия вашей логики DPD, вставленная разными людьми в разные годы. Три из них не совпадают. Дайте мне **чистый слой**: `v_loan_status` — одна строка на кредит с DPD, корзиной, остатком долга и днями жизни; `v_portfolio_monthly` — одна строка на месяц × продукт × филиал с количеством выдач, суммой и остатком долга; `v_payments_clean` — без дубликатов, способ оплаты приведён к норме. Я направлю Power BI на эти три и удалю всё остальное. И обновляться оно должно за секунды, а не за минуты».*

## Сегодня в 3 строках :id=today-in-3-lines

- **Представление** — это сохранённый запрос с именем: оно скрывает соединения и определения, так что одно правило DPD обслуживает все отчёты, — это слой хранилища, который будет читать Power BI на неделе 7.
- **Материализуйте** (`CREATE TABLE … AS SELECT`, `SELECT INTO`, временные таблицы), когда представление медленное или результат нужно заморозить на дату; **индексы** превращают полное *сканирование* таблицы в *поиск*, и какой из них случился, видно в **плане выполнения**.
- Вы знаете **10 привычек производительности**, важных для аналитика, и написали три представления Тимура.

---

## 1. Теория — сохраняем запрос, а не данные :id=1-learn-saving-the-query-not-the-data

### Представления (*views*) :id=views-представления

```sql
CREATE VIEW v_payments_clean AS
WITH ranked AS (
  SELECT payment_id, loan_id, installment_id, paid_at, amount,
         REPLACE(LOWER(TRIM(method)), 'bank transfer', 'transfer') AS method,
         ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
  FROM payments)
SELECT payment_id, loan_id, installment_id, paid_at, amount, method FROM ranked WHERE rn = 1;

SELECT COUNT(*), SUM(amount), COUNT(DISTINCT method) FROM v_payments_clean;     -- 52 850 · 255 114 772 176 · 5
```

Представление хранит **текст** запроса, а не его результат. Каждый `SELECT … FROM v_payments_clean` выполняет внутренний запрос в этот момент, на текущих данных, — поэтому оно всегда свежее и стоит столько же, сколько запрос внутри. Что вы получаете: **одно определение** (правило дубликатов и очистка способа оплаты живут в одном месте; исправьте их один раз — изменятся все отчёты), **более простую поверхность** (Тимур видит шесть чистых столбцов, а не `ROW_NUMBER`) и **безопасность** (представление может показать часть столбцов и скрыть `phone`). Представления можно строить на представлениях: `v_loan_status` ниже читает `v_payments_clean`, поэтому дедупликация наследуется. `DROP VIEW name` удаляет его; в SQL Server для правок есть `CREATE OR ALTER VIEW`, в SQLite — `DROP`, затем `CREATE`.

**Почему Power BI получает представления, а не таблицы.** Дашборд недели 7 будет обновляться из базы. Если он читает сырую `payments`, каждая мера должна повторять дедупликацию и CTE для DPD на DAX — три человека, три версии, проблема Тимура. Если он читает `v_loan_status`, мера — это `SUM(outstanding)`. Представления *и есть* модель данных: одна строка на кредит, одна строка на месяц × продукт × филиал, одна строка на платёж. **Зернистость** представления — существительное, которое составляет одну строку, — это первая строка его документации.

### Материализация: CTAS, SELECT INTO, временные таблицы :id=materialising-ctas-select-into-temp-tables

Представления пересчитываются. Иногда нужно хранить **результат**: срез на дату (регуляторные отчёты замораживаются), дорогой запрос, который читают многие, или промежуточный результат, повторно используемый в длинном скрипте. Три инструмента:

| Инструмент | SQL Server | SQLite | Живёт |
|---|---|---|---|
| **CTAS** — создать таблицу из запроса | `SELECT … INTO new_table FROM …` | `CREATE TABLE new_table AS SELECT …` | пока не удалена |
| **Временная таблица** | `SELECT … INTO #tmp FROM …` (`#` = временная) | `CREATE TEMP TABLE tmp AS SELECT …` | до конца сеанса |
| **Табличная переменная** (только SQL Server) | `DECLARE @t TABLE (…)` | — | пакет |

```sql
CREATE TABLE t_loan_status AS SELECT * FROM v_loan_status;      -- SQL Server: SELECT * INTO t_loan_status FROM v_loan_status
-- 7 828 строк, заморожены на 2026-10-01; представление продолжает двигаться, таблица — нет
```

Замер на нашем файле SQLite в 9.6 МБ: `SELECT bucket, COUNT(*) FROM v_loan_status GROUP BY bucket` — **0.49 с** через представление, **0.00 с** из материализованной таблицы; `v_portfolio_monthly` за один месяц — **12.8 с** через представление (оно пересчитывает остаток долга на конец месяца за 34 месяца), мгновенно из таблицы. **Когда материализовать:** когда представление медленное *и* данные меняются редко (ночная таблица — стандартный ответ хранилища, bronze/silver/gold из видео недели 1); когда число не должно меняться после публикации; когда скрипту нужен один и тот же промежуточный результат пять раз (временная таблица, а не пять копий CTE). **Когда не нужно:** когда свежесть важнее скорости или когда «таблица» тихо устареет и разойдётся с представлением — три показателя Тимура были именно этим: устаревшие копии.

### Индексы (*indexes*) — телефонная книга :id=indexes-индексы-the-phone-book

Без индекса движок читает **каждую строку**, чтобы ответить на `WHERE loan_id = 2242` — это **сканирование** (*scan*). Индекс — отсортированная копия одного или нескольких столбцов с указателями на строки; с ним движок прыгает прямо в нужное место — это **поиск** (*seek*; SQLite пишет `SEARCH`). Как найти фамилию в телефонной книге, а не читать её от корки до корки.

```sql
CREATE INDEX ix_payments_installment ON payments (installment_id);
CREATE INDEX ix_installments_due     ON installments (due_date);
```

**В SQL Server два вида.** **Кластерный индекс** (*clustered*) *и есть* таблица: сами строки хранятся в этом порядке (один на таблицу, обычно первичный ключ — `loan_id`). **Некластерные** индексы — отдельные отсортированные структуры, указывающие внутрь неё (много на таблицу). Роль кластерного в SQLite играет `rowid`; наши учебные таблицы загружены без объявленных первичных ключей, поэтому `WHERE loan_id = 2242` сканирует, пока вы не добавите `CREATE UNIQUE INDEX ix_loans_id ON loans (loan_id)`.

**Когда выигрывает WHERE или JOIN:** равенство или диапазон по индексируемому столбцу (`installment_id = ?`, `due_date >= ? AND due_date < ?`), соединение по нему (каждое `payments.installment_id = installments.installment_id`), `ORDER BY` по нему. **Когда не выигрывает:** вокруг столбца обёрнута функция (`strftime('%Y-%m', due_date) = '2026-09'`, `LOWER(method) = 'card'`) — движок не может искать значение, которое приходится вычислять для каждой строки; `LIKE '%x'`; столбец с двумя значениями (`is_weekend`). Индексы занимают место и слегка замедляют каждый `INSERT`/`UPDATE` — на аналитической копии это почти всегда оправдано; на транзакционной системе решает DBA, а не вы.

### Читаем план выполнения (*execution plan*) — scan или seek :id=reading-an-execution-plan-план-выполнения-scan-or-seek

SQL Server: *Display Estimated Execution Plan* (Ctrl+L) рисует блоки; читайте их справа налево, ищите **Table Scan / Clustered Index Scan** (плохо на больших таблицах) против **Index Seek** (хорошо) и толстые стрелки (много строк). SQLite: `EXPLAIN QUERY PLAN` перед запросом печатает по строке на таблицу:

```sql
EXPLAIN QUERY PLAN SELECT * FROM payments WHERE loan_id = 2242;
-- до:  SCAN payments
-- после CREATE INDEX ix_payments_loan ON payments (loan_id):  SEARCH payments USING INDEX ix_payments_loan (loan_id=?)

EXPLAIN QUERY PLAN SELECT COUNT(*) FROM installments WHERE strftime('%Y-%m', due_date) = '2026-09';
-- SCAN installments USING COVERING INDEX ix_installments_due          ← всё ещё сканирование: функция прячет столбец
EXPLAIN QUERY PLAN SELECT COUNT(*) FROM installments WHERE due_date >= '2026-09-01' AND due_date < '2026-10-01';
-- SEARCH installments USING COVERING INDEX ix_installments_due (due_date>? AND due_date<?)   ← полуоткрытый фильтр недели 2 вознаграждён
```

Соединение DPD из недели 2: до индексации — `SCAN i` плюс `AUTOMATIC COVERING INDEX` по payments (SQLite построил одноразовый индекс под соединение — намёк, что настоящего не хватает); после — `SEARCH i USING INDEX ix_installments_due` и `SEARCH p USING INDEX ix_payments_installment`. Это весь навык на уровне аналитика: *есть ли у моего столбца фильтра/соединения индекс и что говорит план — SCAN или SEARCH?*

### 10 привычек производительности, важных для аналитика :id=the-10-performance-habits-that-matter-for-analysts

1. **Выбирайте только нужные столбцы** — `SELECT *` в Power BI тащит `phone` и `app_version` по сети зря.
2. **Фильтруйте раньше** — `WHERE` по базовой таблице до соединения; CTE, который отфильтровывает 2026 год до соединения с платежами, касается четверти строк.
3. **Никаких функций над индексируемыми столбцами в WHERE** — полуоткрытые диапазоны дат, а не `strftime`/`YEAR()`; чистите *данные* (представление с очищенным способом оплаты), а не ставьте `LOWER()` в каждый фильтр.
4. **Никогда не используйте `DISTINCT`, чтобы спрятать ошибку соединения** — `SELECT DISTINCT` после соединения «один ко многим» (92 193 строки из 7 828 кредитов) *выглядит* правильно, но медленный и неверный (суммы всё равно размножены). Исправляйте зернистость: сначала агрегируйте, потом соединяйте.
5. **Агрегируйте на каждой зернистости, затем соединяйте агрегаты** (вчерашняя цепочка) — меньше промежуточных результатов, нет размножения.
6. **Используйте `EXISTS` вместо `IN` с большими подзапросами, `UNION ALL` вместо `UNION`**, когда не нужно убирать дубликаты, — `UNION` сортирует ради дедупликации.
7. **Индексируйте столбцы соединений и фильтров** на вашей аналитической копии — `installment_id`, `loan_id`, `due_date`, `paid_at`, `disbursed_at`.
8. **Материализуйте то, что медленно и стабильно** (ночная таблица), **представления оставьте для того, что должно быть свежим**.
9. **Избегайте коррелированных подзапросов по большим таблицам**, когда то же делает окно или соединение (вчерашний P5: 4 335 подзапросов против одного `ROW_NUMBER`).
10. **Посмотрите план, прежде чем винить сервер** — `EXPLAIN QUERY PLAN` / Ctrl+L; если на таблице из 92 193 строк написано SCAN, вы знаете, что делать.

### Углубление (необязательно) :id=depth-optional

- ▶ Baraa, *Views* [15:35:02](https://youtu.be/SSKVgrwhzus?t=56102&end=59800), *CTAS and temp tables* [16:36:40](https://youtu.be/SSKVgrwhzus?t=59800&end=62251), *Indexes* [18:23:42](https://youtu.be/SSKVgrwhzus?t=66222&end=73231), *Execution plan* [20:20:31](https://youtu.be/SSKVgrwhzus?t=73231&end=76263), *30 performance tips* [21:43:39](https://youtu.be/SSKVgrwhzus?t=78219&end=80665) — длинно; смотрите Views + Indexes + советы (≈2 ч), главу про план — если вашей целью является SQL Server. Хранимые процедуры и триггеры (17:27:04, 18:12:58) для аналитика необязательны.
- *Английские термины:* представление = view, временная таблица = temp table, материализация = materialisation, индекс = index, кластерный / некластерный = clustered / non-clustered, план выполнения = execution plan, полное сканирование = full scan, поиск по индексу = index seek.

---

## 2. Разобранный пример — `v_loan_status` (15 мин) :id=2-worked-example-v_loan_status-15-min

Зернистость: **одна строка на кредит**, все 7 828, включая закрытые и списанные (Тимур фильтрует в своём инструменте). Определения: DPD и корзина — как в неделе 2 (оплаты по дату отчёта, через чистое представление); остаток долга = `principal_due` платежей со сроком после даты отчёта; дни жизни = дата отчёта − дата выдачи.

```sql
CREATE VIEW v_loan_status AS
WITH unpaid AS (
  SELECT i.loan_id, i.due_date, i.total_due - COALESCE(SUM(p.amount), 0) AS overdue_amount
  FROM installments i
  LEFT JOIN v_payments_clean p ON p.installment_id = i.installment_id AND p.paid_at <= '2026-10-01'
  WHERE i.due_date <= '2026-10-01'
  GROUP BY i.installment_id, i.loan_id, i.due_date, i.total_due
  HAVING COALESCE(SUM(p.amount), 0) < i.total_due),
dpd AS (
  SELECT loan_id, CAST(julianday('2026-10-01') - julianday(MIN(due_date)) AS INTEGER) AS dpd,     -- DATEDIFF(day, MIN(due_date), '2026-10-01')
         COUNT(*) AS unpaid_instalments, SUM(overdue_amount) AS overdue_amount
  FROM unpaid GROUP BY loan_id),
outst AS (
  SELECT loan_id, SUM(principal_due) AS outstanding FROM installments WHERE due_date > '2026-10-01' GROUP BY loan_id)
SELECT l.loan_id, l.customer_id, p.code AS product, b.branch_name, b.region, l.risk_grade, l.status,
       l.disbursed_at, l.principal, l.term_months,
       CAST(julianday('2026-10-01') - julianday(l.disbursed_at) AS INTEGER) AS days_on_book,
       COALESCE(o.outstanding, 0)   AS outstanding,
       COALESCE(d.dpd, 0)           AS dpd,
       CASE WHEN COALESCE(d.dpd, 0) = 0 THEN '0' WHEN d.dpd <= 30 THEN '1-30' WHEN d.dpd <= 60 THEN '31-60'
            WHEN d.dpd <= 90 THEN '61-90' ELSE '90+' END AS bucket,
       COALESCE(d.unpaid_instalments, 0) AS unpaid_instalments,
       COALESCE(d.overdue_amount, 0)     AS overdue_amount
FROM loans l
JOIN products p ON p.product_id = l.product_id
JOIN branches b ON b.branch_id = l.branch_id
LEFT JOIN dpd   d ON d.loan_id = l.loan_id
LEFT JOIN outst o ON o.loan_id = l.loan_id;
```

Проверки, в таком порядке: `SELECT COUNT(*), COUNT(DISTINCT loan_id) FROM v_loan_status` → **7 828 · 7 828** (зернистость держится; 92 193 здесь означало бы, что соединение размножило строки). `SUM(outstanding)` → 208 723 504 430; `SUM(outstanding > 0)` → 3 409; корзины `0` 7 429 · `1-30` 124 · `31-60` 25 · `61-90` 16 · `90+` 234 — три LEFT JOIN с `COALESCE` кладут каждый непросроченный кредит в корзину 0. Кредит 1: Termez Central, CONS, класс C, активен, 552 дня жизни, остаток долга 9 593 064, DPD 0. Кредит 2167: списан, DPD 919, 6 неоплаченных платежей, 3 334 100 просрочено. Таблица `status × bucket`: `default`/`written_off` все в 90+; 13 `closed` кредитов лежат в 1–30 и один в 31–60 — вывод недели 2, теперь это фильтр, который Тимур может нажать.

Абзац словаря данных, которого требует HW 3.2, в виде таблицы (правило — по строке на столбец):

| столбец | определение |
|---|---|
| `loan_id` … `term_months` | скопированы из `loans`, с присоединёнными `product` (код) и `branch_name`/`region` |
| `days_on_book` | дата отчёта − `disbursed_at`, целые дни (кредит 1: 552) |
| `outstanding` | сумма `principal_due` по платежам с `due_date` > даты отчёта; 0 для закрытых/списанных кредитов |
| `dpd` | дата отчёта − срок самого старого наступившего платежа, не оплаченного полностью (оплаты по дату отчёта, чистое представление); 0, если таких нет |
| `bucket` | `0` / `1-30` / `31-60` / `61-90` / `90+` по `dpd` |
| `unpaid_instalments`, `overdue_amount` | количество и неоплаченный остаток этих наступивших платежей |
| оговорки | у 14 `closed` кредитов (у всех `closed_at` NULL) DPD > 0 — 13 в 1–30, 1 в 31–60; остаток долга не включает проценты; дата отчёта зафиксирована на 2026-10-01 |

Дата отчёта встречается четыре раза. В SQL Server сделайте её параметром через встроенную табличную функцию (`CREATE FUNCTION f_loan_status(@asof DATE) RETURNS TABLE AS RETURN (…)`); в SQLite держите таблицу `params` из одной строки и соединяйте её. Для курса буквальная дата допустима — напишите её в комментарии-заголовке представления.

---

## 3. Практика (50 мин) :id=3-practice-50-min

Пишите каждый запрос в поле под вопросом — он сохраняется в этом браузере. Кнопка **✔ Проверить** сообщит, совпал ли ваш результат с ответом. Индексы и новые таблицы меняют только вашу учебную копию базы данных — **База данных → ↺ Сбросить** вернёт оригинал.

**P1.** Создайте `v_payments_clean` и докажите её корректность: строки, сумма, различные способы оплаты и то, что ни у одного платежа по графику не осталось двух строк.

<details><summary>Ответ</summary>

Представление из раздела 1. `SELECT COUNT(*), SUM(amount), COUNT(DISTINCT method) FROM v_payments_clean` → 52 850 · 255 114 772 176 · 5; `SELECT MAX(c) FROM (SELECT installment_id, COUNT(*) c FROM v_payments_clean GROUP BY 1)` → 1.

</details>

**P2.** Создайте `v_loan_status` (разобранный пример) и выполните четыре проверки. Затем: остаток долга по `region` и `bucket` только из представления — насколько этот запрос короче понедельничного, написанного по сырым таблицам?

<details><summary>Ответ</summary>

Проверки — как выше. `SELECT region, bucket, SUM(outstanding) FROM v_loan_status GROUP BY 1, 2` — две строки вместо трёх соединений и CTE; больше всего мёртвого остатка долга в 90+ у Ташкента. Смысл слоя: *вопрос* занимает две строки, *определение* лежит в другом месте, один раз.

</details>

**P3.** `EXPLAIN QUERY PLAN` для `SELECT * FROM payments WHERE loan_id = 2242` до и после `CREATE INDEX ix_payments_loan ON payments (loan_id)`. Скопируйте обе строки.

<details><summary>Ответ</summary>

`SCAN payments` → `SEARCH payments USING INDEX ix_payments_loan (loan_id=?)`. (SQL Server: Table Scan → Index Seek в графическом плане.)

</details>

**P4.** Два фильтра для сентябрьских платежей по графику — `strftime('%Y-%m', due_date) = '2026-09'` и полуоткрытый диапазон — при наличии `ix_installments_due`. Какие планы? То же количество?

<details><summary>Ответ</summary>

То же количество (сентябрьские платежи). Планы: `SCAN installments USING COVERING INDEX` для версии с функцией — она всё равно читает каждую запись; `SEARCH … (due_date>? AND due_date<?)` для диапазона. Привычка 3.

</details>

**P5.** Вопрос про кластерный индекс: `EXPLAIN QUERY PLAN SELECT * FROM loans WHERE loan_id = 2242` против `WHERE rowid = 2242`. Почему они различаются и что исправляет первый?

<details><summary>Ответ</summary>

`SCAN loans` против `SEARCH loans USING INTEGER PRIMARY KEY (rowid=?)`: таблица загружена без объявленного ключа, поэтому `loan_id` — обычный столбец, а `rowid` — порядок хранения (кластерный индекс SQLite). `CREATE UNIQUE INDEX ix_loans_id ON loans (loan_id)` → `SEARCH loans USING INDEX ix_loans_id`. В SQL Server вы объявили бы `loan_id` кластерным первичным ключом при создании таблицы.

</details>

**P6.** Привычка 4: `SELECT COUNT(*), COUNT(DISTINCT l.loan_id) FROM loans l JOIN installments i ON i.loan_id = l.loan_id`. Кто-то «чинит» размноженный отчёт через `SELECT DISTINCT l.loan_id, l.principal …` и затем суммирует. Что всё равно не так?

<details><summary>Ответ</summary>

92 193 против 7 828. `DISTINCT` по (loan_id, principal) действительно сворачивает до 7 828 строк — но только потому, что эти два столбца одинаковы в каждом повторе; добавьте любой столбец платежа — и размножение вернётся, а `SUM(principal)` *до* `DISTINCT` (типичная ошибка) завышен в 24 раза. Решение — зернистость: просуммируйте платежи по кредиту в CTE, затем соедините один раз.

</details>

**P7.** Создайте `t_loan_status` как материализованную копию (CTAS / `SELECT INTO`). Замерьте время подсчёта корзин из представления и из таблицы. Когда бы вы отдали таблицу вместо представления?

<details><summary>Ответ</summary>

≈0.5 с против ≈0 с здесь; разница растёт с объёмом данных. Отдавайте таблицу для замороженного отчёта на конец месяца или ночного обновления; представление оставьте там, где дата отчёта должна быть *сейчас*. Назовите так, чтобы их никто не путал (`t_` / `v_` или `_asof_20261001`).

</details>

**P8.** `v_portfolio_monthly`: постройте (запрос — в Уголке компании), проверьте, что 1 700 строк = 34 месяца × 5 × 10, и сверьте остаток долга на конец сентября 2026 с цифрой на дату отчёта. Почему они различаются примерно на 480 млн?

<details><summary>Ответ</summary>

208 243 879 623 (конец месяца 30 сен) против 208 723 504 430 (на 1 окт). Представление на конец месяца исключает 21 кредит, выданный 1 октября (852 760 000 основного долга, пока ничего не погашено), и считает платежи со сроком *на* 1 октября ещё не оплаченным остатком (в полночь 30 сентября срок ещё не наступил). Два верных числа, два определения — запишите оба в словарь данных.

</details>

**P9.** Выберите пять из десяти привычек и покажите по запросу на каждую на наших данных медленную и быструю форму (планы или количества строк как доказательство).

<details><summary>Ответ</summary>

Любые пять с доказательствами — например, привычка 1 (`SELECT *` против трёх столбцов: сравните ширину), 3 (P4), 4 (P6), 5 (вчерашняя цепочка P6 против соединения сырых таблиц), 9 (последний кредит через `ROW_NUMBER` против коррелированного подзапроса `= MAX`: те же 4 335 строк). Полный балл — за *доказательства*, а не за прозу.

</details>

**P10.** Временная таблица для длинного скрипта: `CREATE TEMP TABLE tmp_dpd AS SELECT loan_id, dpd, bucket, outstanding FROM v_loan_status WHERE dpd > 0`; посчитайте строки; затем задайте к ней три вопроса (по корзинам, по продукту через соединение, средний DPD у активных кредитов).

<details><summary>Ответ</summary>

399 строк. Корзины 124/25/16/234; по продукту больше всего просроченных денег у SME, больше всего просроченных кредитов у Consumer (T11 недели 2); активные просроченные кредиты в среднем имеют 22.7 DPD. Временная таблица исчезает, когда вы закрываете соединение, — в этом и смысл: черновое пространство, а не отчёт.

</details>

<span class="badge stretch">Со звёздочкой</span> **P11.** В P3 вторника нашлись 101 клиент, получившие новый кредит после списанного. Используя `v_loan_status` и `applications`, перечислите сотрудников (`officer_id`), одобривших больше всего таких повторных кредитов, и FPD30 этих повторных кредитов в сравнении с портфелем.

<details><summary>Ответ</summary>

Соедините `loans` с самой собой, чтобы найти повторные кредиты (тот же клиент, `disbursed_at` позже, чем у списанного кредита), присоедините `applications` ради `officer_id`, сгруппируйте и проранжируйте; затем присоедините блок `flags` из недели 2 для FPD30. Ожидайте, что повторные кредиты окажутся заметно выше 1.28 % — прочитайте своё число и приведите его вместе с количеством; малые группы сильно скачут. Структура (CTE для повторов → соединить сотрудника → агрегировать → ранжировать) — это неделя в одном запросе.

</details>

---

## 4. Домашнее задание <span class="badge hw">HW 3.2 — до Дня 5</span> :id=4-homework-hw-32-due-day-5

**Чистый слой для Тимура.** Сдайте через поле 📎 ниже:

1. `views.sql` — `CREATE VIEW` для `v_payments_clean`, `v_loan_status`, `v_portfolio_monthly`, именно в таком порядке (второе читает первое), перед каждым — комментарий-заголовок: зернистость, дата отчёта, исходные таблицы. Оба диалекта там, где они различаются (`julianday` против `DATEDIFF`, `WITH RECURSIVE` против `WITH`, `CREATE TABLE AS` против `SELECT INTO`), или ясный заголовок с диалектом.
2. `dictionary.md` — по абзацу на каждое представление: **зернистость** (что такое одна строка), **число строк**, каждый **столбец** с определением в одну строку (например, *outstanding — сумма `principal_due` по платежам с `due_date > даты отчёта`*), правило **даты отчёта** и известные оговорки (закрытые кредиты в 1–30; остаток на конец месяца против остатка на дату отчёта; 25 удалённых дубликатов).
3. `checks.sql` — проверка зернистости (`COUNT(*)` = `COUNT(DISTINCT key)`) и сверочные итоги для каждого представления (7 828 кредитов / 208 723 504 430; 1 700 строк / 7 828 кредитов / 404 783 280 000 выдано; 52 850 платежей / 255 114 772 176).

Оценивается: (a) три представления создаются и проверки проходят, (б) словарь позволяет Тимуру пользоваться столбцом, не читая SQL, (в) одно определение DPD/остатка долга во всех трёх представлениях — остаток в `v_portfolio_monthly`, который не сходится с `v_loan_status`, теряет балл.

### 📎 Сдайте здесь :id=hand-in-here

```sqltask
{"check": "handin-W3D4", "lesson": "W3D4", "title": "HW 3.2", "tasks": [{"id": "views.sql", "file": "views.sql", "text": true, "minLines": 3, "q": "Напишите здесь `views.sql` — то, что требует страница выше."}, {"id": "dictionary.md", "file": "dictionary.md", "text": true, "minLines": 3, "q": "Напишите здесь `dictionary.md` — то, что требует страница выше."}, {"id": "checks.sql", "file": "checks.sql", "text": true, "minLines": 3, "q": "Напишите здесь `checks.sql` — то, что требует страница выше."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Всё остальное, что перечислено на странице (ещё один файл или .zip из нескольких)."}]}
```

---

## 5. Самопроверка :id=5-self-check

1. Представление и материализованная таблица от одного запроса — что из них изменится, когда сегодня ночью добавят платёж, и что читается быстрее? *(→ раздел 1, «Представления», «Материализация»)*
2. `WHERE YEAR(disbursed_at) = 2026` по индексируемому столбцу — scan или seek, и как это переписать? *(→ раздел 1, «Индексы», «План выполнения»)*
3. Почему `SELECT DISTINCT` после соединения «один ко многим» — ловушка, а не исправление? *(→ привычка 4, P6)*

---

## 6. Уголок компании <span class="badge company">Опора дашборда портфеля</span> :id=_6-company-corner-the-portfolio-dashboard39s-backbone

На первой странице дашборда кредитной компании — **шесть чисел**. Всё остальное раскрывается из них. Каждое — один короткий запрос к одному из представлений Тимура, и это настоящая проверка слоя: если показателю нужна сырая таблица, слой неполон.

| # | Показатель | Определение (наше) | Представление | Значение на 2026-10-01 |
|---|---|---|---|---|
| 1 | **Остаток долга** | сумма `outstanding` по всем кредитам | `v_loan_status` | **208 723 504 430** по 3 409 кредитам |
| 2 | **Выдачи с начала месяца** | кредиты и основной долг, выданные в этом месяце на текущий момент | `v_portfolio_monthly` (или `v_loan_status` с фильтром) | Октябрь: **21 / 852 760 000** (один день); последний полный месяц, сентябрь: 361 / 17 015 490 000 |
| 3 | **PAR30** | остаток долга кредитов с DPD > 30 ÷ общий остаток долга | `v_loan_status` | 6 507 526 953 / 208.72 млрд = **3.12 %** |
| 4 | **NPL90** | остаток долга кредитов с DPD > 90 ÷ общий остаток долга | `v_loan_status` | 5 319 475 527 = **2.55 %** (234 кредита) |
| 5 | **FPD30, последнее зрелое поколение** | FPD30 самого нового поколения, у которого все первые сроки платежей старше 30 дней | блок `flags` из недели 2 на `v_payments_clean` | Июль 2026: 4 из 367 = **1.09 %** (август: в выборке только 11 из 358 кредитов — пока не читается) |
| 6 | **Коэффициент сборов** | оплачено к концу месяца ÷ подлежало оплате в месяце, по платежам со сроком в этом месяце | `v_payments_clean` + `installments` | Сентябрь: 15 982 118 926 / 16 987 977 718 = **94.1 %** |

```sql
-- 1, 3, 4 в одном запросе
SELECT SUM(outstanding) AS outstanding,
       ROUND(100.0 * SUM(CASE WHEN dpd > 30 THEN outstanding ELSE 0 END) / SUM(outstanding), 2) AS par30_pct,
       ROUND(100.0 * SUM(CASE WHEN dpd > 90 THEN outstanding ELSE 0 END) / SUM(outstanding), 2) AS npl90_pct
FROM v_loan_status;
-- 2
SELECT SUM(disbursed_count), SUM(disbursed_amount) FROM v_portfolio_monthly WHERE month = '2026-10-01';
-- 6
SELECT ROUND(100.0 * SUM(COALESCE(p.paid, 0)) / SUM(i.total_due), 1) AS collection_rate_pct
FROM installments i
LEFT JOIN (SELECT installment_id, SUM(amount) AS paid FROM v_payments_clean WHERE paid_at <= '2026-10-01' GROUP BY installment_id) p
       ON p.installment_id = i.installment_id
WHERE i.due_date >= '2026-09-01' AND i.due_date < '2026-10-01';
```

**`v_portfolio_monthly`** — тренд, стоящий за показателями 1 и 2: одна строка на месяц × продукт × филиал, построенная на рекурсивном календаре, чтобы пустые ячейки существовали как нули:

```sql
CREATE VIEW v_portfolio_monthly AS
WITH RECURSIVE months(month_start) AS (
  SELECT '2024-01-01' UNION ALL SELECT date(month_start, '+1 month') FROM months WHERE month_start < '2026-10-01'),
cells AS (SELECT m.month_start, p.product_id, p.code AS product, b.branch_id, b.branch_name
          FROM months m CROSS JOIN products p CROSS JOIN branches b),
disb AS (SELECT strftime('%Y-%m-01', disbursed_at) AS month_start, product_id, branch_id,
                COUNT(*) AS disbursed_count, SUM(principal) AS disbursed_amount FROM loans GROUP BY 1, 2, 3),
outst AS (SELECT m.month_start, l.product_id, l.branch_id, SUM(i.principal_due) AS outstanding_month_end
          FROM months m
          JOIN loans l        ON l.disbursed_at < date(m.month_start, '+1 month')
          JOIN installments i ON i.loan_id = l.loan_id AND i.due_date >= date(m.month_start, '+1 month')
          GROUP BY 1, 2, 3)
SELECT c.month_start AS month, c.product, c.branch_name,
       COALESCE(d.disbursed_count, 0) AS disbursed_count, COALESCE(d.disbursed_amount, 0) AS disbursed_amount,
       COALESCE(o.outstanding_month_end, 0) AS outstanding_month_end
FROM cells c
LEFT JOIN disb  d ON d.month_start = c.month_start AND d.product_id = c.product_id AND d.branch_id = c.branch_id
LEFT JOIN outst o ON o.month_start = c.month_start AND o.product_id = c.product_id AND o.branch_id = c.branch_id;
-- 1 700 rows; 2026 month-end outstanding: Jan 151.8 bn · Mar 164.0 · Jun 184.6 · Aug 203.8 · Sep 208.2 bn
```

Первая версия этого представления соединяла `cells` (50 строк в месяц) с `loans` без сопоставления продукта и филиала — и показала 10 триллионов остатка долга. Сверочная проверка (`SUM(outstanding_month_end)` за сентябрь против `v_loan_status`) поймала это одной строкой. **Каждое представление поставляется со своим проверочным запросом**; для этого и нужен `checks.sql` в HW 3.2.

**Читаем все шесть вместе.** Остаток долга растёт примерно на 7 млрд в месяц (151.8 млрд в январе до 208.2 млрд в сентябре), тогда как выдачи составляют 12–22 млрд: большая часть выданного погашается в течение года (короткие сроки Micro/BNPL/Consumer). PAR30 3.1 % и NPL90 2.6 % близки — просроченный портфель в основном *старый*: 5.3 из 6.5 млрд под риском — это уже 90+. FPD30 1.1 % за июль соответствует исторической величине 1.28 %. Коэффициент сборов 94 % по сентябрьским платежам означает, что 6 % того, что подлежало оплате, не оплачено месяц спустя, — это приток в корзину 1–30 Севары (117 кредитов во вторник). Одна страница, шесть чисел, и каждое прослеживается до представления и определения — вот что даёт «чистый слой».

> Версия для собеседования: *«Что выносят на первую страницу дашборда кредитной компании и откуда берутся числа?»* — Остаток долга, выдачи с начала месяца, PAR30, NPL90, FPD30 последнего зрелого поколения, коэффициент сборов; каждое из представления с заявленной зернистостью и правилом даты отчёта (представление статуса на уровне кредита, месячное портфельное представление, чистое представление платежей); под каждым показателем назвать определение и сверить представления друг с другом.

Завтра: контрольная — вся неделя как один письменный EDA-отчёт по кредитному портфелю и восемь вопросов для собеседования.

---

## Тест дня :id=day-quiz

Для завершения дня нужно набрать 80 %. Пересдавать можно сколько угодно.

```quiz
{"id": "w03d4", "pass": 0.8, "questions": [
  {"type": "single", "q": "У вас есть v_loan_status (представление) и t_loan_status (CREATE TABLE … AS SELECT * FROM v_loan_status). Сегодня ночью добавили платёж. Что верно завтра?", "options": ["Оба показывают новый платёж", "Представление его показывает, таблица нет — зато таблица читается быстрее", "Таблица его показывает, представление нет", "Ни то ни другое, пока не пересоздать оба"], "answer": 1, "explain": "Представление хранит текст запроса и пересчитывается при каждом чтении; материализованная таблица хранит замороженный результат (→ раздел 1, «Представления»; «Материализация»)."},
  {"type": "single", "q": "У due_date есть индекс. Что покажет план для этого фильтра и как это исправить?", "code": "EXPLAIN QUERY PLAN\nSELECT COUNT(*) FROM installments\nWHERE strftime('%Y-%m', due_date) = '2026-09';", "options": ["SEARCH — индекс используется; исправлять нечего", "SCAN — функция прячет столбец; напишите due_date >= '2026-09-01' AND due_date < '2026-10-01'", "SCAN — удалите индекс", "Ошибка — функции нельзя использовать с индексами"], "answer": 1, "explain": "Движок не может искать значение, которое приходится вычислять для каждой строки; полуоткрытый диапазон превращает сканирование в SEARCH (→ раздел 1, «Читаем план выполнения»; привычка 3)."},
  {"type": "multi", "q": "ix_payments_method индексирует method, а у других столбцов свои индексы. В каких фильтрах индекс НЕ поможет?", "options": ["WHERE LOWER(method) = 'card'", "WHERE method LIKE '%card'", "WHERE is_weekend = 1 (столбец с двумя значениями)", "WHERE due_date >= '2026-09-01' AND due_date < '2026-10-01'", "JOIN payments p ON p.installment_id = i.installment_id"], "answer": [0, 1, 2], "explain": "Функция над столбцом, начальный % и столбец с двумя значениями сводят индекс на нет; равенство, диапазоны и соединения по индексируемому столбцу выигрывают (→ раздел 1, «Индексы»)."},
  {"type": "single", "q": "Что такое кластерный индекс в SQL Server?", "options": ["Любой индекс по двум и более столбцам", "Сама таблица, хранимая в порядке индекса, — поэтому он только один на таблицу", "Копия таблицы на другом сервере", "Индекс, который работает только с GROUP BY"], "answer": 1, "explain": "Некластерные индексы — отдельные отсортированные структуры, указывающие внутрь таблицы; их может быть много (→ раздел 1, «Индексы»)."},
  {"type": "single", "q": "Отчёт суммировал principal по loans JOIN installments и получил в 24 раза больше. Кто-то «чинит» его так. Что всё равно не так?", "code": "SELECT DISTINCT l.loan_id, l.principal, i.due_date\nFROM loans l\nJOIN installments i ON i.loan_id = l.loan_id;", "options": ["Ничего — DISTINCT убирает повторы", "Со столбцом платежа в списке каждая строка по-прежнему различна, поэтому ничего не сворачивается; исправьте зернистость: сначала агрегируйте платежи по кредиту, затем соединяйте", "DISTINCT нельзя использовать с JOIN", "Нужно использовать UNION"], "answer": 1, "explain": "DISTINCT прячет ошибку соединения лишь случайно и медленный; агрегируйте на каждой зернистости, затем соединяйте (→ привычка 4; P6)."},
  {"type": "single", "q": "Вы только что создали v_loan_status (одна строка на кредит). Какую проверку запускаете первой?", "options": ["SELECT * FROM v_loan_status", "SELECT COUNT(*), COUNT(DISTINCT loan_id) FROM v_loan_status — значения должны совпасть", "DROP VIEW и создать заново", "SELECT MAX(dpd)"], "answer": 1, "explain": "Проверка зернистости: если строк больше, чем различных кредитов, соединение размножило; каждое представление поставляется со своим проверочным запросом (→ раздел 2, Разобранный пример; раздел 6)."},
  {"type": "number", "q": "Крошечный портфель из четырёх кредитов на сегодня. Чему равен PAR30 в %?", "code": "loan | dpd | outstanding\nA    |   0 | 100\nB    |  15 |  50\nC    |  45 |  30\nD    | 120 |  20", "answer": 25, "explain": "PAR30 = остаток долга кредитов с DPD > 30 ÷ общий остаток долга = (30 + 20) / 200 = 25 %; NPL90 был бы 20 / 200 = 10 % (→ раздел 6, Уголок компании)."},
  {"type": "single", "q": "PAR30 равен 3.12 %, а NPL90 — 2.55 %. Что говорят два таких близких числа?", "options": ["Данные неверны — они должны сильно различаться", "Большая часть денег под риском уже в 90+: просроченный портфель — в основном старый долг", "Взыскание работает превосходно", "Большинство просроченных кредитов в 31–60"], "answer": 1, "explain": "PAR30 включает NPL90; когда они близки, в 31–90 лежит мало, и большая часть остатка долга под риском просрочена больше 90 дней (→ раздел 6, «Читаем все шесть вместе»)."}
]}
```

<!-- challenge:start -->

---

## Задача дня :id=daily-challenge

Бонус для любознательных: один более трудный вопрос по теме дня. Решите его за XP, которые растут вместе с серией задач, — полная неделя из пяти ещё добавляет 10 % к пятничному ваучеру.

```challenge
{"id": "w03d4", "q": "Тимуру нужен показатель NPL90 по регионам. Постройте v_loan_status как на этой странице (чистые платежи, на 2026-10-01) и ответьте только из представления: чему равен NPL90 по региону Tashkent — остаток долга кредитов с DPD больше 90, делённый на общий остаток долга региона? Процент с 2 знаками после запятой.", "type": "number", "dp": 2, "h": ["84584e0f0405652352b4fafa"], "hint": "Условная сумма по столбцу outstanding представления; регион уже есть столбцом представления.", "sol": "U0VMRUNUIHJlZ2lvbiwKICAgICAgIFNVTShDQVNFIFdIRU4gZHBkID4gOTAgVEhFTiBvdXRzdGFuZGluZyBFTFNFIDAgRU5EKSBBUyBucGw5MF9vdXRzdGFuZGluZywKICAgICAgIFNVTShvdXRzdGFuZGluZykgQVMgb3V0c3RhbmRpbmcsCiAgICAgICBST1VORCgxMDAuMCAqIFNVTShDQVNFIFdIRU4gZHBkID4gOTAgVEhFTiBvdXRzdGFuZGluZyBFTFNFIDAgRU5EKSAvIFNVTShvdXRzdGFuZGluZyksIDIpIEFTIG5wbDkwX3BjdApGUk9NIHZfbG9hbl9zdGF0dXMKR1JPVVAgQlkgcmVnaW9uCk9SREVSIEJZIG5wbDkwX3BjdCBERVNDOwotLSB0aGUgc2FtZSB0ZXh0IG9uIFNRTCBTZXJ2ZXIKLS0gVGFzaGtlbnQ6IDEgOTIwIDk0MyA5NzAgLyA4MSA2NzkgNzM4IDA3MSA9IDIuMzUgJSAoOTEgbG9hbnMgb3ZlciA5MCBEUEQpClRoZSBjb21wYW55J3MgTlBMOTAgaXMgMi41NSAlOyBUYXNoa2VudCwgd2l0aCAzOSAlIG9mIHRoZSBib29rLCBzaXRzIHNsaWdodGx5IGJlbG93IGl0LCBhbmQgTnVrdXMgaXMgdGhlIG91dGxpZXIgYXQgNi43NCAlLiBPdmVyIDkwIG1lYW5zIGJ1Y2tldCA5MCssIHNvIGRwZCA+IDkwLCBub3QgPj0gOTAuIE9uY2UgdGhlIHZpZXcgaXMgcmlnaHQgdGhlIHRpbGUgaXMgb25lIEdST1VQIEJZIOKAlCB0aGUgZGVmaW5pdGlvbiBvZiBEUEQgYW5kIG91dHN0YW5kaW5nIGxpdmVzIGluIG9uZSBwbGFjZSwgd2hpY2ggaXMgd2hhdCBUaW11ciBhc2tlZCBmb3Iu"}
```

<!-- challenge:end -->
