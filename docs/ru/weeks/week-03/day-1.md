# Неделя 3 · День 1 — Оконные функции: итог рядом с каждой строкой

<span class="badge">Теория 60 мин</span> <span class="badge">Разобранный пример 15 мин</span> <span class="badge">Практика 60 мин</span> <span class="badge">Домашнее задание</span> <span class="badge company">Уголок компании</span>

> STORY **Понедельник, 9:10.** Бекзод, портфельный менеджер, распечатал вчерашние T2 и T5 и от руки подписал на полях проценты. *«Две вещи, которых я не смог получить от вас на прошлой неделе. Первая: остаток долга каждого филиала **и его доля в компании** — в одной строке, а я всё делю на калькуляторе. Вторая: помесячная выдача по каждому продукту с **накопленным итогом с начала года** рядом, чтобы видеть, где мы относительно плана на 2026 год, не суммируя столбец в Excel».* Мадина, из-за соседнего стола: *«Это и есть весь сегодняшний день. К среде ему нужен пакет».*

## Сегодня в 3 строках :id=today-in-3-lines

- **Оконная функция** считает агрегат *рядом с* каждой строкой, а не схлопывает строки: `SUM(x) OVER ()` — общий итог на каждой строке, `SUM(x) OVER (PARTITION BY product)` — итог по продукту.
- `ORDER BY` внутри `OVER` превращает агрегат в **накопительный итог**; `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` даёт **скользящее среднее**.
- Вы знаете, когда нужен **GROUP BY**, когда **окно**, а когда **и то и другое**, — и у вас есть столбцы Бекзода: доля в компании и накопленный итог с начала года.

---

## 1. Теория — тот же агрегат, но без потери строк :id=1-learn-the-same-aggregate-without-losing-the-rows

### Задача, которую одному GROUP BY не решить :id=the-problem-group-by-cannot-solve-alone

Вчерашний T2 дал пять строк: остаток долга по продуктам. Бекзоду нужен шестой столбец — *доля от итога*. `GROUP BY` уже схлопнул строки, и итога в результате нет: понадобился бы второй запрос или однозначный подзапрос прошлой недели `(SELECT SUM(...) FROM ...)`, повторённый с теми же соединениями и фильтрами. **Оконная функция** (*window function*) решает это на месте: она смотрит на «окно» строк вокруг текущей, считает по ним агрегат и записывает ответ **в текущую строку**. Ни одна строка не пропадает.

```sql
SELECT loan_id, principal,
       SUM(principal) OVER ()                 AS company_total,     -- одно и то же число во всех 7 828 строках
       AVG(principal) OVER ()                 AS company_avg,
       COUNT(*) OVER ()                       AS loans
FROM loans LIMIT 3;
-- 1 · 31 150 000 · 404 783 280 000 · 51 709 668 · 7828   (и те же три значения в строках 2 и 3 — окно прошло по всем 7 828 строкам до того, как LIMIT обрезал вывод)
```

Читайте `OVER ()` как *«по всем строкам результата»*. Пустые скобки = одно окно, в котором всё. Оба движка сегодня согласны по всем ключевым словам окон — SQL Server и SQLite различаются только функциями перед ними (`julianday` против `DATEDIFF`, как и раньше).

### PARTITION BY — своё окно для каждой группы :id=partition-by-one-window-per-group

`PARTITION BY` делит строки на группы, точно как `GROUP BY`, — но каждая строка остаётся и получает агрегат своей группы:

```sql
SELECT l.loan_id, p.code, l.principal,
       ROUND(AVG(l.principal) OVER (PARTITION BY p.code))        AS product_avg,
       ROUND(100.0 * l.principal / AVG(l.principal) OVER (PARTITION BY p.code)) AS pct_of_avg,
       MAX(l.principal) OVER (PARTITION BY p.code)               AS product_max,
       COUNT(*) OVER (PARTITION BY p.code)                       AS loans_in_product
FROM loans l JOIN products p ON p.product_id = l.product_id
WHERE l.loan_id <= 5;
```

Читайте внимательно: `WHERE loan_id <= 5` выполняется **до** окна, поэтому `product_avg` здесь — это среднее по 2 кредитам Consumer среди кредитов 1–5 (35 605 000), а не по всем 2 418. **Окна считаются после `WHERE`, `GROUP BY` и `HAVING` и до `ORDER BY`/`LIMIT`.** Этот порядок — самый полезный факт дня: из-за него можно сначала фильтровать, и из-за него нельзя ставить окно в `WHERE` (нужна производная таблица или CTE — День 3; сегодня используйте схему из P6).

### Доля от итога — столбец, который просил Бекзод :id=share-of-total-the-column-bekzod-asked-for

```sql
SELECT p.code, SUM(i.principal_due) AS outstanding,
       ROUND(100.0 * SUM(i.principal_due) / SUM(SUM(i.principal_due)) OVER (), 1) AS share_pct
FROM installments i JOIN loans l ON l.loan_id = i.loan_id JOIN products p ON p.product_id = l.product_id
WHERE i.due_date > '2026-10-01'
GROUP BY p.code ORDER BY outstanding DESC;
-- SME 125 892 942 411 · 60.3 % · AUTO 57 684 271 333 · 27.6 · CONS 23 054 933 316 · 11.0 · BNPL 1 135 251 000 · 0.5 · MICRO 956 106 370 · 0.5
```

`SUM(SUM(x)) OVER ()` выглядит странно и является ключевым приёмом недели: внутренний `SUM` — агрегат `GROUP BY` (одно значение на продукт); внешний `SUM(...) OVER ()` складывает эти пять значений и записывает итог в каждую из пяти строк. **GROUP BY и окно в одном запросе** — окно работает по *сгруппированному* результату. `100.0 *` — в начале, как всегда.

### ORDER BY внутри OVER — накопительные итоги :id=order-by-inside-over-running-totals

Добавьте `ORDER BY` внутрь скобок — и окно превращается в *«все строки от начала секции до текущей»*. Агрегат становится **накопительным итогом** (*running total*):

```sql
WITH m AS (
  SELECT strftime('%Y-%m', disbursed_at) AS month, COUNT(*) AS loans, SUM(principal) AS disbursed    -- FORMAT(disbursed_at, 'yyyy-MM')
  FROM loans GROUP BY strftime('%Y-%m', disbursed_at))
SELECT month, loans, disbursed,
       SUM(disbursed) OVER (PARTITION BY substr(month, 1, 4) ORDER BY month) AS ytd     -- SQL Server: LEFT(month, 4)
FROM m ORDER BY month;
-- 2026-01 287 / 17 452 370 000 / ytd 17 452 370 000 · 2026-02 265 / 11 893 850 000 / 29 346 220 000 · … · 2026-09 361 / 17 015 490 000 / 161 480 300 000 · 2026-10 21 / 852 760 000 / 162 333 060 000
```

`PARTITION BY` по году, `ORDER BY` по месяцу: накопленная сумма обнуляется каждый январь (2025 заканчивается на 155 927 230 000; 2026 начинается заново с 17.45 млрд). `WITH m AS (...)` — это CTE из Дня 3; используйте его так же, как на прошлой неделе: именованный результат, который вы затем запрашиваете.

### Рамка по умолчанию и ROWS BETWEEN :id=the-default-frame-and-rows-between

Если внутри `OVER` есть `ORDER BY`, у окна появляется **рамка** (*frame*): какие строки вокруг текущей в него входят. По умолчанию это `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` — а `RANGE` означает *«до текущей строки включительно, и все строки с тем же значением ORDER BY»*. Посчитайте ежедневный накопительный итог по сырым кредитам — и ловушка видна:

```sql
SELECT disbursed_at, principal,
       SUM(principal) OVER (ORDER BY disbursed_at)                              AS range_run,   -- рамка по умолчанию
       SUM(principal) OVER (ORDER BY disbursed_at ROWS UNBOUNDED PRECEDING)     AS rows_run
FROM loans WHERE disbursed_at >= '2026-09-28' ORDER BY disbursed_at, loan_id;
-- 2026-09-28: у всех семи кредитов range_run = 543 980 000 (весь день); rows_run растёт 135 550 000 → 140 420 000 → … → 543 980 000
```

Оба «правильны»: `RANGE` говорит *итог по эту дату включительно*, `ROWS` — *итог по эту строку*. Правило: если в `ORDER BY` есть совпадения, решите, что вы имеете в виду; если сортировка идёт по уникальному ключу (одна строка на месяц), они совпадают. Явный синтаксис рамки — `ROWS BETWEEN <start> AND <end>`, где можно использовать `UNBOUNDED PRECEDING`, `n PRECEDING`, `CURRENT ROW`, `n FOLLOWING`, `UNBOUNDED FOLLOWING`.

### Скользящие средние — рамка фиксированной длины :id=moving-averages-a-frame-of-fixed-length

**Скользящее среднее** (*moving average*) сглаживает месячный ряд: каждый месяц заменяется средним по нему самому и двум предыдущим.

```sql
-- после того же WITH m AS (...)
SELECT month, disbursed,
       ROUND(AVG(disbursed) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)) AS ma3,
       COUNT(*)            OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)  AS months_in_window
FROM m ORDER BY month;
-- 2024-01 ma3 = 3 872 450 000 (1 месяц) · 2024-02 4 236 505 000 (2) · 2024-03 4 966 556 667 (3) … 2026-08 19 678 126 667 · 2026-09 19 999 856 667 · 2026-10 13 386 153 333
```

Два честных замечания: первые два месяца усредняют меньше трёх значений (показывайте `months_in_window` или начинайте график с 3-го месяца), а октябрь 2026 — это **один день** данных (852 760 000), и он тянет трёхмесячное среднее вниз на треть. Фильтруйте `WHERE month < '2026-10'` до сглаживания. **Центрированное** среднее — это `ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING`; 12-месячное — `11 PRECEDING`.

### Окно или GROUP BY — что и когда, и когда оба :id=window-vs-group-by-which-and-when-both

| Что нужно | Что использовать | Строк на выходе |
|---|---|---|
| одно число на группу | `GROUP BY` | по одной на группу |
| каждая строка, а рядом число её группы | окно с `PARTITION BY` | все строки |
| одно число на группу **плюс** доля/накопительный итог по группам | `GROUP BY` **и** окно сверху (`SUM(SUM(x)) OVER ()`) | по одной на группу |
| фильтр по результату окна («кредиты выше среднего по своему продукту») | окно в CTE/производной таблице, фильтр снаружи | подмножество |

Окна никогда не уменьшают число строк; `GROUP BY` уменьшает всегда; приём `SUM(SUM())` — это рукопожатие между ними.

### Углубление (необязательно) :id=depth-optional

- ▶ Baraa, *Window functions basics* [8:50:11](https://youtu.be/SSKVgrwhzus?t=31811&end=35220), *Window aggregate* [9:47:00](https://youtu.be/SSKVgrwhzus?t=35220&end=39189) — ~2 ч; SQL Server, все ключевые слова здесь идентичны.
- Русскоязычная презентация (TBC Data Analytics 2.0, если она у вас есть) `2.3 SQL.pdf` — страницы про окна. *Английские термины:* оконные функции = window functions, секция = partition, рамка окна = frame, накопительный итог = running total, скользящее среднее = moving average.

---

## 2. Разобранный пример — таблица филиалов для Бекзода (15 мин) :id=_2-worked-example-bekzod39s-branch-table-15-min

*«Остаток долга каждого филиала и его доля в компании».* Существительное, которое составляет одну строку суммируемого, — **платёж по графику**, срок которого ещё не наступил (как в T2). Соедините `loans → branches` «многие к одному» ради подписи. Сгруппируйте по филиалу. Тогда доля — это окно по сгруппированному результату:

```sql
SELECT b.branch_name, b.region,
       SUM(i.principal_due)                                                   AS outstanding,
       COUNT(DISTINCT i.loan_id)                                              AS loans,
       ROUND(100.0 * SUM(i.principal_due) / SUM(SUM(i.principal_due)) OVER (), 1)                      AS share_pct,
       ROUND(100.0 * SUM(i.principal_due) / SUM(SUM(i.principal_due)) OVER (PARTITION BY b.region), 1) AS share_in_region
FROM installments i JOIN loans l ON l.loan_id = i.loan_id JOIN branches b ON b.branch_id = l.branch_id
WHERE i.due_date > '2026-10-01'
GROUP BY b.branch_name, b.region ORDER BY outstanding DESC;
```

| филиал | остаток долга | доля % | доля в регионе % |
|---|---|---|---|
| Tashkent Central | 28 716 674 373 | 13.8 | 35.2 |
| Tashkent South | 26 787 392 136 | 12.8 | 32.8 |
| Tashkent North | 26 175 671 562 | 12.5 | 32.0 |
| Fergana Central | 24 797 334 197 | 11.9 | 100.0 |
| Samarkand Central | 24 655 889 676 | 11.8 | 100.0 |
| Andijan Central | 19 798 392 956 | 9.5 | 100.0 |
| Namangan Central | 18 696 787 066 | 9.0 | 100.0 |
| Bukhara Central | 15 116 046 338 | 7.2 | 100.0 |
| Nukus Central | 13 309 138 567 | 6.4 | 100.0 |
| Termez Central | 10 670 177 559 | 5.1 | 100.0 |

Проверка: доли в сумме дают 100.0, а остаток долга — 208 723 504 430, вчерашний итог. Два окна в одном запросе, два разбиения: `OVER ()` для компании, `OVER (PARTITION BY region)` для региона. Второй столбец интересен только в Ташкенте, где три филиала делят регион почти поровну; он же показывает, что столбец доли бессмыслен, пока не сказано, *доля чего*.

---

## 3. Практика (60 мин) :id=3-practice-60-min

Пишите каждый запрос в поле под вопросом — он сохраняется в этом браузере. Кнопка **✔ Проверить** сообщит, совпал ли ваш результат с ответом.

**P1.** Каждый кредит с общим итогом по компании, средним по компании и количеством кредитов — в каждой строке. Затем то же только для кредитов клиента 3208; объясните, почему итог изменился.

<details><summary>Ответ</summary>

```sql
SELECT loan_id, principal, SUM(principal) OVER () AS total, ROUND(AVG(principal) OVER ()) AS avg_principal, COUNT(*) OVER () AS n
FROM loans WHERE customer_id = 3208;
-- 4265 · 568 200 000 · total 1 023 170 000 · avg 511 585 000 · n 2  (кредит 7606 — то же самое)
```
Без `WHERE`: итог 404 783 280 000, среднее 51 709 668, n 7 828 в каждой строке. `WHERE` выполняется первым, поэтому окно видит только два кредита клиента.

</details>

**P2.** Остаток долга по **классам риска** с долей от итога, один знак после запятой. Какой класс несёт больше всего денег, и совпадает ли это с тем, что подсказали бы *количества* по классам?

<details><summary>Ответ</summary>

```sql
SELECT l.risk_grade, SUM(i.principal_due) AS outstanding, COUNT(DISTINCT i.loan_id) AS loans,
       ROUND(100.0 * SUM(i.principal_due) / SUM(SUM(i.principal_due)) OVER (), 1) AS share_pct
FROM installments i JOIN loans l ON l.loan_id = i.loan_id WHERE i.due_date > '2026-10-01'
GROUP BY l.risk_grade ORDER BY outstanding DESC;
-- B 93 317 343 066 / 1457 кредитов / 44.7 % · C 56 322 842 888 / 1040 / 27.0 · A 48 417 895 338 / 754 / 23.2 · D 10 665 423 138 / 158 / 5.1
```
B держит 45 % денег на 43 % кредитов с остатком; D — 5 % портфеля: мало, как и должен оставлять отсечку скоринг.

</details>

**P3.** Остаток долга по **продукт × класс** с долей класса *внутри его продукта*. В каком продукте у класса C самая большая доля?

<details><summary>Ответ</summary>

```sql
SELECT p.code, l.risk_grade, SUM(i.principal_due) AS outstanding,
       ROUND(100.0 * SUM(i.principal_due) / SUM(SUM(i.principal_due)) OVER (PARTITION BY p.code), 1) AS share_in_product
FROM installments i JOIN loans l ON l.loan_id = i.loan_id JOIN products p ON p.product_id = l.product_id
WHERE i.due_date > '2026-10-01' GROUP BY p.code, l.risk_grade ORDER BY p.code, l.risk_grade;
-- MICRO C 35.2 % (A 22.7 · B 40.0 · D 2.1); BNPL C 31.4; CONS 30.8; AUTO 28.9; SME 25.3
```
Двадцать строк; четыре доли каждого продукта в сумме дают 100. Больше всего веса класса C у Micro — продукта из приложения, что согласуется с выводом про FPD из недели 2.

</details>

**P4.** Помесячная выдача 2026 года (все продукты, январь–сентябрь) с: долей от девятимесячного итога, накопленным итогом с начала года и каждым месяцем в % от лучшего месяца.

<details><summary>Ответ</summary>

```sql
WITH m AS (SELECT strftime('%Y-%m', disbursed_at) AS month, COUNT(*) AS loans, SUM(principal) AS disbursed
           FROM loans WHERE disbursed_at >= '2026-01-01' AND disbursed_at < '2026-10-01' GROUP BY 1)
SELECT month, loans, disbursed,
       ROUND(100.0 * disbursed / SUM(disbursed) OVER (), 1)      AS share_of_ytd,
       SUM(disbursed) OVER (ORDER BY month)                       AS ytd,
       ROUND(100.0 * disbursed / MAX(disbursed) OVER (), 1)      AS pct_of_best
FROM m ORDER BY month;
-- 2026-01 10.8 % / ytd 17 452 370 000 / 78.3 % от лучшего · 2026-02 7.4 / 29 346 220 000 / 53.4 · 2026-03 12.2 / 49 003 630 000 / 88.2
-- … 2026-08 13.8 / 144 464 810 000 / 100.0 · 2026-09 10.5 / 161 480 300 000 / 76.3
```
Три окна, три рамки: `OVER ()` для итога и максимума, `OVER (ORDER BY month)` для накопленной суммы. Полуоткрытый фильтр не пускает 1 октября — оставьте его, и «YTD по сентябрь» тихо превратится в 162.3 млрд.

</details>

**P5.** Вторая просьба Бекзода: по каждому **продукту** помесячная выдача 2026 года с накопленным итогом с начала года — накопленная сумма должна обнуляться для каждого продукта.

<details><summary>Ответ</summary>

```sql
WITH m AS (SELECT p.code, strftime('%Y-%m', l.disbursed_at) AS month, COUNT(*) AS loans, SUM(l.principal) AS disbursed
           FROM loans l JOIN products p ON p.product_id = l.product_id
           WHERE l.disbursed_at >= '2026-01-01' AND l.disbursed_at < '2026-10-01' GROUP BY 1, 2)
SELECT code, month, loans, disbursed, SUM(disbursed) OVER (PARTITION BY code ORDER BY month) AS ytd
FROM m ORDER BY code, month;
-- AUTO: янв 4 620 560 000 → ytd сен 36 021 820 000 · SME: янв 10 042 990 000 → ytd сен 94 774 300 000 · CONS → 25 461 900 000 · MICRO → 2 791 240 000 · BNPL → 2 431 040 000
```
45 строк (5 продуктов × 9 месяцев). Забудьте `PARTITION BY code` — и «YTD» Auto за сентябрь включит январь всех остальных продуктов.

</details>

**P6.** Сколько кредитов **выше среднего основного долга своего продукта**? (Окно в производной таблице, фильтр снаружи.)

<details><summary>Ответ</summary>

```sql
SELECT code, SUM(above) AS above_avg, COUNT(*) AS loans
FROM (SELECT p.code, CASE WHEN l.principal > AVG(l.principal) OVER (PARTITION BY p.code) THEN 1 ELSE 0 END AS above
      FROM loans l JOIN products p ON p.product_id = l.product_id) t
GROUP BY code;
-- AUTO 189 из 391 · BNPL 787 из 1569 · CONS 1212 из 2418 · MICRO 1331 из 2669 · SME 400 из 781   (всего 3 919)
```
`WHERE principal > AVG(principal) OVER (...)` — ошибка: к моменту выполнения `WHERE` окон ещё не существует. Оберните, потом фильтруйте. Примерно половина выше среднего в каждом продукте: размеры кредитов симметричны, длинного хвоста гигантов нет.

</details>

**P7.** Трёхмесячное скользящее среднее месячной выдачи с 2025-01 по 2026-09, плюс число месяцев в каждом окне. Какой месяц больше всего выше своего скользящего среднего?

<details><summary>Ответ</summary>

```sql
WITH m AS (SELECT strftime('%Y-%m', disbursed_at) AS month, SUM(principal) AS disbursed
           FROM loans WHERE disbursed_at < '2026-10-01' GROUP BY 1),
w AS (SELECT month, disbursed,
             ROUND(AVG(disbursed) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)) AS ma3,
             COUNT(*)            OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)  AS months_in_window,
             ROUND(100.0 * disbursed / AVG(disbursed) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) - 100, 1) AS vs_ma_pct
      FROM m)
SELECT * FROM w WHERE month >= '2025-01' ORDER BY month;
-- 2025-07: 14 590 460 000 против ma3 11 240 216 667 → +29.8 % (дальше всех); 2025-08 +24.0 %; 2026-03 19 657 410 000 против 16 334 543 333 → +20.3 %
```
Два CTE: окно работает в `w` по **всему** ряду, фильтр для показа стоит во внешнем запросе. Поставьте `WHERE month >= '2025-01'` внутрь `w` — и `WHERE` выполнится *до* окна: январь 2025 усреднит один месяц, февраль два — `months_in_window` покажет 1 и 2 вместо 3. Фильтр для входа рамки и фильтр для показа — всегда раздельно.

</details>

**P8.** Платежи по кредиту 1 с долей каждого платежа в общей собранной сумме по кредиту и накопленной собранной суммой, по дате. Что накопленный столбец показывает про апрель–май 2026?

<details><summary>Ответ</summary>

```sql
SELECT payment_id, paid_at, amount,
       SUM(amount) OVER (PARTITION BY loan_id)                                           AS loan_total,
       ROUND(100.0 * amount / SUM(amount) OVER (PARTITION BY loan_id), 1)                AS share_pct,
       SUM(amount) OVER (PARTITION BY loan_id ORDER BY paid_at, payment_id)              AS running_collected
FROM payments WHERE loan_id = 1 ORDER BY paid_at;
-- 18 платежей по 1 741 700 = 31 350 600; каждый 5.6 %; накопленная сумма растёт на один платёж в месяц, кроме 2026-02-26 → 2026-04-25 (в марте ничего), затем два в мае
```
Мартовский платёж внесли с опозданием в 45 дней (история кредита 1 из недели 2) — это видно как плоская ступенька в накопительном итоге, а затем наверстывание. Накопительный итог — самая быстрая картина истории платежей.

</details>

**P9.** График платежей по кредиту 1: по каждому платежу — накопленный основной долг к погашению и **остаток основного долга** после него (основной долг − накопленный основной долг). На каком платеже остаток опускается ниже половины?

<details><summary>Ответ</summary>

```sql
SELECT i.installment_no, i.due_date, i.principal_due,
       SUM(i.principal_due) OVER (ORDER BY i.installment_no) AS cum_principal,
       l.principal - SUM(i.principal_due) OVER (ORDER BY i.installment_no) AS remaining
FROM installments i JOIN loans l ON l.loan_id = i.loan_id WHERE i.loan_id = 1 ORDER BY i.installment_no;
-- no 1 remaining 30 187 050 … no 13 → 16 570 510 · no 14 → 15 243 073 (ниже 15 575 000 = половина) … no 24 → 0
```
Аннуитет: доли основного долга растут (962 950 → 1 698 725), поэтому половина остатка уходит только после платежа 14 из 24. «Остаток долга = платежи, срок которых ещё не наступил» — это именно этот столбец, прочитанный на дату отчёта.

</details>

**P10.** Собрано по месяцам в 2026 году (платежи, из `payments`) с накопительным итогом — затем одной строкой скажите, почему «собрано YTD 125.7 млрд» и «выдано YTD 161.5 млрд» несопоставимы.

<details><summary>Ответ</summary>

```sql
SELECT strftime('%Y-%m', paid_at) AS month, COUNT(*) AS payments, SUM(amount) AS collected,
       SUM(SUM(amount)) OVER (ORDER BY strftime('%Y-%m', paid_at)) AS collected_ytd
FROM payments WHERE paid_at >= '2026-01-01' AND paid_at < '2026-10-01' GROUP BY 1 ORDER BY 1;
-- янв 11 759 005 976 … сен 16 339 462 407; ytd 125 703 885 377
```
Собранное включает проценты и гасит кредиты 2024–2025 годов; выданное — основной долг новых кредитов. Разные совокупности, разное содержание — отношение одного к другому не является коэффициентом сборов (настоящий построим в День 4).

</details>

<span class="badge stretch">Со звёздочкой</span> **P11.** Кривая концентрации клиентов: проранжируйте заёмщиков по остатку долга и покажите накопленную долю остатка у топ-10, топ-25 и топ-25 % заёмщиков. Затем та же идея для филиалов: какую часть портфеля держат три крупнейших?

<details><summary>Ответ</summary>

```sql
WITH c AS (SELECT l.customer_id, SUM(i.principal_due) AS outstanding
           FROM installments i JOIN loans l ON l.loan_id = i.loan_id WHERE i.due_date > '2026-10-01' GROUP BY l.customer_id)
SELECT customer_id, outstanding,
       ROUND(100.0 * outstanding / SUM(outstanding) OVER (), 2)                                   AS share_pct,
       ROUND(100.0 * SUM(outstanding) OVER (ORDER BY outstanding DESC) / SUM(outstanding) OVER (), 2) AS cum_share_pct
FROM c ORDER BY outstanding DESC;
-- 2 535 заёмщиков; строка 1: клиент 3208, 977 697 006, 0.47 % ; накопленно на строке 10: 3.60 %; на строке 25: 7.80 %
```
Накопленная сумма, делённая на общий итог, — два окна с разными рамками в одном выражении. Верхняя четверть заёмщиков (634 человека, через `NTILE(4)` завтра) держит 82.7 % остатка долга; нижняя четверть — 0.5 %. Для филиалов тот же запрос по таблице T5 даёт накопленно 13.8 → 26.6 → **39.1 %** после трёх строк — это разбирает Уголок компании.

</details>

---

## 4. Домашнее задание <span class="badge hw">HW 3.1 — до Дня 3</span> :id=4-homework-hw-31-due-day-3

**Пакет «доли и тренд» для Бекзода.** Сдайте через поле 📎 ниже:

1. `shares.sql` — три запроса, в каждом `GROUP BY` + окно: остаток долга и доля от итога по продуктам, по филиалам (с долей в регионе), по классам. Под каждым `-- result:` с верхней строкой и проверочной строкой, что доли в сумме дают 100.
2. `trend.sql` — (a) помесячная выдача 2026 года с накопленным итогом с начала года и долей от девяти месяцев (P4); (б) то же по каждому продукту, с накопленной суммой, обнуляемой по продукту (P5); (в) 3-месячное скользящее среднее месячной выдачи 2025-01..2026-09 со столбцом числа месяцев в окне (P7) и одна строка с названием месяца, который больше всего выше своего среднего.
3. `pack.md` — шесть предложений для Бекзода: крупнейший продукт и его доля; крупнейший филиал и концентрирован ли Ташкент как регион; значение YTD по сентябрь; самый сильный и самый слабый месяцы 2026 года и тренд скользящего среднего с весны.

Оценивается: (a) числа совпадают с нашими с точностью до округления, (б) у каждого окна правильные `PARTITION BY`/`ORDER BY`/рамка для предложения рядом с ним (YTD, который не обнуляется по продукту, теряет балл), (в) шесть предложений каждый раз говорят, *доля чего* и *за какой период*.

### 📎 Сдайте здесь :id=hand-in-here

```sqltask
{"check": "handin-W3D1", "lesson": "W3D1", "title": "HW 3.1", "tasks": [{"id": "shares.sql", "file": "shares.sql", "text": true, "minLines": 3, "q": "Напишите здесь `shares.sql` — то, что требует страница выше."}, {"id": "trend.sql", "file": "trend.sql", "text": true, "minLines": 3, "q": "Напишите здесь `trend.sql` — то, что требует страница выше."}, {"id": "pack.md", "file": "pack.md", "text": true, "minLines": 3, "q": "Напишите здесь `pack.md` — то, что требует страница выше."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Всё остальное, что перечислено на странице (ещё один файл или .zip из нескольких)."}]}
```

---

## 5. Самопроверка :id=5-self-check

1. `SUM(SUM(principal_due)) OVER ()` — какой `SUM` выполняется первым и что складывает каждый из них? *(→ раздел 1, «Доля от итога»)*
2. Два запроса считают накопительный итог по `disbursed_at`; один использует рамку по умолчанию, другой — `ROWS UNBOUNDED PRECEDING`. В день с семью кредитами — чем различается их вывод? *(→ раздел 1, «Рамка по умолчанию»)*
3. Вам нужны только кредиты выше среднего по своему продукту. Почему окно нельзя поставить в `WHERE` и куда его ставить? *(→ P6)*

---

## 6. Уголок компании <span class="badge company">Структура портфеля</span> :id=6-company-corner-portfolio-mix

**Структура портфеля** (*portfolio mix*) — первая страница любого обзора портфеля: *из чего состоит остаток долга?* Три разреза и проверка концентрации, всё по одному приёму — `GROUP BY` плюс `SUM(SUM()) OVER ()` — для 208 723 504 430 UZS остатка долга по 3 409 кредитам на 2026-10-01.

| разрез | строки | вывод |
|---|---|---|
| по **продукту** | SME **60.3 %** · Auto 27.6 · Consumer 11.0 · BNPL 0.5 · Micro 0.5 | 88 % денег лежит в двух продуктах, на которые приходится 28 % кредитов с остатком (SME 603 + Auto 368 из 3 409). По *количеству* портфель — это Consumer/Micro/BNPL; по *деньгам* — кредитор бизнеса и автомобилей. Скажите, что вы имеете в виду. |
| по **филиалу** | Tashkent Central 13.8 % · South 12.8 · North 12.5 · Fergana 11.9 · Samarkand 11.8 · Andijan 9.5 · Namangan 9.0 · Bukhara 7.2 · Nukus 6.4 · Termez 5.1 | Ровно: крупнейший филиал в 2.7 раза больше самого малого, ни один не выше 14 %. |
| по **классу** | B 44.7 % · C 27.0 · A 23.2 · D 5.1 | A+B = 68 % денег; D — 5 %: скоринг держит рискованный класс небольшим и по деньгам, и по количеству. |

**Концентрация** (*concentration*) задаёт другой вопрос: *насколько всё зависит от немногих?* Два стандартных числа:

- **Доля трёх крупнейших филиалов** — накопленная доля после трёх строк таблицы филиалов: `SUM(SUM(outstanding)) OVER (ORDER BY SUM(outstanding) DESC) / SUM(SUM(outstanding)) OVER ()` → 13.8 → 26.6 → **39.1 %**. Это три ташкентских филиала: 39 % портфеля в одном городе. Регулятор или совет директоров прочтёт это как *географическую концентрацию: один регион = 39 %*; Бекзод прочтёт так: *«столица — треть бизнеса, для узбекского кредитора ничего необычного, но один шок в Ташкенте ударит по 39 % портфеля».*
- **Доля крупнейшего клиента** — клиент 3208 (Улугбек Назаров, сегмент SME, два кредита SME на 568 200 000 и 454 970 000, оба выданы в августе 2026) должен 977 697 006 = **0.47 %** остатка долга. Топ-10 клиентов вместе держат 3.6 %, топ-25 — 7.8 %. Для розничного портфеля с SME это **низкая концентрация на одного заёмщика**: ни один заёмщик сам по себе ничего не решает. (Банк также сравнил бы крупнейшую позицию со своим капиталом — лимит «крупных рисков», обычно 25 % капитала; у нас здесь нет данных о капитале, поэтому мы сообщаем долю портфеля.)

**Как представить структуру.** Одна таблица, три разреза друг под другом, в каждом доля по количеству *и* доля по деньгам рядом (количество говорит об операциях, деньги — о риске); под ней две строки о концентрации. Предложение под таблицей: *«Портфель на 60 % состоит из SME по деньгам и на 41 % из Consumer по количеству кредитов с остатком; три ташкентских филиала держат 39 %; крупнейший заёмщик — 0.5 %, топ-25 — менее 8 %».*

> Версия для собеседования: *«Как бы вы описали состав кредитного портфеля в SQL?»* — Остаток долга = сумма `principal_due` по платежам, срок которых ещё не наступил; сгруппируйте по измерению, добавьте `100.0 * SUM(x) / SUM(SUM(x)) OVER ()` для доли; для концентрации отсортируйте по доле и возьмите накопленную `SUM(...) OVER (ORDER BY ...)`, делённую на итог, чтобы читать доли топ-N; всегда показывайте долю по количеству рядом с долей по деньгам.

Завтра: ранжирование (кто первый, кто в топ-3 каждой группы), взгляд на *предыдущую* строку через `LAG` и платежи, которые, по словам взыскания, пришли дважды.

---

## Тест дня :id=day-quiz

Для завершения дня нужно набрать 80 %. Пересдавать можно сколько угодно.

```quiz
{"id": "w03d1", "pass": 0.8, "questions": [
  {"type": "single", "q": "Что складывает внешний SUM(…) OVER () в этом запросе?", "code": "SELECT p.code, SUM(i.principal_due) AS outstanding,\n       100.0 * SUM(i.principal_due) / SUM(SUM(i.principal_due)) OVER () AS share_pct\nFROM installments i JOIN loans l ON l.loan_id = i.loan_id\nJOIN products p ON p.product_id = l.product_id\nWHERE i.due_date > '2026-10-01'\nGROUP BY p.code;", "options": ["Все платежи компании ещё раз, строка за строкой", "Пять сумм по продуктам, получая общий итог в каждой из пяти строк", "Только платежи текущего продукта", "Это ошибка — агрегаты нельзя вкладывать друг в друга"], "answer": 1, "explain": "Внутренний SUM — агрегат GROUP BY; окно работает по сгруппированному результату и складывает эти значения (→ раздел 1, «Доля от итога»)."},
  {"type": "single", "q": "Что показывает total в каждой строке?", "code": "SELECT loan_id, principal,\n       SUM(principal) OVER () AS total\nFROM loans\nWHERE customer_id = 3208;", "options": ["Общий основной долг компании", "Общий основной долг только по кредитам клиента 3208", "NULL", "Основной долг самой строки"], "answer": 1, "explain": "Окна считаются после WHERE, GROUP BY и HAVING, поэтому окно видит только строки, прошедшие фильтр (→ раздел 1, «PARTITION BY — своё окно для каждой группы»; P1)."},
  {"type": "single", "q": "Почему этот запрос не работает и куда вместо этого поставить окно?", "code": "SELECT l.loan_id\nFROM loans l\nWHERE l.principal > AVG(l.principal) OVER (PARTITION BY l.product_id);", "options": ["AVG не принимает PARTITION BY", "К моменту выполнения WHERE окон ещё нет; посчитайте окно в производной таблице или CTE и фильтруйте снаружи", "Вместо этого поставить окно в GROUP BY", "Он не ломается — возвращает кредиты выше среднего по своему продукту"], "answer": 1, "explain": "Оберните, потом фильтруйте (→ раздел 1, «Окно или GROUP BY»; P6)."},
  {"type": "number", "q": "Три строки в показанном порядке. Чему равен run в ПЕРВОЙ строке (рамка по умолчанию, RANGE)?", "code": "day        | x\n2026-09-28 | 10\n2026-09-28 | 20\n2026-09-29 | 5\n\nSELECT day, x, SUM(x) OVER (ORDER BY day) AS run FROM t;", "answer": 30, "explain": "RANGE берёт все строки с тем же значением ORDER BY, поэтому обе строки 28 сентября показывают итог дня, 30; ROWS UNBOUNDED PRECEDING дал бы 10 (→ раздел 1, «Рамка по умолчанию и ROWS BETWEEN»)."},
  {"type": "single", "q": "Бекзоду нужна накопленная сумма с начала года по каждому продукту. Что не так в этом запросе?", "code": "SELECT code, month, disbursed,\n       SUM(disbursed) OVER (ORDER BY month) AS ytd\nFROM m;", "options": ["Всё в порядке", "Без PARTITION BY code накопленная сумма идёт по всем продуктам, поэтому YTD у Auto включает и все остальные продукты", "ORDER BY внутри OVER не допускается", "Нужен GROUP BY month"], "answer": 1, "explain": "PARTITION BY обнуляет накопленную сумму для каждой группы (→ P5)."},
  {"type": "single", "q": "Какое окно даёт 3-месячное скользящее среднее месячной выдачи (этот месяц и два предыдущих)?", "options": ["AVG(disbursed) OVER (ORDER BY month ROWS BETWEEN 3 PRECEDING AND CURRENT ROW)", "AVG(disbursed) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)", "AVG(disbursed) OVER (ORDER BY month ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING)", "AVG(disbursed) OVER (ORDER BY month)"], "answer": 1, "explain": "2 PRECEDING + текущая строка = 3 месяца; 3 PRECEDING — это четыре месяца, рамка 1/1 — центрированное среднее, а без рамки получается накопленное среднее (→ раздел 1, «Скользящие средние»)."},
  {"type": "multi", "q": "Что из этого требует оконной функции (одним GROUP BY не обойтись)?", "options": ["Каждый кредит со средним основным долгом его продукта рядом", "Остаток долга каждого продукта с его долей от итога в той же строке", "Один итог остатка долга по каждому продукту", "Месячная выдача со столбцом накопленного итога с начала года", "Количество кредитов в компании"], "answer": [0, 1, 3], "explain": "Окна сохраняют строки и добавляют рядом число группы, итог или накопленную сумму; обычные итоги — это GROUP BY (→ раздел 1, «Окно или GROUP BY»)."},
  {"type": "single", "q": "По количеству кредитов портфель в основном Consumer, Micro и BNPL; по деньгам — в основном SME и Auto. Что должна показывать таблица структуры портфеля?", "options": ["Только долю по деньгам — это то, что волнует совет директоров", "Долю по количеству и долю по деньгам рядом, с указанием, доля чего", "Только долю по количеству", "Только средний размер кредита"], "answer": 1, "explain": "Количество говорит об операциях, деньги — о риске; доля без «чего» бессмысленна (→ раздел 6, Уголок компании)."}
]}
```

<!-- challenge:start -->

---

## Задача дня :id=daily-challenge

Бонус для любознательных: один более трудный вопрос по теме дня. Решите его за XP, которые растут вместе с серией задач, — полная неделя из пяти ещё добавляет 10 % к пятничному ваучеру.

```challenge
{"id": "w03d1", "q": "Нилуфар беспокоится, что один филиал слишком сильно опирается на кредиты Auto. По каждому филиалу посчитайте долю Auto в собственном остатке основного долга этого филиала (платежи со сроком после 2026-10-01, все статусы кредитов). Какая самая высокая такая доля среди десяти филиалов? Процент с 1 знаком после запятой.", "type": "number", "dp": 1, "h": ["f3480b47fbe805fc66dfcea9"], "hint": "Один GROUP BY по филиалу и продукту, затем окно, у которого секция — филиал, а не вся компания.", "sol": "U0VMRUNUIGIuYnJhbmNoX25hbWUsIHAuY29kZSwKICAgICAgIFNVTShpLnByaW5jaXBhbF9kdWUpIEFTIG91dHN0YW5kaW5nLAogICAgICAgUk9VTkQoMTAwLjAgKiBTVU0oaS5wcmluY2lwYWxfZHVlKQogICAgICAgICAgICAgLyBTVU0oU1VNKGkucHJpbmNpcGFsX2R1ZSkpIE9WRVIgKFBBUlRJVElPTiBCWSBiLmJyYW5jaF9uYW1lKSwgMSkgQVMgc2hhcmVfaW5fYnJhbmNoCkZST00gaW5zdGFsbG1lbnRzIGkKSk9JTiBsb2FucyBsICAgIE9OIGwubG9hbl9pZCA9IGkubG9hbl9pZApKT0lOIGJyYW5jaGVzIGIgT04gYi5icmFuY2hfaWQgPSBsLmJyYW5jaF9pZApKT0lOIHByb2R1Y3RzIHAgT04gcC5wcm9kdWN0X2lkID0gbC5wcm9kdWN0X2lkCldIRVJFIGkuZHVlX2RhdGUgPiAnMjAyNi0xMC0wMScKR1JPVVAgQlkgYi5icmFuY2hfbmFtZSwgcC5jb2RlCk9SREVSIEJZIENBU0UgV0hFTiBwLmNvZGUgPSAnQVVUTycgVEhFTiAwIEVMU0UgMSBFTkQsIHNoYXJlX2luX2JyYW5jaCBERVNDOwotLSB0aGUgc2FtZSB0ZXh0IG9uIFNRTCBTZXJ2ZXIKLS0gQVVUTyByb3dzOiBUYXNoa2VudCBDZW50cmFsIDkgODMwIDczMCA1NjEgPSAzNC4yICUgb2YgaXRzIGJvb2s7IE51a3VzIENlbnRyYWwsIEZlcmdhbmEgQ2VudHJhbCBhbmQgVGFzaGtlbnQgTm9ydGggYWJvdXQgMzAgJTsgQnVraGFyYSBDZW50cmFsIGxvd2VzdCBhdCAxNy42ICUKV2l0aCBPVkVSICgpIHlvdSB3b3VsZCBnZXQgQXV0bydzIHNoYXJlIG9mIHRoZSB3aG9sZSBjb21wYW55IChUYXNoa2VudCBDZW50cmFsJ3MgQXV0byBpcyA0LjcgJSBvZiB0aGUgYm9vaykg4oCUIGEgZGlmZmVyZW50IHF1ZXN0aW9uLiBDb21wYW55LXdpZGUsIEF1dG8gaXMgMjcuNiAlIG9mIG91dHN0YW5kaW5nOyBUYXNoa2VudCBDZW50cmFsIHJ1bnMgNi42IHBvaW50cyBhYm92ZSB0aGF0LCBCdWtoYXJhIDEwIHBvaW50cyBiZWxvdy4gQSB0aGlyZCBvZiBvbmUgYnJhbmNoJ3MgYm9vayBpbiBiaWctdGlja2V0IEF1dG8gaXMgd29ydGggYSBsaW5lIGluIEJla3pvZCdzIHBhY2ssIG5vdCBhbiBhbGFybS4="}
```

<!-- challenge:end -->
