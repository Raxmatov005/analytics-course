# Неделя 2 · День 1 — Соединение таблиц: кредит и его клиент

<span class="badge">Теория 60 мин</span> <span class="badge">Практика 60 мин</span> <span class="badge">Домашнее задание</span> <span class="badge company">Уголок компании</span>

> STORY **Понедельник, 9:10.** Бекзод ждёт у вашего стола с распечаткой прошлонедельного B18 — три id платежей, один id кредита, три суммы. *«Отличные цифры. Но ни одного имени. Когда я показываю совету кредит, они хотят видеть человека, продукт и филиал, а не `4570`. Можно получить читаемый список кредитов: имя клиента, регион, продукт, филиал, основной долг, статус? Одна строка на кредит.»* Мадина, проходя мимо: *«Это пять таблиц. Сегодня вы узнаете слово, которое их связывает.»*

## Сегодня в трёх строках :id=today-in-3-lines

- Вы умеете писать **INNER JOIN** и **LEFT JOIN** по ключу, с **псевдонимами таблиц**, и выбирать столбцы из обеих сторон.
- Вы знаете, почему соединение `loans` с `installments` **умножает строки** (один-ко-многим), и как соединить **три или четыре таблицы** в одном запросе.
- Вы можете посчитать **остаток долга** и **сумму просрочки** Nur Finance на 2026-10-01 и объяснить, чем они отличаются.

---

## 1. Теория — один вопрос, две таблицы :id=1-learn-one-question-two-tables

### Зачем нужен JOIN :id=why-join

На прошлой неделе каждый вопрос жил в одной таблице. Вопрос Бекзода — нет: *имя* лежит в `customers`, а *основной долг* — в `loans`. Две таблицы связаны ключом — `loans.customer_id` хранит значение `customers.customer_id` — и **JOIN** (*соединение*) использует этот ключ, чтобы поставить подходящие строки рядом:

```sql
SELECT l.loan_id, c.first_name, c.last_name, c.region, l.principal, l.status
FROM loans AS l
INNER JOIN customers AS c ON c.customer_id = l.customer_id;
```

Читайте так: *возьми каждый кредит; для каждого найди клиента, чей id равен `customer_id` кредита; приклей столбцы этого клиента к строке кредита.* Вернётся 7 828 строк — по одной на кредит, потому что у каждого кредита ровно один клиент.

Три вещи в этом запросе:

1. **Псевдонимы** `l` и `c` (*aliases*): короткие имена таблиц. `AS` необязателен (`FROM loans l`); пользуются всегда, потому что теперь у каждого столбца нужно указывать, из какой он таблицы.
2. **Столбцы с префиксом таблицы** `c.region`, `l.principal`. Если имя столбца есть только в одной из двух таблиц, префикс необязателен — но `customer_id` есть в обеих, поэтому один `customer_id` — это ошибка («ambiguous column», неоднозначный столбец). Ставьте префикс везде; будущий вы скажет спасибо.
3. **`ON`** — условие соединения. Почти всегда это `дочерняя.внешний_ключ = родительская.первичный_ключ`. День 1 первой недели дал вам список таких пар; этот список — ваша карта соединений.

В результате есть столбцы обеих таблиц, поэтому `SELECT` может использовать любой из них, а также `WHERE` и `ORDER BY`:

```sql
SELECT l.loan_id, c.first_name, c.last_name, l.principal
FROM loans l
JOIN customers c ON c.customer_id = l.customer_id
WHERE c.segment = 'affluent' AND l.product_id = 5
ORDER BY l.principal DESC;                       -- 179 строк: кредиты малому бизнесу состоятельным клиентам
```

Просто `JOIN` означает `INNER JOIN`. Бекзоду нужно *имя клиента* одним столбцом — это конкатенация строк, тема Дня 3, но сегодня она вам нужна: в SQL Server пишут `c.first_name + ' ' + c.last_name`, в SQLite (и PostgreSQL) — `c.first_name || ' ' || c.last_name`.

### INNER vs LEFT — что происходит со строками без пары :id=inner-vs-left-what-happens-to-rows-that-do-not-match

`INNER JOIN` оставляет только строки, у которых есть пара с другой стороны. Переверните вопрос — *клиенты с их заявками* — и разница станет видна:

```sql
SELECT c.customer_id, c.first_name, a.application_id, a.requested_amount
FROM customers c
LEFT JOIN applications a ON a.customer_id = c.customer_id;
```

| | строк | почему |
|---|---|---|
| `customers INNER JOIN applications` | 14 000 | одна строка на заявку; клиенты, которые ни разу не подавали заявку, исчезают |
| `customers LEFT JOIN applications` | 14 587 | 14 000 строк с заявками + 587 клиентов без заявок, их `application_id` и `requested_amount` — **NULL** |

**LEFT JOIN** (*левое соединение*) сохраняет каждую строку левой таблицы (той, что в `FROM`) и заполняет правую сторону значениями NULL, если пары нет. Всего 6 040 клиентов, у 5 453 из них есть хотя бы одна заявка, у 587 — ни одной: 14 000 + 587 = 14 587. Проверяйте эту арифметику при каждом LEFT JOIN — она показывает, сделало ли соединение то, что вы думаете.

Эти строки с NULL полезны сами по себе. *«Какие клиенты ни разу не подавали заявку?»* — это LEFT JOIN плюс один фильтр, **анти-соединение** (anti-join):

```sql
SELECT COUNT(*)
FROM customers c
LEFT JOIN applications a ON a.customer_id = c.customer_id
WHERE a.application_id IS NULL;                   -- 587
```

*Предпросмотр — правила NULL, на которых это держится, объяснит День 4.* Сегодня просто скопируйте шаблон: LEFT JOIN, затем `WHERE правая_таблица.ключ IS NULL` = «строки слева без пары справа».

`RIGHT JOIN` существует (сохранить все строки правой таблицы); им никто не пользуется — поменяйте таблицы местами и пишите LEFT. `FULL OUTER JOIN` сохраняет строки без пары с обеих сторон (в SQL Server есть; в SQLite только с версии 3.39). Оба встретятся вам в главе Бараа; в коде аналитика 95 % соединений — это INNER или LEFT.

### Один-ко-многим: почему меняется число строк :id=many-to-one-why-the-row-count-changes

Направление связи определяет, что соединение делает с числом ваших строк:

- **многие → один** (`loans → customers`): каждый кредит находит ровно одного клиента. 7 828 на входе, 7 828 на выходе. Безопасно.
- **один → многие** (`loans → installments`): каждый кредит находит *все* свои платежи по графику. 7 828 кредитов на входе, **92 193** строки на выходе — по одной на платёж, со столбцами кредита, *повторёнными* в каждой.

```sql
SELECT COUNT(*)
FROM loans l
JOIN installments i ON i.loan_id = l.loan_id;     -- 92193, а не 7828
```

Это повторение корректно — именно это и значит «одна строка на платёж с данными его кредита» — но это ловушка в тот момент, когда вы суммируете столбец кредита: `SUM(l.principal)` по этому соединению даст 9 981 530 850 000, где каждый основной долг посчитан по разу на каждый платёж. Агрегаты завтрашнего дня сделают это самой частой неверной цифрой в кредитных отчётах; сегодня просто запомните: **зерно (grain) результата соединения — это зерно стороны «многие»**. Прежде чем суммировать, спросите: *что теперь есть одна строка?*

### Три и четыре таблицы :id=three-and-four-tables

Соединения выстраиваются в цепочку; каждый `JOIN … ON` добавляет одну таблицу и может использовать любую уже присоединённую:

```sql
SELECT l.loan_id,
       c.first_name || ' ' || c.last_name AS customer,     -- SQL Server: c.first_name + ' ' + c.last_name
       c.region, p.name AS product, b.branch_name,
       l.principal, l.status
FROM loans l
JOIN customers c ON c.customer_id = l.customer_id
JOIN products  p ON p.product_id  = l.product_id
JOIN branches  b ON b.branch_id   = l.branch_id;
```

По-прежнему 7 828 строк: все три связи — «многие к одному» от кредита. Четвёртый шаг может пройти *через* таблицу, которую вы не выводите, — кредитный инспектор доступен только через заявку:

```sql
FROM loans l
JOIN applications a ON a.application_id = l.application_id
JOIN staff s        ON s.staff_id = a.officer_id
```

Пишите соединения в порядке рассказа (сначала факт, потом его справочники); порядок выполнения база выберет сама, и результат будет тем же.

### Углубление (по желанию) :id=depth-optional

- ▶ Бараа, *SQL joins (basics)* [2:47:57](https://youtu.be/SSKVgrwhzus?t=10077&end=12449) — 40 мин, INNER/LEFT/RIGHT/FULL с его картинками; его `customers`/`orders` — это наши `customers`/`loans`.
- Русская презентация (TBC Data Analytics 2.0, если она у вас есть) `2.1 SQL-47-77.pdf` — страницы про JOIN. *Термины по-английски:* соединение = join, внутреннее = inner, левое = left, псевдоним = alias, ключ соединения = join key.

---

## 2. Разобранный пример — список Бекзода :id=_2-worked-example-bekzod39s-list

**Задача:** одна строка на кредит: клиент, регион, продукт, филиал, основной долг, статус; сначала самые крупные; покажите мне пятёрку лидеров.

1. *Что такое одна строка?* Кредит → `FROM loans`.
2. *Какие столбцы живут в других таблицах?* имя/регион → `customers`; название продукта → `products`; название филиала → `branches`. Все достижимы по ключу, который лежит в `loans`.
3. *Направление?* Все три — «многие к одному». Число строк должно остаться 7 828 — проверьте до того, как добавлять `ORDER BY`.
4. Напишите, запустите, проверьте:

```sql
-- SQL Server: SELECT TOP 5 …  (строку с LIMIT уберите)
SELECT l.loan_id, c.first_name || ' ' || c.last_name AS customer, c.region,
       p.name AS product, b.branch_name, l.principal, l.status
FROM loans l
JOIN customers c ON c.customer_id = l.customer_id
JOIN products  p ON p.product_id  = l.product_id
JOIN branches  b ON b.branch_id   = l.branch_id
ORDER BY l.principal DESC
LIMIT 5;
```

| loan_id | customer | region | product | branch | principal | status |
|---|---|---|---|---|---|---|
| 2861 | Maftuna Umarova | Tashkent | Small business loan | Tashkent Central | 599 060 000 | active |
| 4570 | Umida Khasanova | Namangan | Small business loan | Namangan Central | 598 450 000 | closed |
| 4601 | Abror Abdullaev | Tashkent | Small business loan | Tashkent Central | 597 540 000 | active |
| 4970 | Gulnora Nazarova | Tashkent | Small business loan | Tashkent Central | 597 520 000 | active |
| 7520 | Sevara Tursunova | Tashkent | Small business loan | Tashkent South | 595 160 000 | active |

Кредит 4570 — три платежа по 57 170 000 в прошлую пятницу — это закрытый кредит малому бизнесу Umida Khasanova из Намангана. Вот что Бекзод имел в виду под «читаемым».

---

## 3. Практика (60 мин) :id=3-practice-60-min

Пишите каждый запрос в поле под вопросом — он сохраняется в этом браузере; **✔ Проверить** сравнивает ваш результат с ответом. Только SQL этой и прошлой недели: `SELECT … JOIN … WHERE … ORDER BY`, `COUNT(*)`, `TOP`/`LIMIT`. Пока без `GROUP BY` (это завтра).

**P1.** Соедините `loans` с `customers`. Сколько строк? Теперь выполните `SELECT COUNT(*) FROM loans`. Почему число то же самое?

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*) FROM loans l JOIN customers c ON c.customer_id = l.customer_id;   -- 7828
```
У каждого кредита ровно один клиент (многие к одному), поэтому внутреннее соединение не теряет и не умножает строки. Связь настоящая, но в этой учебной копии базы не объявлено ни одного FOREIGN KEY, так что ничто её не *гарантирует* — проверить можно только подсчётом. Если бы число оказалось меньше, значит, какие-то кредиты указывают на несуществующего клиента; проверьте через LEFT JOIN … IS NULL — здесь вернётся 0.

</details>

**P2.** Активные кредиты, оформленные в филиалах Нукуса и Термеза (по региону филиала, а не клиента).

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*)
FROM loans l JOIN branches b ON b.branch_id = l.branch_id
WHERE b.region IN ('Nukus', 'Termez') AND l.status = 'active';                    -- 413
```

</details>

**P3.** Кредиты малому бизнесу (`product_id = 5`), взятые состоятельными (affluent) клиентами. · **P4.** Микрокредиты, взятые клиентами, живущими в Самарканде.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*) FROM loans l JOIN customers c ON c.customer_id = l.customer_id
WHERE l.product_id = 5 AND c.segment = 'affluent';                                 -- 179
SELECT COUNT(*) FROM loans l JOIN customers c ON c.customer_id = l.customer_id
WHERE l.product_id = 1 AND c.region = 'Samarkand';                                 -- 277
```

</details>

**P5.** Три самых крупных списанных кредита с именем и регионом заёмщика.

<details><summary>Ответ</summary>

```sql
SELECT l.loan_id, c.first_name, c.last_name, c.region, l.principal
FROM loans l JOIN customers c ON c.customer_id = l.customer_id
WHERE l.status = 'written_off'
ORDER BY l.principal DESC LIMIT 3;                       -- в SQL Server: TOP 3
```
6579 Jasur Ismoilov (Samarkand) 525 670 000 · 2898 Abror Sobirov (Tashkent) 507 760 000 · 903 Nodira Yusupova (Tashkent) 498 520 000. Три убытка размером с кредит малому бизнесу; Севара знает всех троих по именам.

</details>

**P6.** Активные автокредиты (Auto), оформленные в филиале *Tashkent Central*. Используйте **код** продукта, а не id, и **название** филиала — три таблицы.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*)
FROM loans l
JOIN products p ON p.product_id = l.product_id
JOIN branches b ON b.branch_id = l.branch_id
WHERE p.code = 'AUTO' AND b.branch_name = 'Tashkent Central' AND l.status = 'active';   -- 60
```

</details>

**P7.** Кредиты, по которым ни разу не было действий по взысканию, — и докажите это число двумя подсчётами по одной таблице.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*) FROM loans l LEFT JOIN collections_actions ca ON ca.loan_id = l.loan_id
WHERE ca.action_id IS NULL;                                                         -- 7545
SELECT COUNT(*) FROM loans;                                                         -- 7828
SELECT COUNT(DISTINCT loan_id) FROM collections_actions;                            -- 283
```
7 828 − 283 = 7 545: большинству кредитов напоминание никогда не требовалось. Анти-соединение и арифметика обязаны сходиться; если нет — значит, ключ соединения неверный.

</details>

**P8.** Умножение строк. Посчитайте строки в `loans JOIN installments`, `loans JOIN payments` и `loans LEFT JOIN payments`. Объясните каждое число исходя из связей.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*) FROM loans l JOIN installments i ON i.loan_id = l.loan_id;         -- 92193
SELECT COUNT(*) FROM loans l JOIN payments p ON p.loan_id = l.loan_id;             -- 52875
SELECT COUNT(*) FROM loans l LEFT JOIN payments p ON p.loan_id = l.loan_id;        -- 53267
```
Один-ко-многим: число строк равно числу строк на стороне *«многие»* (92 193 платежа по графику; 52 875 платежей). LEFT JOIN добавляет по одной строке на каждый кредит, по которому не было ни одного платежа: 53 267 − 52 875 = **392** кредита, по которым пока ничего не оплачено (новые кредиты, у которых первый платёж ещё не наступил, и самые злостные должники).

</details>

**P9.** В Неделе 1, Дне 1, P7c спрашивалось «сколько звонков сделали сотрудники взыскания в Фергане?». Ответьте теперь: `collections_actions → staff → branches`.

<details><summary>Ответ</summary>

```sql
SELECT COUNT(*)
FROM collections_actions ca
JOIN staff s    ON s.staff_id = ca.collector_id
JOIN branches b ON b.branch_id = s.branch_id
WHERE ca.action_type = 'call' AND b.region = 'Fergana';                              -- 416
```
Филиал здесь — это филиал *сотрудника взыскания*, до которого мы добираемся через `staff`. Соединение `collections_actions → loans → branches` дало бы филиал кредита — здесь то же самое (сотрудники работают с кредитами своего филиала), но это не тот же вопрос.

</details>

**P10.** График кредита 1 с его платежами: номер платежа, срок оплаты, сумма к оплате, дата оплаты, оплаченная сумма — включая ещё не оплаченные платежи. Какой платёж был оплачен с наибольшим опозданием относительно срока?

<details><summary>Ответ</summary>

```sql
SELECT i.installment_no, i.due_date, i.total_due, p.paid_at, p.amount
FROM installments i
LEFT JOIN payments p ON p.installment_id = i.installment_id
WHERE i.loan_id = 1
ORDER BY i.installment_no;
```
24 строки (кредит на 24 месяца); 18 оплачены, у 6 `paid_at` равен NULL — их срок наступает с 2026-10-28. Платёж 12 со сроком 2026-03-28 был оплачен 2026-05-12 — с опозданием на 45 дней, — а все последующие вовремя. INNER JOIN показал бы 18 строк и скрыл шесть открытых; «график» требует LEFT.

</details>

<span class="badge stretch">Со звёздочкой</span> **P11.** Соедините `loans` с `applications`. Сколько кредитов пришло по каждому каналу? (Один `COUNT(*)` с `WHERE` на каждый канал.) Затем: сколько заявок имеют `status = 'approved'`, но не имеют кредита вообще? Опишите словами, что это за строки, ещё до того, как посмотрите на них.

<details><summary>Ответ</summary>

app 2 669 · branch 3 590 · partner 1 569 (= 7 828). Одобрены, но без кредита: `applications a LEFT JOIN loans l ON l.application_id = a.application_id WHERE a.status = 'approved' AND l.loan_id IS NULL` → **89**. Все 89 были решены между 2026-09-29 и 2026-10-05 — одобрения, по которым к отчётной дате выдача ещё не состоялась (у некоторых решение даже принято *после* неё: в столбце решения стоит плановая дата). Не ошибки, а конвейер. К ним вернёмся в День 4.

</details>

---

## 4. Домашнее задание <span class="badge hw">HW 2.1 — срок: День 3</span> :id=4-homework-hw-21-due-day-3

**Кредитный портфель Бекзода.** Десять запросов, которые он сможет запускать каждый понедельник. Сдайте `loan_book.sql` (📎 поле ниже), перед каждым запросом — `-- Qn: <вопрос одной строкой>`, после — `-- result: <число строк и верхняя строка либо число>`. В Q6 можно использовать завтрашний `GROUP BY`, если к тому времени вы его выучите; `WHERE` на каждое значение тоже засчитывается.

1. Читаемый список кредитов из раздела 2, все строки, сначала самые поздние выдачи.
2. Тот же список, только **активные** кредиты, плюс `monthly_payment`.
3. Активные кредиты **малому бизнесу**, оформленные в **филиалах Ташкентского региона**, сначала самые крупные (продукт — по коду, регион — из `branches`).
4. **Автокредиты** **состоятельных** клиентов.
5. Каждый кредит с **каналом** и **кредитным скором** его заявки.
6. Каждый кредит с **именем кредитного инспектора**, который вёл его заявку (`applications.officer_id → staff`). У какого инспектора больше всего кредитов?
7. Клиенты, у которых **нет кредита** — количество и список с регионом и сегментом.
8. **Списанные** кредиты с именем клиента, телефоном и названием филиала — этот список возьмёт Севара.
9. Полный график кредита **4570** с платежами (как в P10, но для этого кредита).
10. Кредиты, у которых id клиента **6001 или больше** (дублирующиеся id с прошлой недели), с именами: сколько кредитов и какой основной долг приходится на клиентов-дубликатов?

Оценивается: (a) каждое соединение использует правильный ключ, а число строк указано и верно, (b) LEFT или INNER выбраны осознанно в Q7 и Q9 (с комментарием, почему), (c) названия столбцов, понятные руководителю (псевдонимы, один столбец с именем).

### 📎 Сдайте здесь :id=hand-in-here

```sqltask
{"check": "handin-W2D1", "lesson": "W2D1", "title": "HW 2.1", "tasks": [{"id": "loan_book.sql", "file": "loan_book.sql", "text": true, "minLines": 3, "q": "Напишите здесь `loan_book.sql` — то, что требуется на странице выше."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Всё остальное, что перечислено на странице (ещё один файл или .zip из нескольких)."}]}
```

---

## 5. Самопроверка :id=5-self-check

1. `FROM loans l JOIN customers c ON …` — строки какой таблицы могут исчезнуть и почему? *(→ раздел 1, «INNER vs LEFT»)*
2. Вы соединяете `loans` с `installments` и получаете 92 193 строки. Это ошибка? Что теперь есть одна строка? *(→ раздел 1, «Один-ко-многим»)*
3. Напишите по памяти шаблон из трёх строк, который находит «клиентов, ни разу не подававших заявку». *(→ раздел 1, анти-соединение; P7)*

---

## 6. Уголок компании <span class="badge company">Остаток долга и портфель</span> :id=6-company-corner-outstanding-and-portfolio

Второй вопрос Бекзода каждый понедельник — *«насколько велика книга?»*. На него отвечают два разных числа, и оба — соединения `installments` с `loans`/`payments`. Научитесь считать оба и говорить, какое из них вы имеете в виду.

**1. Остаток долга** (*outstanding balance*) — основной долг, который ещё не погашен. В аннуитетном графике каждый платёж несёт долю основного долга (`principal_due`); основной долг, оставшийся на отчётную дату, — это сумма долей, срок которых **ещё не наступил**:

```sql
SELECT SUM(i.principal_due) AS outstanding, COUNT(DISTINCT i.loan_id) AS loans
FROM installments i
WHERE i.due_date > '2026-10-01';                          -- 208 723 504 430 по 3409 кредитам
```

**208.7 млрд UZS** основного долга ещё предстоит получить по графику. **Портфель** — это это число, обычно ограниченное живыми кредитами: присоедините `loans` и оставьте `status = 'active'` → **203.4 млрд** по 3 341 кредиту; остальные 5.3 млрд приходятся на 22 кредита в `default` и 46 в `written_off`, графики которых продолжают идти, хотя денег никто не ждёт. «Автокредитный портфель» Бекзода — тот же запрос, отфильтрованный через `products` (активные кредиты: Auto 56.0 млрд по 358 кредитам; SME 122.8 млрд; Consumer 22.6 млрд; BNPL 1.1 млрд; Micro 1.0 млрд). Заметьте, чем остаток долга *не* является: `SUM(principal)` по активным кредитам — 297.0 млрд, то есть сумма, изначально выданная, а не то, что осталось.

**2. Сумма просрочки** (*overdue amount*) — деньги, которые *уже должны были поступить* и не поступили: платежи с `due_date <= отчётная дата` и без оплаты по ним. Это шаблон анти-соединения из сегодняшнего дня, применённый к `installments → payments`:

```sql
SELECT SUM(i.total_due) AS overdue, COUNT(*) AS instalments, COUNT(DISTINCT i.loan_id) AS loans
FROM installments i
LEFT JOIN payments p ON p.installment_id = i.installment_id
WHERE i.due_date <= '2026-10-01' AND p.payment_id IS NULL;   -- 6 475 544 633 · 1357 · 399
```

*Предпросмотр — механику IS NULL объяснит День 4; определение уточнит День 3.* **6.48 млрд UZS** по 1 357 наступившим платежам 399 кредитов не оплачено совсем. Большая часть — уже мёртвые деньги: после соединения с `loans` 4.88 млрд приходится на списанные кредиты и 0.87 млрд — на дефолтные; **0.69 млрд по 181 платежу активных кредитов** — это то, что команда Севары действительно взыскивает на этой неделе. Одно уточнение к среде: этот запрос считает *частично* оплаченный платёж оплаченным. Если считать «не оплачено полностью», получится 1 784 платежа по 413 кредитам и 7.60 млрд всё ещё к оплате — именно это число будет использовать расчёт DPD.

| Число | На какой вопрос отвечает | Зерно запроса | На 2026-10-01 |
|---|---|---|---|
| **Остаток долга** | сколько основного долга ещё предстоит получить | платежи с `due_date > отчётная дата` | 208.7 млрд (203.4 млрд активных) |
| **Просрочка** | сколько должно было прийти и не пришло | наступившие платежи без оплаты | 6.48 млрд (0.69 млрд по активным кредитам) |

> Вопрос для собеседования: *«Чем отличается остаток долга от суммы просрочки и как вы посчитаете каждое из них?»* — Остаток долга = основной долг, срок которого ещё не наступил, из графика; просрочка = наступившие платежи без оплаты, из графика минус платежи. Упомяните, что в остаток долга входит и *будущий* основной долг просроченных кредитов и что для обоих нужна дата.

Завтра: пакет для совета Мадины — те же соединения, но с `GROUP BY` сверху.

---

## Тест дня :id=day-quiz

Для завершения дня нужно набрать 80 %. Пересдавать можно сколько угодно.

```quiz
{"id": "w02d1", "pass": 0.8, "questions": [
  {"type": "single", "q": "Что произойдёт при выполнении этого запроса?", "code": "SELECT customer_id, l.principal\nFROM loans l\nJOIN customers c ON c.customer_id = l.customer_id;", "options": ["Одна строка на кредит с id клиента", "Ошибка «ambiguous column»", "Одна строка на клиента", "Ноль строк"], "answer": 1, "explain": "customer_id есть в обеих таблицах, поэтому база не может понять, какой из них вы имеете в виду; ставьте префикс у каждого столбца (→ раздел 1, Зачем нужен JOIN)."},
  {"type": "single", "q": "customers LEFT JOIN loans возвращает больше строк, чем customers INNER JOIN loans. Почему?", "options": ["LEFT JOIN считает каждый кредит дважды", "Клиенты без кредита сохраняют по одной строке, с NULL в столбцах кредита", "LEFT JOIN добавляет ещё и кредиты без клиента", "Это ошибка в условии соединения"], "answer": 1, "explain": "LEFT сохраняет каждую строку левой таблицы и заполняет правую сторону значениями NULL, если пары нет (→ раздел 1, INNER vs LEFT)."},
  {"type": "number", "q": "В небольшом банке 10 клиентов. У 7 из них есть кредиты — 12 кредитов всего — а у 3 кредитов нет. Сколько строк вернёт customers LEFT JOIN loans?", "answer": 15, "explain": "12 строк с кредитами + 3 клиента без кредита; проверяйте эту арифметику при каждом LEFT JOIN (→ раздел 1, INNER vs LEFT)."},
  {"type": "single", "q": "Что возвращает этот запрос?", "code": "SELECT COUNT(*)\nFROM customers c\nJOIN loans l ON l.customer_id = c.customer_id\nWHERE l.loan_id IS NULL;", "options": ["Число клиентов, которые никогда не брали кредит", "0 — INNER JOIN уже убрал клиентов без кредита", "Число кредитов без клиента", "Ошибку"], "answer": 1, "explain": "Для анти-соединения нужен LEFT JOIN; внутреннее соединение никогда не создаёт строк с NULL, которые ищет фильтр (→ раздел 1, анти-соединение; P7)."},
  {"type": "single", "q": "Это соединение возвращает 92 193 строки. Что такое одна строка результата?", "code": "SELECT COUNT(*)\nFROM loans l\nJOIN installments i ON i.loan_id = l.loan_id;", "options": ["Один кредит", "Один платёж по графику, со столбцами его кредита, повторёнными в каждой строке", "Один клиент", "Один платёж"], "answer": 1, "explain": "Зерно результата соединения — это зерно стороны «многие»; SUM(l.principal) здесь посчитал бы каждый основной долг по разу на каждый платёж (→ раздел 1, Один-ко-многим)."},
  {"type": "multi", "q": "Если начать с FROM loans и использовать INNER JOIN, какие соединения сохраняют результат на уровне одной строки на кредит?", "options": ["JOIN customers ON customer_id", "JOIN products ON product_id", "JOIN branches ON branch_id", "JOIN installments ON loan_id", "JOIN payments ON loan_id"], "answer": [0, 1, 2], "explain": "Соединения «многие к одному» находят ровно одну пару на кредит; соединения «один-ко-многим» с installments или payments умножают строки (→ раздел 1, Один-ко-многим; P8)."},
  {"type": "single", "q": "Вам нужен полный график кредита 1 с его платежами, включая ещё не оплаченные платежи по графику. Какое соединение выбрать?", "options": ["installments INNER JOIN payments", "installments LEFT JOIN payments", "payments LEFT JOIN installments", "Без соединения — только payments"], "answer": 1, "explain": "График — левая таблица; внутреннее соединение скрыло бы все открытые платежи (→ P10)."},
  {"type": "single", "q": "Бекзод спрашивает: «сколько основного долга остаётся непогашенным на 2026-10-01?». Какой запрос на это отвечает?", "options": ["SUM(principal) FROM loans WHERE status = 'active'", "SUM(principal_due) FROM installments WHERE due_date > '2026-10-01'", "SUM(total_due) наступивших платежей без оплаты", "SUM(amount) FROM payments"], "answer": 1, "explain": "Остаток долга — это основной долг по графику, срок которого ещё не наступил; SUM(principal) — сумма, изначально выданная в кредит, а наступившие неоплаченные платежи — это сумма просрочки (→ раздел 6, Уголок компании)."}
]}
```

<!-- challenge:start -->

---

## Задача дня :id=daily-challenge

Бонус для любознательных: один более сложный вопрос по теме дня. Решите его и получите XP, растущие вместе с вашей серией задач — полная неделя из пяти добавляет ещё 10 % к ваучеру в пятницу.

```challenge
{"id": "w02d1", "q": "Бекзод спрашивает: сколько непогашенного основного долга (платежи со сроком после отчётной даты 2026-10-01) приходится на активные автокредиты, оформленные в филиалах Ташкентского региона? Ответ в сумах, целое число.", "type": "number", "dp": 0, "h": ["21654098cae00c3343048722"], "hint": "Три таблицы: где лежат деньги, какому кредиту они принадлежат и где этот кредит оформлен. Решите, что такое одна строка, прежде чем суммировать.", "sol": "U0VMRUNUIFNVTShpLnByaW5jaXBhbF9kdWUpIEFTIG91dHN0YW5kaW5nCkZST00gaW5zdGFsbG1lbnRzIGkKSk9JTiBsb2FucyBsICAgIE9OIGwubG9hbl9pZCA9IGkubG9hbl9pZApKT0lOIGJyYW5jaGVzIGIgT04gYi5icmFuY2hfaWQgPSBsLmJyYW5jaF9pZApXSEVSRSBpLmR1ZV9kYXRlID4gJzIwMjYtMTAtMDEnCiAgQU5EIGwuc3RhdHVzID0gJ2FjdGl2ZScKICBBTkQgbC5wcm9kdWN0X2lkID0gNCAgICAgICAgICAtLSBBdXRvIChvciBqb2luIHByb2R1Y3RzIGFuZCBmaWx0ZXIgY29kZSA9ICdBVVRPJykKICBBTkQgYi5yZWdpb24gPSAnVGFzaGtlbnQnOwotLSAyMyA5MDIgNzA3IDkwNSAoMTUxIGxvYW5zKTsgdGhlIHNhbWUgdGV4dCBvbiBTUUxpdGUgYW5kIFNRTCBTZXJ2ZXIKT25lIHJvdyBvZiB0aGUgam9pbiBpcyBhbiBpbnN0YWxtZW50LCBzbyBzdW1taW5nIHByaW5jaXBhbF9kdWUgaXMgc2FmZTsgc3VtbWluZyBsLnByaW5jaXBhbCBvdmVyIHRoZSBzYW1lIGpvaW4gd291bGQgY291bnQgZWFjaCBsb2FuIG9uY2UgcGVyIHJlbWFpbmluZyBpbnN0YWxtZW50LgpXaXRob3V0IHRoZSBzdGF0dXMgZmlsdGVyIHlvdSBnZXQgMjQgNTExIDk5NyA2MTg6IDAuNiBibiBzaXRzIG9uIFRhc2hrZW50IEF1dG8gbG9hbnMgaW4gZGVmYXVsdCBvciB3cml0dGVuIG9mZiB0aGF0IG5vYm9keSBleHBlY3RzIGJhY2suIE9mIHRoZSA1NS45NyBibiBvdXRzdGFuZGluZyBvbiBhY3RpdmUgQXV0byBsb2FucywgVGFzaGtlbnQncyBicmFuY2hlcyBjYXJyeSA0MyAlIOKAlCBhIGxpdHRsZSBhYm92ZSBUYXNoa2VudCdzIDM5ICUgb2YgdGhlIHdob2xlIGJvb2su"}
```

<!-- challenge:end -->
