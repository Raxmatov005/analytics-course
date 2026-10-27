# Неделя 5 · День 4 — Графики и мост к SQL: matplotlib, seaborn, read_sql

<span class="badge">Теория 60 мин</span> <span class="badge">Разбор примера 15 мин</span> <span class="badge">Практика 50 мин</span> <span class="badge company">Уголок компании</span>

> STORY **Четверг, 9:00.** Тимур, BI-специалист (*BI specialist*), с шаблоном презентации для совета директоров. *«Страница Мадины в Excel была верной, но обновлять её никто не мог. Power BI верен, но совет директоров его не откроет. Совет директоров открывает презентацию. Мне нужен **ежемесячный пакет рисунков в PNG** — пять графиков, одного размера, одних цветов, по предложению на каждый, — который я каждый месяц кладу в слот четыре, не трогая мышь. Если ваш ноутбук делает их, я его запущу. Если для этого нужны вы — это не пакет рисунков, а одолжение.»* Жасур, от своего стола: *«И читайте SQL прямо в pandas. Не перепечатывайте CTE, который у вас уже есть.»*

## Сегодня в 3 строках :id=today-in-3-lines

- **Мост:** `sqlite3.connect` + `pd.read_sql(query, con)` выполняет любой SQL недели 3 — цепочку CTE для поколений (винтажей), `FULL OUTER JOIN` для roll rate — и возвращает DataFrame; два мира — один ноутбук.
- **matplotlib** (*библиотека matplotlib*) рисует всё из фигуры и осей: `plot` (линия), `bar` / `barh`, `hist`, `boxplot`, `scatter`; подписи, заголовок, формулирующий вывод, легенда только когда серий больше одной, большие числа в формате млрд (bn); **seaborn** добавляет статистические графики по данным в длинном формате одним вызовом (`barplot`, `lineplot`, `heatmap`, `boxplot`, `countplot`); `subplots` для сетки; `savefig` для презентации.
- Правила выбора графика — те же, что на неделе 4, без изменений; к вечеру у Тимура есть `figures/01…05.png` и код, который сделает их снова в следующем месяце.

---

## 1. Теория — фигура, оси и что на них размещается :id=1-learn--the-figure-the-axes-and-what-goes-on-them

Сначала данные: мост ниже читает базу в DataFrame, и каждый график на этой странице рисуется из них. Запускайте блоки сверху вниз; график появляется под блоком, который его рисует.

### `pd.read_sql` — мост :id=pdread_sql--the-bridge

```python
import sqlite3
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
Path("figures").mkdir(exist_ok=True)                  # папка, куда идут PNG
con = sqlite3.connect("../raw/nur.db")
monthly = pd.read_sql("""
    SELECT strftime('%Y-%m', disbursed_at) AS month, COUNT(*) AS loans, SUM(principal) AS disbursed
    FROM loans WHERE disbursed_at < '2026-10-01' GROUP BY 1 ORDER BY 1""", con)
loans = pd.read_sql("SELECT * FROM loans", con, parse_dates=["disbursed_at"])
status = pd.read_csv("../excel/loans_status.csv", parse_dates=["disbursed_at"])     # выгрузка с dpd, bucket, outstanding
pd.read_sql("SELECT COUNT(*) AS n FROM payments WHERE paid_at > ?", con, params=("2026-10-01",))   # 24 — параметры, никогда не f-строки
```

`sqlite3.connect(path)` открывает файл базы данных (SQL Server / PostgreSQL: `sqlalchemy.create_engine("mssql+pyodbc://…")` и тот же `read_sql`); `pd.read_sql(sql, con)` выполняет запрос и возвращает DataFrame с именами столбцов из `SELECT`. Работает любой SQL, который принимает движок — CTE, окна, рекурсивный календарь, — так что **ничего из недель 1–3 не перепечатывается**. `df.to_sql("name", con, if_exists="replace", index=False)` идёт в обратную сторону: очищенный DataFrame становится таблицей, которую может прочитать Power BI.

> 💡 **Главное.** Делите работу по тому, что каждый инструмент делает хорошо: агрегация, которую хорошо делает SQL (соединения по 92 193 платежам графика, срезы DPD), остаётся в SQL; формирование, отсечение и графики, которые хорошо делает pandas, — после. Вопрос, который сводится к одному `GROUP BY` по большим таблицам → SQL; последовательность преобразований формы, отсечение, соединение двух результатов, график → pandas. Завтрашняя контрольная спросит, что было проще для какого раздела, — это и есть словарь.

> ⚠️ **Осторожно.** Значения идут в `params=`, никогда в текст SQL. `f"… WHERE paid_at > '{as_of}'"` сегодня работает и ломается на первом же значении с кавычкой — а на настоящем сервере именно так проходит инъекция. Один `?` на значение, значения в кортеже: `params=(as_of,)` (запятая делает из него кортеж).

```game
{"type": "cloze", "id": "w05d4-g1", "title": "Спрашивайте безопасно", "text": "pd.read_sql(\"SELECT COUNT(*) AS n FROM payments WHERE paid_at > {{0}}\", con, {{1}}=(AS_OF,))", "blanks": [["?"], ["params"]], "distractors": ["'{AS_OF}'", "values", "args"]}
```

### matplotlib: фигура и оси :id=matplotlib-figure-and-axes

```python
GREY, BLUE, RED = "#9ca3af", "#1d4ed8", "#dc2626"
x = pd.to_datetime(monthly["month"])                    # настоящие даты по оси x
y = monthly["disbursed"]
fig, ax = plt.subplots(figsize=(10, 5))                 # фигура (страница) с одними осями (область графика)
ax.plot(x, y, color=GREY, lw=1, label="month")
ax.plot(x, y.rolling(3).mean(), color=BLUE, lw=2, label="3-month average")
ax.set_title("Disbursements climbed to a 20 bn run-rate", loc="left")
ax.set_xlabel(""); ax.set_ylabel("UZS per month")
ax.legend(frameon=False)
fig.tight_layout()
fig.savefig("figures/01.png", dpi=150)
```

Всегда используйте **объектный интерфейс**: `fig, ax = plt.subplots()`, затем методы на `ax`. (`plt.plot(...)` тоже работает и рисует на «текущих осях» — годится на скорую руку, но запутывает при нескольких графиках.) Типы графиков и вопрос, на который отвечает каждый (таблица недели 4):

| Вопрос | Метод `ax.` | Заметки |
|---|---|---|
| Как это меняется во времени? | `plot(x, y)` | x как настоящие даты (`pd.to_datetime`), одна линия на серию |
| Как сравниваются категории? | `bar(labels, values)` / `barh` для длинных подписей или рейтингов | **начинается с нуля**; сортируйте по значению, если порядок не естественный (месяцы, корзины) |
| Как распределено число? | `hist(values, bins=...)` | выбирайте число интервалов вручную; `log=True` для денег |
| Распределение по группам | `boxplot([g1, g2, ...], labels=...)` | медиана, квартили, усы, выбросы |
| Два числа на строку | `scatter(x, y, s=..., alpha=0.3)` | `alpha` для 7 828 точек; `ax.set_xscale("log")` для денег |

Оформление: `ax.set_title(text, loc="left")`, `ax.set_xlabel` / `set_ylabel`, `ax.set_ylim(0, …)`, `ax.text(x, y, label)` для подписей данных, `ax.axhline(y)` для опорной линии, `ax.annotate` для стрелки к точке, о которой вы говорите, `ax.tick_params(axis="x", rotation=45)`. Цвета: один серый для серии и один цвет для акцента (`"#9ca3af"`, `"#1d4ed8"`, красный `"#dc2626"` для 90+). `fig.tight_layout()` перед сохранением, иначе подписи вылезут за страницу.

### Анатомия честного графика в коде :id=the-anatomy-of-an-honest-chart-in-code

Двенадцать правил Дня 4 недели 4, каждое — в виде строки, которая его реализует:

```python
late = status["bucket"].value_counts().reindex(["1-30", "31-60", "61-90", "90+"])   # четыре просроченные корзины по порядку
fig, ax = plt.subplots(figsize=(10, 5))                                   # 1  один график, одна мысль, размер, подходящий для слайда
ax.bar(late.index, late.values, color=[RED if k == "90+" else GREY for k in late.index])   # 2  один цвет + один акцент
ax.set_ylim(0, late.max() * 1.15)                                         # 3  столбцы от нуля; запас места для подписей
for i, v in enumerate(late.values):
    ax.text(i, v, f"{v:,}", ha="center", va="bottom")                     # 4  число, которое читатель будет цитировать, отформатировано
ax.set_title("399 loans are late; 234 are already 90+", loc="left")       # 5  вывод, по левому краю, а не название графика
ax.set_ylabel("loans"); ax.set_xlabel("DPD bucket as of 2026-10-01")      # 6  единица измерения и дата отчёта
# no ax.legend() call                                                      # 7  нет легенды для одной серии
ax.spines[["top", "right"]].set_visible(False)                            # 8  меньше чернил: без рамки с двух сторон
ax.annotate("17 loans arrived from 61-90 this month", xy=(3, 234), xytext=(1.6, 200),
            arrowprops=dict(arrowstyle="->", color=RED))                  # 9  одна аннотация для точки, о которой вы говорите
fig.text(0.01, 0.01, "loans_status.csv · 7 828 loans · payments de-duplicated", fontsize=9, color="#6b7280")  # 10 строка с источником
fig.tight_layout()                                                         # 11 ничего не обрезано
fig.savefig("figures/03_dpd_buckets.png", dpi=150, facecolor="white")      # 12 файл, а не скриншот
```

График, следующий этим правилам, скучно смотреть и невозможно прочитать неверно — правильный компромисс для презентации совету директоров.

```game
{"type": "bug", "id": "w05d4-g2", "title": "Какая строка нарушает правило?", "q": "Эта столбчатая диаграмма просроченных корзин выполняется без ошибки. Одна строка нарушает правило графиков, которое не является делом вкуса.", "code": "fig, ax = plt.subplots(figsize=(10, 5))\nax.bar(late.index, late.values, color=GREY)\nax.set_yscale(\"log\")\nax.set_title(\"399 loans are late; 234 are already 90+\", loc=\"left\")\nfig.tight_layout()", "answer": [2], "why": "Логарифмическая ось на столбцах нарушает «столбцы начинаются с нуля»: длины столбцов перестают быть пропорциональны количествам. Большие разрывы выносите в подпись или во второй график, а не на логарифмическую шкалу."}
```

### Большие числа в млрд — форматтер :id=big-numbers-in-bn--the-formatter

```python
from matplotlib.ticker import FuncFormatter
bn = FuncFormatter(lambda x, _: f"{x / 1e9:,.0f} bn")
fig, ax = plt.subplots(figsize=(10, 4))
ax.plot(pd.to_datetime(monthly["month"]), monthly["disbursed"], color=BLUE)
ax.yaxis.set_major_formatter(bn)                 # 20000000000 → "20 bn"
# подпись данных в миллиардах: ax.text(x, v, f"{v / 1e9:,.1f} bn", va="center")
```

Суммы в сумах имеют двенадцать знаков; ось y с подписью `2.0e10` — это график, который никто не цитирует. Делите в момент отображения (форматтер) или один раз в данных (`df["bn"] = df["outstanding"] / 1e9`) — но никогда не там и там. Проценты: `PercentFormatter(100)` или `f"{v:.1f} %"`.

### seaborn: статистические графики по длинным данным :id=seaborn-statistical-charts-on-long-data

```python
# (shape only — not meant to run) … только форма: mix, md и vint строятся в разборе примера, практике и Уголке компании
import seaborn as sns
sns.set_theme(style="whitegrid", context="talk")          # одна тема на весь пакет — одинаковые шрифты и сетка на каждом PNG
sns.barplot(data=mix, x="outstanding", y="product", color="#9ca3af", ax=ax)
sns.lineplot(data=md, x="month", y="amount", hue="product", ax=ax)               # одна линия на продукт из ДЛИННЫХ данных
sns.heatmap(vint, annot=True, fmt=".1f", cmap="Reds", ax=ax)                     # матрица: когорта × MOB
sns.boxplot(data=loans, x="product", y="principal", ax=ax)                        # распределение по группам, из исходных строк
sns.countplot(data=loans, x="grade", hue="product", ax=ax)                        # value_counts в виде столбцов
```

**seaborn** (*библиотека seaborn*) стоит поверх matplotlib: каждый вызов принимает `ax=` и возвращает оси, поэтому оформление выше по-прежнему применимо. Его подарок — **`hue`**: третий столбец, который становится цветом, из **длинных** данных (одна строка на месяц × продукт — `melt` из вчерашнего дня), так что график из пяти линий — это один вызов. `barplot` *агрегирует* (по умолчанию среднее — передайте `estimator=sum` или сначала агрегируйте); `countplot` считает строки; `heatmap` требует широкую матрицу (`pivot`); `boxplot` и `histplot` требуют исходные строки. `sns.set_theme()` один раз в начале даёт пакету единый вид.

| Вызов seaborn | Какая форма данных нужна | Что с ней делает | Применение в Nur Finance |
|---|---|---|---|
| `barplot(x, y, hue)` | длинная, одна строка на наблюдение *или* предварительно агрегированная | агрегирует (по умолчанию среднее — передайте `estimator=sum`) | остаток по продуктам (предварительно агрегированный) |
| `countplot(x, hue)` | исходные строки | считает строки по категориям | кредиты по грейдам по продуктам |
| `lineplot(x, y, hue)` | длинная, одна строка на период × серию | одна линия на значение `hue` | ежемесячные выдачи по продуктам |
| `heatmap(matrix)` | **широкая**: `pivot` / `crosstab` | раскрашивает каждую ячейку, `annot=True` печатает значение | когорта поколения (винтажа) × MOB, матрица переходов |
| `boxplot(x, y)` / `violinplot` | исходные строки | медиана, квартили, усы по категориям | principal по продуктам |
| `histplot(x, bins, hue)` / `kdeplot` | исходные строки | распределение, при необходимости по группам | DPD просроченных кредитов |
| `scatterplot(x, y, hue, size)` | исходные строки | две меры на строку | principal против остатка |
| `relplot(..., col=)` / `catplot` | длинная | **малые кратные** — одна панель на значение `col` | одна панель на продукт |

> ⚠️ **Осторожно.** Большинство случаев «seaborn не работает» — это неверная **форма** данных, а не неверный вызов: `hue` хочет длинные данные (`melt`), `heatmap` — широкие (`pivot`, День 3). А `sns.barplot` на исходных строках рисует **среднее** по категории, а не итог — «остаток по продуктам», который тихо оказывается средним на кредит.

### subplots — сетка :id=subplots--the-grid

```python
# (shape only — not meant to run) … только форма: каждое "..." — данные своего графика
fig, axes = plt.subplots(2, 2, figsize=(14, 9))          # axes — массив 2×2
axes[0, 0].bar(...); axes[0, 1].plot(...)
for ax in axes.flat: ax.set_xlabel("")
fig.suptitle("Nur Finance — portfolio, as of 2026-10-01", x=0.01, ha="left")
```

Одна фигура, несколько осей — одностраничник недели 4 как единый PNG. `sharey=True`, когда графики должны быть сопоставимы; `axes.flat` для обхода циклом. Не кладите на одну сетку пять не связанных графиков для презентации — Тимуру нужны пять файлов, по одной мысли в каждом.

### Сохранение для презентации :id=saving-for-the-deck

```python
fig.savefig("figures/02_outstanding_mix.png", dpi=150, bbox_inches="tight", facecolor="white")
fig.savefig("figures/02_outstanding_mix.svg")          # вектор, для дизайнера
plt.close(fig)                                          # освободите память, когда делаете десятки в цикле
```

Слайду 16:9 подходит фигура `figsize=(12, 5.4)` при `dpi=150` (1 800 × 810 px) без масштабирования; держите один размер на тип графика во всём пакете, чтобы презентация не «прыгала». `bbox_inches="tight"` обрезает поля; `facecolor="white"`, потому что прозрачный фон в некоторых просмотрщиках становится чёрным; `plt.close(fig)` после каждого сохранения, иначе тридцать открытых фигур съедят память ядра, а Jupyter предупредит `More than 20 figures have been opened`. Называйте файлы с номером, чтобы они сортировались в порядке презентации (`01_…`, `02_…`), и никогда с датой — датированной должна быть папка.

### Правила выбора графика (неделя 4, без изменений) :id=chart-choice-rules-week-4-unchanged

Линия — для времени (34 месяца), столбцы — для категорий, **barh** — для рейтингов и длинных подписей, heatmap — для матрицы, box — для распределения по группам; **никаких круговых** диаграмм сверх трёх секторов, **никакого 3D**, **столбцы начинаются с нуля**, **сортировка по значению**, если порядок не естественный, **один цвет + один акцент**, **заголовок формулирует вывод** (*«SME — 60 % портфеля»*, а не *«Остаток по продуктам»*), **нет легенды для одной серии**, **единица измерения на оси или в заголовке**, **строка с источником** (`fig.text(0.01, 0.01, "loans_status.csv · 7 828 loans · as of 2026-10-01", fontsize=9)`). Точка октября 2026 (один день, 0.85 млрд) исключается из каждого временного ряда, иначе она читается как обвал. Логарифмическая ось на столбчатой диаграмме нарушает «столбцы начинаются с нуля»: 7 429 текущих кредитов уходят в подпись оси, а не на логарифмическую шкалу.

> 💡 **Главное.** График выбирается **вопросом**, а заголовок на него отвечает. Если вы не можете записать вывод в заголовок, вы ещё не знаете, для чего этот график.

```game
{"type": "sort", "id": "w05d4-g3", "title": "Выберите график", "q": "Разложите каждый вопрос под график, который на него отвечает.", "groups": {"линия": ["Ежемесячные выдачи, 33 месяца", "Доля собранного по месяцу срока"], "barh, отсортированный": ["Остаток по регионам, рейтинг", "Топ-10 филиалов по выданным деньгам"], "heatmap": ["Поколения: когорта × месяцы на балансе", "Матрица переходов: из корзины × в корзину"], "hist / box": ["DPD просроченных кредитов", "Principal по продуктам (разброс)"]}}
```

### Быстрые графики pandas :id=pandas-plotting-shortcuts

```python
ax = monthly.set_index("month")["disbursed"].plot(figsize=(10, 4), title="Disbursed per month")   # линия одним вызовом (под капотом matplotlib)
plt.show()
ax = status["dpd"].plot.hist(bins=30, figsize=(6, 3), title="DPD, all loans")                    # гистограмма одним вызовом
plt.show()
# после разбора примера: mix.plot.barh(x="product", y="outstanding", legend=False) — возвращает оси, оформляйте как обычно
```

`df.plot` / `Series.plot` — это matplotlib с индексом в роли x: идеально для пятисекундного взгляда при исследовании; для презентации идите через `fig, ax`, чтобы заголовок, форматтер и размер были вашими.

### Глубже (по желанию) :id=depth-optional

**Видео (бесплатные, YouTube; каждая ссылка открывается на нужной минуте):**

- ▶ Фигура и оси matplotlib — [Python for Data Analytics - Full Course for Beginners (Luke Barousse), 5:21:23](https://youtu.be/wUSDVGivd-8?t=19283&end=20081)
- ▶ Форматирование графиков / гистограммы / ящики с усами — тот же курс, [8:17:21](https://youtu.be/wUSDVGivd-8?t=29841&end=30606)
- ▶ seaborn — тот же курс, [9:31:39](https://youtu.be/wUSDVGivd-8?t=34299&end=35140)
- ▶ seaborn (короткое видео по одной теме) — [Seaborn Crash Course - Data Visualization in Python (NeuralNine), 08:16](https://youtu.be/rLVCSmtoA7U?t=496&end=840)
- ▶ Быстрые графики pandas — [Creating Visualizations using Pandas Library (Alex The Analyst), 01:52](https://youtu.be/JpSMse3eVVg?t=112&end=192)
- ▶ `read_sql` — [SQL Databases with Pandas and Python - A Complete Guide (Rob Mulla), 08:35](https://youtu.be/DiQ5Hni6oRI?t=515&end=684)
- ▶ `read_sql` с SQLite (совпадает с `sqlite3.connect` со страницы) — [SQLite with Pandas (Code Adhyayana)](https://youtu.be/xcVXCK6U6LA)

- Русская презентация (TBC Data Analytics 2.0, если она у вас есть) `4.5_Python.pdf`: ООП-интерфейс matplotlib — стр. 12–20, relational / categorical / distribution графики seaborn — стр. 22–38 (длинный и широкий формат — стр. 24), heatmap — стр. 36, графики pandas — стр. 47–55, выбор графика и сторителлинг — стр. 68–72. `4.4_Python.pdf`: DB-API и курсоры — стр. 7–28, `read_sql` / `to_sql` / порционная загрузка — стр. 29–34, движки SQLAlchemy — стр. 38–54 (на тот день, когда вы подключитесь к SQL Server).
- *Английские термины:* chart / plot = график, line chart = линейный график, bar / barh = столбчатая / линейчатая диаграмма, histogram = гистограмма, boxplot = ящик с усами, scatter = диаграмма рассеяния, heatmap = тепловая карта, subplot = подграфик, legend = легенда, axis = ось, long / wide format = длинный / широкий формат.

```videoquiz
{"video": "wUSDVGivd-8", "stops": [
  {"at": 19700, "q": "fig, ax = plt.subplots() даёт вам…", "options": ["фигуру (страницу) и оси (область графика), на которых рисуют", "два отдельных графика", "DataFrame", "сохранённый PNG"], "answer": 0, "explain": "Объектный интерфейс: методы ax рисуют и оформляют один именованный график — безопасный путь, когда графиков несколько.", "back": 60},
  {"at": 30200, "q": "Какой график показывает, как распределено одно число?", "options": ["Линейный", "Гистограмма", "Круговая", "Тепловая карта"], "answer": 1, "explain": "hist считает значения по интервалам; выбирайте интервалы вручную и логарифмическую ось для денег от 2 млн до 600 млн.", "back": 60},
  {"at": 34700, "q": "Что делает hue= в seaborn?", "options": ["Задаёт один цвет всем столбцам", "Превращает третий столбец в цвет — одна линия или столбец на значение, из длинных данных", "Меняет тему", "Сортирует категории"], "answer": 1, "explain": "hue — подарок seaborn: график из пяти линий — один вызов, если данные длинные (одна строка на месяц × продукт).", "back": 60}]}
```

```videoquiz
{"video": "rLVCSmtoA7U", "stops": [
  {"at": 600, "q": "sns.barplot на исходных строках по умолчанию рисует…", "options": ["итог по категории", "среднее по категории", "количество по категории", "медиану"], "answer": 1, "explain": "barplot агрегирует средним; передайте estimator=sum или сначала агрегируйте — countplot считает строки.", "back": 45},
  {"at": 760, "q": "sns.heatmap нужны данные в виде…", "options": ["длинной таблицы: строка на ячейку", "широкой матрицы (pivot / crosstab)", "списка словарей", "одной Series"], "answer": 1, "explain": "Строки и столбцы матрицы становятся строками и столбцами тепловой карты — сначала pivot.", "back": 45}]}
```

```videoquiz
{"video": "JpSMse3eVVg", "stops": [
  {"at": 140, "q": "Что df.plot() по умолчанию кладёт на ось x?", "options": ["Первый столбец", "Индекс", "Всегда номера строк", "Ничего — x нужно передать"], "answer": 1, "explain": "Графики pandas ставят индекс на x — поэтому set_index(\"month\") перед .plot().", "back": 30},
  {"at": 180, "q": "Когда однострочник pandas — правильный инструмент?", "options": ["Для презентации совету", "Для быстрого взгляда при исследовании; презентация идёт через fig, ax", "Никогда", "Только для круговых"], "answer": 1, "explain": "У однострочника нет форматтера, заголовка-вывода, размера — для ваших глаз, а не для слота четыре Тимура.", "back": 30}]}
```

```videoquiz
{"video": "DiQ5Hni6oRI", "stops": [
  {"at": 580, "q": "Что возвращает pd.read_sql(query, con)?", "options": ["Курсор", "Список кортежей", "DataFrame с именами столбцов из SELECT", "CSV-файл"], "answer": 2, "explain": "Запрос выполняется в базе, а результат приземляется DataFrame — это и есть мост.", "back": 45},
  {"at": 660, "q": "Как дата из вашего кода должна попасть в SQL?", "options": ["Внутри f-строки", "Через params= с плейсхолдером ?", "Вписанной вручную", "Через глобальную переменную в SQL"], "answer": 1, "explain": "params= передаёт значения безопасно; f-строки ломаются на кавычках и открывают путь для инъекции.", "back": 45}]}
```

```videoquiz
{"video": "xcVXCK6U6LA", "stops": [
  {"at": 200, "q": "Что открывает sqlite3.connect(\"nur.db\")?", "options": ["Сервер в сети", "Сам файл базы данных — сервер не нужен", "CSV", "Книгу Excel"], "answer": 1, "explain": "SQLite — это файл; тот же read_sql потом работает и с SQL Server через движок SQLAlchemy.", "back": 45},
  {"at": 450, "q": "Что делает df.to_sql(\"name\", con, if_exists=\"replace\")?", "options": ["Читает таблицу", "Записывает DataFrame в базу как таблицу", "Удаляет базу", "Печатает SQL"], "answer": 1, "explain": "to_sql идёт в обратную сторону — удобно, и это повод держать производные таблицы вне общей сырой базы.", "back": 45}]}
```

---

## 2. Разбор примера — рисунок 2 от запроса до PNG (15 мин) :id=2-worked-example--figure-2-from-query-to-png-15-min

Структура остатка по продуктам в виде рейтинга с долями в подписях — график со страницы Мадины в Excel, теперь воспроизводимый:

```python
mix = pd.read_sql("""
    SELECT p.name AS product, SUM(i.principal_due) AS outstanding
    FROM installments i JOIN loans l ON l.loan_id = i.loan_id JOIN products p ON p.product_id = l.product_id
    WHERE i.due_date > '2026-10-01' GROUP BY 1 ORDER BY 2""", con)                     # SQL делает соединение по 92 193 строкам
assert mix["outstanding"].sum() == 208_723_504_430                                      # у выгрузки всё ещё известная нам форма
mix["share"] = 100 * mix["outstanding"] / mix["outstanding"].sum()                      # pandas считает долю
fig, ax = plt.subplots(figsize=(10, 5))
ax.barh(mix["product"], mix["outstanding"], color=[BLUE if s == mix["share"].max() else GREY for s in mix["share"]])
for y, (v, s) in enumerate(zip(mix["outstanding"], mix["share"])):
    ax.text(v, y, f"  {v / 1e9:,.1f} bn · {s:.1f} %", va="center")                     # число, которое совет директоров будет цитировать
ax.xaxis.set_major_formatter(bn); ax.set_xlim(0, mix["outstanding"].max() * 1.35)       # место для подписей
ax.set_title(f"SME is {mix['share'].max():.0f} % of the {mix['outstanding'].sum() / 1e9:.1f} bn book on 10 % of the loans", loc="left")
fig.tight_layout(); fig.savefig("figures/02_outstanding_mix.png", dpi=150)
```

Результат: SME 125.9 млрд · 60.3 % (синий) · Auto 57.7 · 27.6 · Consumer 23.1 · 11.0 · BNPL 1.1 · 0.5 · Micro 1.0 · 0.5, наименьший внизу, потому что `ORDER BY 2` по возрастанию ставит самый большой столбец наверх `barh`. Шесть решений, каждое — правило недели 4: barh, потому что пять длинных подписей; отсортировано; от нуля; один акцент; доля в подписи, а не вторая ось; вывод в заголовке.

> 💡 **Главное.** Ежемесячный рисунок не должен устаревать. `assert` на итог останавливает запуск, когда ноябрьская выгрузка меняет форму, а заголовок **строится из данных** f-строкой — «60 %» и «208.7 bn» вычисляются, так что в следующем месяце это будут числа следующего месяца.

---

## 3. Практика (50 мин) :id=3-practice-50-min

Каждый редактор открывает `nur.db` или читает выгрузку; график появляется под редактором, когда ваш код его рисует. Выведите число, о котором спрашивает задача, затем ✔ Check — и сформулируйте вывод, который вы поставили бы в заголовок графика. В Jupyter в `data/python/day4_starter.ipynb` есть пять рисунков пакета; добавляйте свои ячейки ниже и сохраняйте каждый график в `figures/`.

**P1.** `monthly` из моста: линия по 33 месяцам (октябрь исключён) через `.plot()` pandas в одну строку, затем то же через `fig, ax` и форматтер в млрд. Чего не хватает однострочнику для презентации? Выведите сентябрь 2026 в млрд.

```task
{"id": "w05d4-p1", "kind": "python", "starter": "import sqlite3\nimport pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nfrom matplotlib.ticker import FuncFormatter\ncon = sqlite3.connect(\"../raw/nur.db\")\nmonthly = pd.read_sql(\"\"\"SELECT strftime('%Y-%m', disbursed_at) AS month, SUM(principal) AS disbursed\n                         FROM loans WHERE disbursed_at < '2026-10-01' GROUP BY 1 ORDER BY 1\"\"\", con)\n\n# ваш код\n", "answer": 17.0, "dp": 1, "hint": "Проверка ищет выданную сумму за сентябрь 2026 в млрд, с одним знаком: monthly[\"disbursed\"].iloc[-1] / 1e9.", "model": "monthly.set_index(\"month\")[\"disbursed\"].plot()                 # для ваших глаз\nfig, ax = plt.subplots(figsize=(10, 5))\nax.plot(pd.to_datetime(monthly[\"month\"]), monthly[\"disbursed\"], color=\"#1d4ed8\")\nax.yaxis.set_major_formatter(FuncFormatter(lambda x, _: f\"{x / 1e9:,.0f} bn\"))\nax.set_title(\"Disbursements rose from 3.9 bn to 17.0 bn a month in 33 months\", loc=\"left\")\nprint(len(monthly), round(monthly[\"disbursed\"].iloc[-1] / 1e9, 1))   # 33 17.0\n\nОднострочнику не хватает размера, форматтера (он показывает 1e10), выровненного по левому краю заголовка с выводом и файла. Линия начинается с 3.87 млрд (янв. 2024) и заканчивается 17.0 млрд (сен. 2026); два сентября (2025: 14.6 млрд) показывают +16 % г/г."}
```

**P2.** Гистограмма `principal` (все 7 828 кредитов) с 30 интервалами, затем с `ax.set_xscale("log")` — или сначала `np.log10`. Какая из них показывает два портфеля?

```task
{"id": "w05d4-p2", "kind": "choice", "options": ["Линейная — видны все кредиты", "Логарифмическая: два горба, 2–6 млн (Micro / BNPL / Consumer) и 150–450 млн (SME / Auto)", "Никакая — гистограмма не показывает группы", "Обе выглядят одинаково"], "answer": 1, "explain": "Линейная: один столбец слева (медиана 5.79 млн) и длинный невидимый хвост до 599 млн — бесполезна. Логарифмическая: два горба. 10-й перцентиль — 1.37 млн, 99-й — 531 млн: диапазон в 400 раз требует логарифмической оси; скажите об этом в подписи оси (principal, логарифмическая шкала). Интервалы на логарифмической оси: np.logspace(6, 9, 30)."}
```

**P3.** `sns.boxplot` для `principal` по `product`, продукты упорядочены по медиане (или `ax.boxplot` со списком на продукт). Прочитайте ящик SME: выведите медианы.

```task
{"id": "w05d4-p3", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nstatus = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 314770000, "dp": 0, "hint": "Проверка ищет медиану principal у SME в сумах: groupby(\"product\")[\"principal\"].median().", "model": "med = status.groupby(\"product\")[\"principal\"].median().sort_values(ascending=False)\nprint(med)                    # SME 314770000 · Auto 214840000 · Consumer 26965000 · BNPL 4180000 · Micro 2700000\nfig, ax = plt.subplots(figsize=(10, 5))\nax.boxplot([status.loc[status[\"product\"] == p, \"principal\"] for p in med.index], labels=med.index)\nax.set_yscale(\"log\"); ax.set_title(\"SME's middle half runs from 165 m to 454 m, up to the 600 m cap\", loc=\"left\")\n\nМедианы: SME 314.8 млн · Auto 214.8 млн · Consumer 27.0 млн · BNPL 4.18 млн · Micro 2.70 млн. Ящик SME идёт от 165 млн (Q1) до 454 млн (Q3), усы до потолка в 600 млн, выбросов нет — плоское, широкое распределение вплоть до лимита продукта. На одной линейной оси три малых продукта — линия внизу; используйте логарифмическую ось или по подграфику на продукт (sharey=False). В seaborn: sns.boxplot(data=status, x=\"product\", y=\"principal\", order=med.index)."}
```

**P4.** `sns.countplot(x="grade", hue="product")` — затем та же информация в виде heatmap из `pd.crosstab(product, grade)`. Что читается лучше и в чём вывод? Выведите перекрёстную таблицу.

```task
{"id": "w05d4-p4", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nstatus = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 1154, "dp": 0, "hint": "Проверка ищет число кредитов Micro грейда B.", "model": "ct = pd.crosstab(status[\"product\"], status[\"grade\"])\nprint(ct)                                   # Micro: A 655 · B 1154 · C 777 · D 83\nprint(pd.crosstab(status[\"product\"], status[\"grade\"], normalize=\"index\").mul(100).round(0))\nfig, ax = plt.subplots(figsize=(7, 4))\nax.imshow(ct.values, cmap=\"Reds\")          # или sns.heatmap(ct, annot=True, fmt=\"d\", cmap=\"Reds\")\n\nHeatmap читается лучше: одно число в ячейке; 20 столбцов в пяти цветах — это упражнение на чтение легенды. Micro: A 655 · B 1 154 · C 777 · D 83; SME: 175 · 350 · 205 · 51. У каждого продукта примерно 23 / 44 / 29 / 4 % — состав грейдов не зависит от продукта, поэтому разница в FPD между продуктами — не разница в грейдах (вывод недели 2, теперь в виде картинки)."}
```

**P5.** Диаграмма рассеяния `principal` против `outstanding` для активных кредитов, `alpha=0.3`, обе оси логарифмические. Какова корреляция и сколько точек лежит *выше* диагонали (остаток > основного долга)?

```task
{"id": "w05d4-p5", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nstatus = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 19, "dp": 0, "hint": "Проверка ищет число активных кредитов с outstanding > principal — маска и .sum().", "model": "act = status[status[\"status\"] == \"active\"]\nfig, ax = plt.subplots(figsize=(7, 6))\nax.scatter(act[\"principal\"], act[\"outstanding\"], s=8, alpha=0.3)\nax.set_xscale(\"log\"); ax.set_yscale(\"log\")\nprint(round(act[[\"principal\", \"outstanding\"]].corr().iloc[0, 1], 2))    # 0.92\nabove = act[act[\"outstanding\"] > act[\"principal\"]]\nprint(len(above), above[\"product\"].unique())                           # 19 ['Buy now pay later']\n\nТочки на диагонали — молодые кредиты (ещё ничего не погашено); точки далеко под ней — старые, почти погашенные. Точка выше невозможна — а таких 19, все кредиты BNPL, выданные в сентябре 2026, выше на 100–400 сум: график с нулевой ставкой округляет платёж вверх до ближайших 100 (3 380 000 / 12 → 281 700 × 12 = 3 380 400) и никогда не подрезает последний. Невидимо на любой оси, найдено маской — однострочная заметка о качестве данных для Жасура и причина проверять невозможное, прежде чем доверять графику."}
```

**P6.** Остаток по регионам в виде отсортированного barh с подписями в млрд; затем то же для структуры продуктов Tashkent. По одному заголовку-выводу на каждый. Выведите остаток Tashkent в млрд.

```task
{"id": "w05d4-p6", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nstatus = pd.read_csv(\"../excel/loans_status.csv\", parse_dates=[\"disbursed_at\"])\n\n# ваш код\n", "answer": 81.7, "dp": 1, "hint": "Проверка ищет остаток Tashkent в млрд, с одним знаком.", "model": "reg = status.groupby(\"region\")[\"outstanding\"].sum().sort_values()\nprint((reg / 1e9).round(1))       # Tashkent 81.7 · Fergana 24.8 · Samarkand 24.7 · Andijan 19.8 · Namangan 18.7 · Bukhara 15.1 · Nukus 13.3 · Termez 10.7\nfig, ax = plt.subplots(figsize=(10, 5))\nax.barh(reg.index, reg.values, color=[\"#1d4ed8\" if r == \"Tashkent\" else \"#9ca3af\" for r in reg.index])\nfor y, v in enumerate(reg.values):\n    ax.text(v, y, f\"  {v / 1e9:.1f} bn\", va=\"center\")\nax.set_title(\"Tashkent's three branches hold 39 % of the book; the next two regions 24 %\", loc=\"left\")\n\nСтруктура Tashkent: SME 58.6 % · Auto 30.0 · Consumer 10.4 · BNPL 0.5 · Micro 0.5 — «Tashkent — это весь портфель в миниатюре». Отсортировано, от нуля, один акцент (Tashkent)."}
```

**P7.** Мост с параметрами: функция `late_loans(con, as_of)`, которая выполняет логику DPD недели 2 в SQL с `params=` и возвращает количества по корзинам. Вызовите её для 1 сентября и 1 октября.

```task
{"id": "w05d4-p7", "kind": "python", "starter": "import sqlite3\nimport pandas as pd\nimport numpy as np\ncon = sqlite3.connect(\"../raw/nur.db\")\n\n# ваш код: late_loans(con, as_of), затем вызовите её для \"2026-09-01\" и \"2026-10-01\"\n", "answer": 217, "dp": 0, "hint": "Проверка ищет число в 90+ на 1 сентября. Два плейсхолдера ?: отсечение оплат и отсечение наступивших сроков используют дату отчёта.", "model": "def late_loans(con, as_of):\n    q = \"\"\"WITH pc AS (SELECT DISTINCT installment_id, paid_at, amount FROM payments),\n           paid AS (SELECT installment_id, SUM(amount) AS p FROM pc WHERE paid_at <= ? GROUP BY installment_id)\n           SELECT i.loan_id, MIN(i.due_date) AS oldest\n           FROM installments i LEFT JOIN paid ON paid.installment_id = i.installment_id\n           WHERE i.due_date <= ? AND COALESCE(paid.p, 0) < i.total_due\n           GROUP BY i.loan_id\"\"\"\n    d = pd.read_sql(q, con, params=(as_of, as_of), parse_dates=[\"oldest\"])\n    dpd = (pd.Timestamp(as_of) - d[\"oldest\"]).dt.days\n    return pd.cut(dpd, [0, 30, 60, 90, np.inf], labels=[\"1-30\", \"31-60\", \"61-90\", \"90+\"]).value_counts().sort_index()\nprint(late_loans(con, \"2026-09-01\"))   # 128 / 23 / 17 / 217\nprint(late_loans(con, \"2026-10-01\"))   # 124 / 25 / 16 / 234\n\n1 сен: 385 просроченных, плюс 13 со сроком в этот день при DPD 0 (их намеренно отсекает первая граница 0); 1 окт: 399 просроченных, плюс 14. params=(as_of, as_of) заполняет два ? — фильтр по оплатам и фильтр по платежам графика, урок недели 3. Никогда f\"... <= '{as_of}'\": сегодня работает, а сломается на первом же значении с кавычкой."}
```

**P8.** `sns.lineplot` ежемесячных выдач по продуктам (`hue="product"`) из `monthly_disbursements.csv` — длинные данные, октябрь исключён. Затем `pivot` в широкую форму и `df.plot()` — тот же график? Какой продукт кто-то попросит вынести на отдельную ось и почему вы отказываетесь? Выведите итог SME за январь–сентябрь 2026 в млрд.

```task
{"id": "w05d4-p8", "kind": "python", "starter": "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nmd = pd.read_csv(\"../excel/monthly_disbursements.csv\", parse_dates=[\"month\"])\n\n# ваш код\n", "answer": 94.8, "dp": 1, "hint": "Проверка ищет итог SME за 2026 (январь–сентябрь) в млрд, с одним знаком.", "model": "md = md[md[\"month\"] < \"2026-10-01\"]                       # убрать однодневный октябрь\nwide = md.pivot(index=\"month\", columns=\"product\", values=\"amount\")\nwide.plot(figsize=(10, 5))                                  # pandas: широкие данные, столбец на линию\n# seaborn: sns.lineplot(data=md, x=\"month\", y=\"amount\", hue=\"product\") — длинные, hue по продукту\ny26 = md[md[\"month\"] >= \"2026-01-01\"].groupby(\"product\")[\"amount\"].sum() / 1e9\nprint(y26.round(1))       # SME 94.8 · Auto 36.0 · Consumer 25.5 · Micro 2.8 · BNPL 2.4\n\nТот же график: seaborn принимает длинные данные с hue, plot в pandas — широкие с одним столбцом на линию. SME и Auto читаются; Consumer — низкая линия; Micro и BNPL плоские внизу. Просьба о второй оси — ловушка недели 4 (две линии, пересекающиеся на двух шкалах, рассказывают историю, которой нет); дайте малым продуктам собственные малые кратные (sns.relplot(..., col=\"product\", facet_kws={\"sharey\": False})) или график долей."}
```

**P9.** Сетка 2 × 2: корзины (bar), структура остатка (barh), месячная линия, heatmap переходов — один `fig.suptitle`, одна строка источника, один PNG. Затем скажите, почему это *не* то, о чём просил Тимур.

```task
{"id": "w05d4-p9", "kind": "free", "min": 25, "model": "fig, axes = plt.subplots(2, 2, figsize=(16, 10)), каждый график на axes[i, j], fig.suptitle(\"Nur Finance — loan book, as of 2026-10-01\", x=0.01, ha=\"left\") и fig.text(0.01, 0.005, \"nur.db · 7 828 loans · payments de-duplicated\", fontsize=9). Это одностраничник для читателя с распечаткой. Презентации Тимура нужен один график на слайд с одним предложением: сетка 2 × 2 на слайде даёт четыре конкурирующих заголовка и ничего, что можно прочитать с последнего ряда. Оба варианта правильны для своего читателя — сетка для распечатки, пять файлов для презентации.", "rubric": ["Строит сетку через subplots(2, 2) с одним suptitle / строкой источника", "Говорит, что презентации нужен один график и одна мысль на слайд", "Называет читателя каждого формата (распечатка или слайд)"]}
```

> 🚀 **Со звёздочкой (по желанию, +5 XP).** **P10.** `to_sql`: запишите `dpd_per_loan` (HW 5.2) в `nur.db` как таблицу `loan_dpd_pandas`, затем `read_sql` соединения её с логикой DPD недели 2, чтобы посчитать расхождения по каждому кредиту. Потом удалите таблицу (`con.execute("DROP TABLE loan_dpd_pandas")`) — зачем её удалять? Сколько расхождений?

```task
{"id": "w05d4-p10", "kind": "number", "answer": 0, "dp": 0, "unit": "расхождений", "xp": 2, "hint": "d.to_sql(\"loan_dpd_pandas\", con, if_exists=\"replace\", index=False), затем LEFT JOIN с DPD из SQL и COUNT(*) WHERE они различаются.", "model": "0 расхождений на 7 828 кредитах — DPD из pandas и DPD из SQL совпадают по каждому кредиту. Таблицу удаляют, потому что nur.db — общий исходный источник для работы каждого на неделях 1–3: производная таблица, оставленная внутри, — это грех «чистить единственную копию» с недели 1. Производным таблицам место в вашем собственном файле базы данных или в схеме pandas_, с документацией. (На странице вы пишете в свою копию nur.db, так что ничего общего не задето — но привычка всё равно важна.)"}
```

### Ошибки, которые стоят балла на этой неделе :id=mistakes-that-cost-a-point-this-week

- Заголовок, называющий график вместо вывода; легенда на одной серии.
- Столбцы не от нуля, логарифмическая ось на столбцах, круговая диаграмма из пяти продуктов, вторая ось y.
- Двенадцатизначные подписи делений (`2e11`) — нет форматтера.
- Точка октября 2026 за один день оставлена во временном ряду.
- `sns.barplot` на исходных строках без `estimator=sum` — среднее там, где имелся в виду итог.
- SQL, собранный f-строками вместо `params=`.
- PNG, сохранённый до `tight_layout()` — подписи обрезаны.
- Жёстко прописанное число в заголовке, которое противоречит данным следующего месяца.

---

## 4. Самопроверка :id=4-self-check

```check
{"id": "w05d4-sc", "questions": [
  {"type": "multi", "q": "Что pd.read_sql позволяет не переделывать в pandas?", "options": ["Соединения по 92 193 платежам графика", "Цепочки CTE недели 3 (поколения, roll rate)", "Срезы DPD, посчитанные в SQL", "Заголовки графиков"], "answer": [0, 1, 2], "explain": "SQL оставляет себе агрегацию, которую делает хорошо; pandas по-прежнему делает форму, отсечение, assert-ы и график (→ раздел 1, «pd.read_sql»)."},
  {"type": "single", "q": "lineplot в seaborn с hue хочет длинные данные, plot в pandas — широкие. Какие вызовы преобразуют в каждую сторону?", "options": ["melt делает длинные, pivot — широкие", "pivot делает длинные, melt — широкие", "groupby в обе стороны", "concat и merge"], "answer": 0, "explain": "Пара из Дня 3: melt → длинные (строка на месяц × продукт), pivot → широкие (столбец на продукт) (→ раздел 1, «seaborn»)."},
  {"type": "single", "q": "Почему рисунок 3 рисует четыре столбца, а 7 429 текущих кредитов помещает в подпись оси?", "options": ["matplotlib не умеет рисовать пять столбцов", "На одной оси 7 429 расплющили бы четыре просроченных столбца, а логарифмическая ось нарушила бы «столбцы от нуля»", "Так попросил совет директоров", "Текущих кредитов нет в файле"], "answer": 1, "explain": "Пятое число идёт в подпись, а не на логарифмическую шкалу (→ раздел 1, «Правила выбора графика»)."},
  {"type": "single", "q": "PNG получается с обрезанными подписями осей. Чего не хватило перед savefig?", "options": ["plt.close(fig)", "fig.tight_layout() (или bbox_inches=\"tight\")", "dpi=300", "ax.legend()"], "answer": 1, "explain": "tight_layout освобождает место для подписей и заголовков до записи файла (→ раздел 1, «Сохранение для презентации»)."}
]}
```

---

## 5. Уголок компании <span class="badge company">Пакет рисунков</span> :id=5-company-corner-the-figure-pack

Пять PNG, один ноутбук, ни одного клика мышью. Каждый рисунок: SQL для тяжёлой работы через `read_sql`, pandas для формы, matplotlib/seaborn для картинки, вывод в заголовке, `savefig` в `figures/`. Полный код — в `day4_starter.ipynb` (выполненном, так что результаты видны); устройство каждого:

| # | Файл | Данные | График | Заголовок (вывод, на 2026-10-01) |
|---|---|---|---|---|
| 1 | `01_disbursements_ma3.png` | `GROUP BY month` по `loans` через `read_sql`; `rolling(3).mean()` | линия, месяц серым + 3-месячное среднее синим; форматтер в млрд; октябрь исключён | *Выдачи выросли с 3.9 млрд (янв. 2024) до темпа 20 млрд — читайте среднее, а не месяц* |
| 2 | `02_outstanding_mix.png` | платежи графика со сроком после даты отчёта, соединённые с продуктами, в SQL | barh отсортирован, самый большой сверху, SME выделен, подписи `млрд · %` | *SME — 60 % портфеля в 208.7 млрд при 10 % кредитов* |
| 3 | `03_dpd_buckets.png` | `loans_status.csv` → `value_counts` | столбцы четырёх просроченных корзин от нуля, 90+ красным, количества в подписях; 7 429 текущих кредитов (94.9 %) — в подписи оси | *399 кредитов просрочены; 234 из них уже в 90+ — риск в старых долгах, а не в новой волне* |
| 4 | `04_vintage_heatmap.png` | цепочка CTE поколений (винтажей) с недели 3 без изменений через `read_sql`; `pivot(cohort × mob)` | `sns.heatmap`, Reds, аннотации с одним знаком после запятой, ячейки NaN пустые | *Октябрь 2025 — худшая когорта: 6.9 % ever-30+ к месяцу 3, 11.5 % к месяцу 6* |
| 5 | `05_roll_rate.png` | CTE roll rate с недели 3 (два среза, `FULL OUTER JOIN`) через `read_sql`; `pivot` в матрицу 5 × 5 | `sns.heatmap`, раскраска по % от исходной корзины, аннотации с количествами | *1–30 излечивается на 76 % и переходит дальше на 19.5 %; после 60 дней не возвращается никто* |

```game
{"type": "match", "id": "w05d4-g4", "title": "Какой график для какого рисунка?", "pairs": [["01 выдачи", "линия: месяц серым + 3-месячное среднее синим"], ["02 структура остатка", "barh, отсортирован, один акцент, подписи млрд · %"], ["03 корзины DPD", "столбцы от нуля, 90+ красным"], ["04 поколения", "heatmap: когорта × месяцы на балансе"], ["05 roll rate", "heatmap: из корзины × в корзину"]]}
```

Числа за этими заголовками, из собственного вывода ноутбука: среднее на рисунке 1 растёт с 16.6 млрд (янв. 2026) до 20.0 млрд (сен. 2026), в то время как отдельные месяцы колеблются на −32 % / +65 %; доли на рисунке 2 — 60.3 / 27.6 / 11.0 / 0.5 / 0.5 и итог 208 723 504 430; на рисунке 3 — 124 / 25 / 16 / 234; на рисунке 4 строка 2025-10: 2.76 · 4.15 · **6.91** · 8.76 · 9.68 · **11.52** % против сводной кривой 2025 года 4.35 % на MOB 3 и 7.46 % на MOB 6; матрица рисунка 5: из 1–30 → 0: 97, остаётся 6, → 31–60: 25 (19.5 %); 31–60 → 61–90: 16 из 23 (69.6 %); 61–90 → 90+: 17 из 17; 90+ → 90+: 217, плюс 117 новых входов в 1–30. Каждое из этих чисел — число недели 2/3, которое совет директоров уже видел в таблице; пакет — то же число в форме, которую они запомнят.

Драйвер, который запускает Тимур, — каждый рисунок это функция `(con, as_of) → fig`, пакет — цикл:

```python
# (shape only — not meant to run) … только форма: пять функций fig_* лежат в day4_starter.ipynb
FIGURES = {"01_disbursements_ma3": fig_disbursements, "02_outstanding_mix": fig_mix, "03_dpd_buckets": fig_buckets,
           "04_vintage_heatmap": fig_vintage, "05_roll_rate": fig_roll}

def figure_pack(con, as_of, out_dir="figures"):
    out = Path(out_dir) / str(as_of.date()); out.mkdir(parents=True, exist_ok=True)     # figures/2026-10-01/
    for name, make in FIGURES.items():
        fig = make(con, as_of)                       # каждая функция делает запрос с params=(as_of,) и проверяет свои количества через assert
        fig.savefig(out / f"{name}.png", dpi=150, facecolor="white")
        plt.close(fig)
    return sorted(p.name for p in out.glob("*.png"))

figure_pack(con, pd.Timestamp("2026-10-01"))
# ['01_disbursements_ma3.png', '02_outstanding_mix.png', '03_dpd_buckets.png', '04_vintage_heatmap.png', '05_roll_rate.png']
```

> 💡 **Главное.** **Воспроизводимость — это и есть результат.** Три привычки делают пакет Тимура, а не одолжением: дата отчёта — одна переменная, используемая в каждом запросе (`params=(AS_OF,)`); каждый заголовок, цитирующий число, вычисляет его (`f"… {b['90+']:,} of them are already 90+ …"`); и `assert` на каждый датафрейм перед его графиком (`assert b.sum() == 7828`) останавливает запуск, когда выгрузка меняет форму, вместо того чтобы сохранить неверный PNG. В следующем месяце: меняете `AS_OF`, Kernel → Restart & Run All, пять новых файлов в `figures/`.

**Если `FULL OUTER JOIN` не работает** (SQLite до 3.39): постройте два среза в pandas функцией `dpd_per_loan(inst, pay, as_of)` из Дня 3 для 2026-09-01 и 2026-10-01, `merge(on="loan_id", how="outer").fillna(0)`, `pd.cut` по обеим сторонам, `pd.crosstab(from, to)` — 526 кредитов с просрочкой на любую из двух дат, та же матрица 5 × 5.

> 🎯 **Версия для собеседования.** *«Как бы вы построили ежемесячный пакет графиков из базы данных?»* — один ноутбук; SQL для агрегации через `read_sql` с датой отчёта как параметром; pandas для формирования; тип графика выбирается вопросом (линия для времени, barh для рейтингов, heatmap для матриц); заголовки формулируют вывод и сами вычисляют свои числа; asserts на количества перед каждым графиком; `savefig` в датированную папку; Restart & Run All как тест выпуска.

**Скажите это как на собеседовании.** Ответьте на вопрос выше своими словами, как сказали бы вслух, на примере пакета Nur Finance.

```task
{"id": "w05d4-int", "kind": "free", "min": 30, "model": "Я бы сделала его одним ноутбуком, который может перезапустить любой. Тяжёлая агрегация остаётся в SQL — в Nur Finance это цепочка поколений и срезы для roll rate — и читается в pandas через read_sql, а дата отчёта передаётся параметром, а не вклеивается в SQL. pandas придаёт форму каждому результату (pivot для тепловых карт, скользящее среднее для тренда), и перед каждым графиком стоит assert на количества, так что изменившаяся выгрузка останавливает запуск, а не даёт неверную картинку. Тип графика следует вопросу — линия для 33 месяцев, отсортированный barh для структуры продуктов, тепловые карты для поколений и переходов, — а каждый заголовок формулирует вывод числами, вычисленными из данных. Каждый рисунок сохраняется в датированную папку, а Restart & Run All — мой тест выпуска: в следующем месяце я меняю AS_OF и получаю пять новых PNG.", "rubric": ["SQL для агрегации через read_sql с датой отчёта как параметром", "Assert-ы на количества перед графиками", "Тип графика по вопросу; заголовки формулируют вывод, вычисленный из данных", "Перезапускаемость: один AS_OF, savefig в папку, Restart & Run All"]}
```

Завтра: контрольная — десятираздельный EDA-отчёт недели 3, переделанный в pandas, каждое число рядом со своим SQL-близнецом, и вердикт, какой инструмент упростил какой раздел.

---

## Тест дня :id=day-quiz

Для завершения дня нужно набрать 80 %. Пересдавать можно сколько угодно.

```quiz
{"id": "w05d4", "pass": 0.8, "questions": [
  {"type": "single", "q": "Почему пакет рисунков использует fig, ax = plt.subplots() вместо plt.plot()?", "options": ["Каждый заголовок, подпись и форматтер тогда принадлежат именованному графику — понятно и безопасно, когда графиков несколько", "plt.plot не умеет рисовать линии", "Только fig можно сохранить в PNG", "subplots рисует быстрее"], "answer": 0, "explain": "plt.plot рисует на «текущих осях», что запутывает при нескольких графиках; объектный интерфейс делает график вашим (→ раздел 1, «matplotlib»)."},
  {"type": "single", "q": "Каждый столбец должен показывать суммарный остаток по продукту. Что он показывает?", "code": "sns.barplot(data=loans, x=\"outstanding\", y=\"product\")", "options": ["Средний остаток на кредит по каждому продукту", "Количество кредитов", "Итог", "Медиану"], "answer": 0, "explain": "barplot в seaborn по умолчанию агрегирует средним — передайте estimator=sum или сначала агрегируйте (→ раздел 1, «seaborn»)."},
  {"type": "single", "q": "Какая форма данных нужна sns.heatmap для матрицы поколений (когорта × MOB)?", "options": ["Series с процентами", "Широкая: pivot с когортами в строках и MOB в столбцах", "Любая форма", "Длинная: одна строка на когорту × MOB"], "answer": 1, "explain": "Графикам с hue нужны длинные данные (melt); heatmap нужна широкая матрица (pivot) — большинство случаев «seaborn не работает» — это неверная форма данных (→ раздел 1, «seaborn»)."},
  {"type": "single", "q": "Обе строки сегодня возвращают одно и то же количество. Какая из них принадлежит пакету рисунков?", "code": "as_of = \"2026-10-01\"\nq1 = pd.read_sql(f\"SELECT COUNT(*) AS n FROM payments WHERE paid_at > '{as_of}'\", con)\nq2 = pd.read_sql(\"SELECT COUNT(*) AS n FROM payments WHERE paid_at > ?\", con, params=(as_of,))", "options": ["Ни одна — прочитать всю таблицу и фильтровать в pandas", "Любая — они идентичны", "q1 — читается легче", "q2 — params= безопасно передаёт значение; f-строка ломается на кавычке и на настоящем сервере открывает путь для инъекции"], "answer": 3, "explain": "Значения идут в params=, никогда в текст SQL (→ раздел 1, «pd.read_sql», P7)."},
  {"type": "number", "q": "Какое число возвращает этот запрос на nur.db?", "code": "pd.read_sql(\"SELECT COUNT(*) AS n FROM payments WHERE paid_at > ?\", con, params=(\"2026-10-01\",))", "answer": 24, "tol": 0, "explain": "24 платежа с датой в будущем (53.4 млн) — строки, которые каждая сумма платежей исключает через paid_at <= AS_OF (→ раздел 1, «pd.read_sql»)."},
  {"type": "multi", "q": "Какие из этого — правила графиков, а не вопрос вкуса?", "options": ["Нет легенды для одной серии", "Логарифмическая ось на столбчатой диаграмме, чтобы были видны малые значения", "Вторая ось y, чтобы две линии поместились", "Убрать из временного ряда однодневную точку октября", "Столбцы начинаются с нуля", "Заголовок формулирует вывод"], "answer": [0, 3, 4, 5], "explain": "Логарифмическая ось нарушает «столбцы от нуля», а две оси y выдумывают пересечения; точка октября (один день) читается как обвал (→ раздел 1, «Правила выбора графика»)."},
  {"type": "single", "q": "Заголовок рисунка 2 гласит «208.7 bn». В следующем месяце итог изменится. Каково устойчивое решение?", "options": ["Добавить сноску с датой", "Построить заголовок из данных с помощью f-строки", "Править заголовок вручную каждый месяц", "Убрать все числа из заголовков"], "answer": 1, "explain": "Заголовок, вычисленный из данных, не может устареть; assert над графиком ловит изменившуюся выгрузку (→ раздел 2)."},
  {"type": "single", "q": "Уголок компании: что делает пакет рисунков пакетом Тимура, а не одолжением?", "options": ["Один AS_OF в каждом запросе, заголовки, вычисляемые из данных, assert перед каждым графиком — затем Restart & Run All", "Пять графиков на одной сетке 2 × 2", "Цвета, выбираемые вручную каждый месяц", "Сохранение каждого графика в SVG"], "answer": 0, "explain": "Воспроизводимость — это и есть результат: меняете AS_OF, запускаете всё, получаете пять новых файлов (→ Уголок компании)."}
]}
```

<!-- challenge:start -->

---

## Задача дня :id=daily-challenge

Бонус для любознательных: один более сложный вопрос по теме сегодняшнего дня. Решите его за XP, которые растут вместе с серией задач, — полная неделя из пяти ещё и добавляет 10 % к пятничному ваучеру.

```challenge
{"id": "w05d4", "q": "Тимур хочет, чтобы рисунок 1 нёс в заголовке сравнение с прошлым годом. Прочитайте ежемесячную выданную сумму (SUM(principal) по месяцам, выдано до 2026-10-01) из nur.db через pd.read_sql, возьмите 3-месячное скользящее среднее и сравните среднее за сентябрь 2026 (июль–сентябрь 2026) со средним за сентябрь 2025 (июль–сентябрь 2025). На сколько процентов оно выше? Дайте процент с точностью до 1 знака.", "type": "number", "dp": 1, "python": true, "h": ["76d786089690eeaf0c7f6726"], "hint": "Когда месяцы лежат по одному в строке по порядку, значение любого столбца год назад — это двенадцатью строками выше.", "sol": "Y29uID0gc3FsaXRlMy5jb25uZWN0KCIuLi9yYXcvbnVyLmRiIikKbSA9IHBkLnJlYWRfc3FsKCIiIlNFTEVDVCBzdHJmdGltZSgnJVktJW0nLCBkaXNidXJzZWRfYXQpIEFTIG1vbnRoLCBTVU0ocHJpbmNpcGFsKSBBUyBkaXNidXJzZWQKICAgICAgICAgICAgICAgICAgIEZST00gbG9hbnMgV0hFUkUgZGlzYnVyc2VkX2F0IDwgPyBHUk9VUCBCWSAxIE9SREVSIEJZIDEiIiIsIGNvbiwgcGFyYW1zPSgiMjAyNi0xMC0wMSIsKSkKbVsibWEzIl0gPSBtWyJkaXNidXJzZWQiXS5yb2xsaW5nKDMpLm1lYW4oKQptWyJtYTNfeW95Il0gPSAxMDAgKiAobVsibWEzIl0gLyBtWyJtYTMiXS5zaGlmdCgxMikgLSAxKQptLnRhaWwoMSkgICAgIyAyMDI2LTA5ICBtYTMgMTkgOTk5IDg1NiA2NjcgwrcgYSB5ZWFyIGVhcmxpZXIgMTUgNjM0IDIwNiA2NjcgwrcgKzI3LjkgJQoKKzI3LjkgJTogdGhlIDMtbW9udGggYXZlcmFnZSByZWFjaGVkIDIwLjAgYm4gaW4gU2VwdGVtYmVyIDIwMjYgYWdhaW5zdCAxNS42IGJuIGEgeWVhciBlYXJsaWVyIOKAlCBncm93dGgsIGJ1dCBtdWNoIHNsb3dlciB0aGFuIHRoZSArNDDigJM3MCAlIG9mIHRoZSBmaXJzdCBoYWxmIG9mIDIwMjYuClRoZSBzaW5nbGUgbW9udGggc2F5cyArMTYgJSAoMTcuMCB2cyAxNC42IGJuKSwgd2hpY2ggaXMgd2h5IHRoZSB0aXRsZSBzaG91bGQgcXVvdGUgdGhlIGF2ZXJhZ2U6IG9uZSB3ZWFrIFNlcHRlbWJlciBtb250aCB3b3VsZCBvdGhlcndpc2Ugc2V0IHRoZSBzdG9yeS4KRHJvcHBpbmcgT2N0b2JlciAyMDI2IG1hdHRlcnMgaGVyZSB0b286IHdpdGggdGhlIG9uZS1kYXkgbW9udGggbGVmdCBpbiwgdGhlIGxhc3Qgcm93IGlzIGEgY3Jhc2gsIG5vdCBTZXB0ZW1iZXIu"}
```

<!-- challenge:end -->
