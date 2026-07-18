/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        mist: "#F5F7FB",
        coral: "#E8703A",
        sky: "#2A7DE1",
        moss: "#188464"
      }
    }
  },
  plugins: []
};
