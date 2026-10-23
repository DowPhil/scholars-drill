# Scholars Drill — Web Product Requirements, for design

**Version:** 2.0 (replaces the mobile-first brief, `MOBILE-PRD.md` 1.0)
**Date:** 22 October 2026
**For:** UI/UX design
**Live build:** https://scholars-drill.vercel.app
**Supersedes for design purposes:** [PRD.md](PRD.md), [APP-STRUCTURE.md](APP-STRUCTURE.md), [AI-STUDY-MODE.md](AI-STUDY-MODE.md). Those stay the engineering record; this is the one document design needs.

---

## 1. The product in one page

Scholars Drill is exam practice for Nigerian candidates sitting **JAMB, WAEC, NECO and Post-UTME**. A student picks what to practise, answers questions under real exam conditions, finds out immediately what they got wrong and why, and sees which topics are costing them marks.

It is the sister product of **Distinguished Scholars Academy (DSA)**, a tutorial centre in Ibadan. One account works on both: a DSA student signs in here with the email and password they already have.

The loop the whole product serves:

> **Practise → Understand → Improve → Repeat**

A student should always be able to answer four questions: what should I practise, how am I doing, where am I weak, and what do I do next.

**The one thing we cannot get wrong is answer accuracy.** Students distrust existing CBT apps because their answers are often wrong. Every design decision that touches an answer, an explanation, or a score has to reinforce that ours are checked.

---

## 2. Who we are designing for

| | Who | What they need |
|---|---|---|
| **P1** | **The independent candidate.** 16 to 19, anywhere in Nigeria, found us through search or a friend. No relationship with DSA. The growth market. | Free to start, obvious first drill, no jargon, no long forms before value |
| **P2** | **The DSA tutorial student.** Already paying DSA, attends class, wants to practise after. Often on a centre or school computer. | Sign in with existing details, never asked to register twice |
| **P3** | **The parent.** Pays, wants proof of progress. Not designed for in v1, but they will look over a shoulder. | Progress that reads clearly to a non-student |

### The screen and the network

- **Web first, laptop and desktop.** Design at **1280 × 800** and **1440 × 900**. Check 1024 (small laptop) and 768 (tablet).
- **Phones still have to work.** Many students will open the site on a phone. Every screen must stay usable at **360px** wide: no horizontal scroll, nothing cut off. It does not need its own design, just a layout that holds up.
- **The real exam is on a computer.** JAMB CBT is sat at a desktop with mouse and keyboard. Practising here at a desktop is the realistic case, so the CBT runner is designed for it first.
- **Data is metered and the network drops.** Desktop does not mean broadband. Many students share data from a phone hotspot. No video, no decorative photography, no heavy libraries. A dropped connection must never look like lost work.
- **Screen time is interrupted.** A student practises in short sessions, sometimes on a shared computer. Everything resumes where they left it, and logging out on a shared machine is easy to find.

---

## 3. Design principles

1. **Exam realism where it counts.** The CBT simulation copies the real JAMB interface. Practising on a different layout is practising the wrong thing (section 6.4).
2. **Trust is visible.** Verified answers, worked solutions, and a report control on every question. Never let AI or anything else present an unchecked answer as fact.
3. **Frugal by default.** Assume a slow connection and a data cap. A student should be able to finish a drill on a bad network.
4. **Nothing is lost.** Answers save as they are picked. Refresh, closed tab, dropped hotspot: the attempt survives.
5. **Say what happened.** Errors explain the problem and the fix, in plain English. No spinner without a reason attached.
6. **One primary action per screen.** Scanned, not read.
7. **Keyboard is a first-class input.** On a desktop a student should be able to sit a whole exam without touching the mouse.

---

## 4. What is already built

Design should extend this, not replace it. All of it is live and can be opened right now.

| Screen | Path | Notes |
|---|---|---|
| Homepage | `/` | Hero with a **working sample question** visitors can answer before signing up |
| Log in | `/login` | Shared DSA credentials |
| Sign up | `/signup` | Five steps: account, about you, what you are preparing for, parent or guardian, check and confirm |
| Verify email | `/verify` | Emailed code, resend. Code length to confirm (section 11) |
| Forgot password, reset | `/forgot-password`, `/reset-password/[token]` | |
| Dashboard | `/dashboard` | **Placeholder.** Real design needed |

### The design system in the build

Design in these tokens, or tell us what to change. Both themes are already implemented and the app follows the device's light or dark setting.

| Token | Light | Dark | Use |
|---|---|---|---|
| canvas | `#F6F7FA` | `#0B0D12` | Page background |
| surface | `#FDFDFE` | `#12151C` | Cards, panels |
| tint | `#EEF1FB` | `#141A2D` | Selected, brand-tinted fills |
| ink | `#111318` | `#ECEEF3` | Primary text |
| muted | `#535A6B` | `#9BA1B0` | Secondary text |
| line | `#E1E4EC` | `#242836` | Borders, dividers |
| brand | `#002EFF` | `#2A4DFF` | Primary actions. DSA cobalt |
| brand-ink | `#0027D6` | `#8FA6FF` | Brand text and links |
| good / good-soft | `#047857` / `#E8F8F0` | `#34D399` / `#0C2A20` | Correct |
| bad / bad-soft | `#BE123C` / `#FDEEF1` | `#FB7185` / `#2D1017` | Incorrect, errors |

**Type:** Geist, with Geist Mono for numbers, codes and timers.
**Shape:** primary actions are full pills; cards and panels 16px; inputs and answer options 12px. One accent colour only. Green and red mean answer state, never decoration.

---

## 5. Information architecture

Signed out: Home, Log in, Sign up, Verify, Forgot password.

Signed in, four destinations in a **left sidebar** on desktop:

```
┌────────────┬──────────────────────────────────────┐
│ ◆ Scholars │                                      │
│   Drill    │                                      │
│            │                                      │
│ ▸ Home     │          content                     │
│   Practice │                                      │
│   Progress │                                      │
│   Profile  │                                      │
│            │                                      │
│ ─────────  │                                      │
│ Plan: Free │                                      │
│ Log out    │                                      │
└────────────┴──────────────────────────────────────┘
```

| Destination | Holds |
|---|---|
| Home | Dashboard |
| Practice | Modes, CBT simulations, bookmarks |
| Progress | History, stats, reported questions |
| Profile | Account, plan and billing, notifications, settings |

Everything else opens inside those: a drill setup, a result, a review, a topic. The sidebar collapses to icons below 1024px and becomes a top bar with a menu below 768px.

**The quiz runner hides the sidebar and takes the full window** — nothing should invite a student out of a timed exam by accident.

---

## 6. Screens to design

Ordered by build sequence. For every screen we need: default, loading, empty, error, and offline where it applies.

### 6.1 Onboarding — after first sign-up

**Job:** learn enough to recommend a first drill, in under a minute.

Asks, one idea per step: which exam, which year, which subjects, target score. Optional: current average, how long per day they can practise.

- Skippable, resumable, and never shown twice.
- A DSA student arrives with exam and subjects already known: confirm rather than ask.
- Ends by dropping them straight into a first drill, not back at a dashboard.
- On desktop this can be a centred card, not a full-bleed wizard.

### 6.2 Home (dashboard)

**Job:** answer "what do I do now" in one click.

- **Continue practising** as the single primary action: resumes an unfinished attempt, otherwise starts a recommended drill.
- Daily drill: a small, finishable thing ("10 questions, 5 minutes").
- Weak areas: two or three topics with accuracy and a Practise button each.
- Recent activity: last few attempts with score and subject.
- Progress at a glance: questions attempted, accuracy, streak if we build it.

Desktop has room for these side by side. Keep the primary action dominant anyway; a grid of equal cards answers nothing.

Design the **empty state properly** — a brand new student has no history, no weak areas and no stats. That is the state most first-time users will see, and it must still feel like a product with a next step.

### 6.3 Practice — picker and setup

Five modes:

| Mode | The student chooses |
|---|---|
| Quick drill | Subject, number of questions |
| Topic practice | Subject, topic, number of questions |
| Mixed practice | Subject, questions drawn across its topics |
| Past questions | Exam, subject, year |
| Full CBT simulation | Picks a simulation an admin has published |

Then a **setup screen before every attempt**: title, subject, topics, question count, estimated duration, difficulty, mode, instructions. The timer does not start until they click Start.

Empty result matters here: "No questions match that combination" needs a way back, not a dead end.

The practice area also holds **Bookmarks**: every question the student saved, filterable by subject and topic, each one openable and practisable again.

### 6.4 The CBT runner — the centrepiece

**Design this to feel like the real JAMB CBT.** A candidate who has sat a JAMB mock at a centre should recognise it.

```
┌────────────────────────────────────────────────────────────────────┐
│ Scholars Drill · UTME Mock 3             ● Saved      ⏱ 01:47:12  │
├────────────────────────────────────────────────────────────────────┤
│ [Use of English] [Mathematics] [Physics] [Chemistry]               │
├───────────────────────────────────────────────┬────────────────────┤
│ Question 14 of 40                    ⚑ Flag   │ Mathematics        │
│                                               │ ┌──┬──┬──┬──┬──┐   │
│ A body starts from rest and accelerates       │ │ 1│ 2│ 3│ 4│ 5│   │
│ uniformly at 2 m/s². What is its velocity     │ ├──┼──┼──┼──┼──┤   │
│ after 2.5 s?                                  │ │ 6│ 7│ 8│ 9│10│   │
│                                               │ ├──┼──┼──┼──┼──┤   │
│  ○ A.  0 m/s                                  │ │11│12│13│▣ │15│   │
│  ● B.  5 m/s                                  │ └──┴──┴──┴──┴──┘   │
│  ○ C.  10 m/s                                 │ ■ answered         │
│  ○ D.  20 m/s                                 │ □ unanswered       │
│                                               │ ⚑ flagged          │
│                                               │                    │
│  ‹ Previous                         Next ›    │ [ Calculator ]     │
│                                               │ [ Submit ]         │
└───────────────────────────────────────────────┴────────────────────┘
```

Rules that come from the real exam and from our backend:

1. **Options lettered, letter visible beside each.** Four options, A to D, for JAMB. NECO and some Post-UTME papers use five (A to E): the option list must take a fifth without breaking (section 11).
2. **Subject tabs.** One sitting spans several subjects and the candidate moves freely between them. Default UTME shape: four subjects, Use of English 60 questions and 40 each for the rest, 180 in 120 minutes. Use full subject names; desktop has the room.
3. **One countdown for the whole sitting.** Always visible. Warnings at sensible intervals. Auto-submits at zero with a clear message.
4. **The question grid is a permanent side panel on desktop**, as in the real exam. It shows answered, unanswered, flagged and current, for the active subject. Below 1024px it moves into a panel the student opens.
5. **Keyboard shortcuts, as in the JAMB CBT.** A to D (or E) picks an option, N and P move next and previous, S opens submit. Show them once, at the start, and keep a small legend reachable.
6. **No feedback during the exam.** No right or wrong, no explanation, no running score.
7. **Submit asks first:** "You have answered 31 of 40. 9 remain unanswered." with Continue exam and Submit.
8. **Saving is visible but quiet.** A small "Saved" or "Saving…" state, and an unmissable banner if the connection drops, with answers still accepted.
9. **The timer belongs to the server.** The display can drift; the server decides when time is up. Design the case where a student submits and is told the time had already expired.
10. **Closing the tab is not leaving.** Warn on close, but the attempt survives; coming back resumes it.

Also design: the on-screen calculator (a floating panel that does not cover the question), and how the student leaves an attempt on purpose (with a warning).

### 6.5 Practice runner

Same question layout, different behaviour: feedback immediately after each answer.

- Correct or incorrect, with the correct option marked, plus the worked solution.
- Why the option they chose is wrong, where we have it.
- Bookmark and report controls on every question.
- Untimed. Previous and Next only. The side panel can hold progress through the drill instead of the exam grid.

**Correct and incorrect must never be colour alone** — icon and words as well, for colour-blind students and glare.

### 6.6 Result and review

Immediately after submit:

- Score, percentage, correct / incorrect / unanswered, time used.
- A sentence that means something: "Good attempt. You were strong in indices and algebra but lost marks in probability."
- Per subject and per topic accuracy, weakest first, each with a Practise button.
- Then a per-question review: the question, their answer, the correct answer, the working, and a report control.

Design the **review list for scanning**: 180 questions is long, so wrong answers need to be findable at a glance. A filter (All, Wrong, Unanswered, Flagged) and a jump grid like the runner's both work on desktop.

### 6.7 Progress

- Accuracy and questions attempted over time.
- Per subject and per topic breakdown, weakest first.
- History: every attempt with date, mode, subject, question count, score, accuracy, time. A sortable table on desktop; clicking a row opens its result.
- **Reported questions:** each question the student reported, its status (received, under review, corrected, no change) and what changed.

Keep charts honest and legible: few series, labelled axes, no dense grids. They still have to read at 360px.

### 6.8 Profile, plan and settings

Profile, exam and target, subjects, notification settings, password change, log out.

**Notifications.** A bell in the sidebar opens a short list: report outcomes, plan expiry, daily drill reminders if we send them.

**Free versus paid:** free students get capped practice and basic performance data; paying students get the full bank, more practice and advanced analytics. Design the cap being reached as an honest moment, not a trap: say what the limit is, what upgrading gives, and let them carry on with what is free. **Pricing and tier names are not settled — see section 11.**

**Plan and billing**, the flow behind the upgrade button:

- Plans compared side by side, with what each includes.
- Pay online by card or transfer through **Paystack**, which opens its own checkout.
- Or pay offline (bank deposit) and **upload proof**, then wait for approval. Design the pending state, the approved state and the rejected state with its reason.
- Current plan, when it ends, and the **expired** state, where paid features stop and free ones carry on.

### 6.9 AI study mode (later, design last)

Not v1. Worth knowing the shape so nothing blocks it:

- **Corrections:** "why was I wrong", on demand after answering.
- **Topic guidance:** a small, topic-scoped tutor a student opens from a weak topic. It teaches, works one example, then pushes them back into practice. On desktop this can sit beside the question.
- **Study plan:** ranked topics with a reason per topic and a question count.

Two design constraints: AI output always carries a "This doesn't look right" control, and **AI is unavailable during a timed attempt**.

---

## 7. Question content

The question is the product, and real questions are messier than the sample.

- **Diagrams and images.** Questions can carry an image (circuits, graphs, geometry, biology diagrams). Design where it sits relative to the stem and options, how it scales, and a click-to-enlarge. It must load fast and never push the options off screen on a laptop.
- **Maths and science notation.** Fractions, powers, roots, chemical formulas, units. Design how they look inline and in the options, in both themes.
- **Long stems and long options.** Some options are full sentences. The layout must hold four or five of them without a cramped column.
- **Comprehension passages.** JAMB Use of English puts one passage in front of several questions. Desktop is the place to show the passage and question side by side. The question bank does not model passages yet (section 11), so design it, marked as pending.

---

## 8. States and edge cases to design

The ones that will otherwise be missed:

- **Offline mid-exam.** Answers still accepted, queued, synced on reconnect.
- **Reconnected.** Brief confirmation that work is saved.
- **Time expired while away.** Student returns to a submitted attempt.
- **Resumed attempt.** Comes back to the right question with answers intact.
- **Second tab or device.** Behaviour not decided (section 11). Design the message either way.
- **Tab closed mid-exam.** Warning on close; resume on return.
- **Empty filter result.** No questions for that exam, subject and year.
- **Free cap reached.** Mid-session, explained.
- **Plan expired.** Paid features off, free ones on, renewal one click away.
- **Offline payment pending, approved, rejected.**
- **Question reported.** Confirmation, and where to follow it up.
- **Slow load.** Skeletons shaped like the content, not spinners.
- **API unreachable.** Say the server is unreachable, not "invalid credentials".
- **Brand new account.** Every screen with zero data.

---

## 9. Accessibility

- Full keyboard operation, including the whole CBT runner. Visible focus on every control.
- Touch targets **44 × 44px** minimum where the layout is used on touch (phones, tablets, touch laptops), with real spacing between answer options.
- Contrast **WCAG AA** in both themes. Test the dark theme separately.
- Labels above inputs, errors below, never placeholder-as-label.
- Answer state uses icon plus text plus colour.
- Screen reader announcements for anything that changes without a click: saving, time warnings, validation.
- Content stays readable at 200% browser zoom.
- Honour reduced motion.

---

## 10. Performance budget

These shape the design, so they are design constraints:

- Meaningful content on screen in **under 3 seconds on a 3G hotspot**.
- No decorative imagery in the practice flow at all. Question images are content and are the only exception.
- Animation is CSS-level: transitions and small reveals. No animation library.
- Any illustration must work as SVG at a few KB.
- The question screen must be usable without waiting for anything non-essential.

---

## 11. Content and tone

- Plain English, short sentences. Our reader is 17 and may be tired.
- Use the vocabulary they use: JAMB, UTME, WAEC, NECO, Post-UTME, Jambite, "past questions".
- Encouraging without being childish. This is an exam, and they are nervous.
- Never invent numbers, testimonials or student counts in mockups. Mark sample data as sample.
- Buttons say what happens: Start, Submit, Practise Probability.

---

## 12. Open questions for product

Design can proceed without these, but they will change specific screens:

1. **Pricing and tier names.** One document says Gold ₦2,000 and Platinum ₦4,000 one-time; the live plan system is duration based. What each tier includes is undecided.
2. **Gamification.** XP, levels, streaks, badges, daily drills, weekly challenges and leaderboards are specified but scheduled after v1. Decide whether v1 shows a streak at all, because it changes the dashboard.
3. **English comprehension passages.** The question bank does not model a passage shared by several questions yet, so the reading layout in section 7 is provisional.
4. **Parent view.** Parent accounts exist in the system with no screens. Out of v1, but it is coming.
5. **Second tab or device during a timed exam.** Joining the same attempt is friendly and survives a dropped device; blocking it is stricter against cheating. PRD.md raises the trade-off; it needs a decision.
6. **Five options.** Whether NECO and Post-UTME questions with an option E are in the v1 bank.
7. **Post-UTME format.** Each university runs its own. Decide whether Post-UTME gets the JAMB layout or a generic one.
8. **Verification code length.** The brief said 4 digits; the built input accepts up to 6. Confirm what the DSA backend sends so the input matches.

---

## 13. What design does not need to cover

- **The admin and content-manager areas.** Owned separately and not part of this brief.
- **Anything that writes to DSA's tutorial side.** Classes, attendance, fees.

---

## 14. What we need back

1. **Screens at 1280 and 1440**, with 1024 and 768 checked, and **every screen shown holding up at 360**.
2. **Both themes.** Dark is not an afterthought; a lot of practice happens at night.
3. **Every state**, per section 8, not just the happy path.
4. **A component library**: buttons, inputs, answer option, question grid cell, timer, subject tabs, sidebar, panels and dialogs, cards, badges, toasts, skeletons, tables, empty and error states.
5. **An interactive prototype of the CBT runner**, because it is the screen that has to feel right: switch subjects, answer by click and by keyboard, flag, use the grid, open the calculator, submit.
6. **Handoff tokens** mapped to section 4, so the build can use them directly.

Start with the CBT runner and the result screen. They are the product; everything else supports them.
