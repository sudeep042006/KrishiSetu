/* /** @type {import('tailwindcss').Config} */
/* module.exports = {
  content: [],
  theme: {
/*     extend: {},
  },
  plugins: [],
} */

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Update this to include the paths to all your components/screens
  content: ["./App.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}