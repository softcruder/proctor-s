import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(30, 86, 160)',
        'primary-deep': 'rgb(68, 76, 247)',
        'primary-deeper': 'rgb(19, 0, 108)',
        light: 'rgb(214, 228, 239)',
        black: "#161616",
        // gray: "#4F4F4F",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "green-light": "#00680433"
      },
      fontFamily: {
        urban: ['Urban Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
