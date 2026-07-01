/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Custom color palette for Babil Chat
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Dark theme colors
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Custom app colors
        'app-bg': '#0f0f23',
        'app-surface': '#1a1a2e',
        'app-card': '#16213e',
        'app-border': 'rgba(139, 92, 246, 0.3)',
        'app-text': '#ffffff',
        'app-text-secondary': '#e2e8f0',
        'app-text-muted': '#94a3b8',
      },
      fontFamily: {
        // Arabic fonts
        'arabic-regular': ['Amiri-Regular', 'sans-serif'],
        'arabic-bold': ['Amiri-Bold', 'sans-serif'],
        // Latin fonts
        'latin-regular': ['Inter-Regular', 'sans-serif'],
        'latin-medium': ['Inter-Medium', 'sans-serif'],
        'latin-semibold': ['Inter-SemiBold', 'sans-serif'],
        'latin-bold': ['Inter-Bold', 'sans-serif'],
        // System fonts
        'system': ['SF Pro Text', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // Responsive font sizes
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
        '5xl': '48px',
      },
      spacing: {
        // Custom spacing scale
        '18': '72px',
        '88': '352px',
      },
      borderRadius: {
        // Custom border radius
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        // Custom shadows for iOS-like design
        'ios': '0 4px 8px rgba(0, 0, 0, 0.3)',
        'ios-lg': '0 8px 16px rgba(0, 0, 0, 0.4)',
        'primary': '0 4px 8px rgba(139, 92, 246, 0.3)',
      },
      animation: {
        // Custom animations
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      // Custom utilities for Islamic/Arabic content
      textAlign: {
        'start': 'left',
        'end': 'right',
      },
      writingMode: {
        'horizontal': 'horizontal-tb',
        'vertical': 'vertical-rl',
      },
    },
  },
  plugins: [
    // Custom plugin for Islamic/RTL utilities
    function({ addUtilities, theme, e }) {
      const newUtilities = {
        // RTL utilities
        '.rtl': {
          direction: 'rtl',
        },
        '.ltr': {
          direction: 'ltr',
        },
        // Arabic text utilities
        '.text-arabic': {
          fontFamily: theme('fontFamily.arabic-regular'),
          textAlign: 'right',
          direction: 'rtl',
        },
        '.text-arabic-bold': {
          fontFamily: theme('fontFamily.arabic-bold'),
          textAlign: 'right',
          direction: 'rtl',
        },
        // Card shadows for iOS
        '.shadow-ios': {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        },
        '.shadow-ios-lg': {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 16,
        },
        // Gradient utilities
        '.bg-gradient-primary': {
          background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
        },
        '.bg-gradient-dark': {
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        },
        '.bg-gradient-card': {
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        },
      };

      addUtilities(newUtilities);
    },
    // Plugin for responsive utilities
    function({ addUtilities, theme }) {
      const responsiveUtilities = {};
      
      // Add responsive spacing utilities
      Object.keys(theme('spacing')).forEach(key => {
        responsiveUtilities[`.p-${key}-responsive`] = {
          padding: `calc(${theme('spacing')[key]} * var(--scale-factor, 1))`,
        };
        responsiveUtilities[`.m-${key}-responsive`] = {
          margin: `calc(${theme('spacing')[key]} * var(--scale-factor, 1))`,
        };
      });

      addUtilities(responsiveUtilities);
    },
  ],
}; 