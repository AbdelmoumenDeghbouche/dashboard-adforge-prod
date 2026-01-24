/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Light Theme
        'bg-primary': '#FFFFFF',
        'bg-sidebar': '#F8F8F8',
        'bg-hover': '#F0F0F0',
        'bg-selected': '#E8F9F9',

        // Text Colors
        'text-primary': '#1A1A1A',
        'text-secondary': '#6B6B6B',
        'text-tertiary': '#9E9E9E',

        // Accent Colors
        accent: {
          primary: '#00D4D4',
          hover: '#00BCBC',
        },

        // Borders
        'border-light': '#E5E5E5',
        'border-medium': '#D0D0D0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '24px',
        '2xl': '32px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        base: '16px',
        lg: '20px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.06)',
        md: '0 4px 12px rgba(0,0,0,0.08)',
        lg: '0 8px 24px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
