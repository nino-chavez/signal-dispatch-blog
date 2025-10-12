#!/bin/bash

# Signal Dispatch Blog - Complete Setup Script
# This script will:
# 1. Rename directory
# 2. Initialize git
# 3. Create GitHub repo
# 4. Configure Vercel

set -e  # Exit on error

echo "🚀 Starting Signal Dispatch Blog setup..."

# Get current directory
CURRENT_DIR=$(pwd)
PARENT_DIR=$(dirname "$CURRENT_DIR")
NEW_NAME="signal-dispatch-blog"

echo "📁 Step 1: Renaming directory..."
cd "$PARENT_DIR"
if [ -d "signal-dispatch-blog-v2" ]; then
    mv signal-dispatch-blog-v2 "$NEW_NAME"
    echo "✅ Renamed to $NEW_NAME"
else
    echo "⚠️  Directory already renamed or not found"
fi

cd "$NEW_NAME"

echo "📦 Step 2: Initializing Git repository..."
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git initialized"
else
    echo "⚠️  Git already initialized"
fi

echo "📝 Step 3: Creating initial commit..."
git add .
git commit -m "Initial commit: Signal Dispatch blog standalone

- Migrated from monorepo to standalone project
- Simplified to brand-unified violet color scheme
- Implemented Load More pagination (18 posts/page)
- Cleaned hero section and navigation
- 120 blog posts with MDX support
- Vite 7 + React 19 + TypeScript + Tailwind v4

🤖 Generated with Claude Code"

echo "✅ Initial commit created"

echo "🐙 Step 4: Creating GitHub repository..."
gh repo create signal-dispatch-blog \
    --public \
    --source=. \
    --remote=origin \
    --description="Signal Dispatch - Personal blog covering AI, architecture, commerce, and leadership" \
    --push

echo "✅ GitHub repository created and pushed"

echo "🔗 Step 5: Linking Vercel project..."
vercel link --yes

echo "🚀 Step 6: Deploying to Vercel..."
vercel --prod

echo ""
echo "✨ Setup complete!"
echo ""
echo "📍 Repository: https://github.com/$(gh api user -q .login)/signal-dispatch-blog"
echo "🌐 Production URL: Check Vercel dashboard or output above"
echo ""
echo "Next steps:"
echo "1. Verify deployment at your Vercel URL"
echo "2. Update any external links to new repository"
echo "3. Configure custom domain if needed in Vercel dashboard"
