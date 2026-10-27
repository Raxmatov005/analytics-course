# How a Learn section is written (the standard, from 2026-10-28)

The first redesign made every section *interactive*. This standard makes every Learn section **clear and
complete**. It applies to `## N. Learn` and `## N. Worked example` on every day, English and Russian. The model
to copy is **Week 2 Day 1, section 1 (joins)**.

## 1. One concept = one `###` subsection, always in this order

```
### <Concept name in plain words>            e.g. "### LEFT JOIN — keep every row of the left table"

**What it is.** One or two sentences. The term in bold the first time. No story here.

**How to write it.** The syntax as a short ```sql (or python / formula) block with the parts named in
comments. Then one real example on Nur Finance data — a runnable box — and ONE sentence that reads the result
aloud ("14 587 rows: 14 000 applications + 587 customers who never applied").

**When you use it.** 1–3 bullet lines: the questions this concept answers. If it is easy to confuse with the
previous concept, a 2–4 row table "X vs Y" with the difference in one column.

> ⚠️ **Watch out.** (only if there is a real trap) one trap, one sentence, one fix.

**Your turn.** One small ```task (or a ```game) that uses exactly this concept and nothing newer.
```

Nothing else goes in a subsection. If a thought does not fit one of these five slots, it belongs in another
subsection, in the Worked example, or nowhere.

## 2. Coverage: teach the whole topic, not the convenient half

Before writing a day, list every concept a standard textbook chapter on that topic covers and give each one
its own subsection, in an order where every subsection uses only what came before. Then add a short
`### Putting it together` subsection that shows the concepts combined. Examples of what "whole topic" means:

- **Joins** (W2D1): why join · INNER JOIN · LEFT JOIN · INNER vs LEFT (the row that has no partner) · RIGHT JOIN
  · FULL OUTER JOIN · the anti-join (LEFT … IS NULL) · CROSS JOIN · joining a table to itself (self-join) ·
  many-to-one vs one-to-many (what happens to the row count) · chaining 3–4 tables: **the path** — which
  table connects which, drawn as `customers → loans → products` with the keys, including a hop *through* a
  table you do not display · putting it together.
- **Creating and changing tables** (W1D1 lab, W1D3, playground): CREATE TABLE (columns, types, PRIMARY KEY)
  · INSERT (one row, several rows, from a SELECT) · UPDATE … SET … WHERE · DELETE … WHERE · ALTER TABLE ·
  DROP TABLE · what WHERE does and does not protect you from — each one explained, shown and tried **before**
  the lab that combines them.
- **Aggregation** (W2D2): COUNT(*) vs COUNT(col) vs COUNT(DISTINCT) · SUM/AVG/MIN/MAX · GROUP BY one column ·
  two columns · HAVING vs WHERE · aggregate + join (the grain) · ORDER BY an aggregate · putting it together.
- **Window functions** (W3D1): what a window is · OVER () · PARTITION BY · ORDER BY inside OVER · running
  totals · ROW_NUMBER/RANK/DENSE_RANK · LAG/LEAD · frames (ROWS BETWEEN) · window vs GROUP BY · putting it
  together.
- The same completeness rule applies to Excel functions, pandas methods, statistical tests, DAX, metrics.

## 3. Wording

- Short sentences. One idea per sentence. Say the thing, then the reason: "LEFT JOIN keeps every customer.
  A customer with no application gets NULL in the application columns."
- **Bold the term** the first time it appears and in the subsection title; put the Russian term in italics
  once in the English page (*левое соединение*) and the English term once in the Russian page.
- The story (Bekzod asks for…) lives in the day's opening STORY block and in the Worked example — not inside
  Learn. In Learn, a request is at most one line of context before an example.
- Numbers from the data are always read aloud: not "7 828 rows come back", but "7 828 rows — one per loan,
  because every loan has exactly one customer".
- Avoid "notice that", "in other words", "of course", rhetorical questions, and sentences over ~25 words.
- Every code example is runnable as written in the page (or marked as a shape). SQL Server spellings go in a
  trailing comment, not in the prose.

## 4. Pictures where words are weak

For joins, set operations, window frames, the path between tables, pivots and data flows, add a small
diagram: a Markdown table that *is* the picture (two tiny tables and their joined result), or an ASCII sketch
in a ```text block. The join subsections each show the two tiny tables and the result rows.

## 5. The Worked example and the Practice follow the Learn order

- The Worked example walks one realistic request through the concepts **in the order Learn taught them**,
  naming the concept at each step ("step 2 — a LEFT JOIN, because branches with no loans must stay").
- Practice questions come in the same order as the subsections, each one labelled with the concept it
  trains (`**P4.** *(RIGHT JOIN)* …`), and every concept from Learn has at least one question.

## 6. Russian copy

Block for block as before (`docs/ru/TRANSLATING.md`). The structure labels are fixed: **Что это.** / **Как
пишется.** / **Когда применять.** / **Ваша очередь.** / `### Собираем вместе`.
