"use client";

import { useState, useEffect } from "react";
import { Sun, MoonStar, Monitor, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Theme = "light" | "dark" | "system";

type Props = {
  position?: "left" | "right" | "top" | "bottom";
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

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />;
      case "dark":
        return <MoonStar className="w-4 h-4" />;
      case "system":
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "라이트";
      case "dark":
        return "다크";
      case "system":
        return "시스템";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg oneiri-bg-secondary hover:bg-bg-secondary/80 transition-colors oneiri-text-secondary">
          {getThemeIcon()}
          <span className="hidden sm:inline text-sm">{getThemeLabel()}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={position === "left" ? "start" : "end"}
        className="oneiri-bg-secondary w-48"
      >
        <DropdownMenuItem
          onClick={() => handleThemeChange("light")}
          className={`flex items-center gap-2 ${
            theme === "light" ? "bg-accent text-accent-foreground" : ""
          }`}
        >
          <Sun className="w-4 h-4" />
          라이트 테마
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleThemeChange("dark")}
          className={`flex items-center gap-2 ${
            theme === "dark" ? "bg-accent text-accent-foreground" : ""
          }`}
        >
          <MoonStar className="w-4 h-4" />
          다크 테마
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleThemeChange("system")}
          className={`flex items-center gap-2 ${
            theme === "system" ? "bg-accent text-accent-foreground" : ""
          }`}
        >
          <Monitor className="w-4 h-4" />
          시스템 설정
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
