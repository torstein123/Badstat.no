/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1) Configure Purge Paths (Content)
  //    This tells Tailwind to scan for class names in your project files.
  //    Add or remove paths as needed, depending on your folder structure.
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  // 2) Extend the Default Theme
  //    Here you can add custom colors, fonts, breakpoints, etc.
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'rainbow-text': 'rainbow 8s linear infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        rainbow: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'bounce-subtle': {
          '0%, 100%': {
            transform: 'translateY(-10%)',
            'animation-timing-function': 'cubic-bezier(0.8,0,1,1)'
          },
          '50%': {
            transform: 'none',
            'animation-timing-function': 'cubic-bezier(0,0,0.2,1)'
          }
        }
      }
    },
  },

  // 3) Add Plugins
  //    For example, forms, typography, line-clamp, etc.
  plugins: [],
};
