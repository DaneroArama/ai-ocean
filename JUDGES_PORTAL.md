# Judges Portal

Welcome to the AI OCEAN Buildathon Judges Portal! This guide explains how to access and review team submissions.

## Accessing the Portal

1. Navigate to: `https://your-domain.com/admin/judges`
2. Sign in with your admin account
3. The portal will display all published team submissions

## What You'll See

Each team submission card includes:

### Team Information
- **Team Code**: Unique identifier (e.g., AI01, AI02)
- **Team Name**: The team's chosen name
- **Project Name**: Name of their buildathon project
- **Tagline**: Short project description
- **Badge**: Special labels like "Recent" or awards
- **Track**: In-Person or Online participation

### Project Details
- **Description**: Full project overview and features
- **Team Members**: List of participants with their roles

### Submission Materials
Each team provides the following materials via GitHub repository:

#### 📄 Pitch Deck
- PowerPoint/Google Slides presentation
- Business model and value proposition
- Market opportunity and go-to-market strategy

#### ▶️ Demo Video
- 3-5 minute product demonstration
- Key features walkthrough
- User experience showcase

#### 🌐 Live Product
- Working demo deployment
- Try the actual product
- Interactive prototype or MVP

#### 📦 GitHub Repository
- Complete source code
- Technical documentation
- Development history

#### 🔑 Credentials/Instructions
- Login credentials for demo accounts
- API keys (if needed for testing)
- Special setup instructions
- Test data or scenarios

#### 📖 README
- Project overview
- Technical stack
- Setup instructions
- Architecture documentation

## How Team Materials Are Stored

All team submissions follow this structure in their GitHub repositories:

```
team-repo/
├── README.md              # Project overview and setup
├── PITCH_DECK.pdf         # Or link to Google Slides
├── DEMO_VIDEO.md          # Link to YouTube/Vimeo
├── CREDENTIALS.md         # Login info, API keys, instructions
├── DEPLOYMENT.md          # Live product URL
├── docs/                  # Additional documentation
└── src/                   # Source code
```

## Evaluating Submissions

When reviewing each submission, consider:

### Innovation & Creativity (25%)
- Originality of the solution
- Creative problem-solving approach
- Unique features or implementations

### Technical Execution (25%)
- Code quality and architecture
- Working features and functionality
- Technical complexity tackled

### User Experience (20%)
- Design quality and usability
- User flow and interaction
- Accessibility considerations

### Business Viability (15%)
- Market opportunity and fit
- Scalability potential
- Go-to-market strategy

### Presentation (15%)
- Pitch clarity and structure
- Demo quality
- Documentation completeness

## Need Help?

- **Missing Materials**: Contact the organizing team
- **Broken Links**: Report to admin@ai-ocean.dev
- **Technical Issues**: Check the GitHub repository's Issues tab
- **Questions**: Email buildathon@ai-ocean.dev

## Submission Deadline

All materials must be submitted by: **[INSERT DEADLINE]**

Late submissions will be marked and may be subject to penalty per competition rules.

---

## For Admins: Managing Submissions

### Adding New Submissions

1. Go to Convex Dashboard
2. Run the mutation: `submissions.createSubmission`
3. Provide all required fields:
   - teamId (from teams table)
   - projectName
   - description
   - URLs for all materials

### Seeding Sample Data

To populate sample submissions for testing:

```bash
# In Convex Dashboard, run:
seedSubmissions:seed
```

This creates 8 sample submissions based on the teams in Teams.md.

### Syncing from GitHub

For production, you can set up a GitHub webhook to automatically create/update submissions when teams push to their repositories.

```typescript
// Example webhook handler
POST /api/webhooks/github
{
  "repository": "ai-ocean-buildathon/ai01-team-repo",
  "action": "push",
  "branch": "main"
}
```

The webhook should:
1. Parse the repository README for project info
2. Extract links to pitch deck, demo video, etc.
3. Call `submissions.createSubmission` or `updateSubmission`

### Making Submissions Visible

By default, submissions are published (`isPublished: true`). To hide a submission:

```typescript
updateSubmission({
  submissionId: "...",
  isPublished: false
})
```

## Technical Architecture

The Judges Portal is built with:

- **Frontend**: Next.js 15 (App Router) + React 19
- **Backend**: Convex (real-time database & serverless functions)
- **Auth**: Convex Auth (admin-only access)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React

### Database Schema

```typescript
buildathonSubmissions: {
  teamId: Id<"teams">,
  projectName: string,
  tagline?: string,
  description: string,
  pitchDeckUrl?: string,
  demoVideoUrl?: string,
  liveProductUrl?: string,
  githubRepoUrl?: string,
  credentialsUrl?: string,
  readmeUrl?: string,
  submittedAt: number,
  submittedBy?: Id<"participants">,
  lastUpdatedAt: number,
  isPublished: boolean,
}
```

## GitHub Organization Setup

For automatic submission discovery:

1. Create organization: `ai-ocean-buildathon`
2. Create team repos: `ai01-project`, `ai02-project`, etc.
3. Add teams as collaborators to their repo
4. Teams push their code + materials
5. Admin reviews and publishes submissions

Each repo should have a standardized structure with:
- `README.md` with project overview
- `CREDENTIALS.md` with demo login info
- Links to external resources (pitch deck, video)
- Deployed product URL in README or DEPLOYMENT.md
