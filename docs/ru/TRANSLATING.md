<!-- Rules for the Russian copy of the course. Not linked from the site (Docsify ignores it unless opened by hand). -->

# Russian copy of the course — rules

Every English page `docs/X.md` has a Russian copy at `docs/ru/X.md` (same relative path, same file name).
Quiz ids, hand-in ids and progress are shared, so the two copies must stay **structurally identical**: same
sections in the same order, same fenced blocks, same HTML, only the human-readable words in Russian.

## Translate
- All prose, headings, lists, tables, blockquotes, `<summary>` text, HTML text nodes, `title=`/`alt=` text.
- Comments inside SQL / Python code blocks (`-- ...`, `# ...`).
- Inside fenced JSON blocks (`quiz`, `challenge`, `sqltask`, `game`, `sqlplay`): only the values a learner reads —
  `q`, `options`, `explain`, `title`, `text` (when it is a sentence), `hint`, `intro`, item labels, etc.
- Natural, clear Russian for a beginner analyst; address the reader as «вы». Keep the tone of the original.

## Never change
- Code itself: SQL / Python / DAX / Excel formulas, table and column names, string literals that are data
  values (region names, product codes, statuses …), file names, numbers, dates.
- JSON keys, `id`, `check`, `lesson`, `file`, `answer` indexes, numeric answers, `tol`, `pass`, booleans.
  Keep the JSON valid (escape `"` inside strings as `\"`). The block must stay on the same lines layout as the original.
- For quiz questions of `"type": "text"`: keep every original English answer and **add** the Russian
  equivalents to the `answer` array (e.g. `["having", "HAVING clause", "оператор HAVING"]`). Keep code answers as is.
- HTML comments like `<!-- challenge:end -->`, HTML tags, attributes, class names, `data-*`.
- Links: keep every link target exactly as in English (`weeks/week-01/day-2.md`, `/`, `#/...`).
  The site sends them to the Russian copies on its own.
- Labels that are codes: **P1**, **T18**, **Q3**, **HW 2.1** → keep the Latin code (`**P1.**` stays `**P1.**`);
  you may translate the words after it (`HW 2.1` → `ДЗ 2.1` is NOT allowed; keep `HW 2.1`).
- Emoji and the `📖` / `STORY` markers at the start of story blockquotes (keep `STORY` in Latin if it is there).
- People's names (Bekzod, Sevara …) — transliterate to Cyrillic the usual way (Бекзод, Севара).
- Company name: «Nur Finance» stays in Latin.

## Headings keep their English anchor
Docsify builds section ids from heading text. To keep `?id=` links and the menu stable across languages, every
`##` and `###` heading gets the English id at the end with Docsify's `:id=` syntax. The id is the English heading
lower-cased, punctuation removed (keep letters, digits, spaces, `-`), spaces → `-`.
```
## 4. Hand in              →   ## 4. Сдача работы :id=4-hand-in
### Filtering a period     →   ### Фильтр по периоду :id=filtering-a-period
## Day quiz                →   ## Тест дня :id=day-quiz
```
(`1. Self-check` → `1-self-check`; `What's next?` → `whats-next`; `A/B test` → `ab-test`.)

## Fixed words (the scripts read some of them — use exactly these)
| English | Русский |
|---|---|
| `<summary>Answer` | `<summary>Ответ` |
| `<summary>Answers` | `<summary>Ответы` |
| `<summary>Model answer` | `<summary>Образец ответа` |
| `<summary>Model answers` | `<summary>Образцы ответов` |
| `(open after submitting)` | `(открыть после сдачи)` |
| `<summary>Result` | `<summary>Результат` |
| `<summary>Check` | `<summary>Проверка` |
| Checkpoint (in a day's `#` title) | Контрольная |
| Day quiz | Тест дня |
| Daily challenge | Задача дня |
| Self-check | Самопроверка |
| Homework / HW | Домашнее задание (keep `HW 2.1` codes) |
| Hand in | Сдача работы |
| Week N · Day N | Неделя N · День N |
| Stretch | Со звёздочкой |
| Practice day | Пробный день |
| SQL playground | SQL-песочница |
| Database panel | панель «База данных» |
| loan / instalment / principal | кредит / платёж по графику / основной долг |
| outstanding (principal) | остаток долга |
| overdue / DPD | просрочка / DPD |
| portfolio | портфель |
| vintage | поколение (винтаж) |
| default | дефолт |
| dashboard | дашборд |
| funnel / retention / cohort | воронка / удержание / когорта |
| query | запрос |
| join | соединение (JOIN) |
| window function | оконная функция |
| view | представление (VIEW) |
| pivot table | сводная таблица |
| hypothesis test | проверка гипотезы |
| confidence interval | доверительный интервал |
| capstone | итоговый проект |
| mentor | ментор |
| branch | филиал |
