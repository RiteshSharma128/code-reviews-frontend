
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0a0a0f",
          card: "#111118",
          border: "#1e1e2e",
        },
        accent: {
          DEFAULT: "#6366f1",
          cyan: "#22d3ee",
          purple: "#a855f7",
        }
      },
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "float": "float 3s ease-in-out infinite",
      }
    },
  },
  plugins: [],
};

