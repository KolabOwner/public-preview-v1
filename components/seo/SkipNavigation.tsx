'use client';

export default function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-blue-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}

// Add this component to your root layout right after the opening <body> tag
// And add id="main-content" to your main content container