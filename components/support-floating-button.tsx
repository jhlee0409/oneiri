"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, X } from "lucide-react";
import { DiscordIcon } from "@/components/icons/discord";
import { APP_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SupportFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 툴팁/설명 메시지 */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 mb-2 w-72 bg-navy-800 border border-gold-500/20 rounded-lg shadow-xl p-4">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h3 className="text-gold-500 font-semibold mb-2 text-sm">고객 지원</h3>
          <p className="text-slate-300 text-xs mb-3">
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
          "flex items-center justify-center w-14 h-14 bg-gold-500 hover:bg-gold-600 text-navy-900 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
          isOpen && "bg-gold-600"
        )}
        aria-label="고객 지원"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}