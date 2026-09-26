import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        grass: { 50: "#f0fbe9", 100: "#dcf5cc", 400: "#7bc74d", 500: "#5aa832", 600: "#468a25", 700: "#356b1c" },
        dirt: { 400: "#a9774a", 500: "#8b5e34", 600: "#6e4926" },
        stone: { 700: "#3f444c", 800: "#2d3137", 900: "#1e2126" },
        gold: { 300: "#ffe27a", 400: "#ffd23f", 500: "#f5b700" },
        diamond: { 300: "#8ef0ec", 400: "#4fd8d2", 500: "#1fb5ae" },
        redstone: { 400: "#ef5350", 500: "#d32f2f" },
      },
      fontFamily: {
        pixel: ['"DotGothic16"', '"Hiragino Maru Gothic ProN"', "system-ui", "sans-serif"],
        body: ['"M PLUS Rounded 1c"', '"Hiragino Maru Gothic ProN"', '"Meiryo"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        block: "inset -4px -4px 0 rgba(0,0,0,.25), inset 4px 4px 0 rgba(255,255,255,.25)",
        press: "inset 4px 4px 0 rgba(0,0,0,.25)",
      },
      keyframes: {
        pop: { "0%": { transform: "scale(.4)", opacity: "0" }, "70%": { transform: "scale(1.1)", opacity: "1" }, "100%": { transform: "scale(1)" } },
        floatUp: { "0%": { transform: "translateY(0)", opacity: "1" }, "100%": { transform: "translateY(-80px)", opacity: "0" } },
        shake: { "0%,100%": { transform: "translateX(0)" }, "25%": { transform: "translateX(-6px)" }, "75%": { transform: "translateX(6px)" } },
        bob: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-4px)" } },
      },
      animation: {
        pop: "pop .45s ease-out both",
        floatUp: "floatUp 1.4s ease-out forwards",
        shake: "shake .3s ease-in-out 2",
        bob: "bob 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
