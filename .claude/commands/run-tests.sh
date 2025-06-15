#!/bin/bash
# Run all tests with coverage for Hirable AI

echo "🧪 Running Hirable AI test suite..."

# Type checking
echo "📝 Type checking..."
if command -v tsc >/dev/null 2>&1; then
    npx tsc --noEmit
else
    echo "TypeScript compiler not found, skipping type check"
fi

# Linting
echo "🔍 Linting..."
if npm run lint > /dev/null 2>&1; then
    npm run lint
else
    echo "Lint script not found, skipping linting"
fi

# Unit tests (if Jest is configured)
if [ -f "jest.config.js" ] || [ -f "jest.config.ts" ]; then
    echo "🏃 Running unit tests..."
    npm test -- --coverage
else
    echo "Jest not configured, skipping unit tests"
fi

echo "✅ Test suite completed!"
