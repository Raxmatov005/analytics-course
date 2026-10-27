# Who does what in a lending company

Learn the people before the metrics: every request you will ever get comes from one of these desks. For each: what they own, what they ask the analyst, and which Nur Finance tables answer it.

| Role | Owns | A typical request to you | Tables |
|---|---|---|---|
| **Portfolio manager** (Bekzod) | the size, mix and quality of the loan book | "Outstanding by product and branch, this month vs last; where did PAR30 move?" | loans, installments, payments, products, branches |
| **Risk / credit analyst** (Nilufar) | the scoring rules and approval policy | "FPD by vintage and channel for the last 6 months — did the June rule change help?" | applications, loans, installments, payments |
| **Collections head** (Sevara) | getting late money back | "Contact rate and cure rate per collector; which actions actually lead to payment?" | collections_actions, staff, payments, installments |
| **BI / dashboard specialist** (Timur) | the company's dashboards and their refresh | "Build a measure for DPD buckets that works at any date, and document the grain." | all, through a warehouse model |
| **Product analyst** | the app and its funnel | "Where do we lose people between 'view offer' and 'submit'? By device and version." | app_events, applications, customers |
| **Finance / FP&A** | revenue, cost, provisions | "Interest income by month and product; cost of risk." | installments, payments, loans |
| **Data engineer** | the pipelines that fill the tables | "Which source fields do you need daily, and at what grain?" | — (they build what you specify) |
| **Data scientist** (Jasur) | the scoring model | "Pull a labelled sample: loans with 90+ DPD within 12 months, with features at application time." | applications, loans, installments, payments, customers |
| **Branch manager** | one office's sales and staff | "My officers' approvals and FPD, this quarter." | applications, staff, loans |

**Who asks for what?** Eight requests landed in your inbox on Monday. Sort each one to the desk that sent it — the words in the request give it away.

```game
{"type": "sort", "id": "roles-sort", "title": "Who asks for what", "q": "Put each request under the role that sends it.", "groups": {"Portfolio manager": ["Outstanding by product and branch, this month vs last", "Which region grew fastest — and did its PAR30 move?"], "Risk / credit analyst": ["FPD by vintage: did the June rule change help?", "Approval rate by score band after the new cut-off"], "Collections head": ["Cure rate per collector, last month", "Which contact actions actually lead to a payment?"], "Product analyst": ["Where do people drop between 'view offer' and 'submit'?", "Did app version 3.2 lower conversion on Android?"]}}
```

## How a request becomes work

1. **Restate it as a metric with a definition** ("PAR30 = outstanding of loans with DPD > 30 ÷ total outstanding, as of month-end").
2. **Find the grain** (one row per loan? per month per product?).
3. **Name the tables and the joins.**
4. **Compute, check against a number they already trust, then present** — a table or chart with the definition written under it.

Step 4's check is what separates an analyst from a query writer: if your approval rate is 71 % and the monthly report says 64 %, you found either a definition difference (cancelled in the denominator?) or a bug — both are worth a sentence to the requester.

## Russian terms

портфельный менеджер — portfolio manager · риск-аналитик / кредитный аналитик — risk analyst · взыскание — collections · BI-аналитик / дашборд-специалист — BI specialist · продуктовый аналитик — product analyst · дата-инженер — data engineer · скоринг — scoring.
