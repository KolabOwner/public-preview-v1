import React from 'react'

interface ThemeScriptProps {
  defaultTheme?: string
}

export function ThemeScript({ defaultTheme = 'system' }: ThemeScriptProps) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const storageKey = 'theme';
              
              // Get stored theme
              const storedTheme = localStorage.getItem(storageKey);
              
              // Determine which theme to use
              let activeTheme;
              if (storedTheme) {
                activeTheme = storedTheme;
              } else if (defaultTheme === 'system') {
                activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              } else {
                activeTheme = '${defaultTheme}';
              }
              
              // Apply theme to document immediately to prevent flash
              document.documentElement.classList.remove('light', 'dark');

              if (activeTheme === 'dark' ||
                 (activeTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.add('light');
              }
              
              // Store the theme
              if (!storedTheme) {
                localStorage.setItem(storageKey, activeTheme);
              }
            } catch (e) {
              console.error('Error applying theme:', e);
            }
          })();
        `,
      }}
    />
  )
}