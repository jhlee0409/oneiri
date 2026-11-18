"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircle, X } from "lucide-react";
import { DiscordIcon } from "@/components/icons/discord";
import { APP_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

// 글쓰기·읽기·설정처럼 화면 하단을 써야 하는 곳에서는 숨긴다.
const HIDDEN_PATHS = ["/dreams/new", "/analysis/new", "/settings", "/login"];

export function SupportFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (
    HIDDEN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    pathname.startsWith("/library/dreams/")
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 툴팁/설명 메시지 */}
      {isOpen && (
        <div
          role="dialog"
          aria-labelledby="support-dialog-title"
          className="absolute bottom-20 right-0 mb-2 w-72 bg-bg-secondary border border-line rounded-lg shadow-xl p-4"
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 p-1 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>

          <h3 id="support-dialog-title" className="text-accent-primary font-semibold mb-2 text-sm">
            고객 지원
          </h3>
          <p className="text-text-secondary text-xs mb-3">
            피드백, 버그 리포트, 기능 제안 등 무엇이든 편하게 문의해주세요!
          </p>

          <Link
            href={APP_CONFIG.DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg transition-colors text-sm font-medium"
            onClick={() => setIsOpen(false)}
          >
            <DiscordIcon className="w-4 h-4" />
            Discord로 문의하기
          </Link>
        </div>
      )}

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center w-14 h-14 bg-accent-primary hover:brightness-110 text-bg-primary rounded-full shadow-lg transition-all duration-300 hover:scale-110",
          isOpen && "brightness-110"
        )}
        aria-label="고객 지원"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
