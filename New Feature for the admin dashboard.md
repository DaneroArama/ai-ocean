# Buildathon Role Discovery & Registration — Feature Brief

## 1. Purpose

Build a **bilingual event registration and role-discovery system** for the main offline Buildathon.

The goal is not to give participants a fixed personality label.

The goal is to help participants discover **which Buildathon roles may suit them**, especially participants who:

* Already have a profession but want to explore something different.
* Are unsure what role they want.
* Want to change career direction.
* Have no professional experience yet.
* Know what they like but don't know which role matches it.

The assessment should feel like a **casual conversation with a senior advisor**, not a job interview, psychological exam, or corporate questionnaire.

---

# 2. Event Structure

The platform supports two event stages:

```text
Event
│
├── Pre-Event
│   └── Panel Discussion
│       └── Simple Registration
│
└── Main Event
    └── Offline Buildathon
        └── Detailed Registration
            └── Role Discovery
```

The pre-event registration should remain simple.

The detailed assessment belongs to the **main Buildathon registration**.

---

# 3. Main Registration Flow

The Buildathon registration should use a multi-step experience:

```text
Basic Information
        ↓
Background
        ↓
Interests & Skills
        ↓
Role Discovery Assessment
        ↓
Recommended Roles
        ↓
Participant Chooses Role
        ↓
Buildathon Preferences
        ↓
Review
        ↓
Submit
```

The participant should be able to see their progress throughout the process.

---

# 4. Participant Information

Collect basic information such as:

* Name
* Email
* Phone
* University / Organization
* Current occupation
* Experience level
* Current profession
* Skills
* Interests
* Relevant Buildathon information

Keep **current profession**, **interests**, **assessment recommendations**, and **selected Buildathon role** as separate pieces of information.

Example:

```text
Current Profession:
Frontend Developer

Interests:
AI, Product, UX

Assessment Recommendations:
Product Manager
UX Researcher
Product Designer

Selected Buildathon Role:
Product Manager
```

The participant's selected role must never be automatically overwritten by the assessment.

---

# 5. Role Discovery Assessment

The assessment should determine **role affinity**, not diagnose personality.

Questions should be:

* Casual
* Situational
* Conversational
* Interesting
* Easy to understand
* Non-judgmental
* Relevant to real Buildathon situations

Avoid questions that sound like job interviews.

### Avoid

> "How good are you at leadership?"

> "How many years of project management experience do you have?"

### Prefer

> "Your team has three different ideas but only enough time to build one. What would you naturally want to do?"

Possible answers could represent:

* Research
* Product thinking
* Design
* Engineering
* Planning
* Communication

The participant should feel like they are **discovering themselves**, not taking an exam.

---

# 6. Question System

Use a **hybrid approach**.

### Initial assessment

Create a carefully designed set of pre-built core questions.

Recommended initial size:

**20–30 questions.**

### Question engine

Questions must be stored as configurable data rather than hardcoded into UI components.

Each question can contain:

```text
Question
├── ID
├── Category
├── Type
├── English content
├── Myanmar content
├── Options
├── Required
├── Scoring signals
├── Order
└── Active status
```

The system should eventually allow admins to add/edit questions, but a full form builder is **not required for the first version**.

---

# 7. Question Types

Initial support should focus on:

* Single choice
* Multiple choice
* Scenario-based questions
* Optional scale/rating questions

Avoid unnecessary question types initially.

---

# 8. Role Scoring

Each answer can contribute hidden signals toward multiple roles.

Example:

```text
Answer A

Product Manager     +3
UX Researcher       +2
Project Manager     +1
```

The participant should **never see these scores**.

Do not make answer positions directly represent roles.

Avoid:

```text
A = PM
B = Designer
C = Developer
D = Researcher
```

Instead, shuffle answer positions while keeping the underlying option/scoring identity unchanged.

---

# 9. Role Categories

The system should support a comprehensive Buildathon role ecosystem.

Possible roles include:

### Product

* Product Manager
* Product Strategist
* Business Analyst

### Design

* Product Designer
* UI Designer
* UX Designer
* UX Researcher
* Visual Designer

### Engineering

* Frontend Developer
* Backend Developer
* Full-Stack Developer
* Mobile Developer
* AI/ML Engineer
* DevOps / Cloud Engineer

### Data / AI

* Data Analyst
* Data Scientist
* AI Engineer

### Business / Growth

* Marketing
* Growth
* Business Development
* Content Strategist

### Team / Communication

* Project Manager
* Agile / Scrum Facilitator
* Presentation / Pitch Lead

The initial implementation can use a smaller set, but the system should be extensible.

---

# 10. Recommendation System

The assessment should produce **multiple recommended roles**, not one definitive answer.

Example:

```text
🥇 Product Manager — 92%
🥈 UX Researcher — 84%
🥉 Product Designer — 78%
```

Each recommendation should include a short explanation:

> "You seem to enjoy understanding problems, connecting ideas, and helping teams decide what to build."

The result should communicate:

> **These are possibilities, not labels.**

---

# 11. Participant Choice

After receiving recommendations, the participant chooses their actual Buildathon role.

Example:

```text
Recommended:

Product Manager
UX Researcher
Product Designer

Which role would you like to explore?

[ Product Manager ]
[ UX Researcher ]
[ Product Designer ]
[ Other ]
```

A participant may choose a role completely different from the recommendation.

This is intentional.

The system recommends.

**The participant decides.**

---

# 12. Response Quality

The system should include lightweight response-quality mechanisms.

Do **not** simply mark someone invalid because they selected mostly A/B/C/etc.

A participant may legitimately have strong preferences.

Instead use:

* Randomized answer positions
* Similar concepts asked from different perspectives
* Contrasting/scenario questions
* Consistency signals
* Optional response timing signals
* Confidence scoring

The system should produce an internal confidence indicator such as:

```text
Recommendation:
Product Manager — 82%

Confidence:
High
```

or:

```text
Product Manager — 72%

Confidence:
Moderate
```

Low-confidence results should not be treated as failures.

Instead, show multiple possibilities and encourage exploration.

---

# 13. "I'm Not Sure" Option

Some participants genuinely don't know what they want.

Allow appropriate questions to include:

> "I'm not sure yet."

This is important.

The system should help uncertain participants explore roles instead of forcing them into an answer they don't identify with.

---

# 14. Separate Assessment From Registration

Registration questions and assessment questions should be separate concepts.

```text
Registration
├── Basic information
├── Background
├── Interests
└── Buildathon preferences

Assessment
├── Questions
├── Answers
├── Scoring
├── Recommendations
└── Confidence
```

This allows the assessment engine to be reused later.

---

# 15. Assessment Versioning

Every assessment should have a version.

Example:

```text
Buildathon Role Discovery v1
```

Participant results should record the version used.

If questions or scoring rules change later:

```text
Buildathon Role Discovery v2
```

Existing participant results must remain associated with v1.

This ensures old results remain reproducible.

---

# 16. Bilingual Support

Everything participant-facing must support:

```text
English
Myanmar
```

Questions and options should contain localized content.

Conceptually:

```text
Question
├── ID
├── EN
├── MY
└── Scoring
```

Changing language must **not change the underlying question IDs, answers, scores, or results**.

The analytics system should treat English and Myanmar responses identically.

---

# 17. Participant Dashboard

After registration, the participant should be able to view:

```text
My Event
├── Registration Status
├── Profile
├── Interests
├── Skills
├── Role Discovery Result
├── Recommended Roles
├── Selected Buildathon Role
├── Team
└── Event Schedule
```

Once teams are assigned:

```text
Your Team

Product Manager
UI/UX Designer
Frontend Developer
Backend Developer
AI Engineer
```

---

# 18. Admin / Organizer Data

The system should allow organizers to understand the participant pool.

Useful analytics include:

### Registration

* Total participants
* Registration completion
* Registration status
* Experience levels
* Occupations

### Interests

* Most popular interests
* Skill distribution
* Technology distribution

### Role Discovery

* Recommended role distribution
* Selected role distribution
* Recommendation vs selected role
* Confidence distribution

Example:

```text
Recommended:
Product Manager — 28%

Selected:
Product Manager — 21%
```

This could reveal interesting differences between what participants are naturally suited toward and what they actually want to try.

---

# 19. Team Formation

The system should be designed so the selected roles can later be used for team formation.

Example:

```text
Participant
      ↓
Selected Role
      ↓
Team Pool
      ↓
Team Formation
      ↓
Balanced Buildathon Team
```

The initial feature does **not necessarily need automatic team formation**.

But the data model should allow it later.

---

# 20. Core Principle

The entire feature should follow this philosophy:

```text
Ask casually
     ↓
Understand the participant
     ↓
Identify strengths/preferences
     ↓
Suggest possibilities
     ↓
Explain why
     ↓
Let the participant decide
```

Not:

```text
Ask questions
     ↓
Calculate personality
     ↓
Assign a role
```

### Product positioning

The feature should feel like:

> **"Not sure where you fit in a team? Let's explore where you could shine."**

rather than:

> **"Take this test to find out what job you are."**

That distinction should guide both the **UX and the assessment logic**.
