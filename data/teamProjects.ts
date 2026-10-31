/**
 * Project submissions for the AI Ocean Buildathon.
 * Source: AI_OCEAN_Submissions_2026-10-30.xlsx (Submissions sheet).
 *
 * Seed data only — the live values come from the Convex `teams` table and are
 * edited by admins in app/admin/teams. After changing a row here, run:
 *   npx convex run seedTeamProjects:seed
 */
export type TeamProject = {
  code: string
  teamName: string
  projectName: string
  description: string
}

export const TEAM_PROJECTS: TeamProject[] = [
  {
    code: 'AI01',
    teamName: 'OnErrorResumeNext',
    projectName: 'Oern — Door-to-Door Delivery Platform',
    description:
      'Real-time, door-to-door delivery logistics that connects customers, drivers/riders, managers, sellers, and support staff in one workflow. Customers see where their parcel is from driver handoff through delivery; managers and drivers keep every order moving through a clear shared workflow.',
  },
  {
    code: 'AI02',
    teamName: 'Aquaholics',
    projectName: 'ResolveMate',
    description:
      "ResolveMate is the exception-handling layer for one delivery company that serves many sellers and their customers. The company's existing delivery system keeps owning delivery creation and execution; ResolveMate handles what goes wrong: delivery exceptions, customer reports, staff replies, driver reports, proactive delay notices and seller refund handoffs.",
  },
  {
    code: 'AI03',
    teamName: 'Zero_Lag',
    projectName: 'LannPya',
    description:
      'LannPya is a delivery management platform for Myanmar that connects dispatchers, buyers, and riders through address confirmation, automatic rider assignment, live tracking, and cash handover. Includes the working app, pitch deck, demo video, and illustrated workflow guide.',
  },
  {
    code: 'AI04',
    teamName: 'CoralCode',
    projectName: 'Shay Sett (ရှေ့ဆက်)',
    description:
      'Shay Sett helps business owners review cashflow, financial health, working capital, credit and AI-assisted business findings from Excel records. It uses Supabase email/password authentication, owned workspaces, a React/TanStack Start frontend and a FastAPI backend.',
  },
  {
    code: 'AI05',
    teamName: '404',
    projectName: 'The Citadel',
    description: 'The Citadel is a learning and hiring platform for people aged 18–30 in Myanmar who want their first job in IT. Learners study short, practical courses, prove what they can do with a test and a certificate, and then solve real tasks set by verified IT companies. Companies use those tasks to find tested candidates and offer internships.',
  },
  {
    code: 'AI06',
    teamName: 'F.O.M',
    projectName: 'FOM — Future of Myanmar',
    description: 'Team 6 product code for the Escrow, Cross banking, and shop inquiry experience.',
  },
  {
    code: 'AI07',
    teamName: 'Four Hook',
    projectName: 'SaleSayar AI · တူတူတွက်မယ်',
    description:
      'From Chat to Order, From Order to Profit. An AI-powered business and financial assistant tailored for Myanmar online sellers on Facebook and TikTok. Built for the Into the AI Ocean Buildathon, hosted by UXMM.',
  },
  {
    code: 'AI08',
    teamName: 'Innov8',
    projectName: 'ParcelCare — Team-8',
    description: 'Independent AI maker–checker: workflow, configuration and testing.',
  },
  {
    code: 'AI09',
    teamName: '7Vyte',
    projectName: 'Shwe Taw Pyan Chi',
    description:
      'A local financial records app for everyday bookkeeping in Myanmar. It provides income and expense records, one-time and monthly schedules, payment confirmation, budgets, forecasts and bank-specific Credit Readiness checklists. Receipt text recognition runs on the device in English and Burmese using Tesseract.js; every extracted record requires user review. Ask AI remains a demo interface using local record rules; there is no external AI API connection. Registration and sign-in use a Node backend and SQLite database with hashed passwords and cookie sessions. Financial records are saved per account, with a separate browser cache for each user.',
  },
  {
    code: 'AI10',
    teamName: 'Sirens & Knights',
    projectName: 'Nookstep',
    description: 'Your space. Your goal. Your next step.',
  },
  {
    code: 'AI11',
    teamName: 'AquaMind',
    projectName: 'SupplyLink',
    description:
      'Headquarters focuses on wholesale orders. Branches primarily handle retail sales while maintaining protected stock for approved backup wholesale deliveries. SMEs can browse products, submit orders and full payment evidence, follow delivery progress, and confirm receipt.'
  },
  {
    code: 'AI12',
    teamName: 'Something went wrong!',
    projectName: 'Parcel Delivery Management and Tracking',
    description:
      'Next.js App Router and strict TypeScript application with Admin, Rider and customer interfaces. Operational records use PostgreSQL through Prisma. Authenticated server services enforce role/assignment ownership, transactions, stale-write detection and durable idempotency. Hosted photos use PRIVATE Vercel Blob with direct browser uploads; local development also supports private S3-compatible storage and a durable filesystem fallback. No operational arrays or browser localStorage remain.',
  },
  {
    code: 'AI13',
    teamName: 'The Winners',
    projectName: 'Wayfinder — Career Guidance MVP',
    description:
      'A responsive student-facing career exploration demo in one Next.js App Router + TypeScript project. The complete flow is landing → 20-question quiz → server recommendations → courses/advisors/local exploration → confirmed next action. Work remains on feature/frontend_alexander; backend files stay in their existing locations.',
  },
  {
    code: 'AI14',
    teamName: 'Saya-Sync',
    projectName: 'Saya-Sync',
    description: 'Teaching records. Clearer decisions.',
  },
  {
    code: 'AI15',
    teamName: 'Crabbity Crab',
    projectName: 'INVENTO',
    description:
      'Mobile-first inventory app for small Myanmar warehouses',
  },
  {
    code: 'AI16',
    teamName: 'Ocean Blue',
    projectName: 'StockSense',
    description:
      'StockSense is an AI-powered inventory assistant for small retail and food businesses. It gives teams a clear view of stock across branches, batch-level expiry, and auditable stock movements, then calculates explainable risks and offers grounded, read-only recommendations. The product loop is Track → Predict → Alert → Recommend.',
  },
  {
    code: 'AI17',
    teamName: 'Surfers',
    projectName: 'SurferTrack',
    description:
      'A parcel operations application for online shop owners (SMEs), delivery operators, and riders. The repository contains a Next.js web client and an Express REST API backed by PostgreSQL. The interface also uses the SurferTrack brand.',
  },
  {
    code: 'AI18',
    teamName: 'ROWDERS',
    projectName: 'CareerNest',
    description:
      'CareerNest is a career guidance app for Grade 12, GED, and IGCSE students in Myanmar. It has student, mentor, and admin portals, a career matching quiz, AI career guidance, university discovery, mentor booking, and a Pro PDF report.',
  },
]


