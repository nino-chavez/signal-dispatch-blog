# Blog Automation: Usage Guide

**Status:** ✅ Implemented
**Created:** 2025-10-19
**Entry Point:** GitHub Issues

## Overview

This automation allows you to publish blog posts by simply creating a GitHub issue. Write your content in Gemini (or anywhere), paste it into the issue form, and the automation handles the rest.

## How It Works

```
Write in Gemini
   ↓
Copy content
   ↓
Create GitHub Issue (with form)
   ↓
Paste content + fill metadata
   ↓
Submit issue
   ↓
GitHub Action triggers
   ↓
Claude API formats as MDX
   ↓
Commits to repo
   ↓
Vercel builds
   ↓
Blog post live!
```

## Step-by-Step Instructions

### 1. Write Your Content

Write your blog post in Gemini (or any text editor). Use markdown formatting:

```markdown
# Main ideas

Use **bold** and *italic* as needed.

## Section headings

- Bullet points
- Lists
- etc.

### Code examples

```javascript
const example = "code blocks work too";
```
```

### 2. Go to GitHub Issues

Visit: `https://github.com/[your-username]/signal-dispatch-blog/issues/new/choose`

Click: **"New Blog Post"**

### 3. Fill Out the Form

**Post Title**
- Enter the title exactly as you want it to appear

**Category**
- Choose from dropdown:
  - AI & Automation
  - Consulting
  - Architecture
  - Systems Thinking
  - Development
  - Product

**Tags**
- Comma-separated list: `ai, consulting, strategy`
- Use lowercase, hyphens for multi-word tags

**Featured Post?**
- Select "Yes" if this should appear at the top of the blog
- Select "No" for normal posts (default)

**Source**
- Where this content originated:
  - `gemini` - Written in Gemini
  - `linkedin` - LinkedIn article
  - `original` - Original content
  - `medium` - Imported from Medium

**Source URL** (optional)
- If republishing from LinkedIn/Medium, paste the original URL
- Leave blank for original content

**Content**
- Paste your full article from Gemini here
- Markdown formatting will be preserved

**Pre-publish Checklist**
- Check both boxes to confirm

### 4. Submit

Click **"Submit new issue"**

The automation will:
1. Parse your issue
2. Call Claude API to format as MDX
3. Generate proper frontmatter
4. Create slug from title
5. Commit to `src/content/blog/[slug].mdx`
6. Comment on issue with success message
7. Close issue and label as "published"
8. Vercel automatically builds and deploys

### 5. Verify

- Check the issue for a success comment
- Visit `blog.ninochavez.co` to see your post (wait ~2 min for build)
- The issue will be closed automatically

## Example

**Title:** The Future of AI Consulting

**Category:** AI & Automation

**Tags:** ai, consulting, genai, strategy

**Featured:** No

**Source:** gemini

**Source URL:** (leave blank)

**Content:**
```
The consulting industry is at an inflection point. AI isn't just changing how we work—it's fundamentally reshaping what clients need from consultants.

### The Old Model is Breaking

Traditional consulting relied on information asymmetry. Consultants had access to data, frameworks, and expertise that clients didn't. But AI is democratizing access to information at an unprecedented pace.

### What Clients Need Now

Instead of information delivery, clients need:

1. **Strategic judgment** - AI can generate options, but humans must choose
2. **Implementation support** - Ideas are cheap, execution is everything
3. **Change management** - The people side of transformation

### The New Consulting Model

Successful consultants will become **AI-augmented advisors** who:

- Use AI to accelerate research and analysis
- Focus energy on strategic decisions and stakeholder alignment
- Build implementation muscle, not just slide decks

The firms that adapt will thrive. Those that don't will become commoditized.
```

## Troubleshooting

### Issue doesn't trigger automation

**Check:**
- Does the issue have the `blog-automation` label? (should be auto-added by template)
- Check GitHub Actions tab for errors

### MDX formatting issues

**Common causes:**
- Unescaped special characters in content
- Malformed markdown in original content
- Missing required fields

**Solution:**
- Check the Action logs for specific errors
- Manually edit the generated MDX file if needed

### Claude API errors

**Possible issues:**
- API key not set in GitHub secrets
- Rate limiting (wait and retry)
- API outage (check Anthropic status)

## Advanced Usage

### Edit Before Publishing

If you want to review the MDX before it goes live:

1. Create the issue as normal
2. Wait for the automation to commit
3. Immediately edit the MDX file if needed
4. Vercel will rebuild with your edits

### Manually Trigger Rebuild

If you edit the MDX after initial publish:

```bash
# Make edits to src/content/blog/[slug].mdx
git add -A
git commit -m "Update blog post: [title]"
git push
```

Vercel will automatically rebuild.

### Check Automation Logs

Visit: `https://github.com/[your-username]/signal-dispatch-blog/actions`

Click on the latest "Publish Blog Post" workflow to see detailed logs.

## Setup Requirements (One-Time)

### Add Anthropic API Key to GitHub Secrets

1. Go to: `https://github.com/[your-username]/signal-dispatch-blog/settings/secrets/actions`
2. Click: **"New repository secret"**
3. Name: `ANTHROPIC_API_KEY`
4. Value: Your Anthropic API key from https://console.anthropic.com/
5. Click: **"Add secret"**

Without this secret, the automation will fail.

## What Gets Generated

The automation creates an MDX file like this:

```mdx
---
title: "The Future of AI Consulting"
publishedAt: "2025-10-19T15:30:00.000Z"
author: "Nino Chavez"
excerpt: "The consulting industry is at an inflection point. AI isn't just changing how we work—it's fundamentally reshaping what clients need."
category: "AI & Automation"
tags: ["ai", "consulting", "genai", "strategy"]
featured: false
source: "gemini"
---

The consulting industry is at an inflection point. AI isn't just changing how we work—it's fundamentally reshaping what clients need from consultants.

### The Old Model is Breaking

Traditional consulting relied on information asymmetry...

[rest of content]
```

## Tips for Best Results

1. **Write naturally in Gemini** - Don't try to format for the blog, just write good content
2. **Use markdown headings** - `### Heading` works well
3. **Include code blocks** - Triple backticks with language identifier
4. **Choose accurate tags** - Helps readers find related content
5. **Craft a strong opening** - First 2-3 sentences become the excerpt
6. **Review the issue form** - Double-check title and metadata before submitting

## Future Enhancements

Potential additions:
- [ ] Image upload support
- [ ] Draft mode (publish to drafts folder for review)
- [ ] Slack notification when published
- [ ] Preview generation before commit
- [ ] Scheduled publishing (set publish date)

---

**Questions or issues?** Open a GitHub issue with the label `automation-support`.
