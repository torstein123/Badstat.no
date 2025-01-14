/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1) Configure Purge Paths (Content)
  //    This tells Tailwind to scan for class names in your project files.
  //    Add or remove paths as needed, depending on your folder structure.
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // if your React components are in /src
    "./public/index.html",         // sometimes you want to include HTML files
  ],

  // 2) Extend the Default Theme
  //    Here you can add custom colors, fonts, breakpoints, etc.
  theme: {
    extend: {
      colors: {
        // Example of a custom color palette
        midnight: "#001F3F",
        electric: "#7DF9FF",
      },
      fontFamily: {
        // Example of custom font families
        sans: ["Inter", "sans-serif"],
        display: ["Oswald", "sans-serif"],
      },
    },
  },

  // 3) Add Plugins
  //    For example, forms, typography, line-clamp, etc.
  plugins: [
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
};
