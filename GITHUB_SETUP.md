# GitHub Integration Setup

This guide will help you set up automatic submission syncing from your GitHub organization.

## Prerequisites

- GitHub organization (e.g., `ai-ocean-buildathon`)
- Admin access to the organization
- Team repositories following naming convention: `ai01-*`, `ai02-*`, etc.

## Step 1: Create GitHub Personal Access Token

1. Go to GitHub Settings: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: `AI OCEAN Buildathon Sync`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:org` (Read org and team membership)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

## Step 2: Add Token to Environment Variables

Add to your `.env.local` file:

```bash
# GitHub Integration for Judges Portal
GITHUB_TOKEN=ghp_your_token_here
GITHUB_ORG=ai-ocean-buildathon
```

**Important:** Replace:
- `ghp_your_token_here` with your actual GitHub token
- `ai-ocean-buildathon` with your actual GitHub organization name

Restart your development server after adding the token.

## Step 3: Repository Structure

Each team repository should follow this structure:

```
ai01-project-name/
├── README.md              # REQUIRED - Contains all metadata
├── CREDENTIALS.md         # OPTIONAL - Login info
├── src/                   # Source code
└── ...
```

### README.md Format

The sync system parses README.md to extract project information:

```markdown
# Project Name

Short tagline about the project.

## Description

Full description of the project with features and capabilities.

## Links

- [Pitch Deck](https://docs.google.com/presentation/...)
- [Demo Video](https://youtu.be/...)
- [Live Demo](https://project.vercel.app)

## Team

- Member 1 - Role
- Member 2 - Role
```

### What Gets Auto-Extracted

- **Project Name**: First h1 heading in README
- **Tagline**: First paragraph after h1
- **Description**: Text under "Description" section or first paragraph
- **Pitch Deck URL**: Link with "pitch" or "deck" in text
- **Demo Video URL**: YouTube/Vimeo links or links with "demo" or "video"
- **Live Product URL**: Links to vercel.app, netlify.app, or under "Live" section
- **Credentials**: Auto-detected if CREDENTIALS.md exists
- **GitHub Repo**: Automatically captured
- **README URL**: Automatically generated

## Step 4: How to Sync

### From Admin Portal

1. Go to `/admin/judges`
2. Click "Sync from GitHub" button
3. Wait for sync to complete
4. Review imported submissions

### What Happens During Sync

1. Fetches all repos from organization
2. Filters repos matching pattern `ai01-*`, `ai02-*`, etc.
3. Reads README.md from each repo
4. Parses metadata using pattern matching
5. Matches team codes to existing teams in database
6. Creates submission records
7. Shows sync results with imported/skipped counts

## Troubleshooting

### "GITHUB_TOKEN not configured"
- Check `.env.local` has the token
- Restart your dev server after adding token

### "No team repositories found"
- Check repo names start with `ai01`, `ai02`, etc.
- Verify organization name is correct
- Check token has `read:org` permission

### "Team AI01 not found in database"
- Team must exist in Convex `teams` table first
- Team code must match repo prefix
- Run team seeder if needed

### Repos Skipped
- Team code doesn't match database
- README.md is missing or empty
- Submission already exists for that team

## Repository Naming Convention

✅ **Supported formats** (will sync):
- `Team-17`, `Team-18` (capital T with hyphen)
- `team-17`, `team-18` (lowercase with hyphen)  
- `Team17`, `Team18` (capital T no hyphen)
- `ai01-resumemate`, `ai02-project` (ai prefix)
- `AI01-project`, `AI02` (AI prefix)

❌ **Bad names** (won't sync):
- `project-team-01` (team code not at start)
- `random-project` (no team identifier)
- `my-awesome-app` (no team code)

The system will:
- Detect Team-17 → convert to AI17
- Detect team-3 → convert to AI03  
- Detect ai05 → convert to AI05

## Recommended README Template

```markdown
# [Project Name]

[One sentence tagline]

## Description

[2-3 paragraphs describing your project, key features, and target users]

## Links

- **Pitch Deck**: [View Presentation](https://docs.google.com/presentation/...)
- **Demo Video**: [Watch on YouTube](https://youtu.be/...)
- **Live Demo**: [Try it now](https://yourproject.vercel.app)
- **Credentials**: See [CREDENTIALS.md](./CREDENTIALS.md)

## Tech Stack

- Frontend: [technology]
- Backend: [technology]
- Database: [technology]

## Team [Team Code]

- [Name] - [Role]
- [Name] - [Role]
- [Name] - [Role]

## Setup Instructions

[How to run the project locally]
```

## CREDENTIALS.md Template

```markdown
# Demo Credentials

## Admin Account
- **Email**: admin@demo.com
- **Password**: demo123

## Test User Accounts
- **Email**: user1@demo.com
- **Password**: demo123

## API Keys (if needed)
- **OpenAI**: sk-test-xxxxx
- **Other**: xxxxx

## Notes
- All accounts are test/demo accounts
- Data is reset every 24 hours
- Please don't modify test data during judging
```

## Advanced: Webhook Auto-Sync (Optional)

For automatic syncing when teams push to repos:

1. Go to Organization Settings → Webhooks
2. Add webhook:
   - **URL**: `https://your-domain.com/api/github/webhook`
   - **Content type**: `application/json`
   - **Events**: `push`, `repository`
3. Implement webhook handler (see `/api/github/webhook/route.ts`)

## Security Notes

- Never commit GITHUB_TOKEN to git
- Token has read access only (can't modify repos)
- Token is used server-side only
- Rotate token regularly
- Use fine-grained tokens for better security

## Testing

Test with a single repo first:

1. Create test repo: `ai99-test-project`
2. Add proper README.md
3. Run sync
4. Verify submission appears in portal
5. Delete test submission
6. Run sync for all repos

## Support

Issues? Check:
- Token permissions
- Repository naming
- README format
- Team exists in database
- Check browser console for errors
- Check server logs for API errors
