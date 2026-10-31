# Неделя 3 · День 2 — Ранжирование и взгляд вбок: ROW_NUMBER, LAG и дубликаты платежей

<span class="badge">Теория 60 мин</span> <span class="badge">Расследование 30 мин</span> <span class="badge">Практика 50 мин</span> <span class="badge company">Уголок компании</span>

> STORY **Вторник, 9:05.** Севара приходит с распечатанной банковской выпиской и двумя цветами маркера. *«Взыскание говорит, что по некоторым платежам мы получили деньги **дважды** — тот же день, та же сумма, тот же платёж по графику. Финансы говорят: невозможно, у системы уникальные ID платежей. Мне нужен список, а не мнение. И пока вы смотрите: по каждому просроченному кредиту я хочу знать, стало ему **хуже или лучше** с прошлого месяца — Нилуфар называет это roll rates, а я — „заплатили или нет“».* Мадина: *«А ещё Бекзоду нужны три крупнейших кредита по каждому продукту и каждый месяц в сравнении с предыдущим. Инструменты, как ни странно, те же».*

## Сегодня в 3 строках :id=today-in-3-lines

- **Ранжирующие окна:** `ROW_NUMBER` (уникальные 1, 2, 3 …), `RANK` (равные значения получают общий номер, затем пропуск), `DENSE_RANK` (равные значения, без пропуска), `NTILE(n)` (группы равного размера) — и *топ-N по группе* через `PARTITION BY`.
- **Оконные функции значений:** `LAG`/`LEAD` читают предыдущую/следующую строку (разница с прошлым месяцем), `FIRST_VALUE`/`LAST_VALUE` читают края секции (с ловушкой рамки).
- Вы нашли **дубликаты платежей** (и точно знаете, сколько их) с помощью `ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount)`, написали запрос без дубликатов, ничего не удаляя, и построили **матрицу миграции просрочки** сентябрь → октябрь.

---

## 1. Теория — нумерация строк и чтение соседей :id=1-learn-numbering-rows-and-reading-neighbours

### ROW_NUMBER — пронумеровать строки 1, 2, 3 … :id=row_number-number-the-rows-1-2-3

**Что это.** `ROW_NUMBER()` — это **ранжирующая оконная функция** (*ranking window function*). Она даёт строкам каждого окна номера 1, 2, 3 … в порядке `ORDER BY` внутри `OVER`. Двух одинаковых номеров не бывает. С `PARTITION BY` нумерация начинается заново в каждой группе.

```pic
{"id": "w03d2-pic1", "title": "ROW_NUMBER нумерует кредиты каждого клиента, начиная заново с 1", "caption": "Один цвет — один клиент. Клиент 9 взял три кредита в один день, поэтому равенство разбивает `loan_id`; у клиента 1893 нумерация снова начинается с 1 — с кредита 458.", "tables": [{"name": "результат", "cols": ["customer_id", "loan_id", "disbursed_at", "loan_no"], "rows": [[9, 1632, "2025-07-27", 1], [9, 4962, "2025-07-27", 2], [9, 7693, "2025-07-27", 3], [1893, 458, "2025-03-02", 1], [1893, 4687, "2025-03-03", 2], [1893, 5050, "2025-06-10", 3]], "tone": ["a", "a", "a", "b", "b", "b"], "new": ["loan_no"], "more": "… у 1893 ещё 4 кредита (4–7)"}]}
```

**Как пишется.**

```sql
SELECT customer_id, loan_id, disbursed_at,
       -- заново для каждого клиента
       ROW_NUMBER() OVER (PARTITION BY customer_id
                          -- что значит «первый»; loan_id разрешает равенство
                          ORDER BY disbursed_at, loan_id)
       AS loan_no
FROM loans
WHERE customer_id = 1893
ORDER BY loan_no;
```

| customer_id | loan_id | disbursed_at | loan_no |
|---|---|---|---|
| 1893 | 458 | 2025-03-02 | 1 |
| 1893 | 4687 | 2025-03-03 | 2 |
| 1893 | 5050 | 2025-06-10 | 3 |
| … | | | |
| 1893 | 4952 | 2026-05-08 | 7 |

Семь строк: у клиента 1893 семь кредитов, пронумерованных в порядке выдачи. Кредит 458 был первым, кредит 4952 — седьмым. Скобки после `ROW_NUMBER` остаются пустыми — функции не нужен столбец, только порядок.

**Когда применять.**
- «Первый / второй / последний X каждого Y»: первый кредит клиента, последний платёж по кредиту.
- Ровно одна строка на группу (`rn = 1`), даже при равных значениях, — основа топ-N и дедупликации ниже.

> ⚠️ **Осторожно.** Без разрешающего признака `ROW_NUMBER` нумерует равные строки в любом порядке, и следующий запуск может выбрать другой. Заканчивайте `ORDER BY` окна уникальным столбцом (`, loan_id`), чтобы результат каждый раз был тем же.

**Ваша очередь.** Пронумеруйте кредиты каждого клиента (без `WHERE`). У скольких клиентов есть **третий** кредит? Оберните запрос и посчитайте строки с `loan_no = 3` (День 1: окно фильтруют снаружи, в производной таблице).

```task
{"id": "w03d2-l1", "kind": "number", "answer": 868, "dp": 0, "unit": "клиентов", "hint": "SELECT COUNT(*) FROM (SELECT ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY disbursed_at, loan_id) AS loan_no FROM loans) t WHERE loan_no = 3;", "model": "868 клиентов имеют кредит с номером 3 — все, у кого три кредита и больше (593 + 194 + 62 + 15 + 4)."}
```

> 🎬 **Остались вопросы про ROW_NUMBER?** [Baraa объясняет (на английском, есть субтитры) · 4 мин](https://youtu.be/SSKVgrwhzus?t=39482&end=39750)

### RANK и DENSE_RANK — что происходит при равенстве :id=rank-and-dense_rank-what-happens-on-a-tie

**Что это.** `RANK()` и `DENSE_RANK()` нумеруют строки как `ROW_NUMBER`, но строки с **одинаковым значением** (равные значения, *tie*) получают **один и тот же номер**. После равенства `RANK` пропускает номера; `DENSE_RANK` — нет.

```pic
{"id": "w03d2-pic2", "title": "При равенстве RANK оставляет пропуск, а DENSE_RANK — нет", "caption": "Кредиты 102 и 103 равны — 700 — и делят номер 2. Посмотрите на кредит 104: `RANK` говорит 4 (впереди три строки), `DENSE_RANK` — 3 (впереди два значения).", "tables": [{"name": "t", "cols": ["loan", "principal", "RANK", "DENSE_RANK"], "rows": [[101, 900, 1, 1], [102, 700, 2, 2], [103, 700, 2, 2], [104, 500, 4, 3], [105, 400, 5, 4]], "tone": [null, "b", "b", null, null], "new": ["RANK", "DENSE_RANK"], "cells": [[3, "RANK"], [3, "DENSE_RANK"]]}]}
```

**Как пишется.** Пять кредитов, два из них равны — по 700:

```sql
WITH t(loan, principal) AS (VALUES (101, 900), (102, 700), (103, 700), (104, 500), (105, 400))
SELECT loan, principal,
       -- всегда уникален
       ROW_NUMBER() OVER (ORDER BY principal DESC, loan) AS rn,
       -- равные делят номер, затем пропуск
       RANK()       OVER (ORDER BY principal DESC)       AS rk,
       -- равные делят номер, без пропуска
       DENSE_RANK() OVER (ORDER BY principal DESC)       AS drk
FROM t;
```

| loan | principal | ROW_NUMBER | RANK | DENSE_RANK |
|---|---|---|---|---|
| 101 | 900 | 1 | 1 | 1 |
| 102 | 700 | 2 | **2** | **2** |
| 103 | 700 | 3 | **2** | **2** |
| 104 | 500 | 4 | **4** | **3** |
| 105 | 400 | 5 | 5 | 4 |

Кредит 104 — четвёртая строка. `RANK` называет его 4 (впереди три строки); `DENSE_RANK` — 3 (впереди два значения). На реальных данных, кредиты BNPL по основному долгу: четыре кредита делят максимальную сумму продукта, 7 990 000.

```sql
SELECT loan_id, principal,
       ROW_NUMBER() OVER (ORDER BY principal DESC, loan_id) AS rn,
       RANK()       OVER (ORDER BY principal DESC)          AS rk,
       DENSE_RANK() OVER (ORDER BY principal DESC)          AS drk
FROM loans
WHERE product_id = 3                                                -- BNPL
ORDER BY principal DESC, loan_id
LIMIT 7;
```

Строки 1–4 (кредиты 448, 2680, 4162, 5855) — все `RANK` 1 и `DENSE_RANK` 1. Пятый кредит, 1112 на 7 980 000, — `RANK` **5** и `DENSE_RANK` **2**.

**Когда применять.**

| Функция | При равенстве | Для чего |
|---|---|---|
| `ROW_NUMBER` | разные номера | ровно одна строка на группу |
| `RANK` | один номер, затем пропуск | таблица лидеров: «двое делят 2-е место, 3-го нет» |
| `DENSE_RANK` | один номер, без пропуска | «топ-3 **значения**», сколько бы строк их ни делило |

**Ваша очередь.**

```game
{"type": "match", "id": "w03d2-g1", "title": "Четыре кредита BNPL на 7 990 000", "pairs": [["ROW_NUMBER()", "1, 2, 3, 4 — затем 5; всегда уникален"], ["RANK()", "1, 1, 1, 1 — затем 5; общий номер, потом пропуск"], ["DENSE_RANK()", "1, 1, 1, 1 — затем 2; общий номер, без пропуска"], ["NTILE(4)", "четыре группы (почти) равного количества"], ["PERCENT_RANK()", "позиция от 0 до 1"]]}
```

> 🎬 **Остались вопросы про RANK?** [Baraa объясняет (на английском, есть субтитры) · 4 мин](https://youtu.be/SSKVgrwhzus?t=39753&end=39995)

> 🎬 **Остались вопросы про DENSE_RANK?** [Baraa объясняет (на английском, есть субтитры) · 4 мин](https://youtu.be/SSKVgrwhzus?t=39997&end=40262)

### NTILE — разрезать строки на n равных групп :id=ntile-cut-the-rows-into-n-equal-groups

**Что это.** `NTILE(n)` делит упорядоченные строки на **n групп (почти) равного количества** и возвращает номер группы от 1 до n. `NTILE(4)` даёт квартили, `NTILE(10)` — децили. Если строки не делятся поровну, первые группы получают на одну строку больше.

**Как пишется.** Заёмщики в четырёх группах по остатку долга, от крупнейших:

```sql
-- одна строка на заёмщика: остаток долга на 2026-10-01
WITH c AS (
  SELECT l.customer_id, SUM(i.principal_due) AS outstanding
  FROM installments i JOIN loans l ON l.loan_id = i.loan_id
  WHERE i.due_date > '2026-10-01'
  GROUP BY l.customer_id),
q AS (
  SELECT customer_id, outstanding, NTILE(4) OVER (ORDER BY outstanding DESC) AS quartile
  FROM c)
SELECT quartile, COUNT(*) AS borrowers, SUM(outstanding) AS outstanding,
       ROUND(100.0 * SUM(outstanding) / SUM(SUM(outstanding)) OVER (), 1) AS share_pct
FROM q
GROUP BY quartile
ORDER BY quartile;
```

| квартиль | заёмщиков | остаток долга | доля % |
|---|---|---|---|
| 1 | 634 | 172 574 767 663 | 82.7 |
| 2 | 634 | 28 293 321 289 | 13.6 |
| 3 | 634 | 6 745 172 423 | 3.2 |
| 4 | 633 | 1 110 243 055 | 0.5 |

2 535 заёмщиков: 634, 634, 634 и 633 — равное **количество**, лишняя строка досталась первым группам. **Деньги** далеко не равны: верхняя четверть держит 82.7 % портфеля.

**Когда применять.**
- Квартили и децили для слайда «кто наши клиенты по размеру долга».
- Равные по размеру тестовые группы, диапазоны скоринга.

> ⚠️ **Осторожно.** `NTILE` делает группы равного *количества*, а не равной *ширины*. Квартиль 1 — от 99.7 млн до 977.7 млн, квартиль 4 — от 68 300 до 3.9 млн. Показывайте минимум и максимум каждой группы рядом с её количеством. (`PERCENT_RANK()` и `CUME_DIST()` дают вместо этого позицию от 0 до 1; вы встретите их как перцентили на неделе 6.)

**Ваша очередь.** `NTILE(4)` по десяти значениям 1, 2, …, 10. Сколько строк попадёт в группу 1?

```task
{"id": "w03d2-l2", "kind": "number", "answer": 3, "dp": 0, "unit": "строк", "hint": "10 ÷ 4 = по 2 строки, и 2 остаются. Остаток достаётся первым группам.", "model": "3. Группы — 3, 3, 2, 2 строки: две лишние строки достаются группам 1 и 2."}
```

> 🎬 **Остались вопросы про NTILE?** [Baraa объясняет (на английском, есть субтитры) · 6 мин](https://youtu.be/SSKVgrwhzus?t=41254&end=41630)

### LAG и LEAD — предыдущая и следующая строка :id=lag-and-lead-the-previous-and-the-next-row

**Что это.** `LAG(column)` возвращает значение `column` из **предыдущей** строки окна; `LEAD(column)` — из **следующей**. «Предыдущую» определяет `ORDER BY` внутри `OVER`. Это **функции смещения** (*offset functions*): они не агрегируют, а смотрят в сторону.

```pic
{"id": "w03d2-pic3", "title": "LAG читает строку выше", "caption": "Платежи кредита 1. Каждый `prev_paid` — это `paid_at` строки выше (тот же цвет); `gap_days` — разница. Обведённые 58 дней — пропущенный мартовский платёж.", "tables": [{"id": "p", "name": "payments", "label": "loan_id = 1", "cols": ["paid_at", "prev_paid", "gap_days"], "rows": [["2026-01-28", "2025-12-27", 32], ["2026-02-26", "2026-01-28", 29], ["2026-04-25", "2026-02-26", 58], ["2026-05-12", "2026-04-25", 17], ["2026-05-26", "2026-05-12", 14]], "new": ["prev_paid", "gap_days"], "cells": [[2, "gap_days"]], "more": "… всего 18 платежей"}], "links": [{"from": ["p", 0, "paid_at"], "to": ["p", 1, "prev_paid"]}, {"from": ["p", 1, "paid_at"], "to": ["p", 2, "prev_paid"]}, {"from": ["p", 2, "paid_at"], "to": ["p", 3, "prev_paid"]}, {"from": ["p", 3, "paid_at"], "to": ["p", 4, "prev_paid"]}]}
```

**Как пишется.**

```sql
-- offset: на сколько строк назад (1, если не указан); default: вместо NULL
LAG(column, offset, default) OVER (PARTITION BY … ORDER BY …)
```

Платежи по кредиту 1, у каждого — предыдущий и следующий:

```sql
SELECT payment_id, paid_at,
       LAG(paid_at)  OVER (PARTITION BY loan_id ORDER BY paid_at, payment_id) AS prev_paid,
       LEAD(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at, payment_id) AS next_paid,
       CAST(julianday(paid_at)
          -- SQL Server: DATEDIFF(day, тот же LAG, paid_at)
          - julianday(LAG(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at, payment_id)) AS INTEGER) AS gap_days
FROM payments
WHERE loan_id = 1
ORDER BY paid_at;
```

18 строк. У первой нет предыдущей строки, поэтому `prev_paid` и `gap_days` равны NULL; у последней нет следующей. Интервалы: 31, 29, 29, 31, 35 … затем **58** (26 февраля → 25 апреля, пропущенный мартовский платёж), 17 и 14 — наверстывание.

Тот же инструмент сравнивает месяц с предыдущим (`LAG(x)`) и с тем же месяцем прошлого года (`LAG(x, 12)`):

```sql
WITH m AS (SELECT strftime('%Y-%m', disbursed_at) AS month, SUM(principal) AS disbursed
           FROM loans WHERE disbursed_at < '2026-10-01' GROUP BY 1)
SELECT month, disbursed,
       LAG(disbursed) OVER (ORDER BY month) AS prev_month,
       ROUND(100.0 * (disbursed - LAG(disbursed) OVER (ORDER BY month))
             -- к предыдущему месяцу
             / LAG(disbursed) OVER (ORDER BY month), 1)      AS mom_pct,
       ROUND(100.0 * (disbursed - LAG(disbursed, 12) OVER (ORDER BY month))
             -- к тому же месяцу прошлого года
             / LAG(disbursed, 12) OVER (ORDER BY month), 1)  AS yoy_pct
FROM m
ORDER BY month;
```

33 месяца. Февраль 2026: −31.8 % к предыдущему месяцу и +20.0 % к прошлому году в одной строке — сезонный провал, а не спад. Вот зачем нужны оба столбца.

**Когда применять.**
- Изменение к предыдущему периоду: к прошлому месяцу, к прошлому году.
- Дни с предыдущего события того же клиента или кредита.
- `LEAD`: следующая дата платежа, следующий статус, «случилось ли что-то после этого?».

> ⚠️ **Осторожно.** `LAG` видит только строки, дошедшие до окна. Поставьте фильтр вывода `WHERE month >= '2026-01'` внутрь `m` — и 2025 год исчезнет до того, как отработает `LAG(…, 12)`: каждый `yoy_pct` станет NULL. Фильтруйте вывод во внешнем запросе.

**Ваша очередь.**

```game
{"type": "bug", "id": "w03d2-g2", "title": "Найдите сломанную строку", "q": "Интервалы между платежами по кредиту 1. Результат отсортирован по дате, а prev_paid скачет. Какая строка неверна?", "code": "SELECT payment_id, paid_at,\n       LAG(paid_at) OVER (PARTITION BY loan_id) AS prev_paid\nFROM payments\nWHERE loan_id = 1\nORDER BY paid_at;", "answer": [1], "why": "LAG нужен собственный ORDER BY внутри OVER (ORDER BY paid_at, payment_id). ORDER BY в конце сортирует только вывод; он не говорит LAG, какая строка «предыдущая»."}
```

> 🎬 **Остались вопросы про LAG и LEAD?** [Baraa объясняет (на английском, есть субтитры) · 10 мин](https://youtu.be/SSKVgrwhzus?t=43169&end=43790)

### FIRST_VALUE и LAST_VALUE — края окна и ловушка рамки :id=first_value-and-last_value-the-edges-of-the-window-and-the-frame-trap

**Что это.** `FIRST_VALUE(column)` возвращает значение **первой** строки рамки, `LAST_VALUE(column)` — **последней**. Обе записывают его в каждую строку. Они зависят от рамки из Дня 1 — в этом и ловушка.

**Как пишется.**

```sql
SELECT paid_at,
       FIRST_VALUE(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at) AS first_payment,
       -- рамка по умолчанию: кончается на этой строке
       LAST_VALUE(paid_at)  OVER (PARTITION BY loan_id ORDER BY paid_at) AS last_wrong,
       LAST_VALUE(paid_at)  OVER (PARTITION BY loan_id ORDER BY paid_at
                                  ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_payment
FROM payments
WHERE loan_id = 1;
```

18 строк. `first_payment` — 2025-04-27 в каждой строке. `last_payment` — 2026-09-26 в каждой строке. `last_wrong` равен собственной дате строки: при `ORDER BY` рамка по умолчанию заканчивается на текущей строке, поэтому «последняя» строка рамки — сама строка.

**Когда применять.**
- Первый продукт клиента, первый и последний платёж по кредиту, значение на начало и конец периода — рядом с каждой строкой.
- `FIRST_VALUE(x) OVER (… ORDER BY d DESC)` — надёжный способ получить **последнее** значение.

> ⚠️ **Осторожно.** `LAST_VALUE` с `ORDER BY` и без рамки возвращает текущую строку. Явно задайте `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` или используйте `FIRST_VALUE` с обратным порядком.

**Ваша очередь.** Какое окно даёт каждому платежу кредита дату **последнего** платежа по этому кредиту?

```task
{"id": "w03d2-l3", "kind": "choice", "options": ["LAST_VALUE(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at)", "FIRST_VALUE(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at DESC)", "LAG(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at)", "FIRST_VALUE(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at)"], "answer": 1, "explain": "Переверните порядок и возьмите первое значение. LAST_VALUE с рамкой по умолчанию возвращает собственную дату каждой строки; LAG — предыдущая строка; FIRST_VALUE по возрастанию — самый ранний платёж."}
```

> 🎬 **Остались вопросы про FIRST_VALUE и LAST_VALUE?** [Baraa объясняет (на английском, есть субтитры) · 6 мин](https://youtu.be/SSKVgrwhzus?t=44712&end=45062)

### Топ-N по группе — ROW_NUMBER в CTE, фильтр снаружи :id=top-n-per-group-row_number-in-a-cte-filter-outside

**Что это.** **Топ-N по группе** (*top-N per group*) оставляет N лучших строк каждой группы: три крупнейших кредита по продукту, последний кредит клиента. Пронумеруйте строки внутри каждой группы через `ROW_NUMBER`, затем оставьте маленькие номера. Фильтр стоит во внешнем запросе, потому что в `WHERE` окна ещё не существует.

**Как пишется.**

```sql
-- шаг 1: нумеруем строки внутри каждого продукта
WITH r AS (
  SELECT l.loan_id, p.code, l.principal, l.disbursed_at,
         ROW_NUMBER() OVER (PARTITION BY p.code ORDER BY l.principal DESC, l.loan_id) AS rn
  FROM loans l JOIN products p ON p.product_id = l.product_id)
-- шаг 2: оставляем первые три
SELECT * FROM r
WHERE rn <= 3
ORDER BY code, rn;
```

15 строк: по три на продукт. Тройка SME — кредиты 2861, 4570 и 4601 (599 060 000, 598 450 000, 597 540 000); тройка Auto — 1501, 1271 и 3382, чуть меньше 400 млн. Крупнейшие кредиты каждого продукта лежат чуть ниже его максимальной суммы: лимиты упираются в потолок.

Замените `rn <= 3` на `rn = 1`, а окно — на `PARTITION BY customer_id ORDER BY disbursed_at DESC, loan_id DESC`: одна строка на клиента, его **последний** кредит — 4 335 строк.

**Когда применять.**
- N крупнейших, новейших или худших в каждой группе.
- Одна строка на группу (`rn = 1`): последний статус, текущий адрес, последний платёж.

> ⚠️ **Осторожно.** `ROW_NUMBER` оставляет ровно N строк, даже если N-е значение равно следующему. Если все равные строки должны остаться («каждый кредит с одной из трёх крупнейших сумм»), берите `DENSE_RANK() … <= 3`.

**Ваша очередь.**

```game
{"type": "build", "id": "w03d2-g5", "title": "Последний кредит каждого клиента", "q": "Соберите внутренний запрос: кредиты каждого клиента, пронумерованные от самого нового.", "tokens": ["SELECT customer_id, loan_id,", "ROW_NUMBER() OVER (", "PARTITION BY customer_id", "ORDER BY disbursed_at DESC, loan_id DESC", ") AS rn", "FROM loans"], "distractors": ["WHERE rn = 1", "GROUP BY customer_id", "ORDER BY disbursed_at ASC"]}
```

> 🎬 **Остались вопросы про топ-N в каждой группе?** [Baraa объясняет (на английском, есть субтитры) · 3 мин](https://youtu.be/SSKVgrwhzus?t=40350&end=40544)

### Дубликаты — найти их и оставить один через ROW_NUMBER :id=duplicates-find-them-and-keep-one-with-row_number

**Что это.** **Дубликат** (*duplicate*) — строка, которая совпадает с другой строкой **во всём, что определяет «одно и то же»**, даже если её id другой. Пронумеруйте строки внутри каждой группы «одинаковых» строк: строка 1 — оригинал, каждая строка с номером 2 и больше — повтор.

**Как пишется.** Сначала запишите определение «одного и того же»; оно станет `PARTITION BY`. Две строки клиентов с одним номером телефона:

```sql
WITH r AS (
  SELECT customer_id, first_name, last_name, phone,
         -- что делает две строки «одинаковыми»
         ROW_NUMBER() OVER (PARTITION BY phone
                            -- какая считается оригиналом: наименьший id
                            ORDER BY customer_id) AS rn
  FROM customers)
SELECT * FROM r
WHERE rn > 1  -- повторы
ORDER BY customer_id;
```

43 строки — те же 43 пары, которые нашло соединение таблицы с собой на неделе 2 (клиент 6005 повторяет клиента 44, *Yulduz Karimova*). Чтобы **оставить по одной строке**, переверните фильтр: `WHERE rn = 1` возвращает 5 997 клиентов, каждый телефон один раз.

**Удалить** их физически — это тот же список внутри `DELETE`, только в собственной копии:

```sql
-- только схема: удалить повторы из собственной таблицы (практикум ниже делает
-- это по-настоящему)
DELETE FROM my_table
WHERE id IN (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY … ORDER BY id) AS rn FROM my_table) t
             WHERE rn > 1);
```

**Когда применять.**
- Данные загружены дважды, один клиент заведён дважды, платёж импортирован дважды.
- Чистый запрос или представление (`rn = 1`), которое читают все отчёты, а сырая таблица остаётся как доказательство.

| | `GROUP BY … HAVING COUNT(*) > 1` | `ROW_NUMBER() … rn > 1` |
|---|---|---|
| находит **группы** дубликатов | да | да |
| говорит, **какую строку** оставить | нет | да — `rn = 1` |
| возвращает чистые строки | нет | да — `WHERE rn = 1` |

> ⚠️ **Осторожно.** `ORDER BY` внутри окна решает, какая строка выживет. `ORDER BY customer_id` оставляет самый старый id; `ORDER BY customer_id DESC` оставил бы самый новый и удалил оригиналы — то же количество, не те строки.

**Ваша очередь.** Платежи Севары: какой `PARTITION BY` найдёт платёж, импортированный дважды (тот же платёж по графику, тот же день, та же сумма, новый `payment_id`)?

```task
{"id": "w03d2-l4", "kind": "choice", "options": ["PARTITION BY payment_id", "PARTITION BY installment_id, paid_at, amount", "PARTITION BY loan_id", "PARTITION BY paid_at"], "answer": 1, "explain": "Секция — это определение «одного и того же». payment_id уникален, поэтому никогда не повторяется; loan_id или paid_at по отдельности назвали бы дубликатами два честных платежа."}
```

> 🎬 **Остались вопросы про поиск дубликатов через ROW_NUMBER?** [Baraa объясняет (на английском, есть субтитры) · 5 мин](https://youtu.be/SSKVgrwhzus?t=40928&end=41229)

### Миграция с LAG — от одного среза к следующему :id=roll-rates-with-lag-from-one-snapshot-to-the-next

**Что это.** **Миграция между корзинами** (*roll rate*) — доля кредитов, перешедших из одной корзины DPD на одну дату в другую корзину на следующую дату. Сложите срезы один под другим — одна строка на кредит на дату — и `LAG(bucket)` поставит корзину предыдущей даты в ту же строку.

| loan | asof | bucket | `LAG(bucket) OVER (PARTITION BY loan ORDER BY asof)` |
|---|---|---|---|
| 7 | 2026-09-01 | 1-30 | NULL |
| 7 | 2026-10-01 | 31-60 | 1-30 → перешёл вперёд |
| 8 | 2026-09-01 | 1-30 | NULL |
| 8 | 2026-10-01 | 0 | 1-30 → вылечился |
| 9 | 2026-09-01 | 0 | NULL |
| 9 | 2026-10-01 | 1-30 | 0 → новый просроченный |

**Как пишется.** Правило DPD из недели 2, посчитанное сразу на две даты отчёта, затем `LAG`, затем подсчёт по парам «из × в»:

```sql
-- две даты среза
WITH snaps(asof) AS (VALUES ('2026-09-01'), ('2026-10-01')),
-- платежи с наступившим сроком, оплаченные не полностью, на каждую дату
unpaid AS (
  SELECT s.asof, i.loan_id, i.due_date
  FROM snaps s
  JOIN installments i ON i.due_date <= s.asof
  LEFT JOIN payments p ON p.installment_id = i.installment_id AND p.paid_at <= s.asof
  GROUP BY s.asof, i.installment_id, i.loan_id, i.due_date, i.total_due
  HAVING COALESCE(SUM(p.amount), 0) < i.total_due),
dpd AS (SELECT asof, loan_id, CAST(julianday(asof) - julianday(MIN(due_date)) AS INTEGER) AS dpd
        FROM unpaid GROUP BY asof, loan_id),
-- одна строка на кредит на дату; нет неоплаченного платежа = DPD 0
b AS (
  SELECT s.asof, l.loan_id,
         CASE WHEN COALESCE(d.dpd, 0) = 0 THEN '0' WHEN d.dpd <= 30 THEN '1-30' WHEN d.dpd <= 60 THEN '31-60'
              WHEN d.dpd <= 90 THEN '61-90' ELSE '90+' END AS bucket
  FROM snaps s
  JOIN loans l ON l.disbursed_at < '2026-09-01'
  LEFT JOIN dpd d ON d.asof = s.asof AND d.loan_id = l.loan_id),
moves AS (SELECT asof, loan_id, bucket AS to_bucket,
                 -- корзина прошлого месяца, в той же строке
                 LAG(bucket) OVER (PARTITION BY loan_id ORDER BY asof) AS from_bucket
          FROM b)
SELECT from_bucket, to_bucket, COUNT(*) AS loans,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY from_bucket), 1) AS pct_of_from
FROM moves
WHERE asof = '2026-10-01' AND from_bucket <> '0'
GROUP BY from_bucket, to_bucket
ORDER BY from_bucket, to_bucket;
```

8 строк. Из 128 кредитов в 1–30 на 1 сентября 97 вылечились (75.8 %), 6 остались и 25 перешли в 31–60 (19.5 %). Все 17 кредитов из 61–90 дошли до 90+. Последняя строка запроса — доля внутри группы из Дня 1: строки каждой корзины-из в сумме дают 100.

**Когда применять.**
- Отчёт-оценка работы взыскания: 1–30 лечится или переходит дальше?
- Любое состояние, меняющееся со временем: статус в этом месяце против прошлого, сегмент сейчас против момента подписания.

> ⚠️ **Осторожно.** Дата отчёта должна стоять в **обоих** местах: в фильтре платежей по графику (`due_date <= asof`) и в соединении с оплатами (`paid_at <= asof`). Уберите её из соединения — и оплата, сделанная 15 сентября, засчитается на 1 сентября: кредиты будут выглядеть вылечившимися раньше, чем заплатили.

**Ваша очередь.** По матрице выше: какая доля кредитов из 31–60 на 1 сентября перешла в 61–90 к 1 октября? (%, один знак после запятой)

```task
{"id": "w03d2-l5", "kind": "number", "answer": 69.6, "dp": 1, "unit": "%", "hint": "Строка from_bucket = '31-60', to_bucket = '61-90'.", "model": "69.6 % — 16 из 23 кредитов. В 31–60 больше двух из трёх ухудшаются; в 1–30 три из четырёх вылечиваются."}
```

> 🎬 **Остались вопросы про сравнение с прошлой строкой (LAG)?** [Baraa объясняет (на английском, есть субтитры) · 7 мин](https://youtu.be/SSKVgrwhzus?t=43790&end=44186)

### Собираем вместе :id=putting-it-together

Один запрос, несколько сегодняшних инструментов. *«По каждому продукту: последний кредит, его основной долг рядом с предыдущим кредитом и входит ли он в верхнюю четверть продукта по размеру».*

```sql
WITH r AS (
  SELECT l.loan_id, p.code, l.disbursed_at, l.principal,
         -- ROW_NUMBER
         ROW_NUMBER() OVER (PARTITION BY p.code ORDER BY l.disbursed_at DESC, l.loan_id DESC) AS newest_first,
         -- LAG
         LAG(l.principal) OVER (PARTITION BY p.code ORDER BY l.disbursed_at, l.loan_id)        AS prev_principal,
         -- NTILE
         NTILE(4) OVER (PARTITION BY p.code ORDER BY l.principal DESC)                          AS size_quartile
  FROM loans l JOIN products p ON p.product_id = l.product_id)
SELECT code, loan_id, disbursed_at, principal, prev_principal, size_quartile
FROM r
-- топ-N, N = 1
WHERE newest_first = 1
ORDER BY code;
```

Пять строк, по одной на продукт. Последний кредит SME, 3368, выдан 1 октября: 460 800 000, в верхней четверти кредитов SME по размеру и больше чем в пять раз крупнее предыдущего кредита SME (82 430 000). Три окна в одном CTE, у каждого свои `PARTITION BY` и `ORDER BY`: `ROW_NUMBER` выбирает строку, `LAG` читает её соседа в порядке дат, `NTILE` определяет её место по размеру. Фильтр по `newest_first` стоит снаружи, как всегда.

**Какая оконная функция?**

```game
{"type": "sort", "id": "w03d2-g3", "title": "Какая оконная функция?", "q": "Нажмите на вопрос Бекзода, Севары или Нилуфар, затем на функцию, которая на него отвечает.", "groups": {"ROW_NUMBER": ["Последний кредит каждого клиента, ровно одна строка", "Какие строки платежей — повторы более ранних?"], "RANK / DENSE_RANK": ["Таблица лидеров взыскания, где равные делят место", "Каждый кредит с одной из трёх крупнейших сумм в своём продукте"], "LAG / LEAD": ["Каждый месяц в сравнении с предыдущим", "Дни с предыдущего платежа по тому же кредиту"], "NTILE": ["Заёмщики в четырёх равных по числу группах по остатку долга"]}}
```

### Углубление (необязательно) :id=depth-optional

- ▶ Baraa, *Window ranking* [10:53:09](https://youtu.be/SSKVgrwhzus?t=39189&end=42965), *Window value* [11:56:05](https://youtu.be/SSKVgrwhzus?t=42965&end=45634) — ~2 ч.
- Русскоязычная презентация (TBC Data Analytics 2.0, если она у вас есть) `2.3 SQL.pdf` — ранжирующие функции и функции смещения. *Английские термины:* ранжирование = ranking, функции смещения = offset functions (LAG/LEAD), дубликаты = duplicates.

```videoquiz
{"video": "SSKVgrwhzus", "stops": [
  {"at": 40300, "q": "Две строки делят первое место. Что даёт RANK() следующей за ними строке?", "options": ["2", "3", "1", "NULL"], "answer": 1, "explain": "RANK даёт обеим равным строкам 1 и затем пропускает: следующая строка — 3. DENSE_RANK дал бы 2."},
  {"at": 42000, "q": "Какую ранжирующую функцию взять, чтобы оставить ровно одну строку на группу, даже при равных значениях?", "options": ["RANK", "DENSE_RANK", "ROW_NUMBER", "NTILE"], "answer": 2, "explain": "ROW_NUMBER никогда не повторяет номер, поэтому rn = 1 — всегда одна строка: основа дедупликации и «последнего у клиента»."},
  {"at": 43900, "q": "LAG(sales) OVER (ORDER BY month) для первого месяца возвращает…", "options": ["0", "NULL, если не задать значение по умолчанию третьим аргументом", "Значение последнего месяца", "Ошибку"], "answer": 1, "explain": "Предыдущей строки нет, поэтому LAG возвращает NULL; LAG(sales, 1, 0) вернул бы 0."},
  {"at": 45200, "q": "LAST_VALUE с ORDER BY возвращает собственное значение каждой строки. Почему?", "options": ["LAST_VALUE сломан", "Рамка по умолчанию заканчивается на текущей строке", "Не хватает PARTITION BY", "В данных есть равные значения"], "answer": 1, "explain": "При ORDER BY рамка идёт от начала до текущей строки; явно задайте ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING.", "back": 60}]}
```

---

## 2. Разобранный пример — деньги, полученные дважды (расследование, 30 мин) :id=2-worked-example-the-money-received-twice-detective-30-min

Утверждение Севары: *тот же платёж по графику, тот же день, та же сумма, две строки платежа.* Защита Финансов: *payment_id уникален.* Каждый шаг использует одно понятие из раздела 1, в том же порядке.

**Шаг 1 — LAG: ищем улику.** Интервалы между подряд идущими платежами одного кредита, как в разделе 1, по всем кредитам:

```sql
WITH g AS (
  SELECT loan_id,
         julianday(paid_at) - julianday(LAG(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at, payment_id)) AS gap
  FROM payments)
SELECT COUNT(gap) AS pairs, ROUND(AVG(gap), 1) AS avg_gap, SUM(CASE WHEN gap = 0 THEN 1 ELSE 0 END) AS same_day
FROM g;
-- 45 439 пар · в среднем 30.9 дня · 63 пары оплачены в один день
```

63 пары в один день. Часть из них честные (два разных платежа по графику оплачены вместе), часть может оказаться случаями Севары. Тот же день — улика, а не определение.

**Шаг 2 — дубликаты: определяем «одно и то же», нумеруем строки.** Дубликат — это не две одинаковые строки, а две строки, которые **совпадают во всём, что важно**: платёж по графику, дата, сумма. Это и есть `PARTITION BY`; всё, что получило номер 2, — повтор:

```sql
WITH d AS (
  SELECT payment_id, loan_id, installment_id, paid_at, amount, method,
         ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
  FROM payments)
SELECT * FROM d WHERE rn > 1 ORDER BY payment_id;
```

<details><summary>Что вы видите</summary>

**25 строк**, 58 397 800 UZS посчитаны дважды. Их `payment_id` — **52851–52875, последние 25 строк таблицы**, тогда как их двойники разбросаны от id 110 до 52 120 (расстояние от 744 до 52 759). Даты от 2024-08-30 до 2026-09-17, все способы оплаты (card 9, transfer 7, click 4, payme 3, cash 2). Вывод: это не 25 ошибок кассиров за два года, а **пакет**, добавленный в конец, — повторный импорт 25 старых транзакций с новыми ID. Финансы правы, что ID уникальны, и неправы, что это что-то доказывает. Перекрёстные проверки из недели 2: 52 875 платежей против 52 850 различных `installment_id` (разница 25) и 25 платежей по графику оплачены *больше* своего `total_due` ровно на один платёж.

</details>

> 💡 **Главное.** Дубликат — это не две одинаковые строки, а две строки, которые совпадают **во всём, что определяет «одно и то же»**. Сначала запишите это определение (здесь: платёж по графику, дата, сумма) — оно и станет `PARTITION BY`.

**Шаг 3 — оставляем одну: запрос без дубликатов.** Никогда не делайте `DELETE` из учебных таблиц (или из рабочей таблицы по собственному решению): результат — это *запрос* без дубликатов, а сырая таблица остаётся как доказательство. Оставьте `rn = 1` — самый ранний `payment_id` в каждой группе:

```sql
WITH d AS (
  SELECT payment_id, loan_id, installment_id, paid_at, amount,
         -- очистка из недели 2, в том же проходе
         REPLACE(LOWER(TRIM(method)), 'bank transfer', 'transfer') AS method,
         ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
  FROM payments)
SELECT payment_id, loan_id, installment_id, paid_at, amount, method FROM d WHERE rn = 1;
-- 52 850 строк · 255 114 772 176 UZS (сырые: 52 875 · 255 173 169 976) · 5
-- способов оплаты
```

<details><summary>Меняет ли это что-нибудь дальше?</summary>

Перезапустите блок DPD из недели 2 с этим результатом вместо `payments`: всё те же 1 784 неоплаченных платежа с наступившим сроком, всё те же 14 / 124 / 25 / 16 / 234. Дубликаты *добавляют* деньги к платежам, которые уже были оплачены, поэтому DPD и корзины не двигаются — но «собрано в 2026 году» завышено на дубликаты 2026 года, 25 платежей по графику выглядят переплаченными, а любой «коэффициент сборов», построенный на сырых платежах, слегка слишком хорош. Служебная записка для Севары и Финансов: *25 платежей (id 52851–52875) — точные повторы более ранних строк (тот же платёж по графику, дата и сумма), добавленные одним пакетом; 58.4 млн UZS посчитаны в сборах дважды, на просрочку это не влияет; рекомендуем уникальное ограничение на (installment_id, paid_at, amount) при загрузке и `v_payments_clean` (четверг) для всей отчётности.*

</details>

Почему `ROW_NUMBER`, а не `GROUP BY … HAVING COUNT(*) > 1` (T21 из недели 2)? `HAVING` *находит* группы; он не скажет, *какую строку оставить*, и не вернёт недублирующиеся строки рядом. Окно делает и то и другое за один проход.

**Шаг 4 — удаление, на собственной таблице.** Из учебных таблиц вы никогда не удаляете; в своей копии — можно, и так вы узнаете, что делает `DELETE` по списку из `ROW_NUMBER`, прежде чем кому-то это предлагать.

```sqllab
{"id": "w03d2-lab", "title": "Создайте дубликаты, найдите их, удалите", "intro": "Вы копируете платежи кредита 1 в собственную таблицу, подкладываете шесть дубликатов так, как это сделал повторный импорт (тот же платёж по графику, дата и сумма, новые id), находите их через ROW_NUMBER и удаляете ровно их. Учебная таблица payments не трогается.", "steps": [
  {"say": "Создайте my_payments через CREATE TABLE … AS: payment_id, loan_id, installment_id, paid_at, amount каждого платежа по кредиту 1.", "hint": "CREATE TABLE my_payments AS SELECT payment_id, loan_id, installment_id, paid_at, amount FROM payments WHERE loan_id = 1;", "expect": "SELECT COUNT(*) FROM my_payments", "want": 18},
  {"say": "Подложите дубликаты: вставьте ещё раз каждую строку my_payments, оплаченную 2026-05-01 или позже, с новым id payment_id + 100000.", "hint": "INSERT INTO my_payments SELECT payment_id + 100000, loan_id, installment_id, paid_at, amount FROM my_payments WHERE paid_at >= '2026-05-01';", "expect": "SELECT COUNT(*) FROM my_payments", "want": 24},
  {"say": "Найдите их: создайте my_dupes(payment_id) со всеми строками, у которых ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) больше 1.", "hint": "CREATE TABLE my_dupes AS WITH d AS (SELECT payment_id, ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn FROM my_payments) SELECT payment_id FROM d WHERE rn > 1;", "expect": "SELECT COUNT(*) FROM my_dupes WHERE payment_id > 100000", "want": 6},
  {"say": "Удалите из my_payments ровно строки из списка, затем проверьте, что ни одна тройка (платёж по графику, дата, сумма) не встречается дважды.", "hint": "DELETE FROM my_payments WHERE payment_id IN (SELECT payment_id FROM my_dupes);", "expect": "SELECT COUNT(*) FROM my_payments", "want": 18}],
 "cleanup": "DROP TABLE IF EXISTS my_dupes; DROP TABLE IF EXISTS my_payments"}
```

> ⚠️ **Осторожно.** `ORDER BY payment_id` внутри окна решает, какой из двойников выживет: самый ранний id получает `rn = 1`. Поменяйте на `DESC` — и вы сохраните повторно импортированные копии и удалите оригиналы: то же количество, не те строки.

---

## 3. Практика (50 мин) :id=3-practice-50-min

Вопросы идут в порядке раздела 1; понятие, которое тренирует каждый из них, выделено курсивом. Пишите каждый запрос в поле под вопросом — он сохраняется в этом браузере. Кнопка **✔ Проверить** сообщит, совпал ли ваш результат с ответом.

**P1.** *(ROW_NUMBER)* Пронумеруйте кредиты каждого клиента в порядке выдачи (равенство — по `loan_id`) и покажите кредиты с номером 1 — **первый** кредит каждого клиента. Сколько строк и какова структура первых кредитов по продуктам?

<details><summary>Ответ</summary>

```sql
WITH r AS (SELECT l.customer_id, l.loan_id, p.code,
                  ROW_NUMBER() OVER (PARTITION BY l.customer_id ORDER BY l.disbursed_at, l.loan_id) AS loan_no
           FROM loans l JOIN products p ON p.product_id = l.product_id)
SELECT code, COUNT(*) AS first_loans FROM r WHERE loan_no = 1 GROUP BY code ORDER BY first_loans DESC;
-- MICRO 1 531 · CONS 1 325 · BNPL 850 · SME 422 · AUTO 207
```
Один первый кредит на заёмщика: 4 335 строк. Треть заёмщиков начинает с Micro (1 531), и лишь 207 — с Auto. `ROW_NUMBER` гарантирует ровно одну строку с номером 1 на клиента, даже если два кредита выданы в один день, — какой из них первый, решает разрешающий признак.

</details>

**P2.** *(RANK против DENSE_RANK)* Филиалы, ранжированные по остатку долга через `ROW_NUMBER`, `RANK` и `DENSE_RANK`. Почему здесь все три совпадают и что сделало бы их различными?

<details><summary>Ответ</summary>

```sql
WITH o AS (SELECT b.branch_name, SUM(i.principal_due) AS outstanding
           FROM installments i JOIN loans l ON l.loan_id = i.loan_id JOIN branches b ON b.branch_id = l.branch_id
           WHERE i.due_date > '2026-10-01' GROUP BY b.branch_name)
SELECT branch_name, outstanding,
       ROW_NUMBER() OVER (ORDER BY outstanding DESC) AS rn,
       RANK()       OVER (ORDER BY outstanding DESC) AS rk,
       DENSE_RANK() OVER (ORDER BY outstanding DESC) AS drk
FROM o ORDER BY rn;
-- Tashkent Central 1/1/1 … Termez Central 10/10/10
```
Вчерашний остаток долга по филиалам плюс три функции с `ORDER BY outstanding DESC`. У двух филиалов нет одинакового остатка долга с точностью до сума, поэтому равных значений нет. Проранжируйте вместо этого по *числу кредитов* внутри региона Ташкент — равных значений всё равно нет (1012 / 1007 / 1001): равные значения появляются на грубых величинах — класс, срок, округлённые суммы. 17 кредитов имеют основной долг 4 880 000.

</details>

**P2 — почему?** Все три столбца совпадают для каждого филиала. Что сделало бы их различными?

```task
{"id": "w03d2-p1b", "kind": "choice", "options": ["PARTITION BY region", "Два филиала с абсолютно одинаковым остатком долга — равные значения", "Сортировка ASC вместо DESC", "Больше десяти филиалов"], "answer": 1, "explain": "Функции различаются только на равных значениях. Остаток долга с точностью до сума не совпадает; грубые величины совпадают — 17 кредитов имеют основной долг 4 880 000.", "xp": 1}
```

**P3.** *(RANK)* Проранжируйте сотрудников взыскания по полученным обещаниям (`outcome = 'promise_to_pay'`) через `RANK`; покажите действия, обещания и долю обещаний для пятёрки лидеров.

<details><summary>Ответ</summary>

```sql
SELECT collector_id, COUNT(*) AS actions, SUM(CASE WHEN outcome = 'promise_to_pay' THEN 1 ELSE 0 END) AS promises,
       RANK() OVER (ORDER BY SUM(CASE WHEN outcome = 'promise_to_pay' THEN 1 ELSE 0 END) DESC) AS rk
FROM collections_actions GROUP BY collector_id ORDER BY rk LIMIT 5;
-- 29 → 568 действий / 182 обещания · 28 → 593 / 177 · 27 → 590 / 170 · 57 → 419
-- / 125 · 7 → 393 / 121
```
Окно над агрегатом с `CASE` внутри — три слоя, всё ещё один запрос. Ранжирование по *количеству* награждает самого занятого сотрудника; добавьте `100.0 * promises / actions` и проранжируйте ещё и по этому показателю, прежде чем кто-то получит премию.

</details>

**P4.** *(NTILE)* Квартили клиентов по остатку долга (`NTILE(4)`) с количеством, деньгами и долей — затем децили. Сколько держат топ-10 %?

<details><summary>Ответ</summary>

```sql
WITH c AS (SELECT l.customer_id, SUM(i.principal_due) AS outstanding
           FROM installments i JOIN loans l ON l.loan_id = i.loan_id WHERE i.due_date > '2026-10-01' GROUP BY l.customer_id),
q AS (SELECT customer_id, outstanding, NTILE(10) OVER (ORDER BY outstanding DESC) AS decile FROM c)
SELECT decile, COUNT(*) AS borrowers, SUM(outstanding) AS outstanding,
       ROUND(100.0 * SUM(outstanding) / SUM(SUM(outstanding)) OVER (), 1) AS share_pct
FROM q GROUP BY decile ORDER BY decile;
-- 1 · 254 · 102 681 050 696 · 49.2 %   2 · 254 · 54 113 118 283 · 25.9 %   3 ·
-- 254 · 12.4 % …
```
Раздел 1 даёт квартили 82.7 / 13.6 / 3.2 / 0.5 %. `NTILE(10)`: первый дециль (254 заёмщика) держит **49.2 %** портфеля, второй — 25.9 %: три четверти остатка долга у пятой части заёмщиков. Таблица децилей — стандартный слайд «кто наши клиенты по размеру долга»; с каждой долей указывайте число заёмщиков.

</details>

**P4 — прочитайте.** Какую долю остатка долга держит верхняя десятая часть заёмщиков, в %, один знак после запятой?

```task
{"id": "w03d2-p9b", "kind": "number", "answer": 49.2, "dp": 1, "unit": "%", "hint": "Дециль 1 из NTILE(10) OVER (ORDER BY outstanding DESC).", "model": "49.2 %: 254 заёмщика держат 102.7 млрд из 208.7 млрд. Вместе со вторым децилем (25.9 %) пятая часть заёмщиков несёт три четверти портфеля.", "xp": 1}
```

**P5.** *(LAG — к предыдущему месяцу)* Месячная выдача с изменением к предыдущему месяцу и к тому же месяцу прошлого года за 2026-01..2026-09 (вывод фильтруется *снаружи* окна). Какой месяц сильнее всего упал по сравнению с предыдущим и всё же вырос к прошлому году?

<details><summary>Ответ</summary>

```sql
WITH m AS (SELECT strftime('%Y-%m', disbursed_at) AS month, SUM(principal) AS disbursed FROM loans WHERE disbursed_at < '2026-10-01' GROUP BY 1),
w AS (SELECT month, disbursed,
             ROUND(100.0 * (disbursed - LAG(disbursed) OVER (ORDER BY month)) / LAG(disbursed) OVER (ORDER BY month), 1) AS mom_pct,
             ROUND(100.0 * (disbursed - LAG(disbursed, 12) OVER (ORDER BY month)) / LAG(disbursed, 12) OVER (ORDER BY month), 1) AS yoy_pct
      FROM m)
SELECT * FROM w WHERE month >= '2026-01' ORDER BY month;
-- 2026-02 −31.8 / +20.0 · 2026-09 −23.7 / +16.2 · 2026-05 +3.6 / +114.4
```
Запрос с `LAG` из раздела 1, обёрнутый, фильтр вывода снаружи. Февраль: −31.8 % к предыдущему месяцу, **+20.0 %** к прошлому году. Сентябрь: −23.7 % / +16.2 %. Оба столбца — на каждом слайде, где показан месячный ряд.

</details>

**P5 — прочитайте.** Какой месяц 2026 года сильнее всего упал к предыдущему и всё же вырос к прошлому году?

```task
{"id": "w03d2-p4b", "kind": "choice", "options": ["Январь 2026", "Февраль 2026", "Июнь 2026", "Сентябрь 2026"], "answer": 1, "explain": "Февраль: −31.8 % к предыдущему месяцу и +20.0 % к прошлому году — сезонный провал, а не спад. Сентябрь (−23.7 % / +16.2 %) — второй.", "xp": 1}
```

**P6.** *(LAG и LEAD по графику)* По каждому платежу графика кредита 1 — срок предыдущего платежа и число дней между ними (`LAG` по графику). Затем по **всем** кредитам: сколько подряд идущих платежей по графику разделяют больше 31 дня?

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*) FROM (
  SELECT loan_id, installment_no, due_date,
         julianday(due_date) - julianday(LAG(due_date) OVER (PARTITION BY loan_id ORDER BY installment_no)) AS gap
  FROM installments) WHERE gap > 31;
```
Кредит 1: 30, 31, 30, 31, 31, 30, 31, 30, 31, 31, **28** (28 янв → 28 фев), 31 … — длины месяцев, от 28 до 31. По всем графикам ни один интервал не превышает 31 — генератор графиков строго помесячный до дня; интервал 32+ означал бы пропущенный номер платежа. `LEAD(due_date) OVER (PARTITION BY loan_id ORDER BY installment_no)` задаёт тот же вопрос с другой стороны: следующая дата платежа. Шаг в 28 дней — тот же эффект конца месяца, что в P22 дня 3 недели 2: график, который идёт по календарю, не может сохранить 29–31 число в феврале.

</details>

**P7.** *(LAG — интервалы между оплатами)* Интервалы между подряд идущими **оплатами** по каждому кредиту: средний интервал, самый длинный, сколько превышают 60 дней и сколько ровно 0. Какое из этих четырёх — число для расследования?

<details><summary>Ответ</summary>

```sql
WITH g AS (
  SELECT loan_id,
         julianday(paid_at) - julianday(LAG(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at, payment_id)) AS gap
  FROM payments)
SELECT ROUND(AVG(gap), 1) AS avg_gap, MAX(gap) AS max_gap,
       SUM(CASE WHEN gap > 60 THEN 1 ELSE 0 END) AS over_60, SUM(CASE WHEN gap = 0 THEN 1 ELSE 0 END) AS same_day
FROM g;
-- 30.9 · 408 · 492 · 63
```
`AVG` 30.9 дня · `MAX` 408 · 492 интервала > 60 · **63 интервала = 0**. В 63 парах в один день содержатся 25 дубликатов плюс 38 законных пар (заёмщик платит два платежа в один день — разные `installment_id`). «Тот же день» — это подсказка, а не определение; определение — это разбиение по трём столбцам.

</details>

**P7 — число расследования.** Сколько пар подряд идущих оплат одного кредита разделяют ровно 0 дней?

```task
{"id": "w03d2-p6b", "kind": "number", "answer": 63, "dp": 0, "unit": "пар", "hint": "Столбец gap вашего запроса P7; посчитайте строки, где он равен 0.", "model": "63 пары в один день: 25 дубликатов плюс 38 законных пар, где заёмщик оплатил два разных платежа по графику в один день. Это подсказка, а не определение — определение даёт разбиение (платёж по графику, дата, сумма).", "xp": 1}
```

**P8.** *(FIRST_VALUE)* Для клиентов с двумя и более кредитами: продукт их **первого** кредита и их **последнего** кредита (`FIRST_VALUE` дважды, в каждом порядке), посчитанные как таблица «из → в». Сколько клиентов начали с Micro и дошли до SME?

<details><summary>Ответ</summary>

```sql
WITH f AS (SELECT l.customer_id,
                  FIRST_VALUE(p.code) OVER (PARTITION BY l.customer_id ORDER BY l.disbursed_at, l.loan_id)           AS first_product,
                  FIRST_VALUE(p.code) OVER (PARTITION BY l.customer_id ORDER BY l.disbursed_at DESC, l.loan_id DESC) AS latest_product,
                  COUNT(*)            OVER (PARTITION BY l.customer_id)                                              AS loans
           FROM loans l JOIN products p ON p.product_id = l.product_id)
SELECT first_product, latest_product, COUNT(DISTINCT customer_id) AS customers
FROM f WHERE loans >= 2
GROUP BY first_product, latest_product ORDER BY customers DESC;
-- 25 строк: MICRO → MICRO 263 · MICRO → CONS 259 · CONS → MICRO 221 … MICRO →
-- SME 70
```
70 клиентов взяли первым кредит Micro, а последним — SME. Самый частый путь из Micro — в Consumer (259). `FIRST_VALUE` с обратным порядком — надёжное «последнее»: `LAST_VALUE` с рамкой по умолчанию вернул бы собственный продукт каждой строки. `COUNT(DISTINCT customer_id)` — потому что окно записало одну и ту же пару в каждый кредит клиента.

</details>

**P9.** *(топ-N по группе)* Три крупнейших кредита по каждому **филиалу** (кредит, продукт, основной долг, дата выдачи). Сколько строк? Затем переделайте в одну строку на клиента — его последний кредит — и дайте структуру статусов этих последних кредитов.

<details><summary>Ответ</summary>

```sql
WITH r AS (
  SELECT b.branch_name, l.loan_id, p.code, l.principal, l.disbursed_at,
         ROW_NUMBER() OVER (PARTITION BY b.branch_name ORDER BY l.principal DESC, l.loan_id) AS rn
  FROM loans l JOIN branches b ON b.branch_id = l.branch_id JOIN products p ON p.product_id = l.product_id)
SELECT * FROM r WHERE rn <= 3 ORDER BY branch_name, rn;
-- 30 строк; все — кредиты SME; крупнейший по филиалу от 573 480 000 (Samarkand
-- Central) до 599 060 000 (Tashkent Central)
```
```sql
WITH r AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY disbursed_at DESC, loan_id DESC) AS rn FROM loans)
SELECT status, COUNT(*) FROM r WHERE rn = 1 GROUP BY status;
-- active 2266 · closed 1950 · default 30 · written_off 89   (4 335 клиентов)
```
Филиалы: 30 строк, все тридцать — SME. Последние кредиты: у 89 клиентов *последний* кредит списан — но у 188 клиентов списанный кредит есть где-то в истории, значит, **101 из них получили новый кредит после** кредита, который «пошёл плохо» (соедините `loans` с `loans` по клиенту с более поздним `disbursed_at`). Отнесите это число Нилуфар: это вопрос скоринга, а не взыскания.

</details>

**P9 — посчитайте.** Сколько строк возвращает запрос «топ-3 по каждому филиалу»?

```task
{"id": "w03d2-p2b", "kind": "number", "answer": 30, "dp": 0, "unit": "строк", "hint": "Десять филиалов, по три строки — если в каждом филиале хотя бы три кредита.", "model": "30 строк: 10 филиалов × 3. Все тридцать — кредиты SME, так что «крупнейшие кредиты по филиалам» — это на деле «портфель SME по филиалам».", "xp": 1}
```

**P10.** *(дубликаты)* Список Севары в нужном виде: по каждой паре дубликатов одна строка с обоими id платежей, кредитом, платежом по графику, датой, суммой, способом оплаты — `MIN` и `MAX` от `payment_id` по секции. Отсортировать по сумме, самые большие сверху.

<details><summary>Ответ</summary>

```sql
WITH d AS (SELECT payment_id, loan_id, installment_id, paid_at, amount, method,
                  COUNT(*)        OVER (PARTITION BY installment_id, paid_at, amount) AS cnt,
                  MIN(payment_id) OVER (PARTITION BY installment_id, paid_at, amount) AS first_id,
                  MAX(payment_id) OVER (PARTITION BY installment_id, paid_at, amount) AS second_id
           FROM payments)
SELECT DISTINCT first_id, second_id, loan_id, installment_id, paid_at, amount, method FROM d WHERE cnt > 1 ORDER BY amount DESC;
-- 25 строк; крупнейшая: кредит 5106, платёж 59838, 2026-07-17, 12 410 700
-- (click), id 34356 и 52857; затем кредит 1814 12 059 800 (11981/52858); кредит
-- 3676 11 445 500 (24496/52863)
```
Агрегатные окна по секции дубликатов; `DISTINCT` сворачивает пару в одну строку — здесь это допустимо, потому что две строки по построению одинаковы. (Привычки по производительности четверга предостерегают от `DISTINCT`, которым *прячут* ошибку соединения; здесь не тот случай.)

</details>

**P11.** *(дубликаты — что дубликатом не является)* Оплаты одного платежа по графику в *разные* дни или на *разные* суммы — не дубликаты, а частичные оплаты. Сколько платежей по графику после удаления 25 дубликатов имеют две и более различные оплаты? (`COUNT(*) OVER (PARTITION BY installment_id)` по набору без дубликатов.)

<details><summary>Ответ</summary>

```sql
WITH d AS (SELECT installment_id,
                  ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id) AS rn
           FROM payments),
k AS (SELECT installment_id, COUNT(*) OVER (PARTITION BY installment_id) AS n FROM d WHERE rn = 1)
SELECT COUNT(DISTINCT installment_id) AS instalments_with_2plus FROM k WHERE n >= 2;
-- 0
```
На наборе `rn = 1` значение `COUNT(*) OVER (PARTITION BY installment_id)` равно 1 в каждой строке: **ни у одного платежа по графику нет двух различных оплат** — каждый платёж оплачен целиком или не оплачен вовсе, а единственными платежами с несколькими оплатами были 25 дубликатов. Частичные платежи, найденные на неделе 2 (427 неоплаченных платежей с *какой-то* оплатой), — это одиночные оплаты меньше `total_due`. Знание, что в данных нет разбитых платежей, упрощает все последующие определения — запишите это в заметки.

</details>

**P11 — число.** Сколько платежей по графику после удаления 25 дубликатов имеют две и более различные оплаты?

```task
{"id": "w03d2-p11", "kind": "number", "answer": 0, "dp": 0, "unit": "платежей", "hint": "COUNT(*) OVER (PARTITION BY installment_id) по строкам с rn = 1; посчитайте платежи по графику, где он 2 или больше.", "model": "0. Каждый платёж по графику оплачен целиком или не оплачен вовсе; единственными платежами с несколькими оплатами были 25 дубликатов. 427 частично оплаченных платежей недели 2 — одиночные оплаты меньше total_due. Значит, «оплачено» в этих данных никогда не требует суммы по нескольким оплатам одного платежа — запишите это в заметки.", "xp": 2}
```

**P12.** *(миграция с LAG)* Один месяц — одна точка данных. Постройте ту же матрицу, что в разделе 1, для **1 августа → 1 сентября 2026** (даты среза `'2026-08-01'` и `'2026-09-01'`, кредиты, выданные до 1 августа). Какая доля 1–30 перешла в 31–60 на этот раз?

<details><summary>Ответ</summary>

```sql
WITH snaps(asof) AS (VALUES ('2026-08-01'), ('2026-09-01')),
unpaid AS (
  SELECT s.asof, i.loan_id, i.due_date
  FROM snaps s
  JOIN installments i ON i.due_date <= s.asof
  LEFT JOIN payments p ON p.installment_id = i.installment_id AND p.paid_at <= s.asof
  GROUP BY s.asof, i.installment_id, i.loan_id, i.due_date, i.total_due
  HAVING COALESCE(SUM(p.amount), 0) < i.total_due),
dpd AS (SELECT asof, loan_id, CAST(julianday(asof) - julianday(MIN(due_date)) AS INTEGER) AS dpd
        FROM unpaid GROUP BY asof, loan_id),
b AS (SELECT s.asof, l.loan_id,
             CASE WHEN COALESCE(d.dpd, 0) = 0 THEN '0' WHEN d.dpd <= 30 THEN '1-30' WHEN d.dpd <= 60 THEN '31-60'
                  WHEN d.dpd <= 90 THEN '61-90' ELSE '90+' END AS bucket
      FROM snaps s
      JOIN loans l ON l.disbursed_at < '2026-08-01'
      LEFT JOIN dpd d ON d.asof = s.asof AND d.loan_id = l.loan_id),
moves AS (SELECT asof, loan_id, bucket AS to_bucket, LAG(bucket) OVER (PARTITION BY loan_id ORDER BY asof) AS from_bucket FROM b)
SELECT from_bucket, to_bucket, COUNT(*) AS loans,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY from_bucket), 1) AS pct_of_from
FROM moves WHERE asof = '2026-09-01' AND from_bucket <> '0'
GROUP BY from_bucket, to_bucket ORDER BY from_bucket, to_bucket;
-- 1-30 → 0 75 (74.3 %) · → 1-30 5 (5.0) · → 31-60 21 (20.8) | 31-60 → 0 16
-- (47.1) · → 1-30 1 · → 61-90 17 (50.0) | 61-90 → 90+ 16 | 90+ → 90+ 201
```
1–30 перешли вперёд в **20.8 %** случаев (21 из 101) в августе и в 19.5 % в сентябре: примерно каждый пятый, стабильно. 31–60 менее стабильна — 50.0 %, затем 69.6 % — на 34 и 23 кредитах; маленькие строки сильно колеблются. Два месяца — прежде чем называть любую из этих долей «той самой» миграцией.

</details>

> 🚀 **Со звёздочкой (по желанию, +5 XP).** Медиана без функции медианы — переносимый приём с двумя окнами.

**P13.** *(ROW_NUMBER + COUNT как окно)* Медиана основного долга по продуктам через `ROW_NUMBER` и `COUNT(*) OVER` (выберите среднюю строку или строки). Сравните со средним — где они различаются сильнее всего?

<details><summary>Ответ</summary>

```sql
WITH r AS (SELECT p.code, l.principal,
                  ROW_NUMBER() OVER (PARTITION BY p.code ORDER BY l.principal) AS rn,
                  COUNT(*)     OVER (PARTITION BY p.code) AS n
           FROM loans l JOIN products p ON p.product_id = l.product_id)
SELECT code, n, AVG(principal) AS median FROM r WHERE rn IN ((n + 1) / 2, (n + 2) / 2) GROUP BY code;
-- AUTO медиана 214 840 000 (среднее 216 858 133) · SME 314 770 000 (308 728
-- 745) · CONS 26 965 000 (26 926 915) · MICRO 2 700 000 (2 705 586) · BNPL 4
-- 180 000 (4 170 880)
```
Целочисленное деление выбирает одну среднюю строку при нечётном n и две при чётном. Медиана ≈ среднему везде: размеры кредитов равномерно распределены между минимумом и максимумом продукта, перекоса нет. (В SQL Server есть `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY principal) OVER (PARTITION BY code)`; в SQLite нет — это переносимый способ.)

</details>

---

## 4. Самопроверка :id=4-self-check

```check
{"id": "w03d2-sc", "questions": [
  {"type": "single", "q": "Три кредита делят максимальный основной долг. Что дают ROW_NUMBER, RANK и DENSE_RANK (ORDER BY principal DESC) четвёртому кредиту?", "options": ["4, 4, 2", "4, 2, 2", "2, 4, 4", "4, 4, 4"], "answer": 0, "explain": "ROW_NUMBER никогда не повторяется; RANK повторяет, затем прыгает на 4; DENSE_RANK повторяет и продолжает с 2 (→ раздел 1, «RANK и DENSE_RANK»)."},
  {"type": "single", "q": "LAST_VALUE(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at) возвращает собственную дату каждой строки. Как исправить?", "options": ["Убрать PARTITION BY", "Явно задать ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING (или взять FIRST_VALUE с ORDER BY … DESC)", "Использовать LAG", "Добавить ORDER BY paid_at в конце запроса"], "answer": 1, "explain": "При ORDER BY рамка по умолчанию заканчивается на текущей строке, поэтому «последняя» — это сама строка (→ раздел 1, «FIRST_VALUE и LAST_VALUE»)."},
  {"type": "single", "q": "Финансы говорят, что дубликаты невозможны, потому что payment_id уникален. Какое окно всё равно их находит и какую строку вы оставляете?", "options": ["ROW_NUMBER() OVER (PARTITION BY payment_id ORDER BY paid_at), оставить rn = 2", "ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id), оставить rn = 1", "RANK() OVER (ORDER BY amount), оставить ранг 1", "COUNT(*) OVER (), оставить все"], "answer": 1, "explain": "Секция — по тому, что определяет «одно и то же», сортировка — по id, оставляем самый ранний (→ раздел 1, «Дубликаты»; раздел 2)."}]}
```

---

## 5. Уголок компании <span class="badge company">Roll rates</span> :id=5-company-corner-roll-rates

**Миграция между корзинами** (*roll rate*) — это доля кредитов, перешедших из одной корзины DPD в другую между двумя датами среза — обычно от конца месяца до конца месяца. Это отчёт-оценка работы взыскания (1–30 вылечились или перешли в 31–60?) и вход для резервирования (корзина 90+ пополняется тем, что выходит из 61–90). Раздел 1 построил матрицу через `LAG` по сложенным друг под другом срезам. Здесь — второй распространённый способ: два среза рядом, — и как читать результат. Три шага, два из них — вчерашние инструменты:

**1. Срез на каждую дату.** Блок DPD из недели 2, в котором дата отчёта — *параметр* в двух местах: фильтр платежей по графику **и** фильтр оплат. Второй не был нужен на 2026-10-01 (дата выгрузки), но на 2026-09-01 оплата, сделанная 15 сентября, не должна учитываться:

```sql
-- неоплаченные платежи с наступившим сроком на 2026-09-01
WITH u0 AS (
  SELECT i.loan_id, i.due_date FROM installments i
  LEFT JOIN payments p ON p.installment_id = i.installment_id AND p.paid_at <= '2026-09-01'
  WHERE i.due_date <= '2026-09-01'
  GROUP BY i.installment_id, i.loan_id, i.due_date, i.total_due HAVING COALESCE(SUM(p.amount), 0) < i.total_due),
d0 AS (SELECT loan_id, CAST(julianday('2026-09-01') - julianday(MIN(due_date)) AS INTEGER) AS dpd FROM u0 GROUP BY loan_id),
u1 AS ( /* то же с '2026-10-01' */ ),
d1 AS ( /* то же */ ),
```

Срез 2026-09-01: **13 / 128 / 23 / 17 / 217** (398 кредитов). Срез 2026-10-01: 14 / 124 / 25 / 16 / 234 (413) — знакомые числа. Корзина 90+ выросла на 17; вопрос в том, откуда.

**2. Соедините два среза — с обеих сторон.** Кредит, который был просрочен в сентябре и вылечился к октябрю, есть только в `d0`; кредит, который стал просроченным в сентябре, — только в `d1`. Ни одна сторона соединения не должна терять строки → `FULL OUTER JOIN` (SQLite 3.39+, SQL Server — всегда); отсутствие = DPD 0:

```sql
j AS (SELECT COALESCE(a.loan_id, b.loan_id) AS loan_id, COALESCE(a.dpd, 0) AS dpd0, COALESCE(b.dpd, 0) AS dpd1
      FROM d0 a FULL OUTER JOIN d1 b ON a.loan_id = b.loan_id),
k AS (SELECT loan_id,
             CASE WHEN dpd0 = 0 THEN '0' WHEN dpd0 <= 30 THEN '1-30' WHEN dpd0 <= 60 THEN '31-60' WHEN dpd0 <= 90 THEN '61-90' ELSE '90+' END AS from_bucket,
             CASE WHEN dpd1 = 0 THEN '0' WHEN dpd1 <= 30 THEN '1-30' WHEN dpd1 <= 60 THEN '31-60' WHEN dpd1 <= 90 THEN '61-90' ELSE '90+' END AS to_bucket, dpd0
      FROM j)
SELECT from_bucket, COUNT(*) AS loans,
       SUM(CASE WHEN to_bucket = '0' THEN 1 ELSE 0 END)     AS to_0,
       SUM(CASE WHEN to_bucket = '1-30' THEN 1 ELSE 0 END)  AS to_1_30,
       SUM(CASE WHEN to_bucket = '31-60' THEN 1 ELSE 0 END) AS to_31_60,
       SUM(CASE WHEN to_bucket = '61-90' THEN 1 ELSE 0 END) AS to_61_90,
       SUM(CASE WHEN to_bucket = '90+' THEN 1 ELSE 0 END)   AS to_90p
FROM k GROUP BY from_bucket ORDER BY MIN(dpd0);
```

**3. Матрица переходов** (*transition matrix*), количества и проценты по строкам (`100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY from_bucket)` в длинной форме):

| из \ в (1 сен → 1 окт) | 0 | 1–30 | 31–60 | 61–90 | 90+ | кредитов |
|---|---|---|---|---|---|---|
| **1–30** | 97 · **75.8 %** | 6 · 4.7 % | 25 · **19.5 %** | – | – | 128 |
| **31–60** | 6 · 26.1 % | 1 · 4.3 % | – | 16 · 69.6 % | – | 23 |
| **61–90** | – | – | – | – | 17 · 100 % | 17 |
| **90+** | – | – | – | – | 217 · 100 % | 217 |
| *новые из 0* | | 117 | | | | 3 093 обслуживаемых кредита с платежом в сентябре |

**Как это читать.**

- **Переход вперёд 1–30 → 31–60 = 19.5 %** (25 из 128). Каждый пятый кредит с ранней просрочкой за месяц ухудшился. **Излечение 1–30 → 0 = 75.8 %**: три из четырёх расплатились — в согласии с выводом недели 2, что опаздывающие платят в течение 60 дней. Те 6, что «остались» в 1–30, оплатили старый платёж и пропустили следующий.
- **31–60 переходит вперёд в 69.6 %** случаев и лечится в 26 %; **61–90 переходит в 90+ в 100 %** — из 61–90 никто не возвращается. Таков облик настоящего портфеля: шанс излечения падает с возрастом просрочки, поэтому три сотрудника Севары должны работать в 1–30 (T13 недели 2) — единственной корзине, где усилие меняет результат.
- **90+ поглощающая** (217 → 217; плюс 17 пришедших = 234): ничего не лечится, ничего не списывается *из* данных за месяц. В банке в строке 90+ был бы ещё столбец выхода «списано / взыскано».
- **Новые входы:** 117 кредитов вошли в 1–30 из текущих — 3.8 % от 3 093 обслуживаемых кредитов, у которых в сентябре был платёж по графику. Это *доля притока*; первая строка матрицы — это *излечение/переход* запаса. Сообщайте оба показателя.
- 13 кредитов с DPD 0 на 1 сентября (срок наступал в тот день) исключены из строк матрицы выше: они ещё не опаздывали; они входят в совокупность «из 0».

**Что сказать Севаре:** *«Из 128 кредитов в 1–30 на 1 сентября 97 вылечились (76 %), 25 перешли в 31–60 (20 %). Из 23 в 31–60 16 пошли дальше (70 %). Все 17 в 61–90 дошли до 90+. 117 новых кредитов вошли в 1–30 (3.8 % обслуживаемых кредитов). Усилия взыскания окупаются в 1–30 и почти не окупаются позже».* Один месяц — это одна точка данных; постройте ту же матрицу для августа → сентября, прежде чем называть 19.5 % «тем самым» roll rate.

```game
{"type": "order", "id": "w03d2-g4", "title": "Матрица roll rate, шаг за шагом", "items": ["Срез DPD на 1 сентября (дата отчёта в фильтре платежей по графику и в соединении с оплатами)", "Срез DPD на 1 октября, так же", "FULL OUTER JOIN двух срезов по loan_id, отсутствие = DPD 0", "Разбить обе стороны по корзинам через CASE", "Посчитать кредиты по корзина-из × корзина-в", "Разделить на итог корзины-из через SUM(COUNT(*)) OVER (PARTITION BY from_bucket)"], "why": "Каждый шаг — один CTE; окно в конце превращает количества в доли перехода и излечения."}
```

> 🎯 **Версия для собеседования.** *«Как вы считаете roll rates?»* Интервьюер ждёт два среза и где стоит дата отчёта, почему соединение должно сохранить обе стороны и как количества превращаются в доли. Скажите в поле ниже, затем сравните.

**Скажите, как на собеседовании.** Ответьте на вопрос выше в 3–5 предложениях, как сказали бы вслух, с одним числом Nur Finance.

```task
{"id": "w03d2-int", "kind": "free", "min": 30, "model": "Я беру срез DPD по каждому кредиту на две даты — в Nur Finance это 1 сентября и 1 октября 2026 года — и ставлю дату отчёта и в фильтр платежей по графику, и в соединение с оплатами, чтобы оплата после среза не учитывалась. Разбиваю оба среза по корзинам через CASE и соединяю их FULL OUTER JOIN по кредиту, считая отсутствующую сторону DPD 0: вылечившиеся кредиты есть только в первом срезе, а новые просроченные — только во втором. Затем считаю корзина-из × корзина-в и делю на итог корзины-из окном SUM(COUNT(*)) OVER (PARTITION BY from_bucket). Читаю переход вперёд и излечение по корзинам — 19.5 % из 1–30 перешли в 31–60, 75.8 % вылечились — и отдельно сообщаю приток из текущих: 117 кредитов, 3.8 % обслуживаемых.", "rubric": ["Два среза DPD, дата отчёта и в условии по платежам графика, и в условии по оплатам", "FULL OUTER JOIN (или аналог) с отсутствием = 0, и почему", "Доли = количества, делённые на итог корзины-из (окно)", "Читает переход вперёд и излечение, а приток из текущих — отдельно", "Приводит хотя бы одно реальное число"], "xp": 2}
```

Завтра: подзапросы и цепочки CTE по-настоящему — блоки `WITH … AS`, которые вы копировали, станут вашими, — и кривые поколений (винтажи) Нилуфар.

---

## Тест дня :id=day-quiz

Для завершения дня нужно набрать 80 %. Пересдавать можно сколько угодно.

```quiz
{"id": "w03d2", "pass": 0.8, "questions": [
  {"type": "single", "q": "Три кредита делят максимальный основной долг; следующий — четвёртый. Что дают ROW_NUMBER, RANK и DENSE_RANK (ORDER BY principal DESC) четвёртому кредиту?", "options": ["4, 4, 2", "4, 2, 2", "2, 4, 4", "4, 4, 4"], "answer": 0, "explain": "ROW_NUMBER никогда не повторяется; RANK даёт равным значениям один номер, а затем пропускает; DENSE_RANK даёт равным значениям один номер без пропуска (→ раздел 1, «RANK и DENSE_RANK»)."},
  {"type": "single", "q": "Нужна ровно одна строка на клиента: его последний кредит. Какая функция и какой фильтр?", "options": ["RANK() … WHERE rk = 1", "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY disbursed_at DESC, loan_id DESC), оставить rn = 1 во внешнем запросе", "DENSE_RANK() … WHERE drk <= 1", "NTILE(1) OVER (PARTITION BY customer_id)"], "answer": 1, "explain": "ROW_NUMBER гарантирует одну строку даже при равных значениях, дополнительный признак делает результат повторяемым, а фильтр идёт снаружи, потому что окон в WHERE не существует (→ раздел 1, «Топ-N по группе»; P9)."},
  {"type": "number", "q": "NTILE(4) по этим 10 строкам: сколько строк попадёт в группу 1?", "code": "SELECT x, NTILE(4) OVER (ORDER BY x) AS g\nFROM t;      -- в t 10 значений 1, 2, …, 10", "answer": 3, "explain": "NTILE режет на группы почти равного размера; лишние строки достаются первым группам: 3, 3, 2, 2 (→ раздел 1, NTILE; P4)."},
  {"type": "single", "q": "Почему last_payment показывает собственную дату каждой строки?", "code": "SELECT paid_at,\n       LAST_VALUE(paid_at) OVER (PARTITION BY loan_id ORDER BY paid_at) AS last_payment\nFROM payments WHERE loan_id = 1;", "options": ["LAST_VALUE в SQLite сломан", "При ORDER BY рамка по умолчанию заканчивается на текущей строке, поэтому «последняя» строка рамки — это сама строка", "PARTITION BY указан неверно", "В paid_at есть дубликаты"], "answer": 1, "explain": "Явно задайте ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING или используйте FIRST_VALUE с ORDER BY … DESC (→ раздел 1, «FIRST_VALUE и LAST_VALUE»)."},
  {"type": "single", "q": "В m лежит месячная выдача, и запрос считает yoy_pct через LAG(disbursed, 12). Кто-то переносит фильтр вывода WHERE month >= '2026-01' внутрь m. Что произойдёт?", "code": "WITH m AS (SELECT strftime('%Y-%m', disbursed_at) AS month, SUM(principal) AS disbursed\n           FROM loans\n           WHERE disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01'\n           GROUP BY 1)\nSELECT month, disbursed, LAG(disbursed, 12) OVER (ORDER BY month) AS same_month_last_year\nFROM m;", "options": ["Ничего не изменится", "2025 год исчезает до того, как отработает окно, поэтому все значения к прошлому году равны NULL", "Запрос завершится ошибкой", "LAG всё равно прочитает 2025 из таблицы loans"], "answer": 1, "explain": "Фильтруйте вывод во внешнем запросе; окно может заглянуть назад только на строки, которые до него дошли (→ раздел 1, «LAG и LEAD»; P5)."},
  {"type": "single", "q": "Чтобы очистить дубликаты платежей, вы нумеруете строки через ROW_NUMBER() OVER (PARTITION BY installment_id, paid_at, amount ORDER BY payment_id). Почему не просто GROUP BY … HAVING COUNT(*) > 1?", "options": ["HAVING медленнее", "HAVING находит группы дубликатов, но не скажет, какую строку оставить, и не вернёт чистые строки рядом; окно делает и то и другое", "GROUP BY не принимает три столбца", "Они дают разные группы дубликатов"], "answer": 1, "explain": "Оставьте rn = 1 (самый ранний payment_id) в представлении; никогда не делайте DELETE из сырой таблицы (→ раздел 1, «Дубликаты»; раздел 2, шаг 2)."},
  {"type": "multi", "q": "Вы строите срез DPD на 2026-09-01 по данным, выгруженным 2026-10-01. Где должна появиться дата отчёта?", "options": ["В фильтре платежей по графику: due_date <= '2026-09-01'", "В соединении с оплатами: p.paid_at <= '2026-09-01' (в ON)", "В фильтре по loans.disbursed_at = '2026-09-01'", "Нигде — DPD всегда считается на сегодня"], "answer": [0, 1], "explain": "Оплата, сделанная 15 сентября, не должна учитываться на 1 сентября, а в LEFT JOIN условие по оплатам относится к ON (→ раздел 1, «Миграция с LAG»; раздел 5)."},
  {"type": "single", "q": "Чтобы построить матрицу roll rate, вы соединяете сентябрьский и октябрьский срезы DPD через FULL OUTER JOIN. Почему не INNER JOIN?", "options": ["INNER JOIN нельзя применять между CTE", "Вылечившийся кредит есть только в сентябре, а новый просроченный — только в октябре; внутреннее соединение отбросит оба", "FULL OUTER JOIN быстрее", "Чтобы посчитать кредиты дважды"], "answer": 1, "explain": "Ни одна сторона не должна терять строки; отсутствие = DPD 0 через COALESCE (→ раздел 5, Уголок компании)."}
]}
```

<!-- challenge:start -->

---

## Задача дня :id=daily-challenge

Бонус для любознательных: один более трудный вопрос по теме дня. Решите его за XP, которые растут вместе с серией задач, — полная неделя из пяти ещё добавляет 10 % к пятничному ваучеру.

```challenge
{"id": "w03d2", "sql": true, "q": "Бекзод хочет знать, как долго заёмщик ждёт перед вторым кредитом. Для каждого customer_id, у которого не менее двух кредитов, возьмите число дней между первой и второй выдачей (кредиты клиента упорядочьте по disbursed_at, при равенстве — по loan_id). Каково среднее, в днях с 1 знаком после запятой?", "type": "number", "dp": 1, "h": ["ad0c61c8480db949d5a40239"], "hint": "Пронумеруйте кредиты каждого клиента и прочитайте предыдущую строку — затем оставьте ровно одну строку на клиента.", "sol": "V0lUSCByIEFTICgKICBTRUxFQ1QgY3VzdG9tZXJfaWQsIGxvYW5faWQsIGRpc2J1cnNlZF9hdCwKICAgICAgICAgUk9XX05VTUJFUigpIE9WRVIgKFBBUlRJVElPTiBCWSBjdXN0b21lcl9pZCBPUkRFUiBCWSBkaXNidXJzZWRfYXQsIGxvYW5faWQpIEFTIHJuLAogICAgICAgICBMQUcoZGlzYnVyc2VkX2F0KSBPVkVSIChQQVJUSVRJT04gQlkgY3VzdG9tZXJfaWQgT1JERVIgQlkgZGlzYnVyc2VkX2F0LCBsb2FuX2lkKSBBUyBwcmV2X2Rpc2J1cnNlZAogIEZST00gbG9hbnMpClNFTEVDVCBDT1VOVCgqKSBBUyBjdXN0b21lcnMsCiAgICAgICBST1VORChBVkcoanVsaWFuZGF5KGRpc2J1cnNlZF9hdCkgLSBqdWxpYW5kYXkocHJldl9kaXNidXJzZWQpKSwgMSkgQVMgYXZnX2RheXMKRlJPTSByCldIRVJFIHJuID0gMjsKLS0gU1FMIFNlcnZlcjogQVZHKENBU1QoREFURURJRkYoZGF5LCBwcmV2X2Rpc2J1cnNlZCwgZGlzYnVyc2VkX2F0KSBBUyBGTE9BVCkpIOKAlCBEQVRFRElGRiByZXR1cm5zIGFuIGludGVnZXIgYW5kIEFWRyBvZiBpbnRlZ2VycyB0cnVuY2F0ZXMKLS0gMiAyNDYgY3VzdG9tZXJzLCAxOTguMyBkYXlzCktlZXBpbmcgZXZlcnkgcm4gPj0gMiAoYWxsIGdhcHMgYmV0d2VlbiBjb25zZWN1dGl2ZSBsb2FucykgZ2l2ZXMgMTg2Ljkg4oCUIGEgZGlmZmVyZW50IHF1ZXN0aW9uLiBBYm91dCBzaXggYW5kIGEgaGFsZiBtb250aHMgZnJvbSB0aGUgZmlyc3QgbG9hbiB0byB0aGUgc2Vjb25kOiBzaG9ydCBNaWNybyBhbmQgQk5QTCBsb2FucyBjbG9zZSBmYXN0IGFuZCB0aGUgYm9ycm93ZXIgY29tZXMgYmFjay4gV2VlayAxJ3MgZHVwbGljYXRlIHJvd3Mgc3BsaXQgYSBmZXcgcGVvcGxlJ3MgaGlzdG9yaWVzIGFjcm9zcyB0d28gaWRzLCBzbyBjYWxsIGl0ICJwZXIgY3VzdG9tZXIgaWQiLCBub3QgInBlciBwZXJzb24iLg=="}
```

<!-- challenge:end -->
