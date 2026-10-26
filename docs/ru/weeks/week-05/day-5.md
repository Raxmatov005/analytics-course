# Неделя 5 · День 5 — Контрольная: EDA-отчёт в pandas

<span class="badge">Отчёт 150 мин</span> <span class="badge">Собеседование 30 мин</span> <span class="badge hw">Контрольная · 100 баллов</span>

> STORY **Пятница, 9:00.** Мадина, Жасур и Бекзод за одним столом. Мадина: *«Три недели назад вы написали отчёт по кредитному портфелю на SQL. Сегодня вы пишете его **снова, в ноутбуке** — те же десять разделов, те же числа — и под каждым разделом говорите мне, совпал ли pandas с SQL, а если нет — почему.»* Жасур: *«Дело не в pandas. Дело в том, что теперь у вас есть два независимых способа получить каждое число, и вы знаете, каким из них воспользоваться.»* Бекзод: *«И графики. Минимум четыре. Совет директоров не читает `DataFrame.head()`.»*

## Сегодня в 3 строках :id=today-in-3-lines

- **Часть A (80 баллов):** `checkpoint.ipynb` из `data/python/checkpoint_template.ipynb` — десять разделов EDA недели 3, каждый в виде кодовых ячеек + число SQL недели 3 (дано в шаблоне) + одна строка Markdown *совпало / не совпало и почему* + вывод; не менее четырёх графиков на все десять разделов; заключительная ячейка из пяти предложений о том, что pandas упростил и что упростил SQL.
- **Часть B (20 баллов):** восемь вопросов собеседования по материалу этой недели, письменно, по 3–5 предложений на каждый.
- Разрешено: всё с недель 1–5 — `pd.read_sql` по `nur.db` (SQL *разрешён*; раздел всё равно должен заканчиваться DataFrame и шагом pandas), CSV-выгрузки, ваши функции из HW 5.2. Закрыто: образцы ответов, пока вы не сдадите работу.

**Правила.** Открытые материалы. Сдача через **блок 📎 в конце этой страницы**: `checkpoint.ipynb` (выполненный — Kernel → Restart & Run All, затем сохранить, чтобы все результаты были внутри файла), `interview.md`. Сегодня также срок **HW 5.2** в `day-3/`. Все числа на **2026-10-01**; платежи без дублей (ваша `clean_payments`) и обрезаны по дате отчёта везде, где суммируются.

**Метод работы.** В каждом разделе: зерно в комментарии; код; первые строки (`head()` — это результат, он учитывается); число недели 3 рядом с вашим — в виде `assert` там, где оно должно совпасть точно (количества, суммы), и в виде напечатанной пары там, где округление может отличаться (доли); один вывод, который Бекзод может зачитать вслух. *Несовпадение* — не провал, если строка под ним объясняет почему (полуоткрытый и включающий фильтр, грязные и чистые платежи, срез по когорте) — *необъяснённое* несовпадение стоит баллов за число.

**Форма одного раздела** (в шаблоне она повторяется десять раз — две ячейки, затем ячейка Markdown):

~~~markdown
## S5. Величина — по продуктам
**Неделя 3 (SQL):** SME 781 кредит / 241.1 млрд / 59.6 % денег …
~~~

```python
# grain: one row per loan (L, 7 828); products joined m:1 in the read_sql above
by_prod = L.groupby("code").agg(loans=("loan_id", "size"), disbursed=("principal", "sum"))
by_prod["amount_share"] = (100 * by_prod["disbursed"] / by_prod["disbursed"].sum()).round(1)
assert by_prod["loans"].sum() == 7828
by_prod.sort_values("disbursed", ascending=False)
```

~~~markdown
**Совпадение:** идентично S5 (59.6 / 20.9 / 16.1 / 1.8 / 1.6).
**Вывод.** Два портфеля в одном: 85 % кредитов — Micro/Consumer/BNPL, 80 % денег — SME/Auto.
~~~

Три ячейки на раздел, а не тридцать: проверяющий читает вывод, сверяет строку совпадения, затем результат и открывает код только если число расходится. Графики идут в тот раздел, который они иллюстрируют (`fig, ax` в той же ячейке, что и данные, `fig.savefig` по желанию) — четыре на все десять, с заголовками-выводами; естественные места — S5, S7, S9 (два).

**Где каждый инструмент pandas зарабатывает свой раздел:**

| Раздел | Идиома pandas | SQL-близнец |
|---|---|---|
| S1, S3 | `read_sql` + `.min()` / `.max()` | `COUNT(*)`, `MIN` / `MAX` |
| S2 | `value_counts(normalize=True)` | `COUNT(*) / SUM(COUNT(*)) OVER ()` |
| S4 | `drop_duplicates` + маска + `.sum()` | `v_payments_clean` + `WHERE paid_at <=` |
| S5, S6 | `groupby().agg(named=...)`, `rank`, `nlargest` | `GROUP BY`, `RANK()`, `LIMIT` |
| S7 | `rolling(3).mean()`, `pct_change(12)` | `AVG() OVER (ROWS 2 PRECEDING)`, `LAG(x, 12)` |
| S8 | цикл по `period_range` + `.diff()` | рекурсивный CTE + коррелированный `SUM` |
| S9 | `dpd_per_loan`, `pd.cut`, `pivot_table`, `merge(how="outer")` | CTE для DPD, `CASE`, `FULL OUTER JOIN` |
| S10 | `pd.cut(right=False)` + `crosstab` | `CASE WHEN income < …` + `SUM(CASE)` |

**Типичные ошибки этой недели** (каждая стоит балла за число): `how="inner"` по умолчанию там, где имелся в виду `LEFT JOIN`; `fillna(0)` на денежном столбце, который должен остаться NaN; `between` по datetime; `pd.cut` с первой границей 0; суммирование `principal` после присоединения платежей по графику к кредитам (Σ principal ×24.7, размножение строк с недели 2 — `validate="m:1"` бы это поймал); график, чей заголовок называет график.

---

## Часть A — Отчёт (150 мин, 80 баллов) :id=part-a--the-report-150-min-80-pts

Восемь баллов за раздел: 3 за код, который работает и отвечает на заголовок, 3 за числа (совпадающие или объяснённые), 2 за вывод и строку совпадения. Образцы ответов — это *один из* ответов; другой срез с верными числами и настоящим выводом получает столько же.

### S1. Исследование базы данных — таблицы, количества строк, зерно :id=s1-database-exploration--tables-row-counts-grain

<details><summary>Образец ответа</summary>

```python
con = sqlite3.connect("../raw/nur.db")
tables = pd.read_sql("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name", con)["name"]
counts = pd.DataFrame({"table": tables, "rows": [pd.read_sql(f"SELECT COUNT(*) AS n FROM {t}", con)["n"][0] for t in tables]})
```

| таблица | строк | зерно (одна строка =) |
|---|---|---|
| customers | 6 040 | человек (40 дублей → 6 000, HW 5.2) |
| applications | 14 000 | заявка на кредит |
| loans | 7 828 | выданный кредит |
| installments | 92 193 | платёж по графику |
| payments | 52 875 | полученные деньги (52 850 после `drop_duplicates`) |
| collections_actions / app_events | 9 361 / 22 784 | контакт по взысканию / событие в приложении |
| branches / products / staff / dim_date | 10 / 5 / 100 / 1 461 | справочники |

**Совпадение:** все одиннадцать количеств равны S1 недели 3. **Вывод.** Та же база данных, то же зерно; pandas здесь ничего не добавляет, кроме цикла — `read_sql` по `sqlite_master` заменил одиннадцать `UNION ALL`. F-строка на *имени* таблицы допустима только потому, что имена берутся из каталога, а не от пользователя.

</details>

### S2. Справочники — продукты, грейды, каналы, статусы :id=s2-dimensions--products-grades-channels-status

<details><summary>Образец ответа</summary>

```python
L = pd.read_sql("""SELECT l.*, p.code, a.channel, b.region FROM loans l
                   JOIN products p ON p.product_id = l.product_id
                   JOIN applications a ON a.application_id = l.application_id
                   JOIN branches b ON b.branch_id = l.branch_id""", con, parse_dates=["disbursed_at"])
for col in ["code", "risk_grade", "channel", "status"]:
    print(pd.concat([L[col].value_counts(), L[col].value_counts(normalize=True).mul(100).round(1)], axis=1, keys=["loans", "share_pct"]))
```

Продукты MICRO 2 669 (34.1 %) · CONS 2 418 (30.9) · BNPL 1 569 (20.0) · SME 781 (10.0) · AUTO 391 (5.0); грейды B 3 404 (43.5) · C 2 264 (28.9) · A 1 821 (23.3) · D 339 (4.3); каналы branch 3 590 (45.9) · app 2 669 (34.1) · partner 1 569 (20.0); статусы closed 4 242 · active 3 352 · written_off 190 · default 44; сегменты клиентов mass 3 585 · sme 1 251 · affluent 1 204.

**Совпадение:** идентично S2 недели 3. **Вывод.** `value_counts(normalize=True)` — это `COUNT(*) / SUM(COUNT(*)) OVER ()` с недели 3 — четыре блока в цикле вместо четырёх веток `UNION ALL`. App = Micro и partner = BNPL ячейка в ячейку: канал и продукт остаются одним разрезом, а не двумя.

</details>

### S3. Диапазон дат — первая/последняя выдача, платежи, дата отчёта :id=s3-date-range-firstlast-disbursement-payments-as-of

<details><summary>Образец ответа</summary>

```python
pay = pd.read_sql("SELECT * FROM payments", con, parse_dates=["paid_at"])
inst = pd.read_sql("SELECT * FROM installments", con, parse_dates=["due_date"])
print(L["disbursed_at"].min(), L["disbursed_at"].max(), pay["paid_at"].min(), pay["paid_at"].max(), inst["due_date"].max())
# 2024-01-02 · 2026-10-01 · 2024-01-31 · 2026-11-24 · 2030-10-01
(pay["paid_at"] > AS_OF).sum()      # 24 forward-dated rows, 53 438 947
```

**Совпадение:** идентично. **Вывод.** 33 месяца кредитования, график платежей до октября 2030 и `MAX(paid_at)` после даты отчёта — те 24 строки, которые каждая сумма платежей ниже исключает через `pay["paid_at"] <= AS_OF`. В pandas пять крайних значений — это пять вызовов методов на типизированных столбцах; типизация происходит в аргументе `parse_dates=`, а если его забыть, `.max()` превратится в сравнение строк, которое всё равно «работает».

</details>

### S4. Ключевые показатели — итоги :id=s4-key-measures--the-totals

<details><summary>Образец ответа</summary>

```python
pc = pay.sort_values("payment_id").drop_duplicates(subset=["installment_id", "paid_at", "amount"])
outstanding = inst.loc[inst["due_date"] > AS_OF, "principal_due"].sum()
collected = pc.loc[pc["paid_at"] <= AS_OF, "amount"].sum()
tiles = {"loans": len(L), "borrowers": L["customer_id"].nunique(), "disbursed": L["principal"].sum(),
         "avg_ticket": round(L["principal"].mean()), "avg_term": round(L["term_months"].mean(), 1),
         "outstanding": outstanding, "collected": collected, "interest": inst["interest_due"].sum()}
# 7828 · 4335 · 404 783 280 000 · 51 709 668 · 11.8 · 208 723 504 430 · 255 061 333 229 · 122 497 355 801
assert tiles["outstanding"] == 208_723_504_430 and tiles["collected"] == 255_061_333_229
```

**Совпадение:** все восемь. **Вывод.** Собрано по чистым платежам, обрезанным по дате отчёта, — 255 061 333 229 (52 826 строк) против сырых 255 173 169 976: 58.4 млн дублей и 53.4 млн строк с датой в будущем убраны — два фильтра это один `sort_values().drop_duplicates()` и одна маска. 73 % кредитов приходится на повторных заёмщиков (`(L.groupby("customer_id").size() > 1)`, взвешенное по кредитам); портфель выдал 404.8 млрд и по-прежнему несёт 208.7 млрд.

</details>

### S5. Величина — по продуктам, по регионам :id=s5-magnitude--by-product-by-region

<details><summary>Образец ответа</summary>

```python
by_prod = L.groupby("code").agg(loans=("loan_id", "size"), disbursed=("principal", "sum"), avg_ticket=("principal", "mean"))
by_prod["loan_share"] = 100 * by_prod["loans"] / by_prod["loans"].sum()
by_prod["amount_share"] = 100 * by_prod["disbursed"] / by_prod["disbursed"].sum()
by_prod.sort_values("disbursed", ascending=False).round(1)
# SME 781 / 241 117 150 000 / 308 728 745 / 10.0 / 59.6 · AUTO 391 / 84 791 530 000 / 216 858 133 / 5.0 / 20.9 · CONS 2418 / 65 109 280 000 / 30.9 / 16.1 · MICRO 2669 / 7 221 210 000 / 34.1 / 1.8 · BNPL 1569 / 6 544 110 000 / 20.0 / 1.6
by_region = L.groupby("region")["principal"].sum().pipe(lambda s: (100 * s / s.sum()).round(1)).sort_values(ascending=False)
# Tashkent 39.7 · Fergana 12.7 · Samarkand 11.2 · Andijan 9.5 · Namangan 8.6 · Bukhara 6.9 · Nukus 5.8 · Termez 5.7
```

График: barh остатка по продуктам из Дня 4 (60.3 / 27.6 / 11.0 / 0.5 / 0.5). **Совпадение:** идентично S5 недели 3. **Вывод.** Два портфеля в одном — 85 % кредитов это Micro/Consumer/BNPL, 80 % денег — SME/Auto; соотношение среднего чека SME : Micro составляет 114 : 1 (308.7 млн против 2.7 млн). `agg` с именованными результатами и затем два столбца долей — это всё окно поверх `GROUP BY` с недели 3.

</details>

### S6. Рейтинг — лучшие и худшие :id=s6-ranking--top-and-bottom

<details><summary>Образец ответа</summary>

```python
y26 = L[(L["disbursed_at"] >= "2026-01-01") & (L["disbursed_at"] < "2026-10-01")]
br = pd.read_sql("SELECT branch_id, branch_name FROM branches", con)
rank = (y26.merge(br, on="branch_id", validate="m:1").groupby("branch_name")
           .agg(loans=("loan_id", "size"), disbursed_2026=("principal", "sum")).sort_values("disbursed_2026", ascending=False))
rank["rk"] = rank["disbursed_2026"].rank(method="min", ascending=False).astype(int)
# 1 Tashkent South 381 / 21 380 780 000 · 2 Fergana Central 315 / 19 742 090 000 · 3 Samarkand Central 344 / 19 440 640 000 … 10 Termez Central 184 / 8 120 400 000
cust = pd.read_sql("SELECT customer_id, first_name || ' ' || last_name AS customer, segment FROM customers", con)
top = (L.groupby("customer_id").agg(loans=("loan_id", "size"), total=("principal", "sum")).nlargest(3, "total")
        .merge(cust, on="customer_id"))
# Murod Yusupov (sme) 5 / 1 258 430 000 · Ulugbek Nazarov (sme) 2 / 1 023 170 000 · Ulugbek Mirzaev (mass) 3 / 971 810 000
L.groupby("code")["principal"].max()     # AUTO 399 530 000 · BNPL 7 990 000 · CONS 49 990 000 · MICRO 4 990 000 · SME 599 060 000
```

**Совпадение:** идентично. **Вывод.** Fergana Central — второй по деньгам при меньшем числе кредитов, чем у четырёх других филиалов, — много SME; Termez последний с 38 % от лидера. Самый крупный кредит каждого продукта упирается в его `max_amount`. `rank(method="min")` — это `RANK()`; `nlargest` — это `ORDER BY … LIMIT`; единственное место, где нужна осторожность, — соединение с филиалами: `validate="m:1"` говорит, что у кредита один филиал.

</details>

### S7. Изменение во времени — ежемесячные выдачи, 3-месячное среднее, mom %, yoy % :id=s7-change-over-time-monthly-disbursements-3-month-average-mom-yoy-

<details><summary>Образец ответа</summary>

```python
m = (L[L["disbursed_at"] < "2026-10-01"].groupby(L["disbursed_at"].dt.to_period("M"))
       .agg(loans=("loan_id", "size"), disbursed=("principal", "sum")))
m["ma3"] = m["disbursed"].rolling(3).mean().round()
m["mom_pct"] = m["disbursed"].pct_change().mul(100).round(1)
m["yoy_pct"] = m["disbursed"].pct_change(12).mul(100).round(1)
m.loc["2026-01":]
```

| месяц | кредитов | выдано | ma3 | mom % | yoy % |
|---|---|---|---|---|---|
| 2026-01 | 287 | 17 452 370 000 | 16 605 040 000 | −1.5 | +72.8 |
| 2026-02 | 265 | 11 893 850 000 | 15 689 990 000 | −31.8 | +20.0 |
| … | | | | | |
| 2026-08 | 358 | 22 290 210 000 | 19 678 126 667 | +7.7 | +26.2 |
| 2026-09 | 361 | 17 015 490 000 | 19 999 856 667 | −23.7 | +16.2 |

График: рисунок 1 из Дня 4 (месяц серым, среднее синим). **Совпадение:** все 33 строки идентичны S7 недели 3, включая yoy начиная с января 2025. **Вывод.** 3-месячное среднее выросло с 16.6 до 20.0 млрд за девять месяцев (+20 %), тогда как отдельные месяцы колеблются на ±30 %. В версии на pandas нет ловушки `LAG`: `pct_change(12)` выполняется на полном фрейме из 33 строк, а фильтр для показа (`.loc["2026-01":]`) идёт *после* — но если сначала отфильтровать фрейм, а потом вызвать `pct_change(12)`, каждое yoy будет NaN, в точности ошибка недели 3 в новой записи.

</details>

### S8. Накопленный итог — остаток на конец месяца 2026 :id=s8-cumulative--month-end-outstanding-2026

<details><summary>Образец ответа</summary>

```python
rows = []
for ms in pd.period_range("2026-01", "2026-09", freq="M"):
    nxt = (ms + 1).to_timestamp()                                   # первый день следующего месяца
    live = L.loc[L["disbursed_at"] < nxt, "loan_id"]                # кредиты, существовавшие на конец месяца
    bal = inst[(inst["due_date"] >= nxt) & inst["loan_id"].isin(live)]
    rows.append((str(ms), bal["principal_due"].sum(), bal["loan_id"].nunique()))
s8 = pd.DataFrame(rows, columns=["month", "outstanding", "loans_with_balance"])
s8["net_growth"] = s8["outstanding"].diff()
# 2026-01 151 807 386 149 (2 579) · 02 154 145 984 724 (+2.3 bn) · 03 163 974 316 812 (+9.8) · … · 08 203 830 205 928 (+10.2) · 09 208 243 879 623 (+4.4 bn, 3 392 loans)
```

**Совпадение:** все девять концов месяцев равны S8 недели 3 (`v_portfolio_monthly` / рекурсивный календарь). **Вывод.** +56 млрд (+37 %) за девять месяцев при выдаче 161.5 млрд: две трети нового кредитования замещают погашения. Это единственный раздел, где pandas *понятнее* SQL, — девятишаговый цикл с читаемым условием заменяет рекурсивный CTE плюс коррелированный агрегат, — и он же единственный, где он медленнее всего (девять проходов по 92 193 строкам; всё равно меньше секунды).

</details>

### S9. Качество портфеля — корзины, PAR30, NPL90, FPD30, roll rates :id=s9-performance--buckets-par30-npl90-fpd30-roll-rates

<details><summary>Образец ответа</summary>

```python
d = dpd_per_loan(inst, pc, AS_OF)                                               # HW 5.2: loan_id, dpd, bucket
st = d.merge(inst[inst["due_date"] > AS_OF].groupby("loan_id")["principal_due"].sum().rename("outstanding"), on="loan_id", how="left").fillna({"outstanding": 0})
b = st.groupby("bucket", observed=True).agg(loans=("loan_id", "size"), outstanding=("outstanding", "sum"))
b["share_pct"] = (100 * b["outstanding"] / b["outstanding"].sum()).round(2)
# 0 7429 / 197 486 207 578 / 94.62 · 1-30 124 / 4 729 769 899 / 2.27 · 31-60 25 / 748 610 049 / 0.36 · 61-90 16 / 439 441 377 / 0.21 · 90+ 234 / 5 319 475 527 / 2.55
par30 = st.loc[st["dpd"] > 30, "outstanding"].sum() / st["outstanding"].sum()   # 3.12 %
npl90 = st.loc[st["dpd"] > 90, "outstanding"].sum() / st["outstanding"].sum()   # 2.55 %
```

FPD30: сводная таблица Дня 3 — 91 / 7 099 = **1.28 %**, app 1.70 · partner 1.12 · branch 1.04 %, грейды A 0.60 · B 0.97 · C 2.16 · D 2.23. Roll rates: матрица `read_sql` Дня 4 или два среза `dpd_per_loan`, объединённые `how="outer"` — 1–30 → 31–60 **19.5 %** (25 из 128), излечение 75.8 %, 31–60 → 61–90 69.6 %, 61–90 → 90+ 100 %, 117 новых входов. Поколения (винтажи): heatmap Дня 4 — 2025-10 с 6.91 % (MOB 3) / 11.52 % (MOB 6) против сводных 2025 года 4.35 / 7.46. Графики: рисунки 3, 4, 5.

**Совпадение:** корзины, PAR, NPL, FPD30, roll и поколения (винтажи) равны S9 недели 3. **Вывод.** 5.4 % остатка находится в просрочке, и 2.55 из 3.12 пункта PAR30 уже в 90+; живой портфель взыскания (1–90 DPD, 165 кредитов, 5.9 млрд) излечивается три раза из четырёх в первой корзине и никогда — после 60 дней. Одно число, которое нужно объяснить, если ваше отличается: PAR30 использует остаток всего кредита, а не просроченную сумму (коэффициент просрочки был бы 3.7 %).

</details>

### S10. Часть и целое, сегментация — доходная группа × грейд :id=s10-part-to-whole-and-segmentation--income-band--grade

<details><summary>Образец ответа</summary>

```python
inc = pd.read_sql("SELECT customer_id, monthly_income FROM customers", con)
lc = L.merge(inc, on="customer_id", how="left", validate="m:1")
lc["band"] = (pd.cut(lc["monthly_income"], [0, 5e6, 10e6, 20e6, np.inf], labels=["<5m", "5-10m", "10-20m", "20m+"], right=False)
                .astype(str).replace("nan", "unknown"))
ct = pd.crosstab(lc["band"], lc["risk_grade"])
ct["loans"] = ct.sum(axis=1); ct["cd_share_pct"] = (100 * (ct["C"] + ct["D"]) / ct["loans"]).round(1)
ct["avg_ticket"] = lc.groupby("band")["principal"].mean().round()
# unknown 466 / 116 201 132 17 / 32.0 % · <5m 1670 / 33.0 · 5-10m 2781 / 32.8 · 10-20m 774 / 34.8 · 20m+ 2137 / 33.7
```

Концентрация (pandas): три крупнейших филиала — 39.1 % остатка, верхний дециль заёмщиков — 49.1 % (`sort_values().head(len // 10).sum()`). График: heatmap из crosstab или составная столбчатая диаграмма долей грейдов по группам.

**Совпадение:** идентично S10 недели 3 — потому что `right=False` заставляет `pd.cut` читать `[5m, 10m)` в точности как `WHEN monthly_income < 10000000`; при интервалах по умолчанию, закрытых справа, клиент с доходом ровно 5 000 000 переходит в другую группу, и количества съезжают на несколько единиц. **Вывод.** Доход не предсказывает грейд: C+D составляют 32–35 % в каждой группе, включая 466 кредитов «unknown», которые pandas показывает только потому, что `.astype(str).replace("nan", "unknown")` превращает группу NaN в строку, — один лишь `pd.cut` молча выбросил бы её из crosstab, ещё раз урок недели 2 про полосу NULL.

</details>

### Заключительная ячейка — что каждый инструмент упростил :id=the-closing-cell--what-each-tool-made-easier

<details><summary>Образец ответа (пять предложений, у вас будут другие)</summary>

1. pandas упростил S8: девятишаговый цикл с простым условием (`due_date >= next month`, кредит выдан до этого) заменил рекурсивный CTE и коррелированный агрегат, а `diff()` дал чистый прирост одним вызовом. 2. pandas сделал S7 и S9 безопаснее: `pct_change(12)` выполняется на всём фрейме до фильтра для показа, `validate="1:1"` и `assert` после соединения сделали зерно явным, а `pd.cut` заменил четыре ветки `CASE`. 3. SQL упростил S1–S3 и матрицу поколений (винтажей): один `read_sql` цепочки CTE по 92 193 платежам графика короче и быстрее тех же соединений в pandas, а каталог (`sqlite_master`) — это запрос. 4. SQL держит определение в одном месте: `v_loan_status` один раз, читаемый Excel, Power BI и ноутбуком, тогда как функция pandas живёт в одном ноутбуке, пока кто-то не упакует её. 5. Правильное разделение: агрегировать и соединять в SQL на зерне базы данных, затем формировать, отсекать, проверять и рисовать в pandas — и запускать asserts в обоих, потому что важно то число, с которым согласны оба инструмента.

</details>

---

## Часть B — Восемь вопросов собеседования (30 мин, 20 баллов) :id=part-b--eight-interview-questions-30-min-20-pts

Отвечайте письменно, по 3–5 предложений, как сказали бы вслух: 2 балла за вопрос (1 за верный и полный ответ, 1 за пример Nur Finance с числом) плюс 4 за заметку «определения, которые я использовал» в начале `interview.md` (дата отчёта, DPD, FPD30, правило удаления дублей, остаток долга).

1. `loc` против `iloc` — по чему индексирует каждый и когда разница даёт о себе знать?
2. Что делает `validate=` в `merge` и какую ошибку недели 2 он предотвращает?
3. `groupby().agg` против `groupby().transform` — какая форма возвращается из каждого и какой конструкции SQL каждый соответствует?
4. Как pandas представляет пропущенное значение, как с ним обращаются агрегаты и когда `fillna(0)` неверен?
5. `pd.cut` против написанной вручную функции корзин — когда что использовать и какие две ловушки у `pd.cut`?
6. Когда вы берётесь за pandas вместо SQL, а когда наоборот?
7. Как выбрать тип графика и назовите три правила, которые не вопрос вкуса.
8. Что делает ноутбук воспроизводимым и как вы это доказываете перед сдачей?

<details><summary>Образцы ответов (открыть после сдачи)</summary>

1. `loc` выбирает по **метке** (значение индекса, имя столбца) и принимает булевы маски; `iloc` — по **целочисленной позиции**. На свежем `RangeIndex` они совпадают и расходятся после фильтра или сортировки: `late = loans[loans.dpd > 0]; late.loc[0]` вызывает `KeyError` (метки 0 нет среди просроченных кредитов), тогда как `late.iloc[0]` — первая просроченная строка. Правило: `loc` для условий и имён, `iloc` для «первых n», `reset_index(drop=True)`, когда нужно, чтобы они снова совпали.
2. `validate="1:1" / "m:1" / "1:m"` заставляет `merge` вызывать `MergeError`, когда ключ не уникален на стороне, за которую вы поручились. Он предотвращает тихое размножение строк: соединение платежей по графику с кредитами и суммирование `principal` дало ×24.7 на неделе 2 (11.8 строки на кредит, больше на крупных длинных кредитах); с `validate="1:1"` соединение 92 193 платежей графика с 52 826 суммами оплат по платежам графика доказано как «один к одному» до любой суммы. Добавьте `indicator=True`, чтобы увидеть строки `left_only` — анти-соединение.
3. `agg` возвращает **одну строку на группу** (`GROUP BY`): платежи по регионам, 8 строк. `transform` возвращает **одно значение на каждую исходную строку**, выровненное по фрейму, — оконную функцию `SUM(amount) OVER (PARTITION BY loan_id)`: доля каждого платежа в итоге по кредиту, 52 850 строк. `cumcount()` после сортировки — это `ROW_NUMBER() OVER (PARTITION BY …)` — инструмент удаления дублей.
4. `NaN` (`NaT` для дат); `sum`, `mean`, `count` пропускают его, как NULL в SQL (`cust.monthly_income.mean()` = 15.2 млн по 5 684 значениям), `==` его никогда не находит (находит `isna()`), и `len` ≠ `count`. `fillna(0)` верен для количества (нет оплаты → 0 оплачено) и неверен для измерения: он роняет средний доход до 14.3 млн и выдумывает 356 нулевых заёмщиков; подставляйте подписанную оценку или оставляйте NaN и показывайте полосу «unknown» (466 кредитов в S10).
5. `pd.cut` — для числовых диапазонов, которые являются определением (корзины DPD, доходные группы): одна строка, упорядоченная категория, векторизовано, `right=False`, когда правило `<`. Функция + `apply` — когда метка зависит от нескольких столбцов или от текстовой логики. Ловушки: первая граница должна быть *ниже* наименьшего значения (`-1`, иначе каждый `dpd = 0` становится NaN — 7 429 строк), и результат — категория: сравнивайте через `.astype(str)` и используйте `observed=True` в `groupby`.
6. SQL — когда вопрос это одна агрегация или соединение больших таблиц базы данных на её собственном зерне (CTE поколений, срезы DPD — `read_sql` и готово), когда результат должен использоваться несколькими инструментами (представление) или когда данные не помещаются в память. pandas — для цепочки преобразований после этого — отсечение, соединение двух результатов, скользящие окна, сводные таблицы, графики, — для всего итеративного (цикл S8), для asserts и для вывода (CSV, Excel, PNG). Ноутбук держит оба: агрегировать в SQL, формировать и проверять в pandas.
7. По **вопросу**: время → линия (34 месяца), категории → bar / barh для рейтингов и длинных подписей, матрица → heatmap (поколения/винтаж, roll), распределение по группам → boxplot, два числа на строку → scatter. Не вкус: столбцы начинаются с нуля (без логарифмической оси на столбцах), категории сортируются по значению, если порядок не естественный, никаких круговых диаграмм сверх трёх секторов и никакого 3D, один цвет плюс один акцент (90+ красным), заголовок формулирует вывод, нет легенды для одной серии, единица измерения на оси — и исключить однодневную точку октября.
8. Входные данные — по пути, а не вручную; дата отчёта — одна переменная; каждое число напечатано кодом, а не набрано в Markdown; asserts на известные количества (6 000 / 52 850 / 399 / 208 723 504 430), чтобы изменившаяся выгрузка останавливала запуск; ни одна ячейка не зависит от того, что её запускали дважды. Доказательство: **Kernel → Restart & Run All** проходит сверху донизу с зелёными asserts — затем сохраните, чтобы результаты были внутри `.ipynb`, который откроет проверяющий.

</details>

---

## Баллы и что дальше :id=scoring-and-what-happens-next

| Часть | Баллы | Зачёт |
|---|---|---|
| A — отчёт, 10 разделов × 8 | 80 | |
| B — 8 вопросов × 2 + заметка с определениями | 20 | |
| **Итого** | **100** | **≥ 70 → Неделя 6 в понедельник** |

Ниже 70: в отзыве будут названы разделы для переделки (чаще всего S8 — цикл по концам месяцев — и охват FPD30 в S9); пересдайте в понедельник утром до Недели 6. Баллы попадают на [страницу прогресса](progress.md).

**Чек-лист сдачи** (блок 📎 ниже): `checkpoint.ipynb` (выполненный, 10 разделов, ≥ 4 графиков, строка совпадения под каждым разделом, заключительная ячейка из пяти предложений), `interview.md` (заметка с определениями + 8 ответов). Сегодня также срок **HW 5.2** в `day-3/` (`clean_nur.py` или выполненный `day3_starter.ipynb`, `customers_clean.csv`, `payments_clean.csv`, `dpd_per_loan.csv`).

<span class="badge stretch">Со звёздочкой</span> Упакуйте неделю: файл `nur.py` с `clean_customers`, `clean_payments`, `dpd_per_loan`, `portfolio_summary`, `fpd30_table` и `figure_pack(con, as_of, out_dir)`, импортируемый десятистрочным `monthly.py`, который записывает плитки, корзины и пять PNG для любого `AS_OF`. Запустите его на 2026-09-01 и 2026-10-01 и сравните две таблицы корзин — матрицу roll rate, из командной строки.

Мадина, 17:30: *«Жасур запустил ваш ноутбук у себя и получил те же 399. У Бекзода есть его ежемесячный файл. У Тимура пять PNG с заголовками, которые он не писал. В понедельник — статистика: неделя, на которой вы узнаете, чего на самом деле стоит фраза „канал app хуже на 0.66 пункта“ при 41 случае против 34.»*

---

### 📎 Сдайте здесь :id=hand-in-here

```sqltask
{"check": "handin-W5D5", "lesson": "W5D5", "title": "Checkpoint 5", "tasks": [{"id": "checkpoint.ipynb", "file": "checkpoint.ipynb", "names": ["checkpoint.ipynb"], "upload": true, "accept": ".ipynb", "q": "Прикрепите `checkpoint.ipynb` — то, что требует страница выше."}, {"id": "Extra", "file": "extra", "upload": true, "optional": true, "q": "Всё остальное, что перечислено на странице (ещё один файл или .zip из нескольких)."}]}
```

---

## Тест дня :id=day-quiz

Для завершения дня нужно набрать 80 %. Пересдавать можно сколько угодно.

```quiz
{"id": "w05d5", "pass": 0.8, "questions": [
  {"type": "single", "q": "Каждое значение yoy_pct получается NaN. Почему?", "code": "m26 = m.loc[\"2026-01\":]\nm26[\"yoy_pct\"] = m26[\"disbursed\"].pct_change(12) * 100", "options": ["сначала должен выполниться rolling(3)", "pct_change требует дат в виде текста", "Фрейм был обрезан до 2026 года до pct_change(12), так что ни одной строки на 12 месяцев назад нет", "pct_change работает только с целыми числами"], "answer": 2, "explain": "Считайте на полном фрейме из 33 месяцев, а фильтруйте для показа потом — ловушка LAG с недели 3 в новой записи (→ S7)."},
  {"type": "single", "q": "Где находятся кредиты клиентов без указанного дохода?", "code": "lc[\"band\"] = pd.cut(lc[\"monthly_income\"], [0, 5e6, 10e6, 20e6, np.inf], right=False)\npd.crosstab(lc[\"band\"], lc[\"risk_grade\"])", "options": ["В строке <5m", "В строке под названием NaN", "pd.cut вызывает ошибку на NaN", "Нигде — группа NaN молча выпадает из crosstab"], "answer": 3, "explain": "Превратите группу NaN в строку (astype(str).replace(\"nan\", \"unknown\")) — урок недели 2 про полосу NULL (→ S10)."},
  {"type": "single", "q": "Зачем right=False в разбиении по доходу?", "options": ["pd.cut требует этого для денег", "Это ускоряет разбиение", "Это сохраняет NaN как группу", "Чтобы [5m, 10m) совпадало с WHEN monthly_income < 10000000 в SQL — клиент с доходом ровно 5 000 000 остаётся в той же группе, что и на неделе 3"], "answer": 3, "explain": "pd.cut по умолчанию закрыт справа; правило в SQL было «<», так что right=False воспроизводит его (→ S10)."},
  {"type": "single", "q": "Суммирование principal после присоединения платежей по графику к кредитам даёт ×24.7. Какой аргумент merge остановил бы это?", "options": ["indicator=True", "how=\"left\"", "sort=False", "validate= с ожидаемым вами зерном (например, \"m:1\")"], "answer": 3, "explain": "validate вызывает MergeError, когда ключ не уникален там, где вы поручились, — размножение строк с недели 2 становится ошибкой (→ «Типичные ошибки»)."},
  {"type": "single", "q": "Вы забыли parse_dates=, но L[\"disbursed_at\"].max() всё равно возвращает значение. Что не так?", "options": ["Ничего", "Это сравнение строк, которое по случайности работает на тексте ISO; .dt и арифметика дат недоступны", "max() вернул NaN", "pandas сам автоматически преобразовал столбец"], "answer": 1, "explain": "Типизация происходит в parse_dates=; без него .max() сравнивает текст и всё равно «работает» (→ S3)."},
  {"type": "multi", "q": "Что входит в каждый раздел контрольной?", "options": ["Число недели 3 рядом с вашим — assert там, где оно должно совпасть точно, напечатанная пара там, где округление может отличаться", "Один вывод, который Бекзод может зачитать вслух", "Зерно в комментарии", "Тридцать ячеек, показывающих каждую попытку", "Строка совпало / не совпало, говорящая почему"], "answer": [0, 1, 2, 4], "explain": "Три ячейки на раздел, а не тридцать: проверяющий читает вывод, сверяет строку совпадения, затем результат (→ «Метод работы»)."},
  {"type": "text", "q": "Какая команда Jupyter доказывает воспроизводимость ноутбука перед сдачей? (Kernel → …)", "answer": ["restart & run all", "restart and run all", "kernel → restart & run all", "kernel > restart & run all", "kernel -> restart & run all", "restart & run all cells", "перезапустить ядро и выполнить все ячейки", "перезапуск и выполнение всех ячеек", "перезапустить и выполнить все", "перезапустить и выполнить все ячейки"], "explain": "Restart & Run All выполняет каждую ячейку с чистого ядра; затем сохраните, чтобы результаты были внутри файла (→ «Правила»)."},
  {"type": "single", "q": "Ваше число pandas отличается от недели 3, и строка под ним объясняет почему (полуоткрытый и включающий фильтр). Чего это стоит?", "options": ["Половины баллов раздела", "Ничего — баллы за число стоит только необъяснённое несовпадение", "Баллов за вывод", "Всего раздела"], "answer": 1, "explain": "Несовпадение — не провал, если строка под ним говорит почему (→ «Метод работы»)."}
]}
```

<!-- challenge:start -->

---

## Задача дня :id=daily-challenge

Бонус для любознательных: один более сложный вопрос по теме сегодняшнего дня. Решите его за XP, которые растут вместе с серией задач, — полная неделя из пяти ещё и добавляет 10 % к пятничному ваучеру.

```challenge
{"id": "w05d5", "q": "Комитет Нилуфар хочет видеть NPL90 прошлого месяца рядом с нынешним 2.55 %. Пересчитайте его на 2026-09-01 конвейером этой недели: кредиты, выданные не позже 2026-09-01; DPD по платежам графика и платежам без дублей, оплаченным не позже 2026-09-01; остаток = principal_due платежей графика со сроком после 2026-09-01. NPL90 = остаток по кредитам с dpd > 90 ÷ общий остаток. Дайте процент с точностью до 3 знаков.", "type": "number", "dp": 3, "h": ["6c06ef3fdea33478da9c0a73"], "hint": "Ваш dpd_per_loan уже принимает дату отчёта как аргумент — дата отчёта должна сдвинуться в трёх местах, а не в одном.", "sol": "QVMgPSBwZC5UaW1lc3RhbXAoIjIwMjYtMDktMDEiKQpwYyA9IHBheS5zb3J0X3ZhbHVlcygicGF5bWVudF9pZCIpLmRyb3BfZHVwbGljYXRlcyhzdWJzZXQ9WyJpbnN0YWxsbWVudF9pZCIsICJwYWlkX2F0IiwgImFtb3VudCJdKQpwYWlkID0gcGNbcGNbInBhaWRfYXQiXSA8PSBBU10uZ3JvdXBieSgiaW5zdGFsbG1lbnRfaWQiLCBhc19pbmRleD1GYWxzZSkuYWdnKHBhaWQ9KCJhbW91bnQiLCAic3VtIikpCm0gPSBpbnN0Lm1lcmdlKHBhaWQsIG9uPSJpbnN0YWxsbWVudF9pZCIsIGhvdz0ibGVmdCIsIHZhbGlkYXRlPSIxOjEiKS5maWxsbmEoeyJwYWlkIjogMH0pCmxhdGUgPSBtWyhtWyJwYWlkIl0gPCBtWyJ0b3RhbF9kdWUiXSkgJiAobVsiZHVlX2RhdGUiXSA8PSBBUyldCmRwZCA9IChBUyAtIGxhdGUuZ3JvdXBieSgibG9hbl9pZCIpWyJkdWVfZGF0ZSJdLm1pbigpKS5kdC5kYXlzLnJlbmFtZSgiZHBkIikKb3V0ID0gaW5zdFtpbnN0WyJkdWVfZGF0ZSJdID4gQVNdLmdyb3VwYnkoImxvYW5faWQiKVsicHJpbmNpcGFsX2R1ZSJdLnN1bSgpLnJlbmFtZSgib3V0IikKcyA9IChMLmxvY1tMWyJkaXNidXJzZWRfYXQiXSA8PSBBUywgWyJsb2FuX2lkIl1dCiAgICAgICAubWVyZ2UoZHBkLCBvbj0ibG9hbl9pZCIsIGhvdz0ibGVmdCIpLm1lcmdlKG91dCwgb249ImxvYW5faWQiLCBob3c9ImxlZnQiKS5maWxsbmEoeyJkcGQiOiAwLCAib3V0IjogMH0pKQpsZW4ocyksIHNbIm91dCJdLnN1bSgpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIDcgNDY0IGxvYW5zLCAyMDQgODM4IDk4NiA4NjMKMTAwICogcy5sb2Nbc1siZHBkIl0gPiA5MCwgIm91dCJdLnN1bSgpIC8gc1sib3V0Il0uc3VtKCkgICAgICMgNCA3MjggMDQ3IDcwNSAvIDIwNCA4MzggOTg2IDg2MyA9IDIuMzA4ICUKCk5QTDkwIHdhcyAyLjMwOCAlIG9uIDEgU2VwdGVtYmVyICgyMTcgbG9hbnMgaW4gOTArLCB0aGUgRGF5LTQgUDcgY291bnQpIGFuZCAyLjU1ICUgb24gMSBPY3RvYmVyOiArMC4yNCBwb2ludHMgaW4gb25lIG1vbnRoLCB3aGlsZSBQQVIzMCBiYXJlbHkgbW92ZWQgKDMuMTAg4oaSIDMuMTIgJSkuClRoZSAxNyBsb2FucyB0aGF0IHJvbGxlZCBmcm9tIDYx4oCTOTAgaW50byA5MCsgZXhwbGFpbiB0aGUganVtcCDigJQgdGhlIHJpc2sgaXMgbWlncmF0aW5nIGludG8gdGhlIG9sZGVzdCBidWNrZXQsIG5vdCBhcnJpdmluZyBhcyBhIG5ldyB3YXZlLgpUaGUgdHJhcHM6IGxlYXZpbmcgdGhlIHBheW1lbnRzIGN1dCBhdCAxIE9jdG9iZXIgKGV2ZXJ5IFNlcHRlbWJlciBwYXltZW50IHRoZW4gJ2N1cmVzJyBsb2FucyBlYXJseSksIG9yIGtlZXBpbmcgdGhlIGxvYW5zIGRpc2J1cnNlZCBhZnRlciAxIFNlcHRlbWJlciBpbiB0aGUgZGVub21pbmF0b3Iu"}
```

<!-- challenge:end -->
