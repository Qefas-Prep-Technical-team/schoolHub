// tailwind.config.js
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#308ce8",
        // attendance/status colors
        "present": "#10B981",
        "absent": "#EF4444",
        "late": "#F59E0B",
        "excused": "#3B82F6",
        "background-light": "#f6f7f8",
        "background-dark": "#111921",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem", 
        "lg": "0.5rem", 
        "xl": "0.75rem", 
        "full": "9999px"
      },
    },
  },
  plugins: [],
}