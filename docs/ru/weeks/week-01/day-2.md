# Неделя 1 · День 2 — Ваши первые запросы

<span class="badge">Теория 60 мин</span> <span class="badge">Практика 60 мин</span> <span class="badge">Домашнее задание</span> <span class="badge company">Уголок компании</span>

> STORY **Вторник, 9:15.** Бекзод, портфельный менеджер, перегибается через перегородку: *«Мадина говорит, вы наш новый аналитик. Я веду книги Auto и SME. Каждый понедельник я открываю таблицу loans в Excel и листаю, пока глаза не заболят. Может, база данных просто… отдаст мне нужные строки?»* Мадина из-за экрана: *«Для этого SELECT и существует. Покажите ему до обеда.»*

## Сегодня в 3 строках :id=today-in-3-lines

- Вы можете написать **SELECT**, который выбирает столбцы, переименовывает их, убирает дубликаты, **фильтрует строки** через `WHERE`, **сортирует** их и возвращает только первые N.
- Вы знаете семь операторов фильтра (`=`, `<>`, `>`/`<`, `BETWEEN`, `IN`, `LIKE`, `IS NULL`) и то, как `AND`/`OR`/`NOT` их объединяют, — включая ловушку со скобками.
- Вы можете посчитать **долю одобрений** Nur Finance двумя подсчётами и объяснить ловушку отменённых заявок.

---

## 1. Теория — задаём таблице вопрос :id=1-learn-asking-a-table-a-question

### Устройство запроса :id=the-shape-of-a-query

У каждого запроса, который вы напишете на этой неделе, один и тот же каркас. Порядок слов фиксирован, а база выполняет их в другом порядке (FROM → WHERE → SELECT → ORDER BY), поэтому можно фильтровать по столбцу, который вы не выводите.

```sql
SELECT   column1, column2        -- какие столбцы (или * для всех)
FROM     table_name              -- какая таблица
WHERE    condition               -- какие строки (необязательно)
ORDER BY column1 DESC;           -- в каком порядке (необязательно)
```

Попробуйте прямо сейчас — нажмите **▶ Выполнить** под запросом:

```sql
SELECT loan_id, principal, disbursed_at, status
FROM loans;
```

7 828 строк. Та самая сетка, которую вы вчера листали, но четыре столбца теперь выбрали *вы*. `SELECT *` выводит все столбцы — годится, чтобы посмотреть, но плохо для отчёта.

### Псевдонимы, DISTINCT и первые N строк :id=aliases-distinct-and-the-first-n-rows

```sql
SELECT principal AS amount_uzs, disbursed_at AS paid_out_on   -- переименовываем столбцы (alias, псевдоним)
FROM loans;

SELECT DISTINCT channel FROM applications;      -- одна строка на каждое различное значение
```

`DISTINCT` убирает повторяющиеся строки по *выбранным столбцам*. Выполните второй запрос: три строки — `app`, `branch`, `partner`. Это самый быстрый способ узнать, что содержит столбец.

Первые N строк — единственное место, где SQL Server и SQLite пишут по-разному. На страницах всегда показаны оба варианта:

```sql
-- SQL Server
SELECT TOP 5 loan_id, principal FROM loans ORDER BY principal DESC;
-- SQLite / PostgreSQL / MySQL
SELECT loan_id, principal FROM loans ORDER BY principal DESC LIMIT 5;
```

`ORDER BY principal DESC` = сначала самые большие; `ASC` (по умолчанию) = сначала самые маленькие. Сортировать можно по нескольким столбцам: `ORDER BY region, principal DESC`.

### WHERE — семь операторов :id=where-the-seven-operators

| Оператор | Пример | Читается как |
|---|---|---|
| `=` | `status = 'active'` | в точности равно (текст в одинарных кавычках) |
| `<>` (также `!=`) | `status <> 'active'` | не равно |
| `>`, `>=`, `<`, `<=` | `principal > 200000000` | сравнение чисел или дат |
| `BETWEEN a AND b` | `principal BETWEEN 1000000 AND 5000000` | включая оба края |
| `IN (…)` | `region IN ('Nukus', 'Termez')` | равно любому значению из списка |
| `LIKE` | `first_name LIKE 'M%'` | шаблон: `%` = любое число символов, `_` = ровно один |
| `IS NULL` / `IS NOT NULL` | `monthly_income IS NULL` | ячейка пуста |

Объединяйте через `AND`, `OR`, `NOT`. **`AND` связывает сильнее, чем `OR`** — как умножение раньше сложения, — поэтому, когда вы их смешиваете, ставьте скобки:

```sql
WHERE product_id = 5 AND (status = 'approved' OR status = 'approved_not_disbursed')
```

Без скобок база прочитает `(product_id = 5 AND status = 'approved') OR status = 'approved_not_disbursed'` — это другой вопрос, и она вас не предупредит. P10 показывает, насколько сильно вы промахнётесь.

### Три вещи, на которых спотыкаются новички :id=three-things-that-bite-beginners

1. **NULL — это не значение.** `monthly_income = NULL` всегда возвращает ноль строк. Пустые ячейки ищут через `IS NULL`. (*NULL — это «пустое значение», «неизвестно».*)
2. **Сравнение текста.** В SQLite `status = 'Active'` ничего не найдёт (регистр важен). В SQL Server с сопоставлением по умолчанию найдётся и `active`. Пишите значения в точности так, как они хранятся, и вы в безопасности в обоих.
3. **Даты в SQLite сравниваются как текст** (`'2026-09-01'`), а в SQL Server — как настоящие даты, но *один и тот же* литерал `YYYY-MM-DD` работает в обоих. Для «в 2026 году» лучше диапазон, чем функция:

```sql
WHERE disbursed_at >= '2026-01-01' AND disbursed_at < '2027-01-01'   -- в обеих СУБД
-- альтернативы:  SQL Server: YEAR(disbursed_at) = 2026   ·   SQLite: strftime('%Y', disbursed_at) = '2026'
```

Осторожно с `applied_at`: там хранится дата *и время* (`2025-06-02 10:35:00`), поэтому `applied_at BETWEEN '2025-01-01' AND '2025-12-31'` молча теряет все заявки, поданные 31 декабря после полуночи. Используйте `>= '2025-01-01' AND < '2026-01-01'`.

### Углубление (необязательно) :id=depth-optional

- ▶ Baraa, *Query data (SELECT)* [0:34:01](https://youtu.be/SSKVgrwhzus?t=2041&end=5551) — 60 мин, SELECT/DISTINCT/TOP/ORDER BY на его базе SalesDB; ▶ *Filtering data* [2:08:03](https://youtu.be/SSKVgrwhzus?t=7683&end=10077) — 40 мин, все перечисленные выше операторы.
- Презентация на русском (TBC Data Analytics 2.0, если она у вас есть) `2.1 SQL-1-46.pdf`, страницы 1–46 (SELECT, WHERE, ORDER BY). *Английские термины:* запрос = query, выборка = selection/result set, условие = condition, сортировка = sorting, псевдоним = alias.

---

## 2. Разобранный пример — первый запрос Бекзода :id=_2-worked-example-bekzod39s-first-request

*«Сколько Micro-кредитов мы выдали в сентябре? И покажите пять самых крупных.»*

**Шаг 1 — переводим слова в таблицу и столбцы.** «Micro-кредиты» → `loans` с `product_id = 1` (проверьте в `products`: Micro loan — это id 1). «Выданы в сентябре» → `disbursed_at` в сентябре 2026 (данные на 1 октября 2026). «Пять самых крупных» → `ORDER BY principal DESC`, первые пять.

**Шаг 2 — сначала строки, потом подсчёт.** Всегда смотрите на строки, прежде чем их считать: неверный фильтр виден в строках и невиден в числе.

```sql
SELECT loan_id, principal, disbursed_at
FROM loans
WHERE product_id = 1
  AND disbursed_at BETWEEN '2026-09-01' AND '2026-09-30'
ORDER BY principal DESC;
```

**Шаг 3 — считаем.** Замените список столбцов на `COUNT(*)` (единственная агрегатная функция на сегодня; остальные — на 2-й неделе):

```sql
SELECT COUNT(*) AS micro_loans_sep
FROM loans
WHERE product_id = 1
  AND disbursed_at BETWEEN '2026-09-01' AND '2026-09-30';     -- ожидайте 123
```

**Шаг 4 — пять самых крупных.** `SELECT TOP 5 …` / `… LIMIT 5` к запросу из шага 2. Бекзод получает 123 и таблицу из пяти строк за 90 секунд вместо целого утра прокрутки. Запишите число: 123 Micro-кредита выдано в сентябре.

---

## 3. Практика (60 мин) :id=3-practice-60-min

Пишите каждый запрос в поле под вопросом — он сохраняется в этом браузере. **▶ Выполнить**, посмотрите на строки, затем считайте. **✔ Проверить** сообщает, совпадает ли ваш результат с ответом, не показывая его; открывайте свёрнутый блок только после того, как получили число.

**P1.** Выведите различные значения `loans.status`. Сколько их?

<details><summary>Ответ</summary>

```sql
SELECT DISTINCT status FROM loans ORDER BY status;
```
Четыре: active, closed, default, written_off.

</details>

**P2.** Все Auto-кредиты (product_id 4) с principal больше 200 000 000, выданные в 2026 году, сначала самые крупные. Сколько строк и какой самый крупный?

<details><summary>Ответ</summary>

```sql
SELECT loan_id, principal, disbursed_at
FROM loans
WHERE product_id = 4 AND principal > 200000000
  AND disbursed_at >= '2026-01-01' AND disbursed_at < '2027-01-01'
ORDER BY principal DESC;
```
Ожидайте 89 строк; самый крупный — кредит 7608, 396 210 000, выдан 2026-05-26.

</details>

**P3.** Клиенты с пустым ежемесячным доходом. Посчитайте их. Затем посчитайте тех, у кого доход заполнен, и проверьте, что два числа в сумме дают 6 040.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*) FROM customers WHERE monthly_income IS NULL;      -- ожидайте 356
SELECT COUNT(*) FROM customers WHERE monthly_income IS NOT NULL;  -- ожидайте 5684
```
356 + 5 684 = 6 040. Если вы написали `= NULL`, то получили 0 — перечитайте «Три вещи, на которых спотыкаются».

</details>

**P4.** Заявки, пришедшие через приложение и отклонённые, упорядоченные по кредитному баллу от высшего к низшему. Сколько их и какой самый высокий балл у отклонённой заявки? Куда попали строки с пустым баллом?

<details><summary>Ответ</summary>

```sql
SELECT application_id, credit_score, requested_amount
FROM applications
WHERE channel = 'app' AND status = 'rejected'
ORDER BY credit_score DESC;
```
Ожидайте 1 359 строк; первая — заявка 10764 с баллом 821 (затем 811, 806). У 38 строк `credit_score` равен NULL; обе СУБД считают NULL наименьшим значением, поэтому при `DESC` они внизу (при `ASC` оказались бы первыми). Отказ при балле 821 странен — отметьте это до четверга.

</details>

**P5.** Сколько клиентов живёт в Nukus или Termez? Напишите один раз через `OR`, один раз через `IN`.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*) FROM customers WHERE region = 'Nukus' OR region = 'Termez';
SELECT COUNT(*) FROM customers WHERE region IN ('Nukus', 'Termez');
```
В обоих случаях ожидайте 737.

</details>

**P6.** Сколько кредитов *не* active? Сверьте с количеством active.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*) FROM loans WHERE status <> 'active';   -- ожидайте 4476
SELECT COUNT(*) FROM loans WHERE status = 'active';    -- ожидайте 3352
```
4 476 + 3 352 = 7 828.

</details>

**P7.** Клиенты, у которых имя начинается на `M`. Затем сузьте до имён, начинающихся на `Ma`.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*) FROM customers WHERE first_name LIKE 'M%';    -- ожидайте 570
SELECT COUNT(*) FROM customers WHERE first_name LIKE 'Ma%';   -- ожидайте 419
```
(Madina, Malika, Maftuna, Murod…). В SQLite `LIKE` по умолчанию не учитывает регистр для ASCII-букв; в SQL Server это зависит от сопоставления — здесь оба дают одно и то же.

</details>

**P8.** Кредиты с principal от 1 000 000 до 5 000 000 включительно.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*) FROM loans WHERE principal BETWEEN 1000000 AND 5000000;   -- ожидайте 3228
```
То же, что `principal >= 1000000 AND principal <= 5000000`.

</details>

**P9.** Пять самых крупных кредитов за всё время: id кредита, principal, id продукта.

<details><summary>Ответ</summary>

```sql
-- SQL Server
SELECT TOP 5 loan_id, principal, product_id FROM loans ORDER BY principal DESC;
-- SQLite
SELECT loan_id, principal, product_id FROM loans ORDER BY principal DESC LIMIT 5;
```
Сверху кредит 2861 с 599 060 000, затем 4570, 4601, 4970, 7520 — все по продукту 5 (SME).

</details>

**P10.** Одобренные SME-заявки (product_id 5) с запрошенной суммой не менее 500 000 000. Посчитайте их. Затем намеренно уберите заботу о скобках и AND-OR — напишите `product_id = 5 AND requested_amount >= 500000000 OR status = 'approved'` — и посмотрите, что получится.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*) FROM applications
WHERE product_id = 5 AND requested_amount >= 500000000 AND status = 'approved';   -- ожидайте 128

SELECT COUNT(*) FROM applications
WHERE product_id = 5 AND requested_amount >= 500000000 OR status = 'approved';    -- ожидайте 8010 (!)
```
Второй запрос считает *каждую* одобренную заявку по любому продукту плюс крупные SME-заявки. 128 против 8 010 — и ни одного сообщения об ошибке. Скобки всегда, когда `AND` встречается с `OR`.

</details>

<span class="badge stretch">Со звёздочкой</span> **P11.** Клиенты, родившиеся до 1960 года, с ежемесячным доходом больше 30 000 000, сначала самые богатые. Сколько их и кто первый? Затем напишите одно предложение о том, выглядит ли эта группа правдоподобно для кредитора массового рынка.

<details><summary>Ответ</summary>

```sql
SELECT customer_id, first_name, last_name, birth_date, monthly_income
FROM customers
WHERE birth_date < '1960-01-01' AND monthly_income > 30000000
ORDER BY monthly_income DESC;
```
Ожидайте 108 строк; первый — Zafar Mirzaev (клиент 3056), родился 1958-12-02, доход 59 867 394. Правдоподобно как небольшой «хвост» состоятельных клиентов/SME; неправдоподобен кто-либо, родившийся до 1920 года или после сегодняшнего дня, — посмотрите, что вы найдёте в четверг.

</details>

---

## 4. Домашнее задание <span class="badge hw">HW 1.2 — Срок: день 4</span> :id=4-homework-hw-12-due-day-4

**Список Бекзода.** Он прислал десять вопросов. Ответьте на каждый одним запросом и полученным числом (или первыми строками). Сдайте через окно 📎 ниже:

1. `bekzod.sql` — десять запросов, каждому предшествует `-- Qn: <его вопрос>`, а за ним следует `-- result: <число или первые строки>`.
2. `surprised.md` — 5–10 строк: *что вас удивило* в данных при выполнении (неожиданное значение, столбец, который вёл себя странно, подсчёт, который не сошёлся).

Его вопросы:

- Q1 Сколько кредитов Nur Finance выдала за всё время? Q2 Сколько из них Auto? Q3 Сколько SME-кредитов имеют срок 36 месяцев?
- Q4 Сколько кредитов выдано в 2026 году? Q5 Сколько — только в сентябре 2026?
- Q6 Десять самых маленьких кредитов (id кредита, id продукта, principal), сначала самые маленькие. Q7 Сколько кредитов имеют годовую ставку 0 (что это за продукт)?
- Q8 Сколько клиентов в сегменте `sme` за пределами Tashkent? Q9 Сколько заявок запросили больше 500 000 000? Q10 Заявки с пятью самыми высокими кредитными баллами, которые тем не менее были отклонены (любой канал).

**Выполните прямо здесь:**

```sqltask
{"check": "hw1.2", "lesson": "W1D2", "title": "HW 1.2 — 10 вопросов Бекзода", "file": "bekzod.sql", "tasks": [{"id": "Q1", "q": "Сколько кредитов Nur Finance выдала за всё время?"}, {"id": "Q2", "q": "Сколько из них Auto?"}, {"id": "Q3", "q": "Сколько SME-кредитов имеют срок 36 месяцев?"}, {"id": "Q4", "q": "Сколько кредитов выдано в 2026 году?"}, {"id": "Q5", "q": "Сколько — только в сентябре 2026?"}, {"id": "Q6", "q": "Десять самых маленьких кредитов (id кредита, id продукта, principal), сначала самые маленькие."}, {"id": "Q7", "q": "Сколько кредитов имеют годовую ставку 0 (что это за продукт)?"}, {"id": "Q8", "q": "Сколько клиентов в сегменте sme за пределами Tashkent?"}, {"id": "Q9", "q": "Сколько заявок запросили больше 500 000 000?"}, {"id": "Q10", "q": "Заявки с пятью самыми высокими кредитными баллами, которые тем не менее были отклонены (любой канал)."}, {"id": "Surprised", "file": "surprised.md", "text": true, "minLines": 5, "q": "Что вас удивило в данных (5–10 строк): неожиданное значение, столбец, который вёл себя странно, подсчёт, который не сошёлся, — вместе с запросом, который это показывает."}]}
```

Что оценивается: (a) каждый запрос выполняется, а строка с результатом совпадает с данными, (b) условия `WHERE` используют правильный оператор (`IS NULL`, `BETWEEN`, `IN`, скобки там, где нужны), (c) в `surprised.md` названа хотя бы одна настоящая странность вместе с запросом, который её показывает.

---

## 5. Самопроверка :id=5-self-check

1. Почему `WHERE monthly_income = NULL` ничего не возвращает? *(→ раздел 1, «Три вещи, на которых спотыкаются»)*
2. `WHERE a AND b OR c` — какие два условия база группирует первыми? *(→ раздел 1, «WHERE — семь операторов»)*
3. Почему `applied_at BETWEEN '2025-01-01' AND '2025-12-31'` неверно для «заявок за 2025 год»? *(→ раздел 1, «Три вещи, на которых спотыкаются», пункт 3)*

---

## 6. Уголок компании <span class="badge company">Доля одобрений</span> :id=6-company-corner-approval-rate

**Определение.** Доля одобрений (approval rate) — это доля кредитных заявок, на которые компания ответила *«да»*:

> **доля одобрений = одобренные заявки ÷ заявки, по которым принято решение**

Это первое число, на которое смотрит риск-менеджер после изменения правил скоринга, и первое число, на которое жалуется менеджер по продажам. Два запроса и деление вручную (на следующей неделе `GROUP BY` и `CASE` будут делить за вас):

```sql
SELECT COUNT(*) FROM applications;                                                    -- ожидайте 14000
SELECT COUNT(*) FROM applications WHERE status IN ('approved', 'approved_not_disbursed'); -- ожидайте 8595
```

8 595 / 14 000 = **61.4 %**. Обратите внимание: `approved_not_disbursed` считается одобренной: компания *сказала «да»*; клиент ушёл. Одобрение — это про наше решение, а не про решение клиента.

**Ловушка — отменённые заявки.** Выполните ещё один запрос:

```sql
SELECT COUNT(*) FROM applications WHERE status = 'cancelled';   -- ожидайте 1817
```

1 817 заявок были отозваны клиентом до решения (или без него). Входят ли они в знаменатель?

| Соглашение | Знаменатель | Nur Finance сегодня | Кто это предпочитает |
|---|---|---|---|
| **A. Все заявки** | каждая полученная заявка | 8 595 / 14 000 = **61.4 %** | Маркетинг / продукт: «из всех, кто просил, скольким дали деньги?» (на самом деле это конверсия воронки) |
| **B. Заявки с решением** | только одобренные + отклонённые (отменённые исключены) | 8 595 / 12 183 = **70.5 %** | Риск: «из случаев, по которым решение принимали *мы*, как часто мы говорили «да»?» — отмена не наше решение |

Девять пунктов разницы из-за одного слова. Ни то ни другое не ошибка; ошибка — сравнивать 61 % из одного отчёта с 70 % из другого и объявлять «скачок одобрений». Называя долю одобрений, указывайте, какое соглашение вы используете, — а если у компании-заказчика есть собственное определение, берите его (глоссарий его зафиксирует).

Третий вариант, с которым вы столкнётесь, — **только выданные**: считаются `approved`, но не `approved_not_disbursed` (7 917 / 14 000 = 56.6 %). Некоторые команды называют это *take-up* или *конверсией в выдачу*; не позволяйте называть это долей одобрений.

> Версия для собеседования: *«Как бы вы посчитали долю одобрений и что может привести к тому, что две команды сообщат разные числа?»* — Назовите формулу, затем два знаменателя (отменённые включены или нет), затем выданные против одобренных. Бонус: упомяните, что доля одобрений по каналам различается (канал app здесь одобряет меньше, потому что скоринг без сотрудника филиала строже).

Завтра: как были спроектированы таблицы и почему таблицу кредитов пришлось разделить. Принесите список Бекзода.

---

## Тест дня :id=day-quiz

Чтобы завершить день, наберите 80 %. Пересдавать можно сколько угодно раз.

```quiz
{"id": "w01d2", "pass": 0.8, "questions": [
  {"type": "single", "q": "Что возвращает этот запрос на данных Nur Finance?", "code": "SELECT COUNT(*) FROM customers\nWHERE monthly_income = NULL;", "options": ["Количество клиентов с пустым доходом", "Всегда 0", "Сообщение об ошибке", "Всех клиентов"], "answer": 1, "explain": "NULL — это не значение, поэтому = NULL никогда не истинно; пустые ячейки ищут через IS NULL (→ раздел 1, Три вещи, на которых спотыкаются)."},
  {"type": "single", "q": "Как база данных читает это предложение WHERE?", "code": "WHERE product_id = 5 AND status = 'approved'\n   OR status = 'approved_not_disbursed'", "options": ["product_id = 5 AND (status = 'approved' OR status = 'approved_not_disbursed')", "(product_id = 5 AND status = 'approved') OR status = 'approved_not_disbursed'", "Отказывается выполнять без скобок", "Игнорирует строку с OR"], "answer": 1, "explain": "AND связывает сильнее, чем OR, поэтому каждая заявка approved_not_disbursed по любому продукту попадает в результат без всякого предупреждения (→ раздел 1, P10)."},
  {"type": "single", "q": "Почему этот фильтр неверен для «заявок, поданных в 2025 году»?", "code": "WHERE applied_at BETWEEN '2025-01-01' AND '2025-12-31'", "options": ["BETWEEN исключает обе граничные даты", "applied_at хранит дату и время, поэтому заявки от 31 декабря после полуночи отбрасываются", "Даты нужно писать как 01.01.2025", "BETWEEN работает только с числами"], "answer": 1, "explain": "'2025-12-31 10:35:00' позже, чем '2025-12-31'; используйте >= '2025-01-01' AND < '2026-01-01' (→ раздел 1, Три вещи, на которых спотыкаются, пункт 3)."},
  {"type": "multi", "q": "Какие предложения WHERE вернут клиентов, живущих в Nukus или Termez?", "options": ["WHERE region IN ('Nukus', 'Termez')", "WHERE region = 'Nukus' OR region = 'Termez'", "WHERE region = 'Nukus' AND region = 'Termez'", "WHERE region BETWEEN 'Nukus' AND 'Termez'", "WHERE region LIKE 'Nukus, Termez'"], "answer": [0, 1], "explain": "IN — это короткая запись OR; AND требует строку, которая находится в обоих городах одновременно, и ничего не вернёт (→ P5)."},
  {"type": "single", "q": "У 108 отклонённых заявок пустой credit_score. Где они окажутся в этом результате?", "code": "SELECT application_id, credit_score\nFROM applications\nWHERE status = 'rejected'\nORDER BY credit_score DESC;", "options": ["Сверху", "Внизу", "Они не попадут в результат", "Там, где были сохранены"], "answer": 1, "explain": "Обе СУБД считают NULL наименьшим значением, поэтому DESC ставит его в конец, а ASC — в начало (→ P4)."},
  {"type": "single", "q": "Вы работаете в SQLite. Какой запрос выдаст пять самых крупных кредитов?", "options": ["SELECT TOP 5 loan_id, principal FROM loans ORDER BY principal DESC;", "SELECT loan_id, principal FROM loans ORDER BY principal DESC LIMIT 5;", "SELECT loan_id, principal FROM loans ORDER BY principal LIMIT 5;", "SELECT loan_id, principal FROM loans LIMIT 5 ORDER BY principal DESC;"], "answer": 1, "explain": "TOP — это SQL Server; в SQLite LIMIT стоит в самом конце, а без DESC вы получите пять самых маленьких (→ раздел 1, Псевдонимы, DISTINCT и первые N строк)."},
  {"type": "single", "q": "Клиент был одобрен, но ушёл, не взяв деньги (статус approved_not_disbursed). Для доли одобрений эта заявка считается…", "options": ["одобренной — компания сказала «да»", "отклонённой", "отменённой", "нигде не учитывается"], "answer": 0, "explain": "Одобрение — это про наше решение, а не про решение клиента (→ раздел 6, Уголок компании)."},
  {"type": "number", "q": "Доля одобрений, соглашение B (отменённые исключены из знаменателя): 8 595 одобрено, 14 000 заявок, 1 817 отменено. Ответ в %, один знак после запятой.", "answer": 70.5, "tol": 0.1, "explain": "8 595 / (14 000 − 1 817) = 8 595 / 12 183 ≈ 70.5 %, против 61.4 % со всеми заявками; всегда указывайте, какое соглашение используется (→ раздел 6, Уголок компании)."}
]}
```

<!-- challenge:start -->

---

## Задача дня :id=daily-challenge

Бонус для любознательных: один более сложный вопрос по теме дня. Решите его и получите XP, которые растут вместе с серией задач; полная неделя из пяти задач добавляет ещё 10 % к ваучеру в пятницу.

```challenge
{"id": "w01d2", "q": "Нилуфар (риск) нужна доля одобрений партнёрского канала по заявкам, поданным в календарном 2025 году, по соглашению о решённых заявках: отменённые заявки исключены из знаменателя, а approved_not_disbursed считается одобренной. Укажите её в процентах с 1 знаком после запятой.", "type": "number", "dp": 1, "h": ["d037e48df4cd8f8d9f5bb417"], "hint": "Посмотрите, что хранит applied_at, прежде чем писать фильтр по году, и решите, какие статусы входят в знаменатель.", "sol": "U0VMRUNUIENPVU5UKCopIEZST00gYXBwbGljYXRpb25zCldIRVJFIGNoYW5uZWwgPSAncGFydG5lcicgQU5EIGFwcGxpZWRfYXQgPj0gJzIwMjUtMDEtMDEnIEFORCBhcHBsaWVkX2F0IDwgJzIwMjYtMDEtMDEnCiAgQU5EIHN0YXR1cyBJTiAoJ2FwcHJvdmVkJywgJ2FwcHJvdmVkX25vdF9kaXNidXJzZWQnKTsgICAgICAgICAgICAgICAtLSA2ODMKU0VMRUNUIENPVU5UKCopIEZST00gYXBwbGljYXRpb25zCldIRVJFIGNoYW5uZWwgPSAncGFydG5lcicgQU5EIGFwcGxpZWRfYXQgPj0gJzIwMjUtMDEtMDEnIEFORCBhcHBsaWVkX2F0IDwgJzIwMjYtMDEtMDEnCiAgQU5EIHN0YXR1cyBJTiAoJ2FwcHJvdmVkJywgJ2FwcHJvdmVkX25vdF9kaXNidXJzZWQnLCAncmVqZWN0ZWQnKTsgICAtLSA5NzUKKNCi0L7RgiDQttC1INGC0LXQutGB0YIg0LfQsNC/0YDQvtGB0LAg0YDQsNCx0L7RgtCw0LXRgiDQuCDQsiBTUUxpdGUsINC4INCyIFNRTCBTZXJ2ZXIuKQo2ODMgLyA5NzUgPSA3MC4xICUuCtCV0YHQu9C4INCy0LfRj9GC0Ywg0LIg0LfQvdCw0LzQtdC90LDRgtC10LvRjCDQstGB0LUgMSAxMDgg0L/QsNGA0YLQvdGR0YDRgdC60LjRhSDQt9Cw0Y/QstC+0LogMjAyNSDQs9C+0LTQsCwg0L/QvtC70YPRh9C40YLRgdGPIDYxLjYgJSDigJQg0LvQvtCy0YPRiNC60LAg0L7RgtC80LXQvdGR0L3QvdGL0YUg0LfQsNGP0LLQvtC6INC40LcgwqvQo9Cz0L7Qu9C60LAg0LrQvtC80L/QsNC90LjQuMK7LiDQn9C+0LvRg9C+0YLQutGA0YvRgtGL0Lkg0YTQuNC70YzRgtGAINC/0L4g0LTQsNGC0LUg0YHQvtGF0YDQsNC90Y/QtdGCINCy0LXRh9C10YDQvdC40LUg0LfQsNGP0LLQutC4IDMxINC00LXQutCw0LHRgNGPLCDQutC+0YLQvtGA0YvQtSDQvtGC0LHRgNCw0YHRi9Cy0LDQtdGCIEJFVFdFRU4g4oCmICcyMDI1LTEyLTMxJy4g0JrQvtCz0LTQsCDQvdCw0LfRi9Cy0LDQtdGC0LUgNzAuMSwg0L/QuNGI0LjRgtC1INGA0Y/QtNC+0LwgwqvQv9C+INGB0L7Qs9C70LDRiNC10L3QuNGOINC+INGA0LXRiNGR0L3QvdGL0YUg0LfQsNGP0LLQutCw0YXCuy4="}
```

<!-- challenge:end -->
