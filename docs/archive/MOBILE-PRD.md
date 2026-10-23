# Scholars Drill — Mobile Product Requirements, for design

> **Superseded 22 October 2026 by [WEB-PRD.md](../WEB-PRD.md).** Kept for reference: the design target switched back to web.

**Version:** 1.0
**Date:** 27 September 2026
**For:** UI/UX design
**Live build:** https://scholars-drill.vercel.app
**Supersedes for design purposes:** [PRD.md](../PRD.md), [APP-STRUCTURE.md](../APP-STRUCTURE.md), [AI-STUDY-MODE.md](../AI-STUDY-MODE.md). Those stay the engineering record; this is the one document design needs.

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
| **P2** | **The DSA tutorial student.** Already paying DSA, attends class, wants to practise after. | Sign in with existing details, never asked to register twice |
| **P3** | **The parent.** Pays, wants proof of progress. Not designed for in v1, but they will look over a shoulder. | Progress that reads clearly to a non-student |

### Their phone is the constraint

- **Mid-range Android, small screen.** Design to **360 × 640** first. Check 390 and 414. Tablet and desktop are a stretch, not the target.
- **Data is metered and expensive.** Every image has to earn its place. No video, no decorative photography, no heavy libraries.
- **The network drops.** Especially mid-quiz. A dropped connection must never look like lost work.
- **One hand, often standing.** Primary actions belong within thumb reach at the bottom, not the top.
- **Screen time is interrupted.** A student practises in 10 minute gaps. Everything resumes where they left it.

**Mobile is not a shrunk desktop.** The quiz experience in particular must be designed for the phone and tested on real devices.

---

## 3. Design principles

1. **Exam realism where it counts.** The CBT simulation copies the real JAMB interface. Practising on a different layout is practising the wrong thing (section 7).
2. **Trust is visible.** Verified answers, worked solutions, and a report control on every question. Never let AI or anything else present an unchecked answer as fact.
3. **Frugal by default.** Assume a slow connection and a data cap. A student should be able to finish a drill on a bad network.
4. **Nothing is lost.** Answers save as they are picked. Refresh, phone call, tunnel: the attempt survives.
5. **Say what happened.** Errors explain the problem and the fix, in plain English. No spinner without a reason attached.
6. **One primary action per screen.** Scanned, not read.

---

## 4. What is already built

Design should extend this, not replace it. All of it is live and can be opened on a phone right now.

| Screen | Path | Notes |
|---|---|---|
| Homepage | `/` | Hero with a **working sample question** visitors can answer before signing up |
| Log in | `/login` | Shared DSA credentials |
| Sign up | `/signup` | Five steps: account, about you, what you are preparing for, parent or guardian, review |
| Verify email | `/verify` | 4-digit code, resend |
| Forgot password, reset | `/forgot-password`, `/reset-password/[token]` | |
| Dashboard | `/dashboard` | **Placeholder.** Real design needed |

### The design system in the build

Design in these tokens, or tell us what to change. Both themes are already implemented and the app follows the phone's light or dark setting.

| Token | Light | Dark | Use |
|---|---|---|---|
| canvas | `#F6F7FA` | `#0B0D12` | Page background |
| surface | `#FDFDFE` | `#12151C` | Cards, sheets |
| tint | `#EEF1FB` | `#141A2D` | Selected, brand-tinted fills |
| ink | `#111318` | `#ECEEF3` | Primary text |
| muted | `#535A6B` | `#9BA1B0` | Secondary text |
| line | `#E1E4EC` | `#242836` | Borders, dividers |
| brand | `#002EFF` | `#2A4DFF` | Primary actions. DSA cobalt |
| brand-ink | `#0027D6` | `#8FA6FF` | Brand text and links |
| good / good-soft | `#047857` / `#E8F8F0` | `#34D399` / `#0C2A20` | Correct |
| bad / bad-soft | `#BE123C` / `#FDEEF1` | `#FB7185` / `#2D1017` | Incorrect, errors |

**Type:** Geist, with Geist Mono for numbers, codes and timers.
**Shape:** primary actions are full pills; cards and sheets 16px; inputs and answer options 12px. One accent colour only. Green and red mean answer state, never decoration.

---

## 5. Information architecture

Signed out: Home, Log in, Sign up, Verify, Forgot password.

Signed in, four destinations in a bottom tab bar:

```
   Home          Practice        Progress         Profile
   dashboard     modes + CBT     history, stats   account, plan
```

Everything else is pushed on top of those: a drill setup, the quiz runner, a result, a review, a topic. **The quiz runner hides the tab bar** — nothing should invite a student out of a timed exam by accident.

---

## 6. Screens to design

Ordered by build sequence. For every screen we need: default, loading, empty, error, and offline where it applies.

### 6.1 Onboarding — after first sign-up

**Job:** learn enough to recommend a first drill, in under a minute.

Asks, one idea per screen: which exam, which year, which subjects, target score. Optional: current average, how long per day they can practise.

- Skippable, resumable, and never shown twice.
- A DSA student arrives with exam and subjects already known: confirm rather than ask.
- Ends by dropping them straight into a first drill, not back at a dashboard.

### 6.2 Home (dashboard)

**Job:** answer "what do I do now" in one tap.

- **Continue practising** as the single primary action: resumes an unfinished attempt, otherwise starts a recommended drill.
- Daily drill: a small, finishable thing ("10 questions, 5 minutes").
- Weak areas: two or three topics with accuracy and a Practise button each.
- Recent activity: last few attempts with score and subject.
- Progress at a glance: questions attempted, accuracy, streak if we build it.

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

Then a **setup screen before every attempt**: title, subject, topics, question count, estimated duration, difficulty, mode, instructions. The timer does not start until they tap Start.

Empty result matters here: "No questions match that combination" needs a way back, not a dead end.

### 6.4 The CBT runner — the centrepiece

**Design this to feel like the real JAMB CBT**, on a phone. A candidate should recognise it.

```
┌──────────────────────────────┐
│ Use of English      01:47:12 │  timer always visible
├──────────────────────────────┤
│ ‹ English  Maths  Physics  › │  subject tabs, swipe or tap
├──────────────────────────────┤
│ Question 14 of 60            │
│                              │
│ A body starts from rest and  │
│ accelerates uniformly...     │
│                              │
│  ○ A.  0 m/s                 │
│  ● B.  5 m/s                 │
│  ○ C.  10 m/s                │
│  ○ D.  20 m/s                │
│                              │
│                     ⚑ Flag   │
├──────────────────────────────┤
│  ‹ Prev      14/60      Next ›│
│  ▦ Questions        Submit   │  grid opens as a bottom sheet
└──────────────────────────────┘
```

Rules that come from the real exam and from our backend:

1. **Four options, A to D**, letter visible beside each.
2. **Subject tabs.** One sitting spans several subjects and the candidate moves freely between them. Default UTME shape: four subjects, English 60 questions and 40 each for the rest, 180 in 120 minutes.
3. **One countdown for the whole sitting.** Warnings at sensible intervals. Auto-submits at zero with a clear message.
4. **The question grid** shows answered, unanswered, flagged and current, per subject. On a phone it is a bottom sheet, not a permanent panel.
5. **No feedback during the exam.** No right or wrong, no explanation, no running score.
6. **Submit asks first:** "You have answered 31 of 40. 9 remain unanswered." with Continue quiz and Submit.
7. **Saving is visible but quiet.** A small "Saved" or "Saving…" state, and an unmissable banner if the connection drops, with answers still accepted.
8. **The timer belongs to the server.** The display can drift; the server decides when time is up. Design the case where a student submits and is told the time had already expired.

Also design: on-screen calculator, and how the student leaves an attempt on purpose (with a warning).

### 6.5 Practice runner

Same question layout, different behaviour: feedback immediately after each answer.

- Correct or incorrect, with the correct option marked, plus the worked solution.
- Why the option they chose is wrong, where we have it.
- Bookmark and report controls on every question.
- Untimed. Previous and Next only.

**Correct and incorrect must never be colour alone** — icon and words as well, for colour-blind students and bright sunlight.

### 6.6 Result and review

Immediately after submit:

- Score, percentage, correct / incorrect / unanswered, time used.
- A sentence that means something: "Good attempt. You were strong in indices and algebra but lost marks in probability."
- Per subject and per topic accuracy, weakest first, each with a Practise button.
- Then a per-question review: the question, their answer, the correct answer, the working, and a report control.

Design the **review list for scanning**: 40 questions is a long scroll, so wrong answers need to be findable at a glance.

### 6.7 Progress

- Accuracy and questions attempted over time.
- Per subject and per topic breakdown, weakest first.
- History: every attempt with date, mode, subject, question count, score, accuracy, time. Tapping one opens its result.

Keep charts legible on a 360px screen: few data points, labels that fit, no dense grids.

### 6.8 Profile, plan and settings

Profile, exam and target, subjects, notification settings, password change, log out.

**Free versus paid:** free students get capped practice and basic performance data; paying students get the full bank, more practice and advanced analytics. Design the cap being reached as an honest moment, not a trap: say what the limit is, what upgrading gives, and let them carry on with what is free. **Pricing and tier names are not settled — see section 11.**

### 6.9 AI study mode (later, design last)

Not v1. Worth knowing the shape so nothing blocks it:

- **Corrections:** "why was I wrong", on demand after answering.
- **Topic guidance:** a small, topic-scoped tutor a student opens from a weak topic. It teaches, works one example, then pushes them back into practice.
- **Study plan:** ranked topics with a reason per topic and a question count.

Two design constraints: AI output always carries a "This doesn't look right" control, and **AI is unavailable during a timed attempt**.

---

## 7. States and edge cases to design

The ones that will otherwise be missed:

- **Offline mid-quiz.** Answers still accepted, queued, synced on reconnect.
- **Reconnected.** Brief confirmation that work is saved.
- **Time expired while away.** Student returns to a submitted attempt.
- **Resumed attempt.** Comes back to the right question with answers intact.
- **Second device or tab.** One live attempt; the other joins the same one rather than starting another.
- **Empty filter result.** No questions for that exam, subject and year.
- **Free cap reached.** Mid-session, explained.
- **Question reported.** Confirmation, and what happens next.
- **Slow load.** Skeletons shaped like the content, not spinners.
- **API unreachable.** Say the server is unreachable, not "invalid credentials".
- **Brand new account.** Every screen with zero data.

---

## 8. Accessibility

- Touch targets **44 × 44px** minimum, with real spacing between answer options.
- Contrast **WCAG AA** in both themes. Test the dark theme separately.
- Labels above inputs, errors below, never placeholder-as-label.
- Answer state uses icon plus text plus colour.
- Visible keyboard focus on every control.
- Screen reader announcements for anything that changes without a tap: saving, time warnings, validation.
- Honour reduced motion.

---

## 9. Performance budget

These shape the design, so they are design constraints:

- Meaningful content on screen in **under 3 seconds on 3G**.
- No decorative imagery in the practice flow at all.
- Animation is CSS-level: transitions and small reveals. No animation library.
- Any illustration must work as SVG at a few KB.
- The question screen must be usable without waiting for anything non-essential.

---

## 10. Content and tone

- Plain English, short sentences. Our reader is 17 and may be tired.
- Use the vocabulary they use: JAMB, UTME, WAEC, NECO, Post-UTME, Jambite, "past questions".
- Encouraging without being childish. This is an exam, and they are nervous.
- Never invent numbers, testimonials or student counts in mockups. Mark sample data as sample.
- Buttons say what happens: Start, Submit, Practise Probability.

---

## 11. Open questions for product

Design can proceed without these, but they will change specific screens:

1. **Pricing and tier names.** One document says Gold ₦2,000 and Platinum ₦4,000 one-time; the live plan system is duration based. What each tier includes is undecided.
2. **Gamification.** XP, levels, streaks, badges, daily drills, weekly challenges and leaderboards are specified but scheduled after v1. Decide whether v1 shows a streak at all, because it changes the dashboard.
3. **English comprehension passages.** JAMB puts one passage in front of several questions. The question bank does not model that yet, so the reading layout is undesigned.
4. **Parent view.** Parent accounts exist in the system with no screens. Out of v1, but it is coming.

---

## 12. What design does not need to cover

- **The admin and content-manager areas.** Owned separately and not part of this brief.
- **Anything that writes to DSA's tutorial side.** Classes, attendance, fees.

---

## 13. What we need back

1. **Screens at 360px**, with 390 and 414 checked. Tablet only where it is cheap.
2. **Both themes.** Dark is not an afterthought here; a lot of practice happens at night.
3. **Every state**, per section 7, not just the happy path.
4. **A component library**: buttons, inputs, answer option, question grid cell, timer, subject tabs, bottom tab bar, bottom sheet, cards, badges, toasts, skeletons, empty and error states.
5. **An interactive prototype of the CBT runner**, because it is the screen that has to feel right: tab between subjects, answer, flag, open the grid, submit.
6. **Handoff tokens** mapped to section 4, so the build can use them directly.

Start with the CBT runner and the result screen. They are the product; everything else supports them.
