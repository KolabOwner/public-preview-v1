import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Surface colors - will change based on theme
        'surface-1': 'var(--surface-1)',
        'surface-2': 'var(--surface-2)',
        'surface-2-stroke': 'var(--surface-2-stroke)',
        'surface-3': 'var(--surface-3)',
        'surface-3-label': 'var(--surface-3-label)',
        'side-nav-bg': '#1a1f2e',
        'side-nav-stroke': '#2d3748',
        'nav-label': '#a0aec0',
        'color-nav': '#a0aec0',
        'color-nav-hover': '#48c9b0',
        'color-hover-icon': '#48c9b0',
        'input-bg-disabled': '#1a1f2e',
        'input-disabled': '#4a5568',
        'tab-normal': '#2d3748',
        'grey-100': '#f7fafc',
        'grey-200': '#edf2f7',
        'grey-300': '#e2e8f0',
        'grey-400': '#cbd5e0',
        'grey-500': '#a0aec0',
        'grey-600': '#718096',
        'grey-700': '#4a5568',
        'grey-800': '#2d3748',
        'grey-900': '#1a202c',

        // Resume brand colors
        'resume-blue': {
          50: '#e6f7ff',
          100: '#bae7ff',
          200: '#91d5ff',
          300: '#69c0ff',
          400: '#40a9ff',
          500: '#1890ff',
          600: '#096dd9',
          700: '#0050b3',
          800: '#003a8c',
          900: '#002766',
        },
        'resume-teal': {
          DEFAULT: '#48c9b0',
          dark: '#16a085',
        },
        // Navy color palette for dark theme
        'navy': {
          50: '#e4e9f2',
          100: '#c9d2e5',
          200: '#93a5cb',
          300: '#5e78b1',
          400: '#364d7d',
          500: '#1e2a4a',
          600: '#19233d',
          700: '#141b30',
          800: '#0f1424',
          900: '#0a0d17',
          950: '#05070d',
        },

        // Additional UI colors for the new design
        'neutral-0': '#ffffff',
        'tab-focus': '#f3f4f6',
        'tab-hover': '#e5e7eb',
        'menu-item-hover': 'var(--menu-item-hover)',
        'button-text-focus': '#f9fafb',
        'button-text-active': '#e5e7eb',
        'button-text-hover': '#f3f4f6',
        'button-secondary-stroke': '#d1d5db',
        'button-secondary-hover': '#f3f4f6',
        'button-secondary-active': '#e5e7eb',
        
        // Button colors
        'color-button-created': {
          background: '#48c9b0',
          text: '#ffffff',
        },
      },
      fontFamily: {
        'inter': ['var(--font-inter)', 'system-ui', 'sans-serif'],
        'source-sans': ['var(--font-source-sans)', 'sans-serif'],
        'merriweather': ['var(--font-merriweather)', 'serif'],
        'sans-pro': ['Source Sans Pro', 'sans-serif'], // Keep for backward compatibility
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xxs': '0.625rem', // 10px
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        // Resume-specific sizes
        'resume-name': 'var(--resume-name-md)',
        'resume-section': 'var(--resume-section-md)',
        'resume-body': 'var(--resume-body-md)',
        'resume-detail': 'var(--resume-body-sm)',
      },
      letterSpacing: {
        'tighter': '-0.05em',
        'tight': '-0.025em',
        'normal': '0',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em',
        '0.12': '0.12px',
        '0.14': '0.14px',
        'resume-name': 'var(--resume-name-spacing)',
        'resume-section': 'var(--resume-section-spacing)',
        'resume-body': 'var(--resume-body-spacing)',
      },
      lineHeight: {
        'none': '1',
        'tight': '1.1',
        'snug': '1.2',
        'normal': '1.5',
        'relaxed': '1.6',
        'loose': '1.8',
        'resume-heading': 'var(--resume-heading)',
        'resume-body': 'var(--resume-body)',
      },
      fontWeight: {
        'thin': '100',
        'extralight': '200',
        'light': '300',
        'regular': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'extrabold': '800',
        'black': '900',
      },
      animation: {
        'gradient-shift': 'gradient 8s ease infinite',
        'blob': 'blob 7s infinite',
        'loading': 'loading 2s infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        loading: {
          '0%': {
            'background-position': 'left center',
          },
          '100%': {
            'background-position': 'right center',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'grid-white': `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgba(255,255,255,0.02)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        'grid-black': `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgba(0,0,0,0.02)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
      },
      backgroundColor: {
        'menu-item-hover': 'rgba(0, 0, 0, 0.1)', // Menu item hover effect
      },
      transitionDuration: {
        '200': '200ms',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config