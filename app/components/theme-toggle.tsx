"use client";

import { useState, useEffect } from "react";
import { Sun, MoonStar, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

type Props = {
  position?: "left" | "right" | "top" | "bottom" | "left top" | "right top";
};

export default function ThemeToggle({ position = "right" }: Props) {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  // 컴포넌트가 마운트된 후에만 테마를 적용하여 hydration 오류 방지
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("oneiri-theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // 기본값은 시스템 설정을 따름
      applyTheme("system");
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    if (newTheme === "system") {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (systemPrefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } else if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("oneiri-theme", newTheme);
    applyTheme(newTheme);
  };

  // 서버사이드 렌더링 시에는 아무것도 렌더링하지 않음
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg oneiri-bg-secondary animate-pulse" />
    );
  }

  return (
    <div className="relative group">
      <button className="w-10 h-10 rounded-lg oneiri-bg-secondary hover:bg-bg-secondary/80 transition-colors flex items-center justify-center">
        {theme === "light" && <Sun className="w-5 h-5 oneiri-text-primary" />}
        {theme === "dark" && (
          <MoonStar className="w-5 h-5 oneiri-text-primary" />
        )}
        {theme === "system" && (
          <Monitor className="w-5 h-5 oneiri-text-primary" />
        )}
      </button>

      {/* 드롭다운 메뉴 */}
      <div
        className={cn(
          "absolute right-0 mt-2 w-48 oneiri-bg-secondary rounded-lg shadow-lg border border-text-secondary/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50",
          position === "left" && "left-0",
          position === "right" && "right-0",
          position === "top" && "top-0",
          position === "bottom" && "bottom-0",
          position === "left top" && "left-0  -translate-y-[140%]",
          position === "right top" && "right-0  -translate-y-[140%]"
        )}
      >
        <div className="p-2 space-y-1">
          <button
            onClick={() => handleThemeChange("light")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              theme === "light"
                ? "oneiri-accent-bg text-bg-primary"
                : "oneiri-text-primary hover:bg-bg-primary/10"
            }`}
          >
            <Sun className="w-4 h-4" />
            라이트 테마
          </button>

          <button
            onClick={() => handleThemeChange("dark")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              theme === "dark"
                ? "oneiri-accent-bg text-bg-primary"
                : "oneiri-text-primary hover:bg-bg-primary/10"
            }`}
          >
            <MoonStar className="w-4 h-4" />
            다크 테마
          </button>

          <button
            onClick={() => handleThemeChange("system")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              theme === "system"
                ? "oneiri-accent-bg text-bg-primary"
                : "oneiri-text-primary hover:bg-bg-primary/10"
            }`}
          >
            <Monitor className="w-4 h-4" />
            시스템 설정
          </button>
        </div>
      </div>
    </div>
  );
}
