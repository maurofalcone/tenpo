const {
  lightPalette,
  darkPalette,
} = require("./src/theme/palette");
const { colors } = require("./src/theme/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: lightPalette.bg,
        surface: lightPalette.surface,
        text: lightPalette.text,
        muted: lightPalette.muted,
        border: lightPalette.border,
        accent: lightPalette.accent,
        danger: lightPalette.danger,
        success: lightPalette.success,
        "on-accent": lightPalette.onAccent,
        "bg-dark": darkPalette.bg,
        "surface-dark": darkPalette.surface,
        "text-dark": darkPalette.text,
        "muted-dark": darkPalette.muted,
        "border-dark": darkPalette.border,
        "accent-dark": darkPalette.accent,
        "danger-dark": darkPalette.danger,
        "success-dark": darkPalette.success,
        "on-accent-dark": darkPalette.onAccent,
        // Overlays fijos (fotos / login hero)
        "on-media": colors.onMedia,
        "login-hero": colors.loginHero,
        "heart-on-media": colors.heartOnMedia,
        scrim: colors.scrim,
      },
    },
  },
  plugins: [],
};
