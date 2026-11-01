"""Week 1 Day 2: AND, OR, NOT and the bracket trap as a story (apply with: python -I scripts/stories/apply.py w1d2).
Inserted once at the top of the topic "AND, OR, NOT — combining conditions, with brackets", before its playground."""
from common import build as _b

G0 = [[8, "b", "sme"], [12, "m", "oth"]]
G = [[3, "b", "sA", "g"], [2, "b", "sN", "y"], [3, "b", "sR"], [4, "m", "oA", "g"], [3, "m", "oN", "y"], [5, "m", "oR"]]
LEG = [["b", ("SME (product 5)", "SME (продукт 5)")], ["m", ("other products", "другие продукты")],
       ["ring-g", ("approved", "approved — одобрено")], ["ring-y", ("approved, not disbursed", "approved_not_disbursed")]]

STORIES = [
 {"id": "w01d2-s1", "min": 4, "extra": True, "title": ("Twenty applications and one WHERE", "Двадцать заявок и один WHERE"), "steps": [
  {"show": {"kind": "dots", "blocks": [8, 12], "labels": [("SME", "SME"), ("other products", "другие продукты")], "groups": G0,
            "legend": [["b", ("SME (product 5)", "SME (продукт 5)")], ["m", ("other products", "другие продукты")]]},
   "say": ("20 loan applications, one dot each. {b|Blue} = SME (product 5), {m|grey} = every other product.",
           "20 заявок на заём, по точке на каждую. {b|Синие} — SME (продукт 5), {m|серые} — все остальные продукты.")},
  {"show": {"groups": G, "legend": LEG},
   "say": ("Each application also has a status. A {g|green ring} = approved, an {y|amber ring} = approved but not disbursed yet, no ring = rejected.",
           "У каждой заявки есть ещё статус. {g|Зелёное кольцо} — approved (одобрено), {y|жёлтое кольцо} — одобрено, но не выдано, без кольца — отказ.")},
  {"show": {"fade": ["oA", "oN", "oR"]}, "f": ("WHERE product_id = 5  →  8 rows", "WHERE product_id = 5  →  8 строк"),
   "say": ("WHERE keeps a row only when its condition is **true** for that row. `WHERE product_id = 5` → the {b|8} SME rows.",
           "WHERE оставляет строку, только если условие для неё **истинно**. `WHERE product_id = 5` → {b|8} строк SME.")},
  {"show": {"fade": ["sN", "sR", "oA", "oN", "oR"]}, "f": ("product_id = 5 AND status = 'approved'  →  3 rows", "product_id = 5 AND status = 'approved'  →  3 строки"),
   "say": ("**AND** needs **both** to be true: SME **and** approved → {g|3} rows. Every AND makes the result smaller (or the same).",
           "**AND** требует, чтобы были истинны **оба** условия: SME **и** одобрено → {g|3} строки. Каждый AND делает результат меньше (или таким же).")},
  {"say": ("Guess before you look.", "Угадайте, прежде чем смотреть."),
   "ask": {"q": ("`product_id = 5 OR status = 'approved'` — how many rows?", "`product_id = 5 OR status = 'approved'` — сколько строк?"),
           "options": (["3", "12", "15"], ["3", "12", "15"]), "answer": 1,
           "why": ("OR keeps a row when **at least one** is true: all 8 SME rows plus the 4 approved rows of other products = 12.",
                   "OR оставляет строку, если истинно **хотя бы одно** условие: все 8 строк SME плюс 4 одобренные строки других продуктов = 12.")}},
  {"show": {"fade": ["oN", "oR"]}, "f": ("product_id = 5 OR status = 'approved'  →  12 rows", "product_id = 5 OR status = 'approved'  →  12 строк"),
   "say": ("There they are: {b|8} SME rows and {g|4} more approved ones. OR makes the result bigger (or the same).",
           "Вот они: {b|8} строк SME и ещё {g|4} одобренные. OR делает результат больше (или таким же).")},
  {"show": {"fade": ["sA", "oA"]}, "f": ("NOT status = 'approved'  →  13 rows", "NOT status = 'approved'  →  13 строк"),
   "say": ("**NOT** flips a condition: `NOT status = 'approved'` keeps every row that is **not** approved → 13 rows.",
           "**NOT** переворачивает условие: `NOT status = 'approved'` оставляет все строки, которые **не** одобрены → 13 строк.")},
  {"show": {"fade": ["sR", "oA", "oN", "oR"], "box": ["sA", "sN"]}, "f": "",
   "say": ("Our real question: SME applications we said **yes** to — approved **or** approved-not-disbursed. That is {g|3} + {y|2} = **5** rows.",
           "Наш настоящий вопрос: заявки SME, которым мы сказали **да**, — approved **или** approved_not_disbursed. Это {g|3} + {y|2} = **5** строк.")},
  {"show": {"fade": ["sR", "oA", "oR"], "box": ["oN"]},
   "f": ("product_id = 5 AND status = 'approved' OR status = 'approved_not_disbursed'  →  {o|8 rows}", "product_id = 5 AND status = 'approved' OR status = 'approved_not_disbursed'  →  {o|8 строк}"),
   "say": ("Written without brackets, SQL does **AND first** (like × before +): (SME AND approved) OR (any not-disbursed). Result: {o|8 rows} — 3 rows of **other products** sneak in (framed).",
           "Без скобок SQL выполняет **AND первым** (как × раньше +): (SME AND approved) OR (любая не выданная). Итог: {o|8 строк} — пролезли 3 строки **других продуктов** (в рамке).")},
  {"show": {"fade": ["sR", "oA", "oN", "oR"], "box": ["sA", "sN"]},
   "f": ("product_id = 5 AND (status = 'approved' OR status = 'approved_not_disbursed')  →  {g|5 rows}", "product_id = 5 AND (status = 'approved' OR status = 'approved_not_disbursed')  →  {g|5 строк}"),
   "say": ("Brackets say what belongs together: SME AND (either status) → back to {g|5}. **When AND and OR meet, always write brackets.**",
           "Скобки говорят, что относится друг к другу: SME AND (любой из двух статусов) → снова {g|5}. **Когда встречаются AND и OR, всегда ставьте скобки.**")},
  {"show": {"fade": [], "box": []}, "say": ("Last one.", "Последний вопрос."),
   "ask": {"q": ("`a OR b AND c` — what does SQL do first?", "`a OR b AND c` — что SQL выполнит первым?"),
           "options": (["a OR b", "b AND c"], ["a OR b", "b AND c"]), "answer": 1,
           "why": ("AND binds tighter, like × before +: it means a OR (b AND c).", "AND связывает сильнее, как × раньше +: это a OR (b AND c).")}},
 ]},
]


def build(lang):
    return _b(STORIES, lang)

INSERT = [("w01d2-s1", "AND, OR, NOT — combining conditions", "AND, OR, NOT — соединяем условия")]
