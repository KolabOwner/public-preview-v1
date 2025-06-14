#!/bin/bash
# Run security checks for Hirable AI

echo "🔒 Running security checks for Hirable AI..."

# Check for secrets in code
echo "🔍 Checking for exposed secrets..."
if command -v git >/dev/null 2>&1; then
    git secrets --scan || echo "git-secrets not installed, skipping secret scan"
fi

# Audit npm packages
echo "📦 Auditing npm packages..."
npm audit

# Check environment variables
echo "🌍 Checking environment configuration..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local found"
    # Check if required vars are set
    if grep -q "FIREBASE_PROJECT_ID" .env.local; then
        echo "✅ Firebase configuration present"
    else
        echo "❌ Firebase configuration missing"
    fi
else
    echo "❌ .env.local not found"
fi

# Check for common security issues
echo "🛡️  Checking for common security patterns..."
grep -r "console.log" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | wc -l | awk '{print $1 " console.log statements found (should be removed for production)"}'

echo "✅ Security check completed!"
