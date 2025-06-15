import React from 'react'
import { sanitizeThemeValue } from '@/lib/security-utils'

interface ThemeScriptProps {
  defaultTheme?: 'light' | 'dark' | 'system'
}

export function ThemeScript({ defaultTheme = 'system' }: ThemeScriptProps) {
  // Sanitize the theme to prevent XSS injection
  const safeTheme = sanitizeThemeValue(defaultTheme);
  
  // Use JSON.stringify to safely escape the theme value
  const safeThemeString = JSON.stringify(safeTheme);
  
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const storageKey = 'theme';
              const validThemes = ['light', 'dark', 'system'];
              const defaultTheme = ${safeThemeString};
              
              // Validate theme from storage
              function isValidTheme(theme) {
                return validThemes.includes(theme);
              }
              
              // Get stored theme with validation
              const storedTheme = localStorage.getItem(storageKey);
              const validStoredTheme = storedTheme && isValidTheme(storedTheme) ? storedTheme : null;
              
              // Determine which theme to use
              let activeTheme;
              if (validStoredTheme) {
                activeTheme = validStoredTheme;
              } else if (defaultTheme === 'system') {
                activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              } else {
                activeTheme = defaultTheme;
              }
              
              // Apply theme to document immediately to prevent flash
              document.documentElement.classList.remove('light', 'dark');

              if (activeTheme === 'dark' ||
                 (activeTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.add('light');
              }
              
              // Store the theme (only if it's valid)
              if (!validStoredTheme && isValidTheme(activeTheme)) {
                localStorage.setItem(storageKey, activeTheme);
              }
            } catch (e) {
              // Fallback to light theme on any error
              document.documentElement.classList.remove('light', 'dark');
              document.documentElement.classList.add('light');
            }
          })();
        `,
      }}
    />
  )
}