import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function for merging CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export const formatDate = {
  // Format for display (e.g., "2024년 1월 15일")
  korean(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  // Format for relative time (e.g., "3일 전", "방금 전")
  relative(date: string | Date): string {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}일 전`;
    } else if (diffHours > 0) {
      return `${diffHours}시간 전`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}분 전`;
    } else {
      return "방금 전";
    }
  },

  // Format for time only (e.g., "오후 2:30")
  time(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString("ko-KR", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  },

  // Format for short date (e.g., "1/15")
  short(date: string | Date): string {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  },
};

// Text processing utilities
export const textUtils = {
  // Truncate text with ellipsis
  truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  },

  // Extract keywords from text (simple implementation)
  extractKeywords(text: string, count: number = 5): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 1);

    const frequency: Record<string, number> = {};
    words.forEach((word) => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([word]) => word);
  },

  // Count words in text
  wordCount(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  },

  // Highlight search terms in text
  highlightSearch(text: string, searchTerm: string): string {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  },

  // Generate excerpt from long text
  generateExcerpt(text: string, maxLength: number = 150): string {
    if (text.length <= maxLength) return text;

    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");

    if (lastSpace > maxLength * 0.8) {
      return truncated.slice(0, lastSpace) + "...";
    }

    return truncated + "...";
  },
};

// Array utilities
export const arrayUtils = {
  // Remove duplicates from array
  unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  },

  // Shuffle array randomly
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  // Chunk array into smaller arrays
  chunk<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  },

  // Get random items from array
  sample<T>(array: T[], count: number): T[] {
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, Math.min(count, array.length));
  },
};

// Note: localStorage utilities removed - using Supabase for data persistence

// Clipboard utilities
export const clipboard = {
  async copy(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        return true;
      } catch (fallbackError) {
        console.warn("Failed to copy to clipboard:", fallbackError);
        return false;
      }
    }
  },

  async read(): Promise<string | null> {
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      console.warn("Failed to read from clipboard:", error);
      return null;
    }
  },
};

// Sleep utility for delays
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Debounce utility for search/input
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for scroll/resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Color utilities
export const colorUtils = {
  // Generate random color from predefined palette
  randomTagColor(): string {
    const colors = [
      "#8B5CF6",
      "#EC4899",
      "#06B6D4",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#6B7280",
      "#8B5CF6",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  // Convert hex to RGB
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },

  // Check if color is light or dark
  isLight(hex: string): boolean {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return true;

    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128;
  },
};

// Validation utilities
export const validation = {
  email(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  korean(text: string): boolean {
    const regex = /[가-힣]/;
    return regex.test(text);
  },

  url(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  minLength(text: string, min: number): boolean {
    return text.length >= min;
  },

  maxLength(text: string, max: number): boolean {
    return text.length <= max;
  },
};

// Error handling utilities
export const errorUtils = {
  // Extract meaningful error message
  getMessage(error: any): string {
    if (typeof error === "string") return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    return "알 수 없는 오류가 발생했습니다.";
  },

  // Check if error is network related
  isNetworkError(error: any): boolean {
    const message = this.getMessage(error).toLowerCase();
    return (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("connection")
    );
  },

  // Check if error is authentication related
  isAuthError(error: any): boolean {
    const message = this.getMessage(error).toLowerCase();
    return (
      message.includes("auth") ||
      message.includes("unauthorized") ||
      message.includes("token")
    );
  },
};

// Date formatting utilities
export const formatKoreanDate = (dateString: string | null) => {
  if (!dateString) return "날짜 없음";
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
