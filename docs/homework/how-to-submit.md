# How to submit homework

> 🧭 **What this page is for.** How homework travels from the lesson page to your mentor and back — and what the site checks for you before anyone reads it.

## On the lesson page — the normal way (no installs)

Every homework ends with a box. There are two kinds, sometimes both in one box:

- **🧑‍💻 Your workspace — SQL tasks.** Write each query, **▶ Run**, **✔ Check**. The site checks the numbers itself — ✅, or ❌ with the reason (the query did not run, a number is off, the row count is wrong) — on an untouched copy of the data, so nothing you did in the [SQL playground](playground.md) can spoil it. A ❌ never shows the answer: it means *look again*.
- **📎 Hand in — everything else.** Text parts go straight in the box (a few lines at least). Files — an Excel workbook, a notebook, a Power BI screenshot or file, a PDF — go in with **📎 Choose file**, up to 5 MB each.

**📤 Submit** opens when every required part is ✅ or filled in. It sends your queries **with the first rows of their results**, your texts and your files. Your mentor is told in the group's **📤 Homework** topic, and the box shows **✅ submitted** with the date. Your work in progress is saved in this browser, so you can stop and come back.

> 💡 **Key idea.** No screenshots of things the page can check. Your query and its result travel with the submission; the site has already compared the numbers. Upload only what the page cannot run: a workbook, a notebook, a dashboard.

## Sign in once

The site asks you to sign in the first time you open it on a device. If you skipped that, the box asks when you tap Submit — **🔑 sign in**:

1. Write your **name** and the **PIN** your mentor gave you.
2. Tap **Sign in**. The box now says *Signed in as …*.
3. Tap **📤 Submit**.

Once per device and browser. On another device, in another browser, or after clearing the browser's data, sign in again — your answers are still there. If the box says *"You were signed out"*, sign in again the same way. Forgot your PIN? Ask your mentor for a new one.

The course bot's *🔗 Connect this website* link still works too — it signs this browser in the same way.

> ⚠️ **Watch out.** A file over 5 MB will not go through the box. Send it as a zip to the course bot in **📤 Homework** instead.

## When it is due

The badge next to each Homework heading names the day it is due (*HW 1.1 — Due Day 3*): 23:59 Tashkent time on that day, and the menu shows the date. On time, full points are possible; one day late, ×0.8; later, ×0.5 ([the rules](progress.md)). Late is still better than never: always submit.

## What comes back

Within a day your mentor replies: what is right, what is wrong and **why**, how to fix it, and your points. The review appears on your **[My feedback](feedback.md)** page and in the hand-in box of the lesson, the bot tells you in **📤 Homework**, and the points appear on the [progress board](progress.md). Fix what it says and submit again if you want the fix reviewed (you don't lose points for a second try).

## Writing good answers

- **SQL:** get every task to ✅ first. Then the mentor reads *how* you wrote it — aliases, the filter you chose, a comment where you made a choice (`-- cancelled are out of the denominator`).
- **Text:** your own words. If you copied a sentence, say where from.
- **Not sure?** Write what you tried. Partial thinking is graded; a blank is not.

## The other way — GitHub (optional)

Analysts at work keep their files in a repository. If you want that habit now, push your files to `submissions/…` and tell the bot *I pushed it to GitHub instead* — it counts the same. The steps are in **[Tools at work](tools-at-work.md)**, together with installed database apps. Not needed for this course.
