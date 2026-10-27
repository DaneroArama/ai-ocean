# Quick Start: GitHub-Integrated Judges Portal

## 🚀 Setup (5 minutes)

### 1. Install Dependencies
Already done! Octokit installed.

### 2. Get GitHub Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `AI OCEAN Buildathon`
4. Select scopes: ✅ `repo` and ✅ `read:org`
5. Copy the token

### 3. Add to Environment
Add to `.env.local`:
```bash
# GitHub Integration for Judges Portal
GITHUB_TOKEN=ghp_your_token_here
GITHUB_ORG=ai-ocean-buildathon
```

Replace with:
- Your actual GitHub token
- Your actual organization name

Restart dev server:
```bash
npm run dev
```

### 4. Test GitHub Sync
1. Go to: http://localhost:3000/admin/judges
2. Click "Sync from GitHub" button
3. Watch it import all team repos!

## 📁 How Teams Structure Their Repos

Each team creates a repo named: `ai01-projectname`, `ai02-projectname`, etc.

### Required: README.md
```markdown
# Project Name

One line tagline

## Description

Full project description...

## Links
- **Pitch Deck**: [Link](https://docs.google.com/...)
- **Demo Video**: [Link](https://youtu.be/...)
- **Live Demo**: [Link](https://project.vercel.app)
```

### Optional: CREDENTIALS.md
```markdown
# Demo Credentials

## Admin
- Email: admin@demo.com
- Password: demo123

## Test Users
- Email: user@demo.com
- Password: demo123
```

## 🎯 What Happens During Sync

1. **Fetches** all repos from your GitHub org
2. **Finds** repos starting with `ai01`, `ai02`, etc.
3. **Reads** README.md from each repo
4. **Extracts** project info using smart parsing
5. **Creates** submission records in Convex
6. **Shows** results (imported/skipped/errors)

## ✨ What Gets Auto-Extracted

From README.md:
- ✅ Project Name (first h1 heading)
- ✅ Tagline (first paragraph)
- ✅ Description (full text)
- ✅ Pitch Deck URL (finds links with "pitch" or "deck")
- ✅ Demo Video URL (YouTube/Vimeo links)
- ✅ Live Product URL (vercel.app, netlify.app links)
- ✅ GitHub Repo URL (automatic)
- ✅ Credentials (auto-detects CREDENTIALS.md)
- ✅ README URL (automatic)

## 🎨 Judges Portal Features

### Beautiful Card UI
Each team gets a card showing:
- Team code & name
- Project name & tagline  
- Description
- Team members & roles
- Color-coded action buttons:
  - 🟣 Pitch Deck
  - 🔴 Demo Video
  - 🟢 Live Product
  - ⚪ GitHub Repo
  - 🟡 Credentials

### GitHub Sync Button
- One click to import all repos
- Shows progress during sync
- Displays results with counts
- Handles errors gracefully

### Manual Add
- Fallback for teams without GitHub
- Full form for all fields
- Immediate publishing

## 📂 Files Created

```
app/
├── admin/judges/
│   ├── page.tsx          # Main portal with sync
│   └── add/page.tsx      # Manual add form
└── api/
    ├── github/sync/route.ts  # GitHub API integration
    └── teams/route.ts        # Teams helper API

lib/hooks/
└── useGitHubSync.ts      # React hook for syncing

docs/
├── TEAM_REPO_TEMPLATE.md     # Give to teams
└── CREDENTIALS_TEMPLATE.md   # Give to teams

GITHUB_SETUP.md           # Full setup guide
JUDGES_PORTAL.md          # Judges guide
QUICK_START.md            # This file
```

## 🧪 Testing

### Test with Sample Data
```bash
# In Convex dashboard
seedSubmissions:seed
```
Creates 8 example submissions.

### Test GitHub Sync
1. Create test org: `ai-ocean-buildathon-test`
2. Create test repo: `ai99-test-project`
3. Add README.md with project info
4. Run sync from portal
5. Verify it appears

## 🎓 Team Instructions

Share these with teams:

### 1. Repository Setup
```bash
# Create repo in organization
ai-ocean-buildathon/ai01-your-project-name

# Add files
README.md          (required)
CREDENTIALS.md     (optional)
src/              (your code)
```

### 2. README Format
Use template from `docs/TEAM_REPO_TEMPLATE.md`

Key sections:
- Project name as h1
- Tagline as first paragraph
- Links section with all materials
- Team info

### 3. Deploy & Submit
1. Deploy project (Vercel/Netlify)
2. Upload pitch deck (Google Drive)
3. Upload demo video (YouTube)
4. Update README with all links
5. Create CREDENTIALS.md
6. Push to GitHub
7. Notify organizers to sync

## 🔍 Troubleshooting

### "GITHUB_TOKEN not configured"
- Check `.env.local` exists
- Restart dev server

### "No repositories found"
- Check org name is correct
- Verify token has `read:org` permission
- Repos must start with `ai01`, `ai02`, etc.

### "Team AI01 not found"
- Teams must exist in database first
- Check team codes match
- Run team seeder if needed

### Repos Skipped
- Team code doesn't match database
- README.md missing
- Submission already exists (delete old one)

## 🚢 Production Deploy

### Vercel Environment Variables
Add to Vercel dashboard:
```
GITHUB_TOKEN=ghp_your_production_token
NEXT_PUBLIC_CONVEX_URL=https://...
```

### GitHub Organization
1. Create: `ai-ocean-buildathon`
2. Invite all teams
3. Each team creates their repo: `ai##-projectname`
4. Admin syncs from portal

## 💡 Pro Tips

### For Organizers
- Run sync 1 hour before judging
- Check all submissions loaded
- Verify links work
- Have backup of submission URLs

### For Teams
- Test all links before submission
- Keep README updated
- Include screenshots
- Add detailed CREDENTIALS.md
- Deploy early, test often

### For Judges
- Start with GitHub repo to see code
- Watch demo video first
- Try live product with credentials
- Read pitch deck for context
- Check README for tech details

## 📞 Need Help?

Check these docs:
- **Full Setup**: `GITHUB_SETUP.md`
- **Judges Guide**: `JUDGES_PORTAL.md`
- **Team Template**: `docs/TEAM_REPO_TEMPLATE.md`

---

**That's it! You're ready to go! 🎉**

The portal will automatically discover and display all team submissions from GitHub.
