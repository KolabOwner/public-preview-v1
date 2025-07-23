import React from 'react'

interface ThemeScriptProps {
  defaultTheme?: 'light' | 'dark' | 'system'
}

const VALID_THEMES = ['light', 'dark', 'system'] as const;
type ValidTheme = typeof VALID_THEMES[number];

function isValidTheme(theme: unknown): theme is ValidTheme {
  return typeof theme === 'string' && VALID_THEMES.includes(theme as ValidTheme);
}

export function ThemeScript({ defaultTheme = 'system' }: ThemeScriptProps) {
  // Ensure we have a valid theme (TypeScript should already guarantee this)
  const validatedTheme = isValidTheme(defaultTheme) ? defaultTheme : 'system';

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const STORAGE_KEY = 'theme';
              const VALID_THEMES = ${JSON.stringify(VALID_THEMES)};
              const DEFAULT_THEME = ${JSON.stringify(validatedTheme)};
              
              function isValidTheme(theme) {
                return typeof theme === 'string' && VALID_THEMES.includes(theme);
              }
              
              function getSystemTheme() {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              
              function resolveTheme(theme) {
                if (theme === 'system') {
                  return getSystemTheme();
                }
                return theme;
              }
              
              // Get stored theme with validation
              const storedTheme = localStorage.getItem(STORAGE_KEY);
              const activeTheme = isValidTheme(storedTheme) ? storedTheme : DEFAULT_THEME;
              
              // Apply theme classes
              const resolvedTheme = resolveTheme(activeTheme);
              document.documentElement.classList.remove('light', 'dark');
              document.documentElement.classList.add(resolvedTheme);
              
              // Store valid theme
              if (!isValidTheme(storedTheme)) {
                localStorage.setItem(STORAGE_KEY, activeTheme);
              }
              
            } catch (error) {
              // Fallback to light theme on any error
              console.warn('Theme script error:', error);
              document.documentElement.classList.remove('light', 'dark');
              document.documentElement.classList.add('light');
            }
          })();
        `,
      }}
    />
  )
}