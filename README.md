# AI OCEAN — Personality Buildathon

AI-powered personality assessment that matches participants to their ideal team role. Built for buildathons and hackathons where teams need to form fast.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript (strict) |
| **Backend** | Convex (database, serverless functions, auth, real-time) |
| **Auth** | Convex Auth (Google OAuth, GitHub OAuth) |
| **Styling** | Tailwind CSS 4 |
| **Smooth Scroll** | Lenis |
| **Fonts** | Syncopate (headings), Quicksand (body), Syne (display) |
| **Deployment** | Vercel (frontend) + Convex Cloud (backend) |

## Architecture

```
ai-ocean/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (fonts, providers, SEO metadata)
│   ├── page.tsx                  # Landing page (Hero, Bento, Character, CTA)
│   ├── sitemap.ts                # Auto-generated sitemap
│   ├── globals.css               # Theme tokens, Lenis config, animations
│   ├── auth/
│   │   └── signin/page.tsx       # Google/GitHub sign-in
│   ├── register/
│   │   ├── page.tsx              # Pre-event registration (4 steps)
│   │   └── main/page.tsx         # Main event registration (8 steps)
│   ├── dashboard/page.tsx        # Participant dashboard
│   └── admin/
│       ├── layout.tsx            # Admin nav + auth guard
│       ├── page.tsx              # Overview stats
│       ├── questions/page.tsx    # Question management (CRUD)
│       ├── registrations/page.tsx# Registration list (pre-event + main)
│       └── roles/page.tsx        # Role management
├── components/
│   ├── landing/                  # Landing page sections
│   ├── layout/                   # PublicLayout, nav
│   └── auth/                     # AuthGuard, AdminAuthGuard
├── convex/                       # Convex backend
│   ├── schema.ts                 # Database schema (all tables)
│   ├── auth.ts                   # Auth provider config (Google, GitHub)
│   ├── auth.config.ts            # Auth token validation
│   ├── helpers.ts                # Shared utils (getParticipantByIdentity)
│   ├── participants.ts           # Participant CRUD + role checks
│   ├── buildathonRoles.ts        # Role CRUD (admin)
│   ├── roleDiscoveryQuestions.ts  # Question CRUD + active query (shuffled)
│   ├── roleDiscoveryAnswers.ts   # Assessment answers + scoring
│   ├── buildathonRegistrations.ts# Registration flow (draft → submitted)
│   ├── registrations.ts          # General registrations
│   ├── seedBuildathon.ts         # Seed roles + questions (pre-event + main)
│   ├── personalityTest.ts        # Personality test logic
│   ├── admin.ts                  # Admin queries (participants list)
│   └── helpers.ts                # Auth identity resolution
├── lib/
│   ├── hooks/                    # Custom React hooks (useAuth)
│   ├── convex/                   # ConvexClientProvider
│   └── i18n/                     # Internationalization (EN/MY dictionaries)
├── dictionaries/
│   ├── en.json                   # English translations
│   └── my.json                   # Myanmar translations
└── public/
    └── favicons/                 # Favicon set (ico, apple, android, manifest)
```

## Data Model

### Core Tables

| Table | Purpose |
|---|---|
| `participants` | User profiles (email, role: admin \| participant) |
| `buildathonRoles` | 12 team roles with traits, bilingual descriptions |
| `roleDiscoveryQuestions` | Assessment questions (pre-event + main-event) |
| `roleDiscoveryAnswers` | Per-question answers with scoring signals |
| `buildathonRegistrations` | Multi-step registration (basic → assessment → submitted) |
| `roleRecommendations` | AI-calculated top-3 role matches with affinity % |

### Registration Flow

**Pre-Event (4 steps):**
1. Basic Info (name, email, phone, university, org)
2. Background (profession, occupation, experience level)
3. Interests & Skills (comma-separated)
4. Dynamic Questions (admin-configurable: yesno, longtext, single-with-text, multiple text inputs)

**Main Event (8 steps):**
1. Assessment (20-30 scenario questions, shuffled, scored)
2. Recommended Roles (top-3 with explanations)
3. Role Selection
4-8. Preferences, Review, Submit

### Question Types

| Type | UI | Scoring |
|---|---|---|
| `single` | Radio buttons | Yes (option → role weight) |
| `multiple` | Text inputs (configurable count) | No (qualitative) |
| `scenario` | Radio buttons (situational) | Yes |
| `scale` | 1-5 number buttons | Optional |
| `longtext` | Textarea | No |
| `yesno` | Yes/No buttons | No |
| `single-with-text` | Radio + conditional text input | Partial (option only) |

## Features

- **Two-phase registration** — pre-event info collection + main-event role assessment
- **Dynamic questions** — admin creates questions per phase, types, and bilingual text
- **Shuffled assessment** — options shuffle per user to hide scoring signals
- **Role scoring** — hidden weighted signals map answers to 12 team roles
- **Bilingual** — EN/MY throughout (questions, roles, UI)
- **Admin dashboard** — manage roles, questions, view registrations with expand/collapse
- **SEO ready** — Open Graph, Twitter card, sitemap, robots.txt, favicon manifest
- **Auth** — Google + GitHub OAuth via Convex Auth
- **Smooth scroll** — Lenis with `data-lenis-prevent` for modal scroll areas

## Getting Started

```bash
# Install dependencies
npm install

# Start Convex backend
npx convex dev

# In another terminal, start Next.js
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```bash
# .env.local
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
AUTH_SECRET=your-auth-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

### Seed Data

From the Convex dashboard, run `seedBuildathon:seed` to create:
- 12 team roles (Product Manager, UX Researcher, Frontend Dev, etc.)
- 5 pre-event questions (yesno, single-with-text, multiple, longtext, single)
- 6 main-event scenario questions

## Deployment

- **Frontend**: Vercel (auto-deploys from git)
- **Backend**: Convex Cloud (`npx convex deploy`)
- **Auth callbacks**: Set `SITE_URL` in Convex env to your production URL
- **Google OAuth**: Add production URL to Authorized redirect URIs in Google Cloud Console

## License

Private — AI OCEAN Buildathon
