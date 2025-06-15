#!/bin/bash
# Quick start development environment for Hirable AI

echo "🚀 Starting Hirable AI development environment..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Firebase emulators are available
if command -v firebase >/dev/null 2>&1; then
    echo "🔥 Starting Firebase emulators..."
    firebase emulators:start --only auth,firestore,storage &
    EMULATOR_PID=$!
    echo "Firebase emulators started (PID: $EMULATOR_PID)"
    
    # Wait a bit for emulators to start
    sleep 3
fi

echo "🎯 Starting Next.js development server..."
npm run dev
