"""Week 2 Day 4: NULL's logic as a story (apply with: python -I scripts/stories/apply.py w2d4).
Inserted once at the top of the topic "NULL — the value that is not there"."""
from common import build as _b

G0 = [[8, "b", "known"], [2, "y", "null"]]
G = [[5, "b", "low"], [3, "p", "high"], [2, "y", "null"]]

STORIES = [
 {"id": "w02d4-s1", "min": 4, "title": ("Ten customers, two unknown incomes", "Десять клиентов, два неизвестных дохода"), "steps": [
  {"show": {"kind": "dots", "groups": G0, "cols": 5,
            "legend": [["b", ("income on file", "доход записан")], ["y", ("NULL: no income on file", "NULL: дохода нет в базе")]]},
   "say": ("10 customers, one dot each. For {y|2} of them the income cell is empty: **NULL**. NULL means **unknown** — not zero, not an empty text.",
           "10 клиентов, по точке на каждого. У {y|2} из них ячейка дохода пустая: **NULL**. NULL значит **неизвестно** — не ноль и не пустой текст.")},
  {"f": ("COUNT(*) − COUNT(monthly_income) = 10 − 8 = {y|2}", "COUNT(*) − COUNT(monthly_income) = 10 − 8 = {y|2}"),
   "say": ("`COUNT(*)` counts rows: 10. `COUNT(monthly_income)` counts only the **known** values: 8. The difference is how many are missing: {y|2}.",
           "`COUNT(*)` считает строки: 10. `COUNT(monthly_income)` считает только **известные** значения: 8. Разница — сколько пропущено: {y|2}.")},
  {"show": {"fade": ["known", "null"]}, "f": ("WHERE monthly_income = NULL  →  0 rows", "WHERE monthly_income = NULL  →  0 строк"),
   "say": ("Find them with `WHERE monthly_income = NULL`? It finds **nothing**. “Is this unknown income equal to unknown?” — the answer is *unknown*, and WHERE keeps only rows where the answer is **true**.",
           "Найти их через `WHERE monthly_income = NULL`? Не найдётся **ничего**. «Равен ли неизвестный доход неизвестному?» — ответ *неизвестно*, а WHERE оставляет только строки с ответом **истина**.")},
  {"say": ("Check the rule.", "Проверим правило."),
   "ask": {"q": ("What is `NULL = NULL`?", "Чему равно `NULL = NULL`?"),
           "options": (["true", "false", "unknown — so WHERE drops the row"], ["истина", "ложь", "неизвестно — и WHERE отбрасывает строку"]), "answer": 2,
           "why": ("Two unknowns may or may not be equal, so SQL says *unknown*. That is why you never write `= NULL`.",
                   "Два неизвестных могут быть равны, а могут и нет, поэтому SQL отвечает *неизвестно*. Вот почему никогда не пишут `= NULL`.")}},
  {"show": {"fade": ["known"]}, "f": ("WHERE monthly_income IS NULL  →  {y|2 rows}", "WHERE monthly_income IS NULL  →  {y|2 строки}"),
   "say": ("`IS NULL` asks the right question — “is it missing?” — and that answer is true or false, never unknown → {y|2} rows.",
           "`IS NULL` задаёт правильный вопрос — «пропущено?» — и ответ на него всегда истина или ложь, а не «неизвестно» → {y|2} строки.")},
  {"show": {"groups": G, "fade": ["high", "null"],
            "legend": [["b", ("under 5 m", "меньше 5 млн")], ["p", ("5 m or more", "5 млн и больше")], ["y", ("NULL", "NULL")]]},
   "f": ("WHERE monthly_income < 5  →  5 rows", "WHERE monthly_income < 5  →  5 строк"),
   "say": ("`WHERE monthly_income < 5` (million) keeps the {b|5} small incomes. The {y|NULL} rows drop out silently: nobody knows if they are small.",
           "`WHERE monthly_income < 5` (миллионов) оставляет {b|5} маленьких доходов. Строки с {y|NULL} тихо выпадают: никто не знает, маленькие ли они.")},
  {"show": {"fade": ["low", "null"]}, "f": ("< 5 → 5 rows · NOT (< 5) → 3 rows · 5 + 3 = 8, not 10", "< 5 → 5 строк · NOT (< 5) → 3 строки · 5 + 3 = 8, а не 10"),
   "say": ("And `NOT (monthly_income < 5)`? The {p|3} big ones — and the NULL rows drop out **again**: NOT of unknown is still unknown. Two opposite filters together miss 2 customers.",
           "А `NOT (monthly_income < 5)`? {p|3} больших — и строки с NULL выпадают **снова**: NOT от неизвестного — всё ещё неизвестно. Два противоположных фильтра вместе теряют 2 клиентов.")},
  {"show": {"fade": []}, "say": ("Now averages.", "Теперь средние."),
   "ask": {"q": ("The 8 known incomes add up to 40 m. What does `AVG(monthly_income)` return?", "8 известных доходов в сумме дают 40 млн. Что вернёт `AVG(monthly_income)`?"),
           "options": (["40 ÷ 10 = 4 m", "40 ÷ 8 = 5 m"], ["40 ÷ 10 = 4 млн", "40 ÷ 8 = 5 млн"]), "answer": 1,
           "why": ("AVG skips NULL: it divides by the 8 known values, not by all 10 rows.", "AVG пропускает NULL: делит на 8 известных значений, а не на все 10 строк.")}},
  {"f": ("monthly_income * 12 → NULL for 2 rows  ·  COALESCE(monthly_income, 0)", "monthly_income * 12 → NULL для 2 строк  ·  COALESCE(monthly_income, 0)"),
   "say": ("Arithmetic with NULL gives NULL: `monthly_income * 12` is NULL for those 2. `COALESCE(monthly_income, 0)` puts a value in its place — do it only when 0 really is the truth.",
           "Арифметика с NULL даёт NULL: `monthly_income * 12` — NULL для этих двоих. `COALESCE(monthly_income, 0)` подставляет значение вместо NULL — делайте так, только если 0 и правда верен.")},
 ]},
]


def build(lang):
    return _b(STORIES, lang)

INSERT = [("w02d4-s1", "NULL — the value that is not there", "NULL — значение, которого нет")]
