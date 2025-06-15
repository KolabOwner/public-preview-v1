#!/bin/bash
# Deploy Hirable AI to Vercel

echo "🚀 Deploying Hirable AI to Vercel..."

# Build the project
echo "🏗️  Building project..."
npm run build

# Deploy with Vercel CLI if available
if command -v vercel >/dev/null 2>&1; then
    echo "📤 Deploying to Vercel..."
    vercel --prod
else
    echo "❌ Vercel CLI not found. Please install it with: npm i -g vercel"
    exit 1
fi

echo "✅ Deployment completed!"
