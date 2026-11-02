# Your AI helper

> 🧭 **What this page is for.** How to ask an AI about anything in the course, with **your own ChatGPT**, three ways, from quickest to most powerful.

## 1. The "Ask AI" button: the quickest

Every section of a lesson has an **Ask AI** button in its top-right corner (a speech bubble; on a phone, just the bubble).

1. Tap it and write what is not clear, for example *"why do we divide by n − 1 here?"*. You can also leave it empty: then it asks for a simpler explanation of the whole section.
2. Tap **Ask ChatGPT**. Your ChatGPT opens in a new tab with the section's text, the tutor's rules and your question already written.
3. If the message box there is empty (a very long section, or the phone app), paste it: the button has copied everything. Use **Ctrl+V**, or on a phone long-press → **Paste**.

It works on a phone too: be signed in to ChatGPT in the browser or the app.

## 2. A ChatGPT project with the whole course: once, about 5 minutes

Use this for questions that go across lessons, such as *"how does the LEFT JOIN from Week 2 help with the cohorts in Week 8?"*. ChatGPT then has the whole course in front of it.

1. Download the three course files, in English or in Russian. The answers to the tasks are deliberately not inside.
   - English: <a href="ai/course-en-1.md" download>part 1 (Weeks 0–3)</a> · <a href="ai/course-en-2.md" download>part 2 (Weeks 4–6)</a> · <a href="ai/course-en-3.md" download>part 3 (Weeks 7–9)</a>
   - Russian: <a href="ai/course-ru-1.md" download>part 1</a> · <a href="ai/course-ru-2.md" download>part 2</a> · <a href="ai/course-ru-3.md" download>part 3</a>
2. In ChatGPT: **Projects → New project**, name it *Analytics course*.
3. **Add files**: the three files.
4. **Instructions**: paste the text below.
5. Ask your questions inside that project. When your mentor tells you the course changed, download the files again and replace them.

```text
You are my patient tutor for the "Analytics Learning" course (the project files are the whole course). I am a beginner data analyst; English is my second language.
- Explain simply and step by step, with a small everyday example and, when it helps, a tiny table. Use the course's own terms and say which week, day and section you mean.
- For a homework, checkpoint or exam task: do NOT give me the finished answer, query or final numbers. Give a hint, the method and a similar example, then let me try.
- If you are not sure a number is right, tell me how to check it on the course data instead of guessing.
- End with one short question to check I understood.
```

## 3. Codex in VS Code: when the course folder is on your computer

From Week 5 you may keep the course folder on your computer for the notebooks. Then:

1. Open the course folder in **VS Code**.
2. Install the **Codex** extension and sign in with your ChatGPT account.
3. Ask, for example: *"Explain section 2 of docs/weeks/week-05/day-3.md with a smaller example."*

The folder has a file called `AGENTS.md` that gives Codex the same tutor rules. Codex can also run a query on `data/raw/nur.db` or a notebook cell to **check your own work**. It is not there to write your homework.

## Worth knowing

- **It explains; it does not do the work.** The rules ask every helper above for hints and methods, never finished answers, and your mentor's review reads your own reasoning.
- **AI can be wrong, numbers most of all.** If it disagrees with the course, the course data wins: run the query and see. Still unsure? Ask your mentor (💬 in the bot).
- **Your chats stay in your own ChatGPT account.** The course does not see them, and the button sends nothing anywhere by itself.

<details><summary>Why is the helper not built into the page?</summary>

A website cannot spend your ChatGPT plan. OpenAI lets apps that run **on your own computer** use it (that is how Codex in VS Code works), and websites only after OpenAI approves them. A web page is also not allowed to keep your ChatGPT sign-in. So the course does it the other way round: it brings the lesson to your ChatGPT.

</details>

<details><summary>For the mentor: the same with Claude</summary>

In mentor preview every section also has **Ask Claude**: it opens claude.ai with the same text. For questions across the course, make a **Claude project** with the same three files and the same instructions. In Claude Code, open the course folder and ask.

</details>
