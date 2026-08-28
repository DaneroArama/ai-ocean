# Ocean Archetype Personality Test — Feature Brief

## 1. Feature Overview

**Ocean Archetype** is an interactive personality/work-style assessment designed to help users discover the way they naturally approach work, collaboration, problem-solving, creativity, and decision-making.

The assessment measures users across five Ocean Archetypes:

| Letter | Archetype        | Character | Animal    | Core Style                  |
| ------ | ---------------- | --------- | --------- | --------------------------- |
| **O**  | The Orchestrator | Otto      | Octopus   | People & collaboration      |
| **C**  | The Catalyst     | Sharkie   | Shark     | Action & momentum           |
| **E**  | The Evaluator    | Croco     | Crocodile | Accuracy & risk awareness   |
| **A**  | The Artisan      | Crabbi    | Crab      | Creativity & refinement     |
| **N**  | The Navigator    | Turty     | Turtle    | Understanding & consistency |

The user completes **15 primary statements**, receives a score for each archetype, and is assigned the archetype with the highest score.

If there is a tie between the highest-scoring archetypes, a **16th tie-breaker question** determines the final result.

The test is available to both:

* **Registered users**
* **Guests**

Both user types receive the same testing experience and scoring logic. The difference is primarily how their attempt/result is associated and categorized in analytics.

---

# 2. Primary Goals

The feature should:

1. Provide a simple and engaging personality-test experience.
2. Allow users to take the test without requiring registration beforehand.
3. Determine the user's strongest Ocean Archetype.
4. Present a detailed and visually engaging result.
5. Support both English and Myanmar languages.
6. Track test behavior and results for analytics.
7. Distinguish **registered users** and **guests** in analytics.
8. Handle ties fairly through a dedicated tie-breaker.
9. Detect potentially invalid/unreliable response patterns.
10. Allow guests to optionally save their result or create an account after testing.

---

# 3. User Types

There are two types of users who can take the test.

## Registered User

A user who is already authenticated.

```text
userType = REGISTERED
```

Their test attempt can be directly associated with their account.

```text
userId → authenticated user
```

## Guest User

A user who is not authenticated.

```text
userType = GUEST
```

A guest should be able to complete the test without creating an account.

A guest attempt can be associated with an anonymous session identifier.

```text
userId = null
sessionId → anonymous session
```

---

# 4. Recommended User Acquisition Flow

Registration should **not be required before taking the test**.

The preferred flow is:

```text
Landing
   ↓
Ocean Archetype Introduction
   ↓
Start Test
   ↓
15 Questions
   ↓
Tie-breaker if necessary
   ↓
Calculate Result
   ↓
Result
   ↓
Optional Save / Create Account
```

### Why registration comes after the test

The user should first experience the value of the feature.

Requiring registration before a 15-question personality test introduces unnecessary friction and can reduce completion.

The test itself should therefore be accessible to guests.

---

# 5. Registered User Flow

```text
Logged-in User
      ↓
Ocean Archetype
      ↓
Start Test
      ↓
15 Questions
      ↓
Tie-breaker if required
      ↓
Result
      ↓
Result associated with user account
```

The registered user does not need to provide their name or email again because the authenticated account already contains that information.

---

# 6. Guest User Flow

```text
Guest
  ↓
Ocean Archetype
  ↓
Start Test
  ↓
15 Questions
  ↓
Tie-breaker if required
  ↓
Result
  ↓
View Result
  ↓
Optional "Save My Result"
  ↓
Name + Email
  ↓
Save Result / Create Account
```

The guest should **not** be required to provide personal information before taking the test.

---

# 7. Guest Name & Email

After completing the test, the guest may be asked for:

* Name
* Email

However, these fields should only be collected if there is an actual product purpose.

### Email

Email is useful if the product wants to:

* Send the result to the user.
* Allow result retrieval later.
* Convert the guest into a registered user.
* Associate the result with a future account.

### Name

Name is optional unless it is used in the experience.

For example:

> Hey Danero, you're Otto! 🐙

If the name is not used anywhere, there is little reason to require it.

### Recommended UX

```text
Your Ocean Archetype is ready 🌊

Want to save your result?

Name
[________________]

Email
[________________]

[ Save My Result ]

Already have an account? Sign in

[ Continue as Guest ]
```

**Registration should remain optional.**

---

# 8. Quiz Structure

The main assessment consists of:

* **15 statements**
* **5 archetypes**
* **3 statements per archetype**
* **1–5 rating scale**
* Randomized question order
* No normal reverse-scored questions

Each archetype has exactly three primary statements.

```text
O → O1, O2, O3
C → C1, C2, C3
E → E1, E2, E3
A → A1, A2, A3
N → N1, N2, N3
```

---

# 9. Rating Scale

Each statement uses a five-point rating scale.

| Score | Response          |
| ----: | ----------------- |
| **1** | Strongly disagree |
| **2** | Disagree          |
| **3** | Neutral           |
| **4** | Agree             |
| **5** | Strongly agree    |

An alternative user-facing wording is:

| Score | Response           |
| ----: | ------------------ |
| **1** | Not like me at all |
| **2** | Not like me        |
| **3** | In between         |
| **4** | Quite like me      |
| **5** | Very much like me  |

The product should choose **one wording system consistently** throughout the test.

---

# 10. Question Randomization

The 15 questions **must be shuffled** before the test begins.

Users should not see the archetype grouping.

Bad:

```text
O1
O2
O3
C1
C2
C3
E1
E2
E3
...
```

Preferred:

```text
N2
C1
A3
O2
E1
C3
N1
A1
O3
E3
C2
N3
A2
O1
E2
```

The question's archetype must remain attached to the question internally.

For example:

```text
{
  id: "O2",
  archetypeId: "O",
  statement: {
    en: "...",
    mm: "..."
  }
}
```

The frontend should **never determine scoring based on question position**.

---

# 11. Question Content

## O — The Orchestrator

**Character:** Otto
**Animal:** Octopus

### Traits

* Empathetic
* Perceptive
* Versatile

### Motto

> "Nothing moves without people."

### Statements

**O1**

> I enjoy being around people more than working alone.

**Myanmar:**

> တစ်ဦးတည်း အလုပ်လုပ်ရခြင်းထက် အခြားသူများနှင့်အတူ ပူးပေါင်းလုပ်ဆောင်ရခြင်းကို ပိုမိုနှစ်သက်ပါသည်။

**O2**

> I can tell when someone is unhappy with a decision but hasn't said so.

**Myanmar:**

> တစ်ယောက်ယောက်က ဆုံးဖြတ်ချက်တစ်ခုကို မကျေနပ်ပေမယ့် ထုတ်မပြောဘူးဆိုရင်တောင် သူ့ရဲ့သဘောထားကို ခန့်မှန်းနားလည်နိုင်တယ်။

**O3**

> I'd rather keep several things moving than take one all the way through.

**Myanmar:**

> အလုပ်တစ်ခုတည်းကို အဆုံးအထိ အာရုံစိုက်လုပ်တာထက် အလုပ်တွေကို တစ်ပြိုင်နက်တည်း စီမံလုပ်ဆောင်ရတာကို ပိုသဘောကျတယ်။

---

# 12. C — The Catalyst

**Character:** Sharkie
**Animal:** Shark

### Traits

* Driven
* Bold
* Decisive

### Motto

> "Progress comes from action."

### Statements

**C1**

> I get impatient when a conversation goes on without any progress.

**C2**

> I lose interest in work that doesn't visibly change anything.

**C3**

> I'd rather take a risk than wait for the perfect plan.

Myanmar translations are provided in the source specification and should be stored alongside their English equivalents.

---

# 13. E — The Evaluator

**Character:** Croco
**Animal:** Crocodile

### Traits

* Vigilant
* Protective
* Thorough

### Motto

> "Certainty is worth the time."

### Statements

**E1**

> I notice small errors that others might miss.

**E2**

> When someone describes a plan, I start picturing how it could go wrong.

**E3**

> I check things more times than most people think is necessary.

---

# 14. A — The Artisan

**Character:** Crabbi
**Animal:** Crab

### Traits

* Creative
* Curious
* Discerning

### Motto

> "Always curious. Always creating."

### Statements

**A1**

> I often look for a fresh approach instead of following the usual way.

**A2**

> I enjoy making small changes to see how they improve the result.

**A3**

> I make small changes most people would not notice.

---

# 15. N — The Navigator

**Character:** Turty
**Animal:** Turtle

### Traits

* Steady
* Systematic
* Deep

### Motto

> "Steady is its own kind of fast."

### Statements

**N1**

> I want to understand how something works before I use it.

**N2**

> It takes me a long time to get back into something after I am pulled away.

**N3**

> I keep a steady pace instead of working in bursts.

---

# 16. Scoring

Every answer receives a score from **1–5**.

Each archetype's score is calculated by summing its three statements.

```text
O Score = O1 + O2 + O3
C Score = C1 + C2 + C3
E Score = E1 + E2 + E3
A Score = A1 + A2 + A3
N Score = N1 + N2 + N3
```

Each archetype therefore has:

```text
Minimum score = 3
Maximum score = 15
```

Example:

```text
O = 13
C = 9
E = 11
A = 8
N = 12
```

Final result:

```text
O — The Orchestrator
```

---

# 17. Reverse Scoring

There is currently **no standard reverse scoring**.

All 15 primary statements are scored directly:

```text
1 → 1
2 → 2
3 → 3
4 → 4
5 → 5
```

Any reversed statement introduced for an edge case should be treated separately from the normal scoring model.

---

# 18. Tie-Breaker

If multiple archetypes share the highest score, the system should not randomly choose one.

Example:

```text
O = 13
C = 10
E = 13
A = 8
N = 11
```

There is a tie between:

```text
O
E
```

The user receives the 16th question.

### Tie-breaker Question

> **Almost done. Which of these sounds most like you at work?**

The user chooses the statement that best represents them.

### Options

**O — The Orchestrator**

> I keep track of how everyone's doing.

**C — The Catalyst**

> I'd rather get moving than get it perfect.

**E — The Evaluator**

> I'm the one who spots what everyone missed.

**A — The Artisan**

> I care how it turns out, not just that it's done.

**N — The Navigator**

> I want to understand it properly before I touch it.

### Important Implementation Rule

Only the **tied highest archetypes** should be shown.

If O and E are tied:

```text
O — I keep track of how everyone's doing.
E — I'm the one who spots what everyone missed.
```

Do not show C, A, and N.

The selected archetype becomes the final result.

---

# 19. Same-Answer Edge Case

The system should detect when the user selects the exact same rating for every primary statement.

Examples:

```text
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
```

or:

```text
5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
```

This may indicate that the user is answering without differentiating between statements.

### Required behavior

1. Detect identical responses.
2. Provide feedback encouraging the user to reconsider/retest.
3. Introduce a reversed statement/check where appropriate.
4. Avoid silently treating the result as a normal high-confidence result.

The exact UX and scoring behavior for the reversed check should be finalized during implementation.

---

# 20. Result Page

After scoring, the user should receive a dedicated archetype result page.

The result should contain:

### Identity

```text
Your Ocean Archetype

🐙

Otto

The Orchestrator
```

### Traits

```text
Empathetic
Perceptive
Versatile
```

### Motto

> "Nothing moves without people."

### Description

Use the predefined archetype description.

### Wave Concept

Each archetype has a corresponding way of "riding the wave":

| Archetype | Wave       |
| --------- | ---------- |
| O         | Together   |
| C         | Forward    |
| E         | Safely     |
| A         | Gracefully |
| N         | Steadily   |

This should become part of the visual storytelling of the result.

---

# 21. Archetype Descriptions

## Otto — The Orchestrator

Otto is happiest around people.

Otto reads the room more than the task. Who has gone quiet, who is holding back, who hasn't really agreed yet.

Otto would rather keep several things going at once than disappear into one, because staying close to everything is how nothing gets lost.

Not everyone says what they're thinking, but Otto usually knows anyway.

When a team starts to drift apart, Otto brings people back together, makes sure everyone is heard, and helps everyone ride the wave **together**.

---

## Sharkie — The Catalyst

Sharkie wants to see things move.

Sharkie learns by doing, trying things out, and adjusting along the way.

By the time a discussion reaches a conclusion, Sharkie is usually a step past it.

Not every path is clear from the beginning, but Sharkie knows that waiting forever means missing the moment.

When a team feels stuck, Sharkie gets things moving, makes decisions, and helps everyone ride the wave **forward**.

---

## Croco — The Evaluator

Croco sees what could go wrong.

Every plan has a version where it fails, and that is the one Croco is looking at.

The step that gets skipped, the case nobody thought of, the small mistake that survived the last check.

Croco goes back over things more times than most people would.

It takes longer. Croco does it anyway.

When a team is about to miss something, Croco spots it, speaks up, and helps everyone ride the wave **safely**.

---

## Crabbi — The Artisan

Crabbi shapes things until they feel right.

Crabbi looks for a fresh approach instead of taking the usual one, then keeps making small changes most people would never notice, guided by a sense that something is slightly off long before there are words for why.

Nobody asked for those last few changes. Crabbi makes them anyway.

When a team wants something that feels right, Crabbi shapes it, adjusts it, and helps everyone ride the wave **gracefully**.

---

## Turty — The Navigator

Turty wants to know how things work.

Before starting, Turty wants to see how the parts fit together, because building on something you do not understand tends to cost more later.

Turty keeps a steady pace rather than working in bursts, and once deep in a problem, coming back from an interruption takes a long time.

It looks slower from the outside. It usually is not.

When a team needs something that will hold, Turty works it out from the ground up and helps everyone ride the wave **steadily**.

---

# 22. Analytics

Analytics should distinguish between:

```text
REGISTERED
GUEST
```

This distinction should be attached to every test attempt.

### Example

```text
testAttempt
├── testId
├── userType
├── userId
├── sessionId
├── startedAt
├── completedAt
├── scores
├── finalArchetype
├── tieBreakerUsed
└── completed
```

### Registered

```text
userType: REGISTERED
userId: <authenticated-user-id>
```

### Guest

```text
userType: GUEST
userId: null
sessionId: <anonymous-session-id>
```

If a guest later creates an account, the existing attempt should ideally be capable of being associated with the newly created account rather than creating a duplicate attempt.

---

# 23. Analytics Requirements

The analytics system should be able to answer:

### User segmentation

* How many registered users took the test?
* How many guests took the test?
* What percentage of attempts are guest vs registered?

### Archetype distribution

* Most common archetype overall.
* Most common archetype among registered users.
* Most common archetype among guests.

### Completion

* Test starts.
* Test completions.
* Abandoned tests.
* Completion rate.
* Drop-off by question.

### Result behavior

* Number of O results.
* Number of C results.
* Number of E results.
* Number of A results.
* Number of N results.
* Number of ties.
* Number of tie-breakers used.
* Number of same-answer patterns detected.

### Guest conversion

Potentially track:

```text
Guest takes test
      ↓
Completes test
      ↓
Views result
      ↓
Clicks Save Result
      ↓
Provides email
      ↓
Creates account
```

This allows the team to understand whether the test is successfully converting anonymous visitors into registered users.

---

# 24. Privacy & Data Collection

Guest users should not be forced to provide personal information merely to see their result.

Recommended principle:

> **Collect the minimum information necessary for the feature's purpose.**

Analytics can work without name/email:

```text
GUEST
sessionId
test result
scores
timestamps
```

Name/email should only be collected when there is a clear purpose such as saving, emailing, or account creation.

---

# 25. Localization

The feature supports:

* English (`en`)
* Myanmar (`mm`)

Every statement should have both translations.

Example:

```text
{
  id: "O1",
  archetypeId: "O",
  statement: {
    en: "I enjoy being around people more than working alone.",
    mm: "တစ်ဦးတည်း အလုပ်လုပ်ရခြင်းထက်..."
  }
}
```

The archetype IDs should remain language-independent:

```text
O
C
E
A
N
```

Do not create separate scoring identifiers for different languages.

---

# 26. Recommended Data Architecture

Keep the test content separate from the quiz logic.

### Archetype

```text
Archetype
├── id
├── name
├── character
├── animal
├── traits
├── motto
├── description
└── wave
```

### Question

```text
Question
├── id
├── archetypeId
├── statement.en
└── statement.mm
```

### Test Attempt

```text
TestAttempt
├── testId
├── userType
├── userId
├── sessionId
├── answers
├── scores
├── finalArchetype
├── tieBreakerUsed
├── completed
├── startedAt
└── completedAt
```

This makes future content changes much easier without modifying the scoring engine.

---

# 27. Frontend UX Requirements

The test UI should be:

* Mobile responsive.
* Simple and distraction-free.
* One statement at a time.
* Clear 1–5 selection.
* Easy to change an answer before proceeding.
* Show test progress.
* Provide clear next/previous navigation where appropriate.
* Preserve answers while navigating.
* Prevent accidental loss of progress.

Example:

```text
Ocean Archetype

Question 7 of 15
━━━━━━━━━━━━━━━○━━

I notice small errors that others might miss.

○ Strongly disagree
○ Disagree
○ Neutral
○ Agree
○ Strongly agree

              [Next]
```

The UI should avoid revealing which archetype the current question belongs to.

---

# 28. Final Recommended Flow

Putting everything together:

```text
                    LANDING
                       │
                       ↓
             Ocean Archetype Intro
                       │
                       ↓
                   Start Test
                       │
                       ↓
              ┌─────────────────┐
              │   15 Questions  │
              │   Randomized     │
              └────────┬────────┘
                       ↓
             Validate Responses
                       │
              ┌────────┴────────┐
              │                 │
        Same answers?           No
              │                 │
             Yes                ↓
              │              Calculate
       Retest / Check         Scores
              │                 │
              └────────┬────────┘
                       ↓
                 Highest Score
                       │
                ┌──────┴──────┐
                │             │
              Tie?          No Tie
                │             │
               Yes            │
                ↓             │
          16th Question       │
                │             │
                └──────┬──────┘
                       ↓
                 Final Result
                       │
             ┌─────────┴─────────┐
             │                   │
        Registered             Guest
             │                   │
       Save to account       View result
                                 │
                                 ↓
                         Optional Save Result
                                 │
                           Name + Email
                                 │
                                 ↓
                         Optional Account
```

---

# 29. MVP Acceptance Criteria

The feature is considered complete when:

* [ ] Both registered users and guests can take the test.
* [ ] Registration is **not required before testing**.
* [ ] The test contains 15 primary statements.
* [ ] Every archetype has exactly three statements.
* [ ] Statements are randomized.
* [ ] Each statement uses a 1–5 rating.
* [ ] Scores are correctly calculated per archetype.
* [ ] Highest score determines the result.
* [ ] Ties trigger the 16th question.
* [ ] Only tied archetypes appear in the tie-breaker.
* [ ] Same-answer patterns are detected.
* [ ] English and Myanmar content are supported.
* [ ] Registered attempts are categorized as `REGISTERED`.
* [ ] Guest attempts are categorized as `GUEST`.
* [ ] Registered attempts can be associated with the user's account.
* [ ] Guest attempts can exist without an account.
* [ ] Guest name/email collection occurs **after testing**, not before.
* [ ] Guest personal information is optional unless required for a specific feature.
* [ ] Results display the correct archetype information.
* [ ] Analytics can distinguish guest and registered activity.
* [ ] Test completion and abandonment can be measured.
* [ ] Tie-breaker usage can be measured.
* [ ] Guest-to-registration conversion can be measured if account creation is offered.

---

**1. Don't put a registration wall before the test.**
Let everyone experience the test.

**2. Don't require guest name/email just to get the result.**
Show the result first, then offer **"Save My Result"**.

**3. Treat `userType` as analytics metadata, not scoring logic.**

That gives you a clean architecture:

```text
                    SAME TEST
                       │
             ┌─────────┴─────────┐
             │                   │
        REGISTERED             GUEST
             │                   │
          userId              sessionId
             │                   │
             └─────────┬─────────┘
                       ↓
                  SAME SCORING
                       ↓
                  SAME RESULT
                       ↓
                DIFFERENT ANALYTICS
```

That's the approach I'd use for the production implementation.
