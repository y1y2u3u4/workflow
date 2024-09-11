/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "colors-background-bg-primary": "#fff",
        "colors-border-border-secondary": "#eaecf0",
        "component-colors-components-buttons-secondary-button-secondary-fg":
          "#344054",
        royalblue: "#175cd3",
        mediumvioletred: "#c11574",
        "component-colors-utility-success-utility-success-700": "#067647",
        "colors-background-bg-secondary": "#f9fafb",
        "colors-text-text-quaternary-500": "#667085",
        "component-colors-components-buttons-primary-button-primary-bg":
          "#7e56d9",
        "component-colors-components-buttons-secondary-button-secondary-border":
          "#d0d5dd",
        "component-colors-components-buttons-tertiary-button-tertiary-fg":
          "#475467",
        "component-colors-components-buttons-secondary-color-button-secondary-color-border":
          "#d6bbfb",
        "component-colors-components-buttons-secondary-color-button-secondary-color-fg":
          "#6941c6",
        "colors-text-text-primary-900": "#101828",
        "component-colors-utility-success-utility-success-600": "#079455",
      },
      spacing: {
        "container-padding-desktop": "32px",
        "spacing-3xl": "24px",
        "spacing-4xl": "32px",
        "spacing-xxs": "2px",
        "spacing-lg": "12px",
        "spacing-xs": "4px",
        "spacing-sm": "6px",
        "spacing-xl": "16px",
        "spacing-md": "8px",
        "spacing-2xl": "20px",
        "width-xxs": "320px",
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        robotoMono: ['Roboto Mono', 'monospace'],
        "roboto-mono": "'Roboto Mono'",
        "text-sm-semibold": "Inter",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "9980xl": "9999px",
        "radius-xl": "12px",
        "radius-md": "8px",
        "spacing-sm": "6px",
        "radius-full": "9999px",
        "radius-sm": "6px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
    fontSize: {
      sm: "14px",
      xs: "12px",
      lg: "18px",
      base: "16px",
      "11xl": "30px",
      inherit: "inherit",
    },
    screens: {
      mq800: {
        raw: "screen and (max-width: 800px)",
      },
      mq675: {
        raw: "screen and (max-width: 675px)",
      },
      mq450: {
        raw: "screen and (max-width: 450px)",
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [require("tailwindcss-animate")],
};
