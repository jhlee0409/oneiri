import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors - "밤의 색, 별의 빛"
        navy: {
          900: "#0d0d1a", // The Deepest Night
          800: "#1a1a2e", // Midnight Haze
          700: "#333333", // Distant Mountain
          100: "#f0f0f0", // Moonlight
        },
        // Accent Colors
        gold: {
          500: "#D4AF37", // Starlight
          300: "#F7D56E", // Soft Glow
        },
        // Text Colors
        slate: {
          100: "#E6F1FF", // Moonlight
          300: "#A8B2D1", // Whispering Mist
          500: "#8892B0", // Faded Memory
        },
        // System Colors
        success: "#64FFDA",
        error: "#FF6464",

        //OLD

        // Oneiri Brand Colors - 듀얼 테마 시스템
        oneiri: {
          // 다크 테마: "별이 빛나는 밤의 서재"
          dark: {
            abyss: "#0D0D1A", // 심연 네이비 - Primary 배경
            night: "#1A1A2E", // 밤하늘 네이비 - Secondary 배경
            golden: "#D4AF37", // 금빛 실타래 - Accent
            starlight: "#F0F0F0", // 별빛 화이트 - 메인 텍스트
            shadow: "#8A8A9E", // 그림자 그레이 - 서브 텍스트
          },
          // 라이트 테마: "새벽의 양피지"
          light: {
            parchment: "#FDFBF6", // 양피지 크림 - Primary 배경
            paper: "#FFFFFF", // 깨끗한 종이 - Secondary 배경
            antique: "#B8860B", // 앤틱 골드 - Accent
            charcoal: "#333333", // 목탄 잉크 - 메인 텍스트
            faded: "#9E9E9E", // 옅은 잉크 - 서브 텍스트
          },

          // 공통 시스템 컬러
          violet: "#9370DB", // 여명 바이올렛 - 보조 액센트
          forest: "#2E8B57", // 숲의 초록 - 성공
          garnet: "#C70039", // 석류석 레드 - 에러

          // new
        },
        // 테마 변수 (CSS 변수로 제어)
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "accent-primary": "var(--accent-primary)",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        serif: ["Gowun Batang", "serif"], // KoPub 바탕체 Pro 대체
        sans: ["Pretendard", "Noto Sans KR", "sans-serif"],
      },
      fontSize: {
        display: ["48px", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        headline: ["32px", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        title: ["24px", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "body-large": ["18px", { lineHeight: "1.6" }],
        body: ["16px", { lineHeight: "1.6" }],
        label: ["16px", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        caption: ["14px", { lineHeight: "1.5" }],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        base: "16px",
        lg: "32px",
        xl: "64px",
      },
      maxWidth: {
        container: "1280px",
        screen: "1920px",
      },
      boxShadow: {
        oneiri: "0px 10px 30px rgba(10, 25, 47, 0.5)",
        showcase: "0px 20px 50px rgba(0, 0, 0, 0.5)",
      },
      // old
      borderRadius: {
        oneiri: "8px",
        "oneiri-sm": "4px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backdropBlur: {
        oneiri: "10px",
        "oneiri-soft": "5px",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        float: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
          "100%": { transform: "translateY(0px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 0.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
